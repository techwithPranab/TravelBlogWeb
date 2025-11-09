"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReviewStats = exports.deleteReview = exports.getPendingReviews = exports.moderateReview = exports.addReply = exports.markHelpful = exports.getReview = exports.submitReview = exports.getReviews = exports.validateReview = void 0;
const Review_1 = __importDefault(require("../models/Review"));
const express_validator_1 = require("express-validator");
// Validation rules for review submission
exports.validateReview = [
    (0, express_validator_1.body)('resourceType').isIn(['destination', 'guide', 'blog']).withMessage('Invalid resource type'),
    (0, express_validator_1.body)('resourceId').notEmpty().withMessage('Resource ID is required'),
    (0, express_validator_1.body)('author.name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
    (0, express_validator_1.body)('author.email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1-5'),
    (0, express_validator_1.body)('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5-200 characters'),
    (0, express_validator_1.body)('content').trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10-2000 characters'),
    (0, express_validator_1.body)('wouldRecommend').isBoolean().withMessage('Would recommend must be true or false'),
    (0, express_validator_1.body)('pros').optional().isArray().withMessage('Pros must be an array'),
    (0, express_validator_1.body)('cons').optional().isArray().withMessage('Cons must be an array'),
    (0, express_validator_1.body)('travelDate').optional().isISO8601().withMessage('Travel date must be a valid date'),
    (0, express_validator_1.body)('travelType').optional().isIn(['solo', 'couple', 'family', 'friends', 'business']).withMessage('Invalid travel type')
];
// Get reviews for a specific resource
const getReviews = async (req, res) => {
    try {
        const { resourceType, resourceId } = req.params;
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', minRating, maxRating, travelType, verified } = req.query;
        let verifiedFilter;
        if (verified === 'true') {
            verifiedFilter = true;
        }
        else if (verified === 'false') {
            verifiedFilter = false;
        }
        else {
            verifiedFilter = undefined;
        }
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy: sortBy,
            sortOrder: sortOrder,
            minRating: minRating ? parseInt(minRating) : undefined,
            maxRating: maxRating ? parseInt(maxRating) : undefined,
            travelType: travelType,
            verified: verifiedFilter
        };
        const reviews = await Review_1.default.getResourceReviews(resourceType, resourceId, options);
        const totalReviews = await Review_1.default.countDocuments({
            resourceType,
            resourceId,
            status: 'approved'
        });
        const stats = await Review_1.default.getReviewStats(resourceType, resourceId);
        res.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    currentPage: options.page,
                    totalPages: Math.ceil(totalReviews / options.limit),
                    totalReviews,
                    hasNextPage: options.page < Math.ceil(totalReviews / options.limit),
                    hasPrevPage: options.page > 1
                },
                stats: stats[0] || {
                    totalReviews: 0,
                    averageRating: 0,
                    ratingCounts: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reviews'
        });
    }
};
exports.getReviews = getReviews;
// Submit a new review
const submitReview = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { resourceType, resourceId, author, rating, title, content, pros = [], cons = [], travelDate, travelType, wouldRecommend, images = [] } = req.body;
        // Check if user already reviewed this resource
        const existingReview = await Review_1.default.findOne({
            resourceType,
            resourceId,
            'author.email': author.email
        });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                error: 'You have already reviewed this resource'
            });
        }
        const review = new Review_1.default({
            resourceType,
            resourceId,
            author,
            rating,
            title,
            content,
            pros,
            cons,
            travelDate: travelDate ? new Date(travelDate) : undefined,
            travelType,
            wouldRecommend,
            images,
            status: 'pending' // Reviews need approval by default
        });
        await review.save();
        res.status(201).json({
            success: true,
            message: 'Review submitted successfully and is pending approval',
            data: {
                reviewId: review._id
            }
        });
    }
    catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit review'
        });
    }
};
exports.submitReview = submitReview;
// Get a specific review by ID
const getReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review_1.default.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }
        // Only return approved reviews unless it's an admin request
        if (review.status !== 'approved') {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }
        res.json({
            success: true,
            data: review
        });
    }
    catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch review'
        });
    }
};
exports.getReview = getReview;
// Mark a review as helpful
const markHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review_1.default.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }
        if (review.status !== 'approved') {
            return res.status(400).json({
                success: false,
                error: 'Cannot mark unapproved review as helpful'
            });
        }
        await review.markHelpful();
        res.json({
            success: true,
            message: 'Review marked as helpful',
            data: {
                helpfulVotes: review.helpfulVotes
            }
        });
    }
    catch (error) {
        console.error('Error marking review as helpful:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark review as helpful'
        });
    }
};
exports.markHelpful = markHelpful;
// Add a reply to a review
const addReply = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { author, content } = req.body;
        // Validate input
        if (!author?.name || !author?.email || !content) {
            return res.status(400).json({
                success: false,
                error: 'Author name, email, and content are required'
            });
        }
        if (content.trim().length < 10 || content.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                error: 'Reply content must be between 10-1000 characters'
            });
        }
        const review = await Review_1.default.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }
        if (review.status !== 'approved') {
            return res.status(400).json({
                success: false,
                error: 'Cannot reply to unapproved review'
            });
        }
        const reply = {
            author: {
                name: author.name.trim(),
                email: author.email.toLowerCase().trim(),
                avatar: author.avatar
            },
            content: content.trim(),
            createdAt: new Date()
        };
        await review.addReply(reply);
        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            data: {
                reply
            }
        });
    }
    catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add reply'
        });
    }
};
exports.addReply = addReply;
// Admin routes for review moderation
const moderateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { status, moderationNotes, featured } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be pending, approved, or rejected'
            });
        }
        const review = await Review_1.default.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }
        review.status = status;
        if (moderationNotes)
            review.moderationNotes = moderationNotes;
        if (featured !== undefined)
            review.featured = featured;
        await review.save();
        res.json({
            success: true,
            message: 'Review moderated successfully',
            data: {
                reviewId: review._id,
                status: review.status,
                featured: review.featured
            }
        });
    }
    catch (error) {
        console.error('Error moderating review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to moderate review'
        });
    }
};
exports.moderateReview = moderateReview;
// Get pending reviews for moderation
const getPendingReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        };
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const reviews = await Review_1.default.find({ status: 'pending' })
            .sort(sort)
            .limit(options.limit)
            .skip((options.page - 1) * options.limit);
        const totalReviews = await Review_1.default.countDocuments({ status: 'pending' });
        res.json({
            success: true,
            data: {
                reviews,
                pagination: {
                    currentPage: options.page,
                    totalPages: Math.ceil(totalReviews / options.limit),
                    totalReviews,
                    hasNextPage: options.page < Math.ceil(totalReviews / options.limit),
                    hasPrevPage: options.page > 1
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching pending reviews:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch pending reviews'
        });
    }
};
exports.getPendingReviews = getPendingReviews;
// Delete a review (admin only)
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review_1.default.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'Review not found'
            });
        }
        await Review_1.default.findByIdAndDelete(reviewId);
        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete review'
        });
    }
};
exports.deleteReview = deleteReview;
// Get review statistics for a resource
const getReviewStats = async (req, res) => {
    try {
        const { resourceType, resourceId } = req.params;
        const stats = await Review_1.default.getReviewStats(resourceType, resourceId);
        res.json({
            success: true,
            data: stats[0] || {
                totalReviews: 0,
                averageRating: 0,
                ratingCounts: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
            }
        });
    }
    catch (error) {
        console.error('Error fetching review stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch review statistics'
        });
    }
};
exports.getReviewStats = getReviewStats;
