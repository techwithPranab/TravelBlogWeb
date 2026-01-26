"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetrics = exports.getSubscribers = exports.getStats = exports.updatePreferences = exports.verifyEmail = exports.unsubscribe = exports.subscribe = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Newsletter_1 = __importDefault(require("@/models/Newsletter"));
// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = async (req, res) => {
    try {
        const { email, name, source = 'homepage', preferences } = req.body;
        // Check if email already exists
        const existingSubscriber = await Newsletter_1.default.findOne({ email });
        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                res.status(400).json({
                    success: false,
                    error: 'Email is already subscribed to our newsletter'
                });
                return;
            }
            else {
                // Reactivate subscription
                existingSubscriber.isActive = true;
                existingSubscriber.subscribedAt = new Date();
                existingSubscriber.unsubscribedAt = undefined;
                if (name)
                    existingSubscriber.name = name;
                if (preferences)
                    existingSubscriber.preferences = { ...existingSubscriber.preferences, ...preferences };
                await existingSubscriber.save();
                res.status(200).json({
                    success: true,
                    message: 'Successfully resubscribed to newsletter',
                    data: {
                        email: existingSubscriber.email,
                        name: existingSubscriber.name,
                        isVerified: existingSubscriber.isVerified
                    }
                });
                return;
            }
        }
        // Generate verification token
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        // Create new subscriber
        const subscriber = await Newsletter_1.default.create({
            email,
            name,
            source,
            preferences: preferences || {
                weekly: true,
                deals: true,
                destinations: true,
                tips: true,
                travelTips: true,
                photography: true,
                weeklyDigest: true
            },
            verificationToken,
            isVerified: false // Set to true in development, false in production
        });
        // Email verification will be implemented with email service
        console.log(`Verification email should be sent to ${email} with token: ${verificationToken}`);
        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to newsletter. Please check your email to verify your subscription.',
            data: {
                email: subscriber.email,
                name: subscriber.name,
                isVerified: subscriber.isVerified
            }
        });
    }
    catch (error) {
        console.error('Newsletter subscription error:', error);
        if (error.code === 11000) {
            res.status(400).json({
                success: false,
                error: 'Email is already subscribed'
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Server error during subscription'
        });
    }
};
exports.subscribe = subscribe;
// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
const unsubscribe = async (req, res) => {
    try {
        const { email, token } = req.body;
        const subscriber = await Newsletter_1.default.findOne({
            email,
            ...(token && { verificationToken: token })
        });
        if (!subscriber) {
            res.status(404).json({
                success: false,
                error: 'Subscriber not found'
            });
            return;
        }
        subscriber.isActive = false;
        subscriber.unsubscribedAt = new Date();
        await subscriber.save();
        res.status(200).json({
            success: true,
            message: 'Successfully unsubscribed from newsletter'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error during unsubscription'
        });
    }
};
exports.unsubscribe = unsubscribe;
// @desc    Verify email subscription
// @route   GET /api/newsletter/verify/:token
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const subscriber = await Newsletter_1.default.findOne({ verificationToken: token });
        if (!subscriber) {
            res.status(400).json({
                success: false,
                error: 'Invalid verification token'
            });
            return;
        }
        subscriber.isVerified = true;
        subscriber.verificationToken = undefined;
        await subscriber.save();
        res.status(200).json({
            success: true,
            message: 'Email successfully verified'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error during verification'
        });
    }
};
exports.verifyEmail = verifyEmail;
// @desc    Update newsletter preferences
// @route   PUT /api/newsletter/preferences
// @access  Public
const updatePreferences = async (req, res) => {
    try {
        const { email, preferences, token } = req.body;
        const subscriber = await Newsletter_1.default.findOne({
            email,
            ...(token && { verificationToken: token })
        });
        if (!subscriber) {
            res.status(404).json({
                success: false,
                error: 'Subscriber not found'
            });
            return;
        }
        subscriber.preferences = { ...subscriber.preferences, ...preferences };
        await subscriber.save();
        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: subscriber.preferences
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error updating preferences'
        });
    }
};
exports.updatePreferences = updatePreferences;
// @desc    Get newsletter statistics (admin only)
// @route   GET /api/newsletter/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const totalSubscribers = await Newsletter_1.default.countDocuments();
        const activeSubscribers = await Newsletter_1.default.countDocuments({ isActive: true });
        const verifiedSubscribers = await Newsletter_1.default.countDocuments({ isVerified: true, isActive: true });
        const recentSubscriptions = await Newsletter_1.default.countDocuments({
            subscribedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
        // Subscription sources breakdown
        const sourceStats = await Newsletter_1.default.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$source', count: { $sum: 1 } } }
        ]);
        // Monthly subscription trends
        const monthlyStats = await Newsletter_1.default.aggregate([
            {
                $match: {
                    subscribedAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$subscribedAt' },
                        month: { $month: '$subscribedAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalSubscribers,
                activeSubscribers,
                verifiedSubscribers,
                recentSubscriptions,
                sourceStats,
                monthlyStats
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error getting statistics'
        });
    }
};
exports.getStats = getStats;
// @desc    Get all subscribers (admin only)
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
const getSubscribers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        let isActive;
        if (req.query.isActive === 'true')
            isActive = true;
        else if (req.query.isActive === 'false')
            isActive = false;
        let isVerified;
        if (req.query.isVerified === 'true')
            isVerified = true;
        else if (req.query.isVerified === 'false')
            isVerified = false;
        const filter = {};
        if (isActive !== undefined)
            filter.isActive = isActive;
        if (isVerified !== undefined)
            filter.isVerified = isVerified;
        const subscribers = await Newsletter_1.default.find(filter)
            .select('-verificationToken')
            .sort({ subscribedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const total = await Newsletter_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: subscribers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error getting subscribers'
        });
    }
};
exports.getSubscribers = getSubscribers;
// @desc    Get newsletter metrics for public display
// @route   GET /api/newsletter/public/metrics
// @access  Public
const getMetrics = async (req, res) => {
    try {
        const [weeklyDigestSubscribers, dealAlertsSubscribers, destinationSubscribers, travelTipsSubscribers, totalActiveSubscribers] = await Promise.all([
            Newsletter_1.default.countDocuments({
                isActive: true,
                'preferences.weeklyDigest': true
            }),
            Newsletter_1.default.countDocuments({
                isActive: true,
                'preferences.deals': true
            }),
            Newsletter_1.default.countDocuments({
                isActive: true,
                'preferences.destinations': true
            }),
            Newsletter_1.default.countDocuments({
                isActive: true,
                'preferences.travelTips': true
            }),
            Newsletter_1.default.countDocuments({ isActive: true })
        ]);
        // Format numbers for display (e.g., 45000 -> "45K+")
        // Show minimum values for better presentation
        const formatNumber = (num) => {
            if (num >= 1000000)
                return `${Math.floor(num / 1000000)}M+`;
            if (num >= 1000)
                return `${Math.floor(num / 1000)}K+`;
            // For new sites, show minimum 1K+ instead of 0
            return num > 0 ? `${num}` : '1K+';
        };
        res.json({
            success: true,
            data: {
                weeklyDigest: formatNumber(weeklyDigestSubscribers),
                dealAlerts: formatNumber(dealAlertsSubscribers),
                destinations: formatNumber(destinationSubscribers),
                travelTips: formatNumber(travelTipsSubscribers),
                totalActive: formatNumber(totalActiveSubscribers)
            }
        });
    }
    catch (error) {
        console.error('Newsletter metrics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch newsletter metrics'
        });
    }
};
exports.getMetrics = getMetrics;
