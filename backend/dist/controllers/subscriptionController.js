"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSubscription = exports.upgradeSubscription = exports.getUsageStats = exports.getSubscriptionStatus = void 0;
const Subscription_1 = __importDefault(require("../models/Subscription"));
const Itinerary_1 = __importDefault(require("../models/Itinerary"));
// @desc    Get subscription status
// @route   GET /api/subscriptions/status
// @access  Private
const getSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        let subscription = await Subscription_1.default.findOne({ userId });
        // Create free subscription if doesn't exist
        if (!subscription) {
            await Subscription_1.default.createFreeSubscription(userId);
            subscription = await Subscription_1.default.findOne({ userId });
        }
        // Ensure subscription exists
        if (!subscription) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create or retrieve subscription'
            });
        }
        res.json({
            success: true,
            data: {
                subscriptionType: subscription.subscriptionType,
                isActive: subscription.isActive(),
                subscriptionStartDate: subscription.subscriptionStartDate,
                subscriptionEndDate: subscription.subscriptionEndDate,
                itinerariesUsed: subscription.itinerariesUsed,
                itinerariesLimit: subscription.itinerariesLimit,
                remainingItineraries: subscription.getRemainingItineraries(),
                autoRenew: subscription.autoRenew,
                cancelledAt: subscription.cancelledAt
            }
        });
    }
    catch (error) {
        console.error('Get subscription status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription status',
            error: error.message
        });
    }
};
exports.getSubscriptionStatus = getSubscriptionStatus;
// @desc    Get usage statistics
// @route   GET /api/subscriptions/usage
// @access  Private
const getUsageStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const subscription = await Subscription_1.default.findOne({ userId });
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }
        // Get total itineraries created
        const totalItineraries = await Itinerary_1.default.countDocuments({ userId });
        // Get itineraries created this year
        const currentYear = new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        const itinerariesThisYear = await Itinerary_1.default.countDocuments({
            userId,
            createdAt: { $gte: yearStart }
        });
        // Get recent itineraries
        const recentItineraries = await Itinerary_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title destinations duration budget createdAt');
        res.json({
            success: true,
            data: {
                subscription: {
                    type: subscription.subscriptionType,
                    used: subscription.itinerariesUsed,
                    limit: subscription.itinerariesLimit,
                    remaining: subscription.getRemainingItineraries()
                },
                stats: {
                    totalItineraries,
                    itinerariesThisYear,
                    recentItineraries
                }
            }
        });
    }
    catch (error) {
        console.error('Get usage stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch usage statistics',
            error: error.message
        });
    }
};
exports.getUsageStats = getUsageStats;
// @desc    Upgrade to premium subscription
// @route   POST /api/subscriptions/upgrade
// @access  Private
const upgradeSubscription = async (req, res) => {
    try {
        const userId = req.user._id;
        const { paymentId } = req.body;
        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment ID is required'
            });
        }
        // TODO: Verify payment with payment gateway
        const amount = 1000; // ₹1000 for premium
        const subscription = await Subscription_1.default.upgradeToPremium(userId, paymentId, amount);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }
        res.json({
            success: true,
            message: 'Successfully upgraded to Premium subscription',
            data: {
                subscriptionType: subscription.subscriptionType,
                subscriptionEndDate: subscription.subscriptionEndDate,
                itinerariesLimit: subscription.itinerariesLimit,
                amount: subscription.amount,
                currency: subscription.currency
            }
        });
    }
    catch (error) {
        console.error('Upgrade subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upgrade subscription',
            error: error.message
        });
    }
};
exports.upgradeSubscription = upgradeSubscription;
// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
const cancelSubscription = async (req, res) => {
    try {
        const userId = req.user._id;
        const subscription = await Subscription_1.default.findOne({ userId });
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }
        if (subscription.subscriptionType === 'free') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel free subscription'
            });
        }
        subscription.cancelledAt = new Date();
        subscription.autoRenew = false;
        await subscription.save();
        res.json({
            success: true,
            message: 'Subscription cancelled successfully. You can continue using premium features until the end of your current billing period.',
            data: {
                cancelledAt: subscription.cancelledAt,
                subscriptionEndDate: subscription.subscriptionEndDate
            }
        });
    }
    catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel subscription',
            error: error.message
        });
    }
};
exports.cancelSubscription = cancelSubscription;
