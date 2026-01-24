"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleRateLimit = exports.itineraryRateLimit = void 0;
const Itinerary_1 = __importDefault(require("../models/Itinerary"));
// Store for tracking rate limits (in production, use Redis)
const rateLimitStore = new Map();
/**
 * Rate limiting middleware for itinerary generation
 * Limits: 5 generations per user per day
 */
const itineraryRateLimit = (config = {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 5
}) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            // Check database for actual generation count (more accurate than memory)
            const oneDayAgo = new Date(Date.now() - config.windowMs);
            const generationCount = await Itinerary_1.default.countDocuments({
                userId,
                createdAt: { $gte: oneDayAgo },
                generatedBy: 'ai'
            });
            if (generationCount >= config.maxRequests) {
                const oldestItinerary = await Itinerary_1.default.findOne({
                    userId,
                    createdAt: { $gte: oneDayAgo },
                    generatedBy: 'ai'
                }).sort({ createdAt: 1 });
                const resetTime = oldestItinerary
                    ? new Date(oldestItinerary.createdAt.getTime() + config.windowMs)
                    : new Date(Date.now() + config.windowMs);
                return res.status(429).json({
                    success: false,
                    message: `Rate limit exceeded. You can generate ${config.maxRequests} itineraries per day.`,
                    error: {
                        code: 'RATE_LIMIT_EXCEEDED',
                        limit: config.maxRequests,
                        current: generationCount,
                        resetTime: resetTime.toISOString(),
                        retryAfter: Math.ceil((resetTime.getTime() - Date.now()) / 1000)
                    }
                });
            }
            // Add rate limit info to response headers
            res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
            res.setHeader('X-RateLimit-Remaining', (config.maxRequests - generationCount - 1).toString());
            res.setHeader('X-RateLimit-Reset', new Date(Date.now() + config.windowMs).toISOString());
            next();
        }
        catch (error) {
            console.error('Rate limit check failed:', error);
            // Don't block requests if rate limiting fails
            next();
        }
    };
};
exports.itineraryRateLimit = itineraryRateLimit;
/**
 * Simple in-memory rate limiter (for non-critical endpoints)
 */
const simpleRateLimit = (maxRequests = 10, windowMs = 60 * 1000 // 1 minute
) => {
    return (req, res, next) => {
        const userId = req.user?.id || req.ip;
        const key = `rate_limit:${userId}`;
        const now = Date.now();
        const limitData = rateLimitStore.get(key);
        if (!limitData || now > limitData.resetTime) {
            // Reset the limit
            rateLimitStore.set(key, {
                count: 1,
                resetTime: now + windowMs
            });
            return next();
        }
        if (limitData.count >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((limitData.resetTime - now) / 1000)
            });
        }
        // Increment count
        limitData.count++;
        rateLimitStore.set(key, limitData);
        next();
    };
};
exports.simpleRateLimit = simpleRateLimit;
/**
 * Clean up expired entries from rate limit store
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 60 * 60 * 1000); // Clean up every hour
exports.default = {
    itineraryRateLimit: exports.itineraryRateLimit,
    simpleRateLimit: exports.simpleRateLimit
};
