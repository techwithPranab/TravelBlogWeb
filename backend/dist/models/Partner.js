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
const partnerSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    company: {
        type: String,
        required: [true, 'Company/organization name is required'],
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    partnershipType: {
        type: String,
        required: [true, 'Partnership type is required'],
        enum: {
            values: ['hotel', 'tour', 'brand', 'creator', 'other'],
            message: 'Partnership type must be one of: hotel, tour, brand, creator, other'
        }
    },
    message: {
        type: String,
        required: [true, 'Partnership proposal message is required'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'approved', 'rejected'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
    },
    reviewedAt: {
        type: Date
    },
    reviewedBy: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});
// Indexes for better performance
partnerSchema.index({ email: 1 });
partnerSchema.index({ status: 1 });
partnerSchema.index({ partnershipType: 1 });
partnerSchema.index({ createdAt: -1 });
partnerSchema.index({ status: 1, createdAt: -1 });
// Virtual for full name
partnerSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
// Ensure virtual fields are serialized
partnerSchema.set('toJSON', { virtuals: true });
partnerSchema.set('toObject', { virtuals: true });
exports.default = mongoose_1.default.model('Partner', partnerSchema);
