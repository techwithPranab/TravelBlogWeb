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
const PhotoSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    imageUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String
    },
    driveId: {
        type: String
    },
    thumbnailDriveId: {
        type: String
    },
    location: {
        country: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    photographer: {
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
        userId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],
    category: {
        type: String,
        required: true,
        enum: ['landscape', 'architecture', 'food', 'culture', 'adventure', 'wildlife', 'people', 'other']
    },
    camera: {
        make: { type: String, trim: true },
        model: { type: String, trim: true },
        settings: {
            aperture: { type: String },
            shutter: { type: String },
            iso: { type: String },
            focalLength: { type: String }
        }
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'approved', 'rejected', 'inactive'],
        default: 'pending'
    },
    moderationNotes: {
        type: String,
        trim: true
    },
    moderatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    moderatedAt: {
        type: Date
    },
    likes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            default: []
        }],
    views: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    approvedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
// Index for better query performance
PhotoSchema.index({ status: 1, isPublic: 1, isFeatured: -1 });
PhotoSchema.index({ category: 1, status: 1 });
PhotoSchema.index({ 'location.country': 1, status: 1 });
PhotoSchema.index({ tags: 1, status: 1 });
PhotoSchema.index({ likes: -1, status: 1 });
PhotoSchema.index({ submittedAt: -1 });
// Update the updatedAt field before saving
PhotoSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
exports.default = mongoose_1.default.model('Photo', PhotoSchema);
