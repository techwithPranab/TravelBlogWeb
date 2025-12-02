"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResource = exports.updateResource = exports.createResource = exports.trackResourceClick = exports.getResourceBySlug = exports.getResourcesByCategory = exports.getFeaturedResources = exports.getAllResources = void 0;
const Resource_1 = __importDefault(require("../models/Resource"));
const handleAsync_1 = require("../utils/handleAsync");
// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
exports.getAllResources = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const { page = 1, limit = 10, category, type, isRecommended, isFeatured } = req.query;
    // Build filter object
    const filter = { isActive: true };
    if (category)
        filter.category = category;
    if (type)
        filter.type = type;
    if (isRecommended)
        filter.isRecommended = isRecommended === 'true';
    if (isFeatured)
        filter.isFeatured = isFeatured === 'true';
    const resources = await Resource_1.default.find(filter)
        .populate('author', 'name avatar')
        .populate('destinations', 'name slug')
        .sort({ averageRating: -1, createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));
    const total = await Resource_1.default.countDocuments(filter);
    res.status(200).json({
        success: true,
        count: resources.length,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
        },
        data: {
            resources,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            },
            count: resources.length
        }
    });
});
// @desc    Get featured resources
// @route   GET /api/resources/featured
// @access  Public
exports.getFeaturedResources = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const resources = await Resource_1.default.find({
        isActive: true,
        isFeatured: true
    })
        .populate('author', 'name avatar')
        .populate('destinations', 'name slug')
        .sort({ averageRating: -1 })
        .limit(8);
    res.status(200).json({
        success: true,
        count: resources.length,
        data: resources
    });
});
// @desc    Get resources by category
// @route   GET /api/resources/category/:category
// @access  Public
exports.getResourcesByCategory = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const resources = await Resource_1.default.find({
        category: req.params.category,
        isActive: true
    })
        .populate('author', 'name avatar')
        .populate('destinations', 'name slug')
        .sort({ averageRating: -1, createdAt: -1 });
    res.status(200).json({
        success: true,
        count: resources.length,
        data: resources
    });
});
// @desc    Get single resource by slug
// @route   GET /api/resources/:slug
// @access  Public
exports.getResourceBySlug = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const resource = await Resource_1.default.findOne({
        slug: req.params.slug,
        isActive: true
    })
        .populate('author', 'name avatar bio')
        .populate('destinations', 'name slug images')
        .populate({
        path: 'reviews.user',
        select: 'name avatar'
    });
    if (!resource) {
        return res.status(404).json({
            success: false,
            error: 'Resource not found'
        });
    }
    res.status(200).json({
        success: true,
        data: resource
    });
});
// @desc    Track resource click
// @route   POST /api/resources/:id/click
// @access  Public
exports.trackResourceClick = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const resource = await Resource_1.default.findById(req.params.id);
    if (!resource) {
        return res.status(404).json({
            success: false,
            error: 'Resource not found'
        });
    }
    resource.clickCount += 1;
    await resource.save();
    res.status(200).json({
        success: true,
        data: {
            clickCount: resource.clickCount
        }
    });
});
// @desc    Create new resource
// @route   POST /api/resources
// @access  Private/Admin/Contributor
exports.createResource = (0, handleAsync_1.handleAsync)(async (req, res) => {
    // Add user as author
    req.body.author = req.user._id;
    const resource = await Resource_1.default.create(req.body);
    res.status(201).json({
        success: true,
        data: resource
    });
});
// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private/Admin/Contributor
exports.updateResource = (0, handleAsync_1.handleAsync)(async (req, res) => {
    let resource = await Resource_1.default.findById(req.params.id);
    if (!resource) {
        return res.status(404).json({
            success: false,
            error: 'Resource not found'
        });
    }
    // Check if user is resource owner or admin
    if (resource.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to update this resource'
        });
    }
    resource.lastUpdated = new Date();
    resource = await Resource_1.default.findByIdAndUpdate(req.params.id, { ...req.body, lastUpdated: new Date() }, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        data: resource
    });
});
// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
exports.deleteResource = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const resource = await Resource_1.default.findById(req.params.id);
    if (!resource) {
        return res.status(404).json({
            success: false,
            error: 'Resource not found'
        });
    }
    await resource.deleteOne();
    res.status(200).json({
        success: true,
        data: {}
    });
});
