import { Request, Response } from 'express';
import Photo from '../models/Photo';
import { handleAsync } from '../utils/handleAsync';
import { uploadBufferToCloudinary, uploadThumbnailToCloudinary, deleteFromCloudinary } from '../config/drive';
import { emailService } from '../services/emailService';
import multer from 'multer';
import sharp from 'sharp';

// Helper function to process tags string
const processTagsString = (tags: any): string[] => {
  if (typeof tags === 'string') {
    return tags.split(',').map(tag => tag.trim());
  }
  return [];
};

// @desc    Get all photos (public, approved)
// @route   GET /api/v1/photos
// @access  Public
export const getPhotos = handleAsync(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 20, 
    category, 
    country, 
    tags, 
    featured,
    sortBy = 'submittedAt',
    sortOrder = 'desc',
    search
  } = req.query;

  // Build filter object
  const filter: any = { 
    status: 'approved', 
    isPublic: true 
  };
  
  if (category) filter.category = category;
  if (country) filter['location.country'] = new RegExp(country as string, 'i');
  if (tags) {
    const tagArray = (tags as string).split(',').map(tag => tag.trim().toLowerCase());
    filter.tags = { $in: tagArray };
  }
  if (featured === 'true') filter.isFeatured = true;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search as string, 'i')] } },
      { category: { $regex: search, $options: 'i' } },
      { 'location.country': { $regex: search, $options: 'i' } },
      { 'location.city': { $regex: search, $options: 'i' } },
      { 'photographer.name': { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
console.log('Filter:', filter);
  const photos = await Photo.find(filter)
    .sort(sort)
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit))
    .select('-moderationNotes');
  console.log('Photos found:', photos);
  const total = await Photo.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: photos.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    data: photos
  });
});

// @desc    Get single photo by ID
// @route   GET /api/v1/photos/:id
// @access  Public
export const getPhoto = handleAsync(async (req: Request, res: Response) => {
  const photo = await Photo.findOne({ 
    _id: req.params.id, 
    status: 'approved', 
    isPublic: true 
  }).select('-moderationNotes');

  if (!photo) {
    return res.status(404).json({
      success: false,
      error: 'Photo not found'
    });
  }

  // Increment view count
  await Photo.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  res.status(200).json({
    success: true,
    data: photo
  });
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// @desc    Submit new photo with file upload
// @route   POST /api/v1/photos
// @access  Public
export const submitPhoto = handleAsync(async (req: Request, res: Response) => {
  const {
    title,
    description,
    location,
    photographer,
    tags,
    category,
    camera
  } = req.body;

  // Parse JSON strings if needed
  const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
  const parsedPhotographer = typeof photographer === 'string' ? JSON.parse(photographer) : photographer;

  // Validate required fields
  if (!title || !parsedLocation?.country || !parsedPhotographer?.name || !parsedPhotographer?.email || !category) {
    return res.status(400).json({
      success: false,
      error: 'Please provide all required fields: title, location, photographer name & email, category'
    });
  }

  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Please upload a photo file'
    });
  }

  try {
    // Process image with sharp to create both main image and thumbnail
    const sharpImage = sharp(req.file.buffer);

    // Create main image
    const processedImage = await sharpImage
      .clone()
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Create thumbnail from the same sharp instance
    const thumbnail = await sharpImage
      .clone()
      .resize(400, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Clear the original buffer from memory
    req.file.buffer = Buffer.alloc(0);

    // Force garbage collection if available (only in development)
    if (global.gc) {
      global.gc();
    }

    // Generate unique filenames
    const timestamp = Date.now();
    const originalName = req.file.originalname.replace(/\.[^/.]+$/, "");

    // Upload to Cloudinary
    const [imageResult, thumbnailResult] = await Promise.all([
      uploadBufferToCloudinary(processedImage, `BagPackStories/photos/${timestamp}-${originalName}.jpg`, 'BagPackStories/photos'),
      uploadThumbnailToCloudinary(thumbnail, `BagPackStories/photos/thumbnails/${timestamp}-${originalName}-thumb.jpg`, 'BagPackStories/photos/thumbnails')
    ]);

    // Extract URLs and public IDs from Cloudinary results
    const imageUrl = imageResult.url;
    const thumbnailUrl = thumbnailResult.url;

    // Create photo record
    const photo = await Photo.create({
      title,
      description,
      driveId: imageResult.public_id, // Store Cloudinary public_id
      thumbnailDriveId: thumbnailResult.public_id, // Store Cloudinary public_id
      imageUrl,
      thumbnailUrl,
      location: parsedLocation,
      photographer: parsedPhotographer,
      tags: Array.isArray(tags) ? tags : processTagsString(tags),
      category,
      camera: typeof camera === 'string' ? JSON.parse(camera) : camera,
      status: 'pending'
    });

    // Send email notification to admin
    try {
      const photoLocationString = parsedLocation.city && parsedLocation.country 
        ? `${parsedLocation.city}, ${parsedLocation.country}`
        : parsedLocation.country || 'Unknown';

      await emailService.sendPhotoSubmissionNotificationToAdmin({
        photoTitle: title,
        photoDescription: description,
        photographerName: parsedPhotographer.name,
        photographerEmail: parsedPhotographer.email,
        photoLocation: photoLocationString,
        photoCategory: category,
        photoTags: Array.isArray(tags) ? tags : processTagsString(tags),
        photoThumbnailUrl: thumbnailUrl,
        submissionDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        adminDashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/admin/photos`
      });
      
      console.log('📧 Photo submission notification sent to admin successfully');
    } catch (emailError) {
      console.error('❌ Failed to send photo submission notification to admin:', emailError);
      // Don't fail the entire request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Photo submitted successfully and is pending review',
      data: photo
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload photo'
    });
  }
});

// @desc    Like/unlike photo
// @route   PUT /api/v1/photos/:id/like
// @access  Public
export const likePhoto = handleAsync(async (req: Request, res: Response) => {
  const { userId } = req.body; // Expecting userId from request body
  
  const photo = await Photo.findOne({ 
    _id: req.params.id, 
    status: 'approved', 
    isPublic: true 
  });

  if (!photo) {
    return res.status(404).json({
      success: false,
      error: 'Photo not found'
    });
  }

  let message = '';
  
  if (userId) {
    // Check if user has already liked the photo
    const hasLiked = photo.likes.includes(userId);
    
    if (hasLiked) {
      // Unlike - remove user from likes array
      await Photo.findByIdAndUpdate(req.params.id, { 
        $pull: { likes: userId } 
      });
      message = 'Photo unliked successfully';
    } else {
      // Like - add user to likes array
      await Photo.findByIdAndUpdate(req.params.id, { 
        $addToSet: { likes: userId } 
      });
      message = 'Photo liked successfully';
    }
  } else {
    // For anonymous users, just increment a general like count
    await Photo.findByIdAndUpdate(req.params.id, { $inc: { 'stats.likes': 1 } });
    message = 'Photo liked successfully';
  }

  res.status(200).json({
    success: true,
    message
  });
});

// @desc    Download photo (increment download count)
// @route   PUT /api/v1/photos/:id/download
// @access  Public
export const downloadPhoto = handleAsync(async (req: Request, res: Response) => {
  const photo = await Photo.findOne({ 
    _id: req.params.id, 
    status: 'approved', 
    isPublic: true 
  });

  if (!photo) {
    return res.status(404).json({
      success: false,
      error: 'Photo not found'
    });
  }

  // Increment download count
  await Photo.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });

  res.status(200).json({
    success: true,
    data: {
      downloadUrl: photo.imageUrl,
      filename: `${photo.title.replace(/\s+/g, '_')}.jpg`
    }
  });
});

// @desc    Get photo categories with counts
// @route   GET /api/v1/photos/categories
// @access  Public
export const getPhotoCategories = handleAsync(async (req: Request, res: Response) => {
  const categories = await Photo.aggregate([
    { $match: { status: 'approved', isPublic: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get photo locations with counts
// @route   GET /api/v1/photos/locations
// @access  Public
export const getPhotoLocations = handleAsync(async (req: Request, res: Response) => {
  const locations = await Photo.aggregate([
    { $match: { status: 'approved', isPublic: true } },
    { $group: { _id: '$location.country', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);

  res.status(200).json({
    success: true,
    data: locations
  });
});

// @desc    Get featured photos
// @route   GET /api/v1/photos/featured
// @access  Public
export const getFeaturedPhotos = handleAsync(async (req: Request, res: Response) => {
  const { limit = 12 } = req.query;

  const photos = await Photo.find({ 
    status: 'approved', 
    isPublic: true, 
    isFeatured: true 
  })
    .sort({ likes: -1, submittedAt: -1 })
    .limit(Number(limit))
    .select('-moderationNotes');

  res.status(200).json({
    success: true,
    count: photos.length,
    data: photos
  });
});

// ADMIN ROUTES

// @desc    Get all photos for admin management
// @route   GET /api/v1/photos/admin/all
// @access  Private/Admin
export const getAllPhotosAdmin = handleAsync(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 20, 
    status, 
    category, 
    sortBy = 'submittedAt',
    sortOrder = 'desc' 
  } = req.query;

  // Build filter object
  const filter: any = {};
  if (status) filter.status = status;
  if (category) filter.category = category;

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const photos = await Photo.find(filter)
    .sort(sort)
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit))
    .populate('moderatedBy', 'name email');

  const total = await Photo.countDocuments(filter);

  // Get status counts for admin dashboard with better error handling
  let statusCounts = { pending: 0, approved: 0, rejected: 0, inactive: 0 };
  
  try {
    // Use separate count queries for reliability
    const [pendingCount, approvedCount, rejectedCount, inactiveCount] = await Promise.all([
      Photo.countDocuments({ status: 'pending' }),
      Photo.countDocuments({ status: 'approved' }),
      Photo.countDocuments({ status: 'rejected' }),
      Photo.countDocuments({ status: 'inactive' })
    ]);
    
    statusCounts = {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      inactive: inactiveCount
    };
  } catch (error) {
    console.error('Error getting status counts:', error);
    // Keep default values if queries fail
  }

  res.status(200).json({
    success: true,
    count: photos.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    statusCounts,
    data: photos
  });
});

// @desc    Get all photos for moderation
// @route   GET /api/v1/photos/admin/pending
// @access  Private/Admin
export const getPendingPhotos = handleAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 20 } = req.query;

  const photos = await Photo.find({ status: 'pending' })
    .sort({ submittedAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Photo.countDocuments({ status: 'pending' });

  res.status(200).json({
    success: true,
    count: photos.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    data: photos
  });
});

// @desc    Moderate photo (approve/reject)
// @route   PUT /api/v1/photos/admin/:id/moderate
// @access  Private/Admin
export const moderatePhoto = handleAsync(async (req: Request, res: Response) => {
  const { status, moderationNotes, isFeatured } = req.body;
  const adminId = (req as any).user?.id; // Assuming user is attached from auth middleware

  console.log('Moderation request:', {
    photoId: req.params.id,
    status: status,
    statusType: typeof status,
    moderationNotes,
    isFeatured
  });

  // Validate status - make it case-insensitive and trim whitespace
  const normalizedStatus = status?.toString().toLowerCase().trim();
  console.log('Normalized status:', normalizedStatus);
  if (!normalizedStatus || !['approved', 'rejected', 'inactive'].includes(normalizedStatus)) {
    return res.status(400).json({
      success: false,
      error: `Status must be either 'approved', 'rejected', or 'inactive'. Received: '${status}' (normalized: '${normalizedStatus}')`
    });
  }

  const updateData: any = {
    status: normalizedStatus,
    moderationNotes,
    moderatedBy: adminId,
    moderatedAt: new Date(),
    updatedAt: new Date()
  };

  if (normalizedStatus === 'approved') {
    updateData.approvedAt = new Date();
    if (isFeatured !== undefined) {
      updateData.isFeatured = isFeatured;
    }
  }

  const photo = await Photo.findByIdAndUpdate(
    req.params.id, 
    updateData,
    { new: true }
  ).populate('moderatedBy', 'name email');

  if (!photo) {
    return res.status(404).json({
      success: false,
      error: 'Photo not found'
    });
  }

  // Send email notification to photographer if photo is approved
  if (normalizedStatus === 'approved') {
    try {
      const photoLocationString = photo.location.city && photo.location.country 
        ? `${photo.location.city}, ${photo.location.country}`
        : photo.location.country || 'Unknown';

      await emailService.sendPhotoApprovalNotification({
        photographerName: photo.photographer.name,
        photographerEmail: photo.photographer.email,
        photoTitle: photo.title,
        photoDescription: photo.description || '',
        photoLocation: photoLocationString,
        photoCategory: photo.category,
        photoThumbnailUrl: photo.thumbnailUrl || photo.imageUrl,
        approvalDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        isFeatured: photo.isFeatured || false,
        galleryUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/gallery`,
        photoUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/gallery/${photo._id}`,
        submitPhotoUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/submit-photo`
      });
      
      console.log('📧 Photo approval notification sent to photographer successfully');
    } catch (emailError) {
      console.error('❌ Failed to send photo approval notification to photographer:', emailError);
      // Don't fail the entire request if email fails
    }
  }

  res.status(200).json({
    success: true,
    message: `Photo ${status} successfully`,
    data: photo
  });
});

// @desc    Delete photo
// @route   DELETE /api/v1/photos/admin/:id
// @access  Private/Admin
export const deletePhoto = handleAsync(async (req: Request, res: Response) => {
  const photo = await Photo.findById(req.params.id);

  if (!photo) {
    return res.status(404).json({
      success: false,
      error: 'Photo not found'
    });
  }

  try {
    // Delete from Cloudinary if public_id exists
    if (photo.driveId) {
      await deleteFromCloudinary(photo.driveId);
    }
    
    // Delete thumbnail from Cloudinary if thumbnailDriveId exists
    if (photo.thumbnailDriveId) {
      await deleteFromCloudinary(photo.thumbnailDriveId);
    }

    // Delete from database
    await Photo.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete photo'
    });
  }
});

// @desc    Update photo status
// @route   PUT /api/v1/photos/admin/:id/status
// @access  Private/Admin
export const updatePhotoStatus = handleAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const adminId = (req as any).user?.id;

  // Validate status
  const normalizedStatus = status?.toString().toLowerCase().trim();
  if (!normalizedStatus || !['pending', 'approved', 'rejected', 'inactive'].includes(normalizedStatus)) {
    return res.status(400).json({
      success: false,
      error: `Status must be one of: 'pending', 'approved', 'rejected', or 'inactive'. Received: '${status}'`
    });
  }

  const updateData: any = {
    status: normalizedStatus,
    moderatedBy: adminId,
    moderatedAt: new Date(),
    updatedAt: new Date()
  };

  if (normalizedStatus === 'approved') {
    updateData.approvedAt = new Date();
  }

  const photo = await Photo.findByIdAndUpdate(
    req.params.id, 
    updateData,
    { new: true }
  ).populate('moderatedBy', 'name email');

  if (!photo) {
    return res.status(404).json({
      success: false,
      error: 'Photo not found'
    });
  }

  res.status(200).json({
    success: true,
    data: photo
  });
});
