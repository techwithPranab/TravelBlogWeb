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
const subscriptionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    subscriptionType: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free',
        required: true
    },
    subscriptionStartDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    subscriptionEndDate: {
        type: Date
    },
    itinerariesUsed: {
        type: Number,
        default: 0,
        required: true
    },
    itinerariesLimit: {
        type: Number,
        default: 5, // Free tier default
        required: true
    },
    paymentId: {
        type: String
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    amount: {
        type: Number
    },
    currency: {
        type: String,
        default: 'INR'
    },
    autoRenew: {
        type: Boolean,
        default: false
    },
    cancelledAt: {
        type: Date
    }
}, {
    timestamps: true
});
// Indexes
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ subscriptionType: 1 });
subscriptionSchema.index({ subscriptionEndDate: 1 });
// Methods
subscriptionSchema.methods.isActive = function () {
    if (this.subscriptionType === 'free') {
        return true;
    }
    if (this.subscriptionType === 'premium') {
        if (!this.subscriptionEndDate)
            return false;
        return new Date() < this.subscriptionEndDate && !this.cancelledAt;
    }
    return false;
};
subscriptionSchema.methods.canCreateItinerary = function () {
    return this.isActive() && this.itinerariesUsed < this.itinerariesLimit;
};
subscriptionSchema.methods.getRemainingItineraries = function () {
    return Math.max(0, this.itinerariesLimit - this.itinerariesUsed);
};
subscriptionSchema.methods.incrementUsage = async function () {
    this.itinerariesUsed += 1;
    await this.save();
};
subscriptionSchema.methods.resetUsage = async function () {
    this.itinerariesUsed = 0;
    await this.save();
};
// Static methods
subscriptionSchema.statics.createFreeSubscription = async function (userId) {
    return await this.create({
        userId,
        subscriptionType: 'free',
        subscriptionStartDate: new Date(),
        itinerariesUsed: 0,
        itinerariesLimit: 5
    });
};
subscriptionSchema.statics.upgradeToPremium = async function (userId, paymentId, amount) {
    const subscription = await this.findOne({ userId });
    if (!subscription)
        return null;
    const now = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year from now
    subscription.subscriptionType = 'premium';
    subscription.subscriptionStartDate = now;
    subscription.subscriptionEndDate = endDate;
    subscription.itinerariesLimit = 40;
    subscription.paymentId = paymentId;
    subscription.paymentStatus = 'completed';
    subscription.amount = amount;
    subscription.currency = 'INR';
    subscription.cancelledAt = undefined;
    await subscription.save();
    return subscription;
};
exports.default = mongoose_1.default.model('Subscription', subscriptionSchema);
