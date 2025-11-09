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
const resourceSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Resource title is required'],
        trim: true,
        maxlength: [150, 'Title cannot exceed 150 characters']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    category: {
        type: String,
        enum: ['Booking', 'Gear', 'Apps', 'Websites', 'Services', 'Transportation', 'Insurance', 'Other'],
        required: true
    },
    type: {
        type: String,
        enum: ['Tool', 'Service', 'Product', 'Website', 'App', 'Guide', 'Template'],
        required: true
    },
    url: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Please enter a valid URL'
        }
    },
    images: [{
            url: {
                type: String,
                required: true
            },
            alt: {
                type: String,
                required: true
            },
            caption: String
        }],
    features: [{
            type: String,
            trim: true
        }],
    pros: [{
            type: String,
            trim: true
        }],
    cons: [{
            type: String,
            trim: true
        }],
    pricing: {
        type: {
            type: String,
            enum: ['Free', 'Paid', 'Freemium', 'Subscription'],
            required: true
        },
        amount: {
            type: Number,
            min: 0
        },
        currency: {
            type: String,
            default: 'USD'
        },
        description: {
            type: String,
            required: true,
            trim: true
        }
    },
    rating: {
        overall: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        usability: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        value: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        support: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        features: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        }
    },
    tags: [{
            type: String,
            trim: true
        }],
    destinations: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Destination'
        }],
    isAffiliate: {
        type: Boolean,
        default: false
    },
    affiliateLink: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Please enter a valid affiliate URL'
        }
    },
    isRecommended: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviews: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },
            comment: {
                type: String,
                required: true,
                trim: true,
                maxlength: [500, 'Review comment cannot exceed 500 characters']
            },
            date: {
                type: Date,
                default: Date.now
            }
        }],
    totalReviews: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    clickCount: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
// Indexes for better performance
resourceSchema.index({ slug: 1 });
resourceSchema.index({ category: 1, type: 1 });
resourceSchema.index({ isRecommended: 1, isFeatured: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ destinations: 1 });
resourceSchema.index({ averageRating: -1 });
resourceSchema.index({ isActive: 1 });
resourceSchema.index({ author: 1 });
exports.default = mongoose_1.default.model('Resource', resourceSchema);
