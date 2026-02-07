import AdAnalytics from '../models/AdAnalytics'
import Advertisement from '../models/Advertisement'
import { AdPlacement } from '../models/Advertisement'
import mongoose from 'mongoose'

/**
 * Service for ad analytics and tracking
 */
class AdAnalyticsService {
  /**
   * Record an impression
   */
  async recordImpression(
    adId: string,
    context: {
      blogPostId?: string
      placement: AdPlacement
      userId?: string
      sessionId: string
      deviceType: 'desktop' | 'mobile' | 'tablet'
      browser?: string
      os?: string
      geoLocation?: any
      viewDuration?: number
      scrollDepth?: number
      wasVisible?: boolean
      userAgent?: string
      ipAddress?: string
      referrer?: string
    }
  ): Promise<void> {
    try {
      // Record in analytics
      await (AdAnalytics as any).recordEvent(
        new mongoose.Types.ObjectId(adId),
        'impression',
        {
          ...context,
          blogPostId: context.blogPostId
            ? new mongoose.Types.ObjectId(context.blogPostId)
            : undefined,
          userId: context.userId
            ? new mongoose.Types.ObjectId(context.userId)
            : undefined
        }
      )
      
      // Update ad performance
      const ad = await Advertisement.findById(adId)
      if (ad) {
        await ad.incrementImpressions()
      }
    } catch (error) {
      console.error('Error recording impression:', error)
    }
  }
  
  /**
   * Record a click
   */
  async recordClick(
    adId: string,
    context: {
      blogPostId?: string
      placement: AdPlacement
      userId?: string
      sessionId: string
      deviceType: 'desktop' | 'mobile' | 'tablet'
      browser?: string
      os?: string
      geoLocation?: any
      userAgent?: string
      ipAddress?: string
      referrer?: string
    }
  ): Promise<void> {
    try {
      // Record in analytics
      await (AdAnalytics as any).recordEvent(
        new mongoose.Types.ObjectId(adId),
        'click',
        {
          ...context,
          blogPostId: context.blogPostId
            ? new mongoose.Types.ObjectId(context.blogPostId)
            : undefined,
          userId: context.userId
            ? new mongoose.Types.ObjectId(context.userId)
            : undefined
        }
      )
      
      // Update ad performance
      const ad = await Advertisement.findById(adId)
      if (ad) {
        await ad.incrementClicks()
      }
    } catch (error) {
      console.error('Error recording click:', error)
    }
  }
  
  /**
   * Record a conversion
   */
  async recordConversion(
    adId: string,
    context: {
      blogPostId?: string
      placement: AdPlacement
      userId?: string
      sessionId: string
      deviceType: 'desktop' | 'mobile' | 'tablet'
      conversionValue?: number
      conversionType?: string
      geoLocation?: any
    }
  ): Promise<void> {
    try {
      await (AdAnalytics as any).recordEvent(
        new mongoose.Types.ObjectId(adId),
        'conversion',
        {
          ...context,
          blogPostId: context.blogPostId
            ? new mongoose.Types.ObjectId(context.blogPostId)
            : undefined,
          userId: context.userId
            ? new mongoose.Types.ObjectId(context.userId)
            : undefined
        }
      )
      
      // Update ad performance
      const ad = await Advertisement.findById(adId)
      if (ad && ad.performance) {
        ad.performance.conversions = (ad.performance.conversions || 0) + 1
        if (context.conversionValue) {
          ad.performance.revenue =
            (ad.performance.revenue || 0) + context.conversionValue
        }
        await ad.save()
      }
    } catch (error) {
      console.error('Error recording conversion:', error)
    }
  }
  
  /**
   * Get analytics summary for an advertisement
   */
  async getAnalyticsSummary(
    adId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<any> {
    try {
      const summary = await (AdAnalytics as any).getAnalyticsSummary(
        new mongoose.Types.ObjectId(adId),
        dateRange
      )
      
      return summary
    } catch (error) {
      console.error('Error getting analytics summary:', error)
      return null
    }
  }
  
  /**
   * Get performance by placement
   */
  async getPerformanceByPlacement(
    adId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<any[]> {
    try {
      return await (AdAnalytics as any).getPerformanceByPlacement(
        new mongoose.Types.ObjectId(adId),
        dateRange
      )
    } catch (error) {
      console.error('Error getting performance by placement:', error)
      return []
    }
  }
  
  /**
   * Get top performing ads
   */
  async getTopPerformingAds(
    limit: number = 10,
    metric: 'impressions' | 'clicks' | 'ctr' = 'ctr',
    dateRange?: { start: Date; end: Date }
  ): Promise<any[]> {
    try {
      const topAds = await (AdAnalytics as any).getTopPerformingAds(
        limit,
        metric,
        dateRange
      )
      
      // Populate with advertisement details
      const populated = await Promise.all(
        topAds.map(async (item: any) => {
          const ad = await Advertisement.findById(item.advertisementId).select(
            'name type format status'
          )
          return {
            ...item,
            advertisement: ad
          }
        })
      )
      
      return populated
    } catch (error) {
      console.error('Error getting top performing ads:', error)
      return []
    }
  }
  
  /**
   * Generate performance report
   */
  async generateReport(
    filters: {
      advertisementId?: string
      type?: string
      dateRange?: { start: Date; end: Date }
      placement?: AdPlacement
    },
    format: 'json' | 'csv' = 'json'
  ): Promise<any> {
    try {
      const matchStage: any = {}
      
      if (filters.advertisementId) {
        matchStage.advertisementId = new mongoose.Types.ObjectId(
          filters.advertisementId
        )
      }
      
      if (filters.dateRange) {
        matchStage.timestamp = {
          $gte: filters.dateRange.start,
          $lte: filters.dateRange.end
        }
      }
      
      if (filters.placement) {
        matchStage.placement = filters.placement
      }
      
      const report = await AdAnalytics.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              advertisementId: '$advertisementId',
              eventType: '$eventType'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: {
              date: '$_id.date',
              advertisementId: '$_id.advertisementId'
            },
            impressions: {
              $sum: {
                $cond: [{ $eq: ['$_id.eventType', 'impression'] }, '$count', 0]
              }
            },
            clicks: {
              $sum: {
                $cond: [{ $eq: ['$_id.eventType', 'click'] }, '$count', 0]
              }
            },
            conversions: {
              $sum: {
                $cond: [{ $eq: ['$_id.eventType', 'conversion'] }, '$count', 0]
              }
            }
          }
        },
        {
          $project: {
            date: '$_id.date',
            advertisementId: '$_id.advertisementId',
            impressions: 1,
            clicks: 1,
            conversions: 1,
            ctr: {
              $cond: [
                { $gt: ['$impressions', 0] },
                { $multiply: [{ $divide: ['$clicks', '$impressions'] }, 100] },
                0
              ]
            }
          }
        },
        { $sort: { date: -1 } }
      ])
      
      if (format === 'csv') {
        return this.convertToCSV(report)
      }
      
      return report
    } catch (error) {
      console.error('Error generating report:', error)
      return null
    }
  }
  
  /**
   * Get revenue by period
   */
  async getRevenueByPeriod(
    dateRange: { start: Date; end: Date },
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<any[]> {
    const formatMap = {
      day: '%Y-%m-%d',
      week: '%Y-W%V',
      month: '%Y-%m'
    }
    
    return AdAnalytics.aggregate([
      {
        $match: {
          eventType: 'conversion',
          timestamp: {
            $gte: dateRange.start,
            $lte: dateRange.end
          },
          conversionValue: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            period: {
              $dateToString: { format: formatMap[groupBy], date: '$timestamp' }
            }
          },
          revenue: { $sum: '$conversionValue' },
          conversions: { $sum: 1 }
        }
      },
      {
        $project: {
          period: '$_id.period',
          revenue: 1,
          conversions: 1,
          averageValue: { $divide: ['$revenue', '$conversions'] }
        }
      },
      { $sort: { '_id.period': 1 } }
    ])
  }
  
  /**
   * Convert report data to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvRows = [headers.join(',')]
    
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header]
        return typeof value === 'string' ? `"${value}"` : value
      })
      csvRows.push(values.join(','))
    }
    
    return csvRows.join('\n')
  }
}

export default new AdAnalyticsService()
