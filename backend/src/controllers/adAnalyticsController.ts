import { Request, Response, NextFunction } from 'express'
import adAnalyticsService from '../services/adAnalyticsService'
import { AdPlacement } from '../models/Advertisement'

/**
 * Ad Analytics Controller
 * Handles tracking and analytics for advertisements
 */

/**
 * @route   POST /api/ad-analytics/impression
 * @desc    Track ad impression
 * @access  Public
 */
export const trackImpression = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      advertisementId,
      blogPostId,
      placement,
      deviceType,
      browser,
      os,
      viewDuration,
      scrollDepth,
      wasVisible
    } = req.body

    if (!advertisementId || !placement) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: advertisementId, placement'
      })
    }
    
    // Get or create session ID
    const sessionId = req.cookies?.sessionId || `session_${Date.now()}_${Math.random()}`
    
    // Set session cookie if not exists
    if (!req.cookies?.sessionId) {
      res.cookie('sessionId', sessionId, {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        sameSite: 'lax'
      })
    }
    
    const context = {
      blogPostId,
      placement,
      userId: (req as any).user?._id?.toString(),
      sessionId,
      deviceType: deviceType || 'desktop',
      browser,
      os,
      viewDuration,
      scrollDepth,
      wasVisible: wasVisible !== false, // Default true
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      referrer: (() => {
        const ref = req.headers.referer || req.headers.referrer
        return Array.isArray(ref) ? ref[0] : ref
      })()
    }
    
    await adAnalyticsService.recordImpression(advertisementId, context)
    
    res.status(200).json({
      success: true,
      message: 'Impression tracked successfully'
    })
  } catch (error: any) {
    console.error('Error tracking impression:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track impression'
    })
  }
}

/**
 * @route   POST /api/ad-analytics/click
 * @desc    Track ad click
 * @access  Public
 */
export const trackClick = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      advertisementId,
      blogPostId,
      placement,
      deviceType,
      browser,
      os
    } = req.body
    
    if (!advertisementId || !placement) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: advertisementId, placement'
      })
    }
    
    const sessionId = req.cookies?.sessionId || `session_${Date.now()}_${Math.random()}`
    
    const context = {
      blogPostId,
      placement,
      userId: (req as any).user?._id?.toString(),
      sessionId,
      deviceType: deviceType || 'desktop',
      browser,
      os,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      referrer: (() => {
        const ref = req.headers.referer || req.headers.referrer
        return Array.isArray(ref) ? ref[0] : ref
      })()
    }

    await adAnalyticsService.recordClick(advertisementId, context)
    
    res.status(200).json({
      success: true,
      message: 'Click tracked successfully'
    })
  } catch (error: any) {
    console.error('Error tracking click:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track click'
    })
  }
}

/**
 * @route   POST /api/ad-analytics/conversion
 * @desc    Track ad conversion
 * @access  Public
 */
export const trackConversion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      advertisementId,
      blogPostId,
      placement,
      deviceType,
      conversionValue,
      conversionType
    } = req.body
    
    if (!advertisementId || !placement) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: advertisementId, placement'
      })
    }
    
    const sessionId = req.cookies?.sessionId || `session_${Date.now()}_${Math.random()}`
    
    const context = {
      blogPostId,
      placement,
      userId: (req as any).user?._id?.toString(),
      sessionId,
      deviceType: deviceType || 'desktop',
      conversionValue,
      conversionType
    }
    
    await adAnalyticsService.recordConversion(advertisementId, context)
    
    res.status(200).json({
      success: true,
      message: 'Conversion tracked successfully'
    })
  } catch (error: any) {
    console.error('Error tracking conversion:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track conversion'
    })
  }
}

/**
 * @route   GET /api/ad-analytics/advertisement/:id
 * @desc    Get analytics for specific advertisement
 * @access  Admin
 */
export const getAnalyticsByAd = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const { startDate, endDate } = req.query
    
    const dateRange = startDate && endDate
      ? { start: new Date(startDate as string), end: new Date(endDate as string) }
      : undefined
    
    const [summary, performanceByPlacement] = await Promise.all([
      adAnalyticsService.getAnalyticsSummary(id, dateRange),
      adAnalyticsService.getPerformanceByPlacement(id, dateRange)
    ])
    
    res.status(200).json({
      success: true,
      data: {
        summary,
        performanceByPlacement
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch analytics'
    })
  }
}

/**
 * @route   GET /api/ad-analytics/summary
 * @desc    Get overall analytics summary
 * @access  Admin
 */
export const getAnalyticsSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query
    
    const dateRange = startDate && endDate
      ? { start: new Date(startDate as string), end: new Date(endDate as string) }
      : undefined
    
    // This would aggregate across all ads
    // For now, return placeholder
    res.status(200).json({
      success: true,
      data: {
        message: 'Overall analytics summary will be implemented'
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch analytics summary'
    })
  }
}

/**
 * @route   GET /api/ad-analytics/performance
 * @desc    Get performance report
 * @access  Admin
 */
export const getPerformanceReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      advertisementId,
      type,
      startDate,
      endDate,
      placement,
      format = 'json'
    } = req.query
    
    const filters: any = {}
    
    if (advertisementId) filters.advertisementId = advertisementId as string
    if (type) filters.type = type as string
    if (placement) filters.placement = placement as AdPlacement
    if (startDate && endDate) {
      filters.dateRange = {
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      }
    }
    
    const report = await adAnalyticsService.generateReport(
      filters,
      format as 'json' | 'csv'
    )
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=ad-performance-report.csv'
      )
      return res.send(report)
    }
    
    res.status(200).json({
      success: true,
      data: report
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate performance report'
    })
  }
}

/**
 * @route   GET /api/ad-analytics/export
 * @desc    Export analytics data
 * @access  Admin
 */
export const exportAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { format = 'csv', ...filters } = req.query
    
    const report = await adAnalyticsService.generateReport(
      filters as any,
      format as 'json' | 'csv'
    )
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=analytics-export-${Date.now()}.csv`
      )
      return res.send(report)
    }
    
    res.setHeader('Content-Type', 'application/json')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=analytics-export-${Date.now()}.json`
    )
    res.status(200).json(report)
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to export analytics'
    })
  }
}

/**
 * @route   GET /api/ad-analytics/top-performers
 * @desc    Get top performing ads
 * @access  Admin
 */
export const getTopPerformers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      limit = 10,
      metric = 'ctr',
      startDate,
      endDate
    } = req.query
    
    const dateRange = startDate && endDate
      ? { start: new Date(startDate as string), end: new Date(endDate as string) }
      : undefined
    
    const topAds = await adAnalyticsService.getTopPerformingAds(
      Number(limit),
      metric as 'impressions' | 'clicks' | 'ctr',
      dateRange
    )
    
    res.status(200).json({
      success: true,
      data: topAds
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch top performers'
    })
  }
}

/**
 * @route   GET /api/ad-analytics/revenue
 * @desc    Get revenue analytics
 * @access  Admin
 */
export const getRevenueAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      startDate,
      endDate,
      groupBy = 'day'
    } = req.query
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      })
    }
    
    const dateRange = {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    }
    
    const revenueData = await adAnalyticsService.getRevenueByPeriod(
      dateRange,
      groupBy as 'day' | 'week' | 'month'
    )
    
    res.status(200).json({
      success: true,
      data: revenueData
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch revenue analytics'
    })
  }
}
