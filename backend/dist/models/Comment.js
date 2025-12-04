"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const commentSchema = new mongoose_1.Schema({
    resourceType: {
        type: String,
        required: true,
        enum: ['blog', 'destination', 'guide', 'photo']
    },
    resourceId: {
        type: String,
        required: true,
        index: true
    },
    author: {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        avatar: {
            type: String,
            trim: true
        },
        website: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    if (!v)
                        return true;
                    return /^https?:\/\/.+/.test(v);
                },
                message: 'Website must be a valid URL starting with http:// or https://'
            }
        }
    },
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 2000
    },
    parentId: {
        type: String,
        index: true,
        validate: {
            validator: async function (v) {
                if (!v)
                    return true;
                const Comment = mongoose_1.default.model('Comment');
                const parent = await Comment.findById(v);
                return !!parent;
            },
            message: 'Parent comment does not exist'
        }
    },
    replies: [{
            type: String,
            ref: 'Comment'
        }],
    likes: {
        type: Number,
        default: 0,
        min: 0
    },
    dislikes: {
        type: Number,
        default: 0,
        min: 0
    },
    mentions: [{
            name: {
                type: String,
                required: true,
                trim: true
            },
            email: {
                type: String,
                required: true,
                lowercase: true,
                trim: true
            }
        }],
    attachments: [{
            type: {
                type: String,
                enum: ['image', 'link'],
                required: true
            },
            url: {
                type: String,
                required: true,
                trim: true
            },
            title: {
                type: String,
                trim: true,
                maxlength: 200
            },
            description: {
                type: String,
                trim: true,
                maxlength: 500
            }
        }],
    edited: {
        type: Boolean,
        default: false
    },
    editHistory: [{
            content: {
                type: String,
                required: true
            },
            editedAt: {
                type: Date,
                default: Date.now
            },
            reason: {
                type: String,
                trim: true,
                maxlength: 200
            }
        }],
    flagged: {
        type: Boolean,
        default: false
    },
    flagReasons: [{
            reason: {
                type: String,
                enum: ['spam', 'inappropriate', 'harassment', 'off-topic', 'other'],
                required: true
            },
            reportedBy: {
                type: String,
                required: true,
                trim: true
            },
            reportedAt: {
                type: Date,
                default: Date.now
            },
            description: {
                type: String,
                trim: true,
                maxlength: 500
            }
        }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'hidden', 'flagged'],
        default: 'approved' // Auto-approve by default, can be changed based on moderation policy
    },
    moderationNotes: {
        type: String,
        trim: true
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});
// Indexes for performance
commentSchema.index({ resourceType: 1, resourceId: 1 });
commentSchema.index({ parentId: 1 });
commentSchema.index({ status: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ likes: -1 });
commentSchema.index({ flagged: 1 });
commentSchema.index({ 'author.email': 1 });
// Virtual for net score (likes - dislikes)
commentSchema.virtual('score').get(function () {
    return this.likes - this.dislikes;
});
// Virtual for reply count
commentSchema.virtual('replyCount').get(function () {
    return this.replies.length;
});
// Virtual for flag count
commentSchema.virtual('flagCount').get(function () {
    return this.flagReasons.length;
});
// Pre-save middleware to detect mentions
commentSchema.pre('save', function (next) {
    if (this.isModified('content')) {
        // Extract mentions from content (e.g., @username)
        const mentionRegex = /@(\w+)/g;
        let match;
        while ((match = mentionRegex.exec(this.content)) !== null) {
            // Here you would typically look up actual users by username
            // For now, we'll just detect mentions without storing them
            console.log('Mention detected:', match[1]);
        }
    }
    next();
});
// Method to add a reply
commentSchema.methods.addReply = function (replyId) {
    if (!this.replies.includes(replyId)) {
        this.replies.push(replyId);
        return this.save();
    }
    return Promise.resolve(this);
};
// Method to remove a reply
commentSchema.methods.removeReply = function (replyId) {
    this.replies = this.replies.filter((id) => id !== replyId);
    return this.save();
};
// Method to like comment
commentSchema.methods.like = function () {
    this.likes += 1;
    return this.save();
};
// Method to dislike comment
commentSchema.methods.dislike = function () {
    this.dislikes += 1;
    return this.save();
};
// Method to edit comment
commentSchema.methods.edit = function (newContent, reason) {
    // Save current content to history
    this.editHistory.push({
        content: this.content,
        editedAt: new Date(),
        reason
    });
    this.content = newContent;
    this.edited = true;
    return this.save();
};
// Method to flag comment
commentSchema.methods.flag = function (reason, reportedBy, description) {
    this.flagReasons.push({
        reason,
        reportedBy,
        reportedAt: new Date(),
        description
    });
    this.flagged = true;
    // Auto-hide if flagged multiple times
    if (this.flagReasons.length >= 3) {
        this.status = 'hidden';
    }
    return this.save();
};
// Static method to get comments for a resource
commentSchema.statics.getResourceComments = function (resourceType, resourceId, options = {}) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', includeReplies = true, parentId = null } = options;
    const query = {
        resourceType,
        resourceId,
        status: { $in: ['approved'] }
    };
    // Filter for top-level comments or replies
    if (includeReplies && !parentId) {
        query.parentId = null;
    }
    else if (parentId) {
        query.parentId = parentId;
    }
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    return this.find(query)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('replies', 'author content likes dislikes createdAt status')
        .exec();
};
// Static method to get comment statistics
commentSchema.statics.getCommentStats = function (resourceType, resourceId) {
    return this.aggregate([
        {
            $match: {
                resourceType,
                resourceId,
                status: 'approved'
            }
        },
        {
            $group: {
                _id: null,
                totalComments: { $sum: 1 },
                totalLikes: { $sum: '$likes' },
                totalDislikes: { $sum: '$dislikes' },
                avgLikes: { $avg: '$likes' },
                topLevelComments: {
                    $sum: {
                        $cond: [{ $eq: ['$parentId', null] }, 1, 0]
                    }
                },
                replies: {
                    $sum: {
                        $cond: [{ $ne: ['$parentId', null] }, 1, 0]
                    }
                }
            }
        }
    ]);
};
// Static method to get flagged comments for moderation
commentSchema.statics.getFlaggedComments = function (options = {}) {
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    return this.find({ flagged: true })
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
};
exports.Comment = mongoose_1.default.models.Comment || mongoose_1.default.model('Comment', commentSchema);
exports.default = exports.Comment;
