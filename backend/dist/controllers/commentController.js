"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommentStats = exports.getAllCommentsAdmin = exports.deleteComment = exports.getFlaggedComments = exports.moderateComment = exports.flagComment = exports.editComment = exports.dislikeComment = exports.likeComment = exports.getComment = exports.submitComment = exports.getComments = exports.validateComment = void 0;
const Comment_1 = __importDefault(require("../models/Comment"));
const express_validator_1 = require("express-validator");
const profanityFilter_1 = require("../utils/profanityFilter");
// Validation rules for comment submission
exports.validateComment = [
    (0, express_validator_1.body)('resourceType').isIn(['blog', 'destination', 'guide', 'photo']).withMessage('Invalid resource type'),
    (0, express_validator_1.body)('resourceId').notEmpty().withMessage('Resource ID is required'),
    (0, express_validator_1.body)('author.name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
    (0, express_validator_1.body)('author.email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1-2000 characters'),
    (0, express_validator_1.body)('parentId').optional().isMongoId().withMessage('Invalid parent comment ID')
];
// Get comments for a specific resource
const getComments = async (req, res) => {
    try {
        const { resourceType, resourceId } = req.params;
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', includeReplies = 'true', parentId } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy: sortBy,
            sortOrder: sortOrder,
            includeReplies: includeReplies === 'true',
            parentId: parentId
        };
        const comments = await Comment_1.default.getResourceComments(resourceType, resourceId, options);
        let totalComments;
        if (parentId) {
            totalComments = await Comment_1.default.countDocuments({
                resourceType,
                resourceId,
                parentId,
                status: 'approved'
            });
        }
        else {
            // For top-level comments, check for null parentId
            totalComments = await Comment_1.default.countDocuments({
                resourceType,
                resourceId,
                parentId: null,
                status: 'approved'
            });
        }
        const stats = await Comment_1.default.getCommentStats(resourceType, resourceId);
        res.json({
            success: true,
            data: {
                comments,
                pagination: {
                    currentPage: options.page,
                    totalPages: Math.ceil(totalComments / options.limit),
                    totalComments,
                    hasNextPage: options.page < Math.ceil(totalComments / options.limit),
                    hasPrevPage: options.page > 1
                },
                stats: stats[0] || {
                    totalComments: 0,
                    totalLikes: 0,
                    totalDislikes: 0,
                    topLevelComments: 0,
                    replies: 0
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch comments'
        });
    }
};
exports.getComments = getComments;
// Submit a new comment
const submitComment = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { resourceType, resourceId, author, content, parentId, attachments = [] } = req.body;
        // Check for inappropriate content
        if ((0, profanityFilter_1.containsProfanity)(content)) {
            return res.status(400).json({
                success: false,
                error: (0, profanityFilter_1.getProfanityError)()
            });
        }
        // Validate parent comment if provided
        if (parentId) {
            const parentComment = await Comment_1.default.findById(parentId);
            if (!parentComment) {
                return res.status(400).json({
                    success: false,
                    error: 'Parent comment not found'
                });
            }
            if (parentComment.resourceType !== resourceType || parentComment.resourceId !== resourceId) {
                return res.status(400).json({
                    success: false,
                    error: 'Parent comment belongs to different resource'
                });
            }
        }
        // Use authenticated user info if available, otherwise use provided author info
        const authenticatedUser = req.user;
        const commentAuthor = authenticatedUser ? {
            name: authenticatedUser.name,
            email: authenticatedUser.email,
            avatar: authenticatedUser.avatar || '/images/default-avatar.jpg',
            website: authenticatedUser.website || author.website
        } : {
            name: author.name.trim(),
            email: author.email.toLowerCase().trim(),
            avatar: author.avatar || '/images/default-avatar.jpg',
            website: author.website
        };
        const comment = new Comment_1.default({
            resourceType,
            resourceId,
            author: commentAuthor,
            content: content.trim(),
            parentId,
            attachments,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        await comment.save();
        // If this is a reply, add it to parent's replies array
        if (parentId) {
            const parentComment = await Comment_1.default.findById(parentId);
            if (parentComment) {
                await parentComment.addReply(comment._id.toString());
            }
        }
        res.status(201).json({
            success: true,
            message: 'Comment submitted successfully',
            data: {
                commentId: comment._id,
                comment
            }
        });
    }
    catch (error) {
        console.error('Error submitting comment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit comment'
        });
    }
};
exports.submitComment = submitComment;
// Get a specific comment by ID
const getComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment_1.default.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }
        // Only return approved comments unless it's an admin request
        if (comment.status !== 'approved') {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }
        res.json({
            success: true,
            data: comment
        });
    }
    catch (error) {
        console.error('Error fetching comment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch comment'
        });
    }
};
exports.getComment = getComment;
// Like a comment
const likeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment_1.default.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }
        if (comment.status !== 'approved') {
            return res.status(400).json({
                success: false,
                error: 'Cannot like unapproved comment'
            });
        }
        await comment.like();
        res.json({
            success: true,
            message: 'Comment liked successfully',
            data: {
                likes: comment.likes,
                score: comment.likes - comment.dislikes
            }
        });
    }
    catch (error) {
        console.error('Error liking comment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to like comment'
        });
    }
};
exports.likeComment = likeComment;
// Dislike a comment
const dislikeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment_1.default.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }
        if (comment.status !== 'approved') {
            return res.status(400).json({
                success: false,
                error: 'Cannot dislike unapproved comment'
            });
        }
        await comment.dislike();
        res.json({
            success: true,
            message: 'Comment disliked successfully',
            data: {
                dislikes: comment.dislikes,
                score: comment.likes - comment.dislikes
            }
        });
    }
    catch (error) {
        console.error('Error disliking comment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to dislike comment'
        });
    }
};
exports.dislikeComment = dislikeComment;
// Edit a comment
const editComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content, reason, authorEmail } = req.body;
        if (!content || content.trim().length < 1 || content.trim().length > 2000) {
            return res.status(400).json({
                success: false,
                error: 'Content must be between 1-2000 characters'
            });
        }
        const comment = await Comment_1.default.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }
        // Verify the user is the author
        if (comment.author.email !== authorEmail) {
            return res.status(403).json({
                success: false,
                error: 'You can only edit your own comments'
            });
        }
        await comment.edit(content.trim(), reason);
        res.json({
            success: true,
            message: 'Comment edited successfully',
            data: {
                comment
            }
        });
    }
    catch (error) {
        console.error('Error editing comment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to edit comment'
        });
    }
};
exports.editComment = editComment;
// Flag a comment
const flagComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { reason, reportedBy, description } = req.body;
        const validReasons = ['spam', 'inappropriate', 'harassment', 'off-topic', 'other'];
        if (!validReasons.includes(reason)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid flag reason'
            });
        }
        if (!reportedBy) {
            return res.status(400).json({
                success: false,
                error: 'Reporter identification is required'
            });
        }
        const comment = await Comment_1.default.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }
        await comment.flag(reason, reportedBy, description);
        res.json({
            success: true,
            message: 'Comment flagged successfully',
            data: {
                flagged: comment.flagged,
                status: comment.status
            }
        });
    }
    catch (error) {
        console.error('Error flagging comment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to flag comment'
        });
    }
};
exports.flagComment = flagComment;
// Admin routes for comment moderation
const moderateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { action, moderationNotes } = req.body;
        // Map action to status
        let status;
        switch (action) {
            case 'approve':
                status = 'approved';
                break;
            case 'reject':
                status = 'rejected';
                break;
            case 'flag':
                status = 'flagged';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid action. Must be approve, reject, or flag'
                });
        }
        const comment = await Comment_1.default.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }
        comment.status = status;
        if (moderationNotes)
            comment.moderationNotes = moderationNotes;
        await comment.save();
        res.json({
            success: true,
            message: 'Comment moderated successfully',
            data: {
                commentId: comment._id,
                status: comment.status
            }
        });
    }
    catch (error) {
        console.error('Error moderating comment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to moderate comment'
        });
    }
};
exports.moderateComment = moderateComment;
// Get flagged comments for moderation
const getFlaggedComments = async (req, res) => {
    try {
        const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy: sortBy,
            sortOrder: sortOrder
        };
        const comments = await Comment_1.default.getFlaggedComments(options);
        const totalComments = await Comment_1.default.countDocuments({ flagged: true });
        res.json({
            success: true,
            data: {
                comments,
                pagination: {
                    currentPage: options.page,
                    totalPages: Math.ceil(totalComments / options.limit),
                    totalComments,
                    hasNextPage: options.page < Math.ceil(totalComments / options.limit),
                    hasPrevPage: options.page > 1
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching flagged comments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch flagged comments'
        });
    }
};
exports.getFlaggedComments = getFlaggedComments;
// Delete a comment (admin only)
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment_1.default.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                error: 'Comment not found'
            });
        }
        // Remove from parent's replies if it's a reply
        if (comment.parentId) {
            const parentComment = await Comment_1.default.findById(comment.parentId);
            if (parentComment) {
                await parentComment.removeReply(commentId);
            }
        }
        // Delete all replies to this comment
        await Comment_1.default.deleteMany({ parentId: commentId });
        // Delete the comment itself
        await Comment_1.default.findByIdAndDelete(commentId);
        res.json({
            success: true,
            message: 'Comment and its replies deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete comment'
        });
    }
};
exports.deleteComment = deleteComment;
// Get all comments for admin (admin only)
const getAllCommentsAdmin = async (req, res) => {
    try {
        console.log('🔍 getAllCommentsAdmin called with query:', req.query);
        // Check total comments in database first
        const totalCommentsInDB = await Comment_1.default.countDocuments();
        console.log('📊 Total comments in database:', totalCommentsInDB);
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', status, resourceType, searchTerm } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy: sortBy,
            sortOrder: sortOrder
        };
        // Build filter object
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }
        if (resourceType && resourceType !== 'all') {
            filter.resourceType = resourceType;
        }
        if (searchTerm) {
            filter.$or = [
                { content: { $regex: searchTerm, $options: 'i' } },
                { 'author.name': { $regex: searchTerm, $options: 'i' } },
                { 'author.email': { $regex: searchTerm, $options: 'i' } }
            ];
        }
        console.log('📊 Filter object:', filter);
        console.log('⚙️ Options:', options);
        // Get comments with pagination
        const comments = await Comment_1.default.find(filter)
            .sort({ [options.sortBy]: options.sortOrder === 'desc' ? -1 : 1 })
            .limit(options.limit)
            .skip((options.page - 1) * options.limit)
            .populate('resourceId', 'title slug');
        // Get total count
        const totalComments = await Comment_1.default.countDocuments(filter);
        console.log('📝 Total comments found:', totalComments);
        console.log('💬 Comments data:', comments.length, 'comments retrieved');
        // Get stats
        const stats = await Comment_1.default.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log('📈 Stats data:', stats);
        const statusStats = {
            approved: 0,
            pending: 0,
            rejected: 0,
            flagged: 0
        };
        stats.forEach(stat => {
            if (stat._id) {
                if (stat._id === 'hidden') {
                    statusStats.flagged = stat.count;
                }
                else if (statusStats.hasOwnProperty(stat._id)) {
                    statusStats[stat._id] = stat.count;
                }
            }
        });
        res.json({
            success: true,
            data: {
                comments,
                pagination: {
                    page: options.page,
                    limit: options.limit,
                    total: totalComments,
                    pages: Math.ceil(totalComments / options.limit)
                },
                stats: statusStats
            }
        });
    }
    catch (error) {
        console.error('Error fetching all comments for admin:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch comments'
        });
    }
};
exports.getAllCommentsAdmin = getAllCommentsAdmin;
// Get comment statistics for a resource
const getCommentStats = async (req, res) => {
    try {
        const { resourceType, resourceId } = req.params;
        const stats = await Comment_1.default.getCommentStats(resourceType, resourceId);
        res.json({
            success: true,
            data: stats[0] || {
                totalComments: 0,
                totalLikes: 0,
                totalDislikes: 0,
                topLevelComments: 0,
                replies: 0
            }
        });
    }
    catch (error) {
        console.error('Error fetching comment stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch comment statistics'
        });
    }
};
exports.getCommentStats = getCommentStats;
