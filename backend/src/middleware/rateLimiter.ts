import { Request, Response, NextFunction } from 'express'
import Itinerary from '../models/Itinerary'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

// Store for tracking rate limits (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Rate limiting middleware for itinerary generation
 * Limits: 5 generations per user per day
 */
export const itineraryRateLimit = (config: RateLimitConfig = {
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  maxRequests: 5
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      // Check database for actual generation count (more accurate than memory)
      const oneDayAgo = new Date(Date.now() - config.windowMs)
      
      const generationCount = await Itinerary.countDocuments({
        userId,
        createdAt: { $gte: oneDayAgo },
        generatedBy: 'ai'
      })

      if (generationCount >= config.maxRequests) {
        const oldestItinerary = await Itinerary.findOne({
          userId,
          createdAt: { $gte: oneDayAgo },
          generatedBy: 'ai'
        }).sort({ createdAt: 1 })

        const resetTime = oldestItinerary
          ? new Date(oldestItinerary.createdAt.getTime() + config.windowMs)
          : new Date(Date.now() + config.windowMs)

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
        })
      }

      // Add rate limit info to response headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString())
      res.setHeader('X-RateLimit-Remaining', (config.maxRequests - generationCount - 1).toString())
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + config.windowMs).toISOString())

      next()
    } catch (error: any) {
      console.error('Rate limit check failed:', error)
      // Don't block requests if rate limiting fails
      next()
    }
  }
}

/**
 * Simple in-memory rate limiter (for non-critical endpoints)
 */
export const simpleRateLimit = (
  maxRequests: number = 10,
  windowMs: number = 60 * 1000 // 1 minute
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.ip
    const key = `rate_limit:${userId}`
    
    const now = Date.now()
    const limitData = rateLimitStore.get(key)

    if (!limitData || now > limitData.resetTime) {
      // Reset the limit
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return next()
    }

    if (limitData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((limitData.resetTime - now) / 1000)
      })
    }

    // Increment count
    limitData.count++
    rateLimitStore.set(key, limitData)
    
    next()
  }
}

/**
 * Clean up expired entries from rate limit store
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60 * 60 * 1000) // Clean up every hour

export default {
  itineraryRateLimit,
  simpleRateLimit
}
