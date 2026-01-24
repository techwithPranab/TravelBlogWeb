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
const RestaurantSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    destinationName: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    cuisine: [{
            type: String,
            required: true
        }],
    priceRange: {
        type: String,
        required: true
    },
    averageCost: {
        type: Number
    },
    currency: {
        type: String
    },
    location: {
        address: { type: String },
        area: { type: String },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    specialties: [{
            type: String
        }],
    description: {
        type: String
    },
    mealType: [{
            type: String
        }],
    dietaryOptions: [{
            type: String
        }],
    rating: {
        type: Number,
        min: 0,
        max: 5
    },
    mustTry: [{
            type: String
        }],
    contactInfo: {
        phone: { type: String },
        email: { type: String },
        website: { type: String }
    },
    isManuallyAdded: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// Indexes
RestaurantSchema.index({ userId: 1, createdAt: -1 });
RestaurantSchema.index({ cuisine: 1 });
// Compound index to prevent duplicate restaurants in same location
RestaurantSchema.index({ name: 1, 'location.address': 1, destinationName: 1 }, { unique: true, sparse: true });
exports.default = mongoose_1.default.model('Restaurant', RestaurantSchema);
