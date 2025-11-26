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
const mongoose_1 = __importStar(require("mongoose"));
const postSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    excerpt: {
        type: String,
        required: [true, 'Please provide an excerpt'],
        trim: true,
        maxlength: [500, 'Excerpt cannot be more than 500 characters']
    },
    content: {
        type: String,
        required: [true, 'Please provide content']
    },
    contentSections: [{
            id: {
                type: String,
                required: true
            },
            type: {
                type: String,
                enum: ['text', 'image-text', 'image-only'],
                required: true
            },
            title: {
                type: String,
                trim: true
            },
            content: {
                type: String,
                required: function () {
                    return this.type !== 'image-only';
                }
            },
            image: {
                url: String,
                alt: String,
                caption: String
            },
            imagePosition: {
                type: String,
                enum: ['left', 'right', 'center', 'full-width'],
                default: 'left'
            },
            order: {
                type: Number,
                required: true
            }
        }],
    featuredImage: {
        url: String,
        alt: String,
        caption: String
    },
    images: [{
            type: String
        }],
    youtubeVideos: [{
            id: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true,
                trim: true
            },
            url: {
                type: String,
                required: true,
                trim: true
            },
            description: {
                type: String,
                trim: true
            },
            order: {
                type: Number,
                required: true,
                default: 0
            }
        }],
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categories: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Category'
        }],
    tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],
    seo: {
        metaTitle: {
            type: String,
            maxlength: [60, 'Meta title cannot be more than 60 characters']
        },
        metaDescription: {
            type: String,
            maxlength: [160, 'Meta description cannot be more than 160 characters']
        },
        focusKeyword: {
            type: String,
            maxlength: [50, 'Focus keyword cannot be more than 50 characters']
        },
        ogImage: String
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'published', 'rejected', 'archived', 'inactive'],
        default: 'draft'
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    readTime: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    likeCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
    likes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            default: []
        }],
    comments: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Comment',
            default: []
        }],
    destination: {
        country: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        coordinates: {
            lat: {
                type: Number,
                min: -90,
                max: 90
            },
            lng: {
                type: Number,
                min: -180,
                max: 180
            }
        }
    },
    // Approval workflow fields
    submittedAt: {
        type: Date
    },
    moderatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    moderatedAt: {
        type: Date
    },
    moderationNotes: {
        type: String,
        trim: true
    },
    publishedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            // Convert backend field names to match frontend API interface
            ret.views = ret.viewCount || 0;
            ret.likes = ret.likeCount || 0;
            ret.comments = ret.commentCount || 0;
            // Ensure numeric fields have default values
            ret.viewCount = ret.viewCount || 0;
            ret.likeCount = ret.likeCount || 0;
            ret.commentCount = ret.commentCount || 0;
            ret.readTime = ret.readTime || 0;
            return ret;
        }
    },
    toObject: { virtuals: true }
});
// Indexes for better performance
postSchema.index({ slug: 1 });
postSchema.index({ author: 1 });
postSchema.index({ categories: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ status: 1 });
postSchema.index({ isPremium: 1 });
postSchema.index({ isFeatured: 1 });
postSchema.index({ publishedAt: -1 });
postSchema.index({ viewCount: -1 });
postSchema.index({ createdAt: -1 });
// Text index for search
postSchema.index({
    title: 'text',
    excerpt: 'text',
    content: 'text',
    tags: 'text'
}, {
    weights: {
        title: 10,
        excerpt: 5,
        tags: 3,
        content: 1
    }
});
// Generate slug from title before saving
postSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }
    next();
});
// Calculate read time before saving
postSchema.pre('save', function (next) {
    if (this.isModified('content')) {
        const wordsPerMinute = 200;
        const words = this.content.trim().split(/\s+/).length;
        this.readTime = Math.ceil(words / wordsPerMinute);
    }
    next();
});
// Set published date when status changes to published
postSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        if (this.status === 'published' && !this.publishedAt) {
            this.publishedAt = new Date();
        }
        if (this.status === 'pending' && !this.submittedAt) {
            this.submittedAt = new Date();
        }
    }
    next();
});
// Virtual for comments
exports.default = mongoose_1.default.model('Post', postSchema);
