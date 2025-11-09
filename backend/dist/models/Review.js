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
exports.Review = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const reviewSchema = new mongoose_1.Schema({
    resourceType: {
        type: String,
        required: true,
        enum: ['destination', 'guide', 'blog']
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
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        avatar: {
            type: String,
            trim: true
        }
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    pros: [{
            type: String,
            trim: true,
            maxlength: 200
        }],
    cons: [{
            type: String,
            trim: true,
            maxlength: 200
        }],
    travelDate: {
        type: Date,
        validate: {
            validator: function (v) {
                return !v || v <= new Date();
            },
            message: 'Travel date cannot be in the future'
        }
    },
    travelType: {
        type: String,
        enum: ['solo', 'couple', 'family', 'friends', 'business']
    },
    wouldRecommend: {
        type: Boolean,
        required: true
    },
    helpfulVotes: {
        type: Number,
        default: 0,
        min: 0
    },
    replies: [{
            _id: {
                type: mongoose_1.Schema.Types.ObjectId,
                default: () => new mongoose_1.default.Types.ObjectId()
            },
            author: {
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
                },
                avatar: {
                    type: String,
                    trim: true
                }
            },
            content: {
                type: String,
                required: true,
                trim: true,
                maxlength: 1000
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
    images: [{
            url: {
                type: String,
                required: true,
                trim: true
            },
            caption: {
                type: String,
                trim: true,
                maxlength: 200
            }
        }],
    verified: {
        type: Boolean,
        default: false
    },
    featured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    moderationNotes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});
// Indexes for performance
reviewSchema.index({ resourceType: 1, resourceId: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ featured: 1, status: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ helpfulVotes: -1 });
// Virtual for average rating calculation
reviewSchema.virtual('averageRating').get(function () {
    return this.rating;
});
// Method to add a reply
reviewSchema.methods.addReply = function (reply) {
    this.replies.push(reply);
    return this.save();
};
// Method to mark as helpful
reviewSchema.methods.markHelpful = function () {
    this.helpfulVotes += 1;
    return this.save();
};
// Static method to get reviews for a resource
reviewSchema.statics.getResourceReviews = function (resourceType, resourceId, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', minRating, maxRating, travelType, verified } = options;
    const query = {
        resourceType,
        resourceId,
        status: 'approved'
    };
    if (minRating !== undefined)
        query.rating = { ...query.rating, $gte: minRating };
    if (maxRating !== undefined)
        query.rating = { ...query.rating, $lte: maxRating };
    if (travelType)
        query.travelType = travelType;
    if (verified !== undefined)
        query.verified = verified;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    return this.find(query)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
};
// Static method to get review statistics
reviewSchema.statics.getReviewStats = function (resourceType, resourceId) {
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
                totalReviews: { $sum: 1 },
                averageRating: { $avg: '$rating' },
                ratingDistribution: {
                    $push: '$rating'
                }
            }
        },
        {
            $addFields: {
                ratingCounts: {
                    '1': {
                        $size: {
                            $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', 1] }
                            }
                        }
                    },
                    '2': {
                        $size: {
                            $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', 2] }
                            }
                        }
                    },
                    '3': {
                        $size: {
                            $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', 3] }
                            }
                        }
                    },
                    '4': {
                        $size: {
                            $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', 4] }
                            }
                        }
                    },
                    '5': {
                        $size: {
                            $filter: {
                                input: '$ratingDistribution',
                                cond: { $eq: ['$$this', 5] }
                            }
                        }
                    }
                }
            }
        },
        {
            $project: {
                ratingDistribution: 0
            }
        }
    ]);
};
exports.Review = mongoose_1.default.models.Review || mongoose_1.default.model('Review', reviewSchema);
exports.default = exports.Review;
