"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadGuideImage = exports.deleteGuide = exports.updateGuide = exports.createGuide = exports.getGuideBySlug = exports.getGuidesByType = exports.getGuidesByDestination = exports.getFeaturedGuides = exports.getAllGuides = exports.upload = void 0;
const Guide_1 = __importDefault(require("../models/Guide"));
const handleAsync_1 = require("../utils/handleAsync");
const drive_1 = require("../config/drive");
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
// Configure multer for memory storage with increased file size limit
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
// @desc    Get all guides
// @route   GET /api/guides
// @access  Public
exports.getAllGuides = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const { page = 1, limit = 10, type, difficulty, destination, category, search } = req.query;
    // Build filter object
    const filter = { isPublished: true };
    if (type)
        filter.type = type;
    if (difficulty)
        filter.difficulty = difficulty;
    if (destination)
        filter['destination.slug'] = destination;
    if (category)
        filter.category = category;
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
            { type: { $regex: search, $options: 'i' } },
            { difficulty: { $regex: search, $options: 'i' } }
        ];
    }
    const guides = await Guide_1.default.find(filter)
        .sort({ publishedAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));
    const total = await Guide_1.default.countDocuments(filter);
    res.status(200).json({
        success: true,
        count: guides.length,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
        },
        data: guides
    });
});
// @desc    Get featured guides
// @route   GET /api/guides/featured
// @access  Public
exports.getFeaturedGuides = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const guides = await Guide_1.default.find({
        isPublished: true,
        rating: { $gte: 4.5 }
    })
        .sort({ rating: -1, totalReviews: -1 })
        .limit(6);
    res.status(200).json({
        success: true,
        count: guides.length,
        data: guides
    });
});
// @desc    Get guides by destination
// @route   GET /api/guides/destination/:destinationId
// @access  Public
exports.getGuidesByDestination = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const guides = await Guide_1.default.find({
        'destination.slug': req.params.destinationId,
        isPublished: true
    })
        .sort({ publishedAt: -1 });
    res.status(200).json({
        success: true,
        count: guides.length,
        data: guides
    });
});
// @desc    Get guides by type
// @route   GET /api/guides/type/:type
// @access  Public
exports.getGuidesByType = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const guides = await Guide_1.default.find({
        type: req.params.type,
        isPublished: true
    })
        .sort({ publishedAt: -1 });
    res.status(200).json({
        success: true,
        count: guides.length,
        data: guides
    });
});
// @desc    Get single guide by slug
// @route   GET /api/guides/:slug
// @access  Public
exports.getGuideBySlug = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const guide = await Guide_1.default.findOne({
        slug: req.params.slug,
        isPublished: true
    });
    if (!guide) {
        return res.status(404).json({
            success: false,
            error: 'Guide not found'
        });
    }
    // Increment views
    if (guide.views !== undefined) {
        guide.views += 1;
        await guide.save();
    }
    res.status(200).json({
        success: true,
        data: guide
    });
});
// @desc    Create new guide
// @route   POST /api/guides
// @access  Private/Admin/Contributor
exports.createGuide = (0, handleAsync_1.handleAsync)(async (req, res) => {
    // Add user as embedded author
    req.body.author = {
        name: req.user.name,
        avatar: req.user.avatar || '',
        bio: req.user.bio || ''
    };
    const guide = await Guide_1.default.create(req.body);
    res.status(201).json({
        success: true,
        data: guide
    });
});
// @desc    Update guide
// @route   PUT /api/guides/:id
// @access  Private/Admin/Contributor
exports.updateGuide = (0, handleAsync_1.handleAsync)(async (req, res) => {
    let guide = await Guide_1.default.findById(req.params.id);
    if (!guide) {
        return res.status(404).json({
            success: false,
            error: 'Guide not found'
        });
    }
    // Check if user is admin (author check removed due to embedded structure)
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to update this guide'
        });
    }
    guide = await Guide_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        data: guide
    });
});
// @desc    Delete guide
// @route   DELETE /api/guides/:id
// @access  Private/Admin
exports.deleteGuide = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const guide = await Guide_1.default.findById(req.params.id);
    if (!guide) {
        return res.status(404).json({
            success: false,
            error: 'Guide not found'
        });
    }
    await guide.deleteOne();
    res.status(200).json({
        success: true,
        data: {}
    });
});
// @desc    Upload image for guide
// @route   POST /api/guides/upload-image
// @access  Private/Admin
exports.uploadGuideImage = (0, handleAsync_1.handleAsync)(async (req, res) => {
    // Check if file was uploaded
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'Please upload an image file'
        });
    }
    try {
        // Process image with sharp
        const processedImage = await (0, sharp_1.default)(req.file.buffer)
            .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
        // Generate unique filename
        const timestamp = Date.now();
        const originalName = req.file.originalname.replace(/\.[^/.]+$/, "");
        const fileName = `BagPackStories/guides/${timestamp}-${originalName}.jpg`;
        // Upload to Cloudinary
        const result = await (0, drive_1.uploadBufferToCloudinary)(processedImage, fileName, 'BagPackStories/guides');
        res.status(200).json({
            success: true,
            data: {
                url: result.url,
                public_id: result.public_id
            }
        });
    }
    catch (error) {
        console.error('Error uploading guide image:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload image'
        });
    }
});
