"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDestinationImage = exports.deleteDestination = exports.updateDestination = exports.createDestination = exports.getDestinationById = exports.getDestinationBySlug = exports.getPopularDestinations = exports.getFeaturedDestinations = exports.getAllDestinations = exports.upload = void 0;
const Destination_1 = __importDefault(require("../models/Destination"));
const handleAsync_1 = require("../utils/handleAsync");
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const drive_1 = require("../config/drive");
// Configure multer for memory storage
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
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
// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
exports.getAllDestinations = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const { page = 1, limit = 10, country, continent, isPopular, isFeatured, search } = req.query;
    // Build filter object - only show published destinations to public
    const filter = {
        isActive: true,
        status: 'published'
    };
    if (country)
        filter.country = country;
    if (continent)
        filter.continent = continent;
    if (isPopular)
        filter.isPopular = isPopular === 'true';
    if (isFeatured)
        filter.isFeatured = isFeatured === 'true';
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { country: { $regex: search, $options: 'i' } },
            { continent: { $regex: search, $options: 'i' } },
            { highlights: { $in: [new RegExp(search, 'i')] } }
        ];
    }
    const destinations = await Destination_1.default.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));
    const total = await Destination_1.default.countDocuments(filter);
    res.status(200).json({
        success: true,
        count: destinations.length,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
        },
        data: destinations
    });
});
// @desc    Get featured destinations
// @route   GET /api/destinations/featured
// @access  Public
exports.getFeaturedDestinations = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const destinations = await Destination_1.default.find({
        isActive: true,
        isFeatured: true,
        status: 'published'
    })
        .sort({ createdAt: -1 })
        .limit(6);
    res.status(200).json({
        success: true,
        count: destinations.length,
        data: destinations
    });
});
// @desc    Get popular destinations
// @route   GET /api/destinations/popular
// @access  Public
exports.getPopularDestinations = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const destinations = await Destination_1.default.find({
        isActive: true,
        isPopular: true,
        status: 'published'
    })
        .sort({ rating: -1 })
        .limit(10);
    res.status(200).json({
        success: true,
        count: destinations.length,
        data: destinations
    });
});
// @desc    Get single destination by slug
// @route   GET /api/destinations/:slug
// @access  Public
exports.getDestinationBySlug = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const destination = await Destination_1.default.findOne({
        slug: req.params.slug,
        isActive: true,
        status: 'published'
    });
    if (!destination) {
        return res.status(404).json({
            success: false,
            error: 'Destination not found'
        });
    }
    res.status(200).json({
        success: true,
        data: destination
    });
});
// @desc    Get single destination by ID (Admin)
// @route   GET /api/destinations/admin/:id
// @access  Private/Admin
exports.getDestinationById = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const destination = await Destination_1.default.findById(req.params.id);
    if (!destination) {
        return res.status(404).json({
            success: false,
            error: 'Destination not found'
        });
    }
    res.status(200).json({
        success: true,
        data: destination
    });
});
// @desc    Create new destination
// @route   POST /api/destinations
// @access  Private/Admin
exports.createDestination = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const destination = await Destination_1.default.create(req.body);
    res.status(201).json({
        success: true,
        data: destination
    });
});
// @desc    Update destination
// @route   PUT /api/destinations/:id
// @access  Private/Admin
exports.updateDestination = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const destination = await Destination_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!destination) {
        return res.status(404).json({
            success: false,
            error: 'Destination not found'
        });
    }
    res.status(200).json({
        success: true,
        data: destination
    });
});
// @desc    Delete destination
// @route   DELETE /api/destinations/:id
// @access  Private/Admin
exports.deleteDestination = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const destination = await Destination_1.default.findById(req.params.id);
    if (!destination) {
        return res.status(404).json({
            success: false,
            error: 'Destination not found'
        });
    }
    await destination.deleteOne();
    res.status(200).json({
        success: true,
        data: {}
    });
});
// @desc    Upload destination image
// @route   POST /api/destinations/upload-image
// @access  Private/Admin
exports.uploadDestinationImage = (0, handleAsync_1.handleAsync)(async (req, res) => {
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
        const filename = `BagPackStories/destinations/${timestamp}-${originalName}.jpg`;
        // Upload to Cloudinary
        const result = await (0, drive_1.uploadBufferToCloudinary)(processedImage, filename, 'BagPackStories/destinations');
        res.status(200).json({
            success: true,
            data: {
                url: result.url,
                alt: req.file.originalname,
                public_id: result.public_id
            }
        });
    }
    catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload image'
        });
    }
});
