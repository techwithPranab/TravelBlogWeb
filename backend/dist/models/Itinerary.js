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
const ActivitySchema = new mongoose_1.Schema({
    time: { type: String, default: 'TBD' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    estimatedCost: { type: Number, default: 0 },
    duration: { type: String, default: 'N/A' },
    location: { type: String }
});
const DayPlanSchema = new mongoose_1.Schema({
    day: { type: Number, required: true },
    date: { type: String },
    morning: [ActivitySchema],
    afternoon: [ActivitySchema],
    evening: [ActivitySchema],
    totalEstimatedCost: { type: Number, required: true },
    notes: { type: String }
});
const TransportationTipSchema = new mongoose_1.Schema({
    type: { type: String },
    description: { type: String },
    estimatedCost: { type: Number },
    insiderTip: { type: String },
    bookingInfo: { type: String }
}, { _id: false });
const ItinerarySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    source: {
        type: String,
        required: true,
        trim: true
    },
    destinations: {
        type: [String],
        required: true,
        validate: {
            validator: (v) => v.length > 0 && v.length <= 5,
            message: 'At least 1 and maximum 5 destinations are allowed'
        }
    },
    destination: {
        type: String,
        trim: true
    },
    travelMode: {
        type: String,
        enum: ['air', 'rail', 'car', 'bus', 'mixed'],
        required: true
    },
    adults: {
        type: Number,
        required: true,
        min: 1,
        max: 20,
        default: 1
    },
    children: {
        type: Number,
        required: true,
        min: 0,
        max: 10,
        default: 0
    },
    totalPeople: {
        type: Number,
        required: true,
        min: 1,
        max: 30
    },
    numberOfRooms: {
        type: Number,
        required: false,
        min: 1,
        max: 10,
        default: 1
    },
    dietType: {
        type: String,
        enum: ['veg', 'non-veg', 'both'],
        required: false,
        default: 'both'
    },
    includeAccommodationReference: {
        type: Boolean,
        default: true
    },
    includeRestaurantReference: {
        type: Boolean,
        default: true
    },
    includeWeatherReference: {
        type: Boolean,
        default: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: Number,
        required: true,
        min: 1,
        max: 30
    },
    startDate: {
        type: Date,
        required: false // Made optional for backward compatibility
    },
    endDate: {
        type: Date,
        required: false // Made optional for backward compatibility
    },
    budget: {
        type: String,
        enum: ['budget', 'moderate', 'luxury'],
        required: true
    },
    interests: {
        type: [String],
        required: true,
        validate: {
            validator: (v) => v.length > 0,
            message: 'At least one interest is required'
        }
    },
    travelStyle: {
        type: String,
        enum: ['solo', 'couple', 'family', 'group'],
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    currencySymbol: {
        type: String,
        default: '$'
    },
    dayPlans: {
        type: [DayPlanSchema],
        default: []
    },
    accommodationSuggestions: {
        type: [{
                name: String,
                type: String,
                priceRange: String,
                location: {
                    address: String,
                    area: String,
                    coordinates: {
                        lat: Number,
                        lng: Number
                    }
                },
                amenities: [String],
                proximityToAttractions: String,
                bookingTip: String,
                whyRecommended: String
            }],
        default: []
    },
    transportationTips: {
        type: [TransportationTipSchema],
        default: []
    },
    restaurantRecommendations: {
        type: [{
                name: String,
                cuisine: String,
                priceRange: String,
                mealType: [String],
                location: {
                    address: String,
                    area: String,
                    coordinates: {
                        lat: Number,
                        lng: Number
                    }
                },
                mustTryDish: String,
                reservationNeeded: Boolean,
                localFavorite: Boolean
            }],
        default: []
    },
    generalTips: {
        type: [String],
        default: []
    },
    packingList: {
        type: [String],
        default: []
    },
    weatherForecast: {
        type: mongoose_1.Schema.Types.Mixed,
        default: null
    },
    dailyCostBreakdown: {
        type: [{
                day: Number,
                flightCost: { type: Number, default: 0 },
                accommodationCost: { type: Number, default: 0 },
                foodCost: { type: Number, default: 0 },
                sightseeingCost: { type: Number, default: 0 },
                localTransportCost: { type: Number, default: 0 },
                shoppingCost: { type: Number, default: 0 },
                miscellaneousCost: { type: Number, default: 0 },
                totalDayCost: { type: Number, default: 0 }
            }],
        default: []
    },
    budgetBreakdown: {
        type: {
            totalFlightCost: { type: Number, default: 0 },
            totalAccommodationCost: { type: Number, default: 0 },
            totalFoodCost: { type: Number, default: 0 },
            totalSightseeingCost: { type: Number, default: 0 },
            totalLocalTransportCost: { type: Number, default: 0 },
            totalShoppingCost: { type: Number, default: 0 },
            totalMiscellaneousCost: { type: Number, default: 0 }
        },
        default: {}
    },
    totalEstimatedCost: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    shareToken: {
        type: String,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: ['generating', 'completed', 'failed', 'edited'],
        default: 'generating'
    },
    generatedBy: {
        type: String,
        enum: ['ai', 'manual'],
        default: 'ai'
    },
    aiModel: {
        type: String,
        default: 'gpt-4'
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    lastEditedAt: {
        type: Date
    },
    viewCount: {
        type: Number,
        default: 0
    },
    shareCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
// Indexes for better query performance
ItinerarySchema.index({ userId: 1, createdAt: -1 });
ItinerarySchema.index({ shareToken: 1 });
ItinerarySchema.index({ status: 1 });
// Calculate totalPeople before saving
ItinerarySchema.pre('save', function (next) {
    // Calculate total people
    this.totalPeople = this.adults + this.children;
    // Set destination from destinations array for backward compatibility
    if (this.destinations && this.destinations.length > 0) {
        this.destination = this.destinations.join(', ');
    }
    // Generate share token if public
    if (!this.shareToken && this.isPublic) {
        this.shareToken = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
    next();
});
exports.default = mongoose_1.default.model('Itinerary', ItinerarySchema);
