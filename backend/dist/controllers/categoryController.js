"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryBySlug = exports.getAllCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const handleAsync_1 = require("../utils/handleAsync");
// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = (0, handleAsync_1.handleAsync)(async (req, res) => {
    // Get categories with dynamic post counts
    const categoriesWithPostCount = await Category_1.default.aggregate([
        {
            $match: { isActive: true }
        },
        {
            $lookup: {
                from: 'posts',
                let: { categoryId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ['$$categoryId', '$categories'] },
                                    { $eq: ['$status', 'published'] }
                                ]
                            }
                        }
                    },
                    {
                        $count: 'postCount'
                    }
                ],
                as: 'postCountResult'
            }
        },
        {
            $addFields: {
                postCount: {
                    $ifNull: [{ $arrayElemAt: ['$postCountResult.postCount', 0] }, 0]
                }
            }
        },
        {
            $project: {
                postCountResult: 0
            }
        },
        {
            $sort: { name: 1 }
        }
    ]);
    res.status(200).json({
        success: true,
        count: categoriesWithPostCount.length,
        data: categoriesWithPostCount
    });
});
// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategoryBySlug = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const category = await Category_1.default.findOne({
        slug: req.params.slug,
        isActive: true
    });
    if (!category) {
        return res.status(404).json({
            success: false,
            error: 'Category not found'
        });
    }
    res.status(200).json({
        success: true,
        data: category
    });
});
// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const category = await Category_1.default.create(req.body);
    res.status(201).json({
        success: true,
        data: category
    });
});
// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const category = await Category_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!category) {
        return res.status(404).json({
            success: false,
            error: 'Category not found'
        });
    }
    res.status(200).json({
        success: true,
        data: category
    });
});
// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = (0, handleAsync_1.handleAsync)(async (req, res) => {
    const category = await Category_1.default.findById(req.params.id);
    if (!category) {
        return res.status(404).json({
            success: false,
            error: 'Category not found'
        });
    }
    await category.deleteOne();
    res.status(200).json({
        success: true,
        data: {}
    });
});
