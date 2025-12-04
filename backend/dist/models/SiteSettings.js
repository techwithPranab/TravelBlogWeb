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
const siteSettingsSchema = new mongoose_1.Schema({
    siteName: {
        type: String,
        required: [true, 'Site name is required'],
        default: 'BagPackStories'
    },
    siteDescription: {
        type: String,
        required: [true, 'Site description is required'],
        default: 'Discover amazing travel destinations and guides'
    },
    siteUrl: {
        type: String,
        required: [true, 'Site URL is required'],
        default: 'https://yourdomain.com'
    },
    contactEmail: {
        type: String,
        required: [true, 'Contact email is required'],
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    supportEmail: {
        type: String,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    contactPhone: {
        type: String,
        default: '+1 (555) 123-4567'
    },
    contactAddress: {
        street: { type: String, default: '123 Travel Street' },
        city: { type: String, default: 'San Francisco' },
        state: { type: String, default: 'CA' },
        zipCode: { type: String, default: '94105' },
        country: { type: String, default: 'USA' }
    },
    businessHours: {
        monday: { type: String, default: '9:00 AM - 6:00 PM' },
        tuesday: { type: String, default: '9:00 AM - 6:00 PM' },
        wednesday: { type: String, default: '9:00 AM - 6:00 PM' },
        thursday: { type: String, default: '9:00 AM - 6:00 PM' },
        friday: { type: String, default: '9:00 AM - 6:00 PM' },
        saturday: { type: String, default: '10:00 AM - 4:00 PM' },
        sunday: { type: String, default: 'Closed' }
    },
    supportSettings: {
        email: { type: String, default: process.env.SUPPORT_EMAIL || 'support@yourdomain.com' },
        responseTime: { type: String, default: 'Within 24 hours' }
    },
    socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String,
        youtube: String,
        linkedin: String
    },
    seoSettings: {
        metaTitle: {
            type: String,
            default: 'BagPackStories - Discover Amazing Destinations'
        },
        metaDescription: {
            type: String,
            default: 'Discover amazing travel destinations, guides, and tips from experienced travelers around the world.'
        },
        metaKeywords: [{
                type: String
            }],
        ogImage: String
    },
    emailSettings: {
        smtpHost: String,
        smtpPort: Number,
        smtpUser: String,
        smtpPassword: String,
        fromEmail: {
            type: String,
            required: [true, 'From email is required'],
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
        },
        fromName: {
            type: String,
            required: [true, 'From name is required']
        }
    },
    generalSettings: {
        postsPerPage: {
            type: Number,
            default: 12,
            min: 1,
            max: 50
        },
        commentsEnabled: {
            type: Boolean,
            default: true
        },
        registrationEnabled: {
            type: Boolean,
            default: true
        },
        maintenanceMode: {
            type: Boolean,
            default: false
        },
        analyticsCode: String
    },
    theme: {
        primaryColor: {
            type: String,
            default: '#3B82F6'
        },
        secondaryColor: {
            type: String,
            default: '#8B5CF6'
        },
        logo: String,
        favicon: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Ensure only one settings document exists
siteSettingsSchema.index({}, { unique: true });
exports.default = mongoose_1.default.model('SiteSettings', siteSettingsSchema);
