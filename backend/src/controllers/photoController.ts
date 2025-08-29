import { Request, Response } from 'express';
import Photo from '../models/Photo';
import { handleAsync } from '../utils/handleAsync';

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
    sortOrder = 'desc'
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

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const photos = await Photo.find(filter)
    .sort(sort)
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit))
    .select('-moderationNotes');

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

// @desc    Submit new photo
// @route   POST /api/v1/photos
// @access  Public
export const submitPhoto = handleAsync(async (req: Request, res: Response) => {
  const {
    title,
    description,
    imageUrl,
    thumbnailUrl,
    location,
    photographer,
    tags,
    category,
    camera
  } = req.body;

  // Validate required fields
  if (!title || !imageUrl || !location.country || !photographer.name || !photographer.email || !category) {
    return res.status(400).json({
      success: false,
      error: 'Please provide all required fields: title, imageUrl, location.country, photographer name & email, category'
    });
  }

  const photo = await Photo.create({
    title,
    description,
    imageUrl,
    thumbnailUrl,
    location,
    photographer,
    tags: tags || [],
    category,
    camera,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    message: 'Photo submitted successfully and is pending review',
    data: photo
  });
});

// @desc    Like/unlike photo
// @route   PUT /api/v1/photos/:id/like
// @access  Public
export const likePhoto = handleAsync(async (req: Request, res: Response) => {
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

  // For simplicity, just increment likes
  // In a real app, you'd track which users liked which photos
  await Photo.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });

  res.status(200).json({
    success: true,
    message: 'Photo liked successfully'
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

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Status must be either approved or rejected'
    });
  }

  const updateData: any = { 
    status, 
    moderationNotes,
    updatedAt: new Date()
  };

  if (status === 'approved') {
    updateData.approvedAt = new Date();
    if (isFeatured !== undefined) {
      updateData.isFeatured = isFeatured;
    }
  }

  const photo = await Photo.findByIdAndUpdate(
    req.params.id, 
    updateData,
    { new: true }
  );

  if (!photo) {
    return res.status(404).json({
      success: false,
      error: 'Photo not found'
    });
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
  const photo = await Photo.findByIdAndDelete(req.params.id);

  if (!photo) {
    return res.status(404).json({
      success: false,
      error: 'Photo not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Photo deleted successfully'
  });
});
