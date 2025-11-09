"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePhoto = exports.moderatePhoto = exports.getPendingPhotos = exports.getAllPhotosAdmin = exports.getFeaturedPhotos = exports.getPhotoLocations = exports.getPhotoCategories = exports.downloadPhoto = exports.likePhoto = exports.submitPhoto = exports.upload = exports.getPhoto = exports.getPhotos = void 0;
const Photo_1 = __importDefault(require("../models/Photo"));
const handleAsync_1 = require("../utils/handleAsync");
const drive_1 = require("../config/drive");
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
// Helper function to process tags string
const processTagsString = (tags) => {
    if (typeof tags === 'string') {
        return tags.split(',').map(tag => tag.trim());
    }
    return [];
};
// @desc    Get all photos (public, approved)
// @route   GET /api/v1/photos
// @access  Public
exports.getPhotos = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const { page = 1, limit = 20, category, country, tags, featured, sortBy = 'submittedAt', sortOrder = 'desc', search } = req.query;
    // Build filter object
    const filter = {
        status: 'approved',
        isPublic: true
    };
    if (category)
        filter.category = category;
    if (country)
        filter['location.country'] = new RegExp(country, 'i');
    if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
        filter.tags = { $in: tagArray };
    }
    if (featured === 'true')
        filter.isFeatured = true;
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
            { category: { $regex: search, $options: 'i' } },
            { 'location.country': { $regex: search, $options: 'i' } },
            { 'location.city': { $regex: search, $options: 'i' } },
            { 'photographer.name': { $regex: search, $options: 'i' } }
        ];
    }
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    console.log('Filter:', filter);
    const photos = await Photo_1.default.find(filter)
        .sort(sort)
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit))
        .select('-moderationNotes');
    console.log('Photos found:', photos);
    const total = await Photo_1.default.countDocuments(filter);
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
exports.getPhoto = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const photo = await Photo_1.default.findOne({
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
    await Photo_1.default.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.status(200).json({
        success: true,
        data: photo
    });
});
// Configure multer for memory storage
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({ storage });
// @desc    Submit new photo with file upload
// @route   POST /api/v1/photos
// @access  Public
exports.submitPhoto = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const { title, description, location, photographer, tags, category, camera } = req.body;
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
        const sharpImage = (0, sharp_1.default)(req.file.buffer);
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
            (0, drive_1.uploadBufferToCloudinary)(processedImage, `TravelBlog/photos/${timestamp}-${originalName}.jpg`, 'TravelBlog/photos'),
            (0, drive_1.uploadThumbnailToCloudinary)(thumbnail, `TravelBlog/photos/thumbnails/${timestamp}-${originalName}-thumb.jpg`, 'TravelBlog/photos/thumbnails')
        ]);
        // Extract URLs and public IDs from Cloudinary results
        const imageUrl = imageResult.url;
        const thumbnailUrl = thumbnailResult.url;
        // Create photo record
        const photo = await Photo_1.default.create({
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
        res.status(201).json({
            success: true,
            message: 'Photo submitted successfully and is pending review',
            data: photo
        });
    }
    catch (error) {
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
exports.likePhoto = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const { userId } = req.body; // Expecting userId from request body
    const photo = await Photo_1.default.findOne({
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
            await Photo_1.default.findByIdAndUpdate(req.params.id, {
                $pull: { likes: userId }
            });
            message = 'Photo unliked successfully';
        }
        else {
            // Like - add user to likes array
            await Photo_1.default.findByIdAndUpdate(req.params.id, {
                $addToSet: { likes: userId }
            });
            message = 'Photo liked successfully';
        }
    }
    else {
        // For anonymous users, just increment a general like count
        await Photo_1.default.findByIdAndUpdate(req.params.id, { $inc: { 'stats.likes': 1 } });
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
exports.downloadPhoto = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const photo = await Photo_1.default.findOne({
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
    await Photo_1.default.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });
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
exports.getPhotoCategories = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const categories = await Photo_1.default.aggregate([
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
exports.getPhotoLocations = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const locations = await Photo_1.default.aggregate([
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
exports.getFeaturedPhotos = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const { limit = 12 } = req.query;
    const photos = await Photo_1.default.find({
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
exports.getAllPhotosAdmin = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const { page = 1, limit = 20, status, category, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;
    // Build filter object
    const filter = {};
    if (status)
        filter.status = status;
    if (category)
        filter.category = category;
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    const photos = await Photo_1.default.find(filter)
        .sort(sort)
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit))
        .populate('moderatedBy', 'name email');
    const total = await Photo_1.default.countDocuments(filter);
    // Get status counts for admin dashboard with better error handling
    let statusCounts = { pending: 0, approved: 0, rejected: 0 };
    try {
        // Use separate count queries for reliability
        const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
            Photo_1.default.countDocuments({ status: 'pending' }),
            Photo_1.default.countDocuments({ status: 'approved' }),
            Photo_1.default.countDocuments({ status: 'rejected' })
        ]);
        statusCounts = {
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount
        };
    }
    catch (error) {
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
exports.getPendingPhotos = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const photos = await Photo_1.default.find({ status: 'pending' })
        .sort({ submittedAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));
    const total = await Photo_1.default.countDocuments({ status: 'pending' });
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
exports.moderatePhoto = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const { status, moderationNotes, isFeatured } = req.body;
    const adminId = req.user?.id; // Assuming user is attached from auth middleware
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
    if (!normalizedStatus || !['approved', 'rejected'].includes(normalizedStatus)) {
        return res.status(400).json({
            success: false,
            error: `Status must be either 'approved' or 'rejected'. Received: '${status}' (normalized: '${normalizedStatus}')`
        });
    }
    const updateData = {
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
    const photo = await Photo_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('moderatedBy', 'name email');
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
exports.deletePhoto = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const photo = await Photo_1.default.findById(req.params.id);
    if (!photo) {
        return res.status(404).json({
            success: false,
            error: 'Photo not found'
        });
    }
    try {
        // Delete from Cloudinary if public_id exists
        if (photo.driveId) {
            await (0, drive_1.deleteFromCloudinary)(photo.driveId);
        }
        // Delete thumbnail from Cloudinary if thumbnailDriveId exists
        if (photo.thumbnailDriveId) {
            await (0, drive_1.deleteFromCloudinary)(photo.thumbnailDriveId);
        }
        // Delete from database
        await Photo_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Photo deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete photo'
        });
    }
});
