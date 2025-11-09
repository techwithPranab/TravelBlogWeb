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
const destinationSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Destination name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
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
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true
    },
    continent: {
        type: String,
        required: [true, 'Continent is required'],
        trim: true
    },
    featuredImage: {
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            required: true
        }
    },
    gallery: [{
            url: {
                type: String,
                required: true
            },
            alt: {
                type: String,
                required: true
            }
        }],
    coordinates: {
        lat: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        lng: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        }
    },
    bestTimeToVisit: {
        type: String,
        required: true,
        trim: true
    },
    averageTemperature: {
        summer: {
            type: String,
            required: true
        },
        winter: {
            type: String,
            required: true
        }
    },
    currency: {
        type: String,
        required: true,
        trim: true
    },
    language: {
        type: String,
        required: true,
        trim: true
    },
    timezone: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
        default: 0
    },
    totalReviews: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    highlights: [{
            type: String,
            trim: true
        }],
    activities: [{
            name: {
                type: String,
                required: true
            },
            icon: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            }
        }],
    accommodation: [{
            type: {
                type: String,
                required: true,
                enum: ['budget', 'mid-range', 'luxury', 'hostel', 'hotel', 'guesthouse', 'homestay']
            },
            name: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            priceRange: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                min: 0,
                max: 5
            },
            amenities: [{
                    type: String
                }],
            bookingUrl: {
                type: String
            }
        }],
    transportation: [{
            type: String,
            trim: true
        }],
    localCuisine: [{
            type: String,
            trim: true
        }],
    travelTips: [{
            type: String,
            trim: true
        }],
    relatedPosts: [{
            id: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            slug: {
                type: String,
                required: true
            },
            image: {
                type: String,
                required: true
            }
        }],
    isPopular: {
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
    status: {
        type: String,
        enum: ['published', 'draft', 'inactive'],
        default: 'published'
    },
    seoTitle: {
        type: String,
        trim: true,
        maxlength: [60, 'SEO title cannot exceed 60 characters']
    },
    seoDescription: {
        type: String,
        trim: true,
        maxlength: [160, 'SEO description cannot exceed 160 characters']
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            // Ensure numeric fields have default values
            ret.rating = ret.rating || 0;
            ret.totalReviews = ret.totalReviews || 0;
            return ret;
        }
    }
});
exports.default = mongoose_1.default.model('Destination', destinationSchema);
