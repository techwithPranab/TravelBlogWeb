import mongoose, { Document, Schema } from 'mongoose'
import { AdPlacement } from './Advertisement'

export interface IAdAnalytics extends Document {
  advertisementId: mongoose.Types.ObjectId
  
  // Event Info
  eventType: 'impression' | 'click' | 'conversion' | 'view'
  timestamp: Date
  
  // Context
  blogPostId?: mongoose.Types.ObjectId
  placement: AdPlacement
  
  // User Info (anonymized for privacy)
  userId?: mongoose.Types.ObjectId
  sessionId: string
  isUnique: boolean
  
  // Technical
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser?: string
  os?: string
  geoLocation?: {
    country?: string
    city?: string
    countryCode?: string
  }
  
  // Engagement
  viewDuration?: number
  scrollDepth?: number
  wasVisible?: boolean
  
  // Conversion
  conversionValue?: number
  conversionType?: string
  
  // Metadata
  userAgent?: string
  ipAddress?: string
  referrer?: string
  
  createdAt: Date
}

const adAnalyticsSchema = new Schema<IAdAnalytics>(
  {
    advertisementId: {
      type: Schema.Types.ObjectId,
      ref: 'Advertisement',
      required: [true, 'Advertisement ID is required'],
      index: true
    },
    eventType: {
      type: String,
      enum: ['impression', 'click', 'conversion', 'view'],
      required: [true, 'Event type is required'],
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    blogPostId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      index: true
    },
    placement: {
      type: String,
      required: [true, 'Placement is required'],
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    sessionId: {
      type: String,
      required: [true, 'Session ID is required'],
      index: true
    },
    isUnique: {
      type: Boolean,
      default: false,
      index: true
    },
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
      required: [true, 'Device type is required']
    },
    browser: {
      type: String,
      trim: true
    },
    os: {
      type: String,
      trim: true
    },
    geoLocation: {
      country: String,
      city: String,
      countryCode: String
    },
    viewDuration: {
      type: Number,
      min: 0
    },
    scrollDepth: {
      type: Number,
      min: 0,
      max: 100
    },
    wasVisible: {
      type: Boolean,
      default: false
    },
    conversionValue: {
      type: Number,
      min: 0
    },
    conversionType: {
      type: String,
      trim: true
    },
    userAgent: {
      type: String
    },
    ipAddress: {
      type: String
    },
    referrer: {
      type: String
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
)

// Compound indexes for common queries
adAnalyticsSchema.index({ advertisementId: 1, eventType: 1, timestamp: -1 })
adAnalyticsSchema.index({ advertisementId: 1, isUnique: 1 })
adAnalyticsSchema.index({ blogPostId: 1, eventType: 1 })
adAnalyticsSchema.index({ sessionId: 1, advertisementId: 1 })

// TTL index - auto-delete records after 90 days (GDPR compliance)
adAnalyticsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }) // 90 days

// Static methods
adAnalyticsSchema.statics.recordEvent = async function (
  advertisementId: mongoose.Types.ObjectId,
  eventType: 'impression' | 'click' | 'conversion' | 'view',
  context: {
    blogPostId?: mongoose.Types.ObjectId
    placement: AdPlacement
    userId?: mongoose.Types.ObjectId
    sessionId: string
    deviceType: 'desktop' | 'mobile' | 'tablet'
    browser?: string
    os?: string
    geoLocation?: any
    viewDuration?: number
    scrollDepth?: number
    wasVisible?: boolean
    conversionValue?: number
    conversionType?: string
    userAgent?: string
    ipAddress?: string
    referrer?: string
  }
) {
  // Check if this is a unique event (first time for this session + ad)
  const existingEvent = await this.findOne({
    advertisementId,
    sessionId: context.sessionId,
    eventType
  })
  
  const isUnique = !existingEvent
  
  const analytics = new this({
    advertisementId,
    eventType,
    ...context,
    isUnique,
    timestamp: new Date()
  })
  
  return analytics.save()
}

adAnalyticsSchema.statics.getAnalyticsSummary = async function (
  advertisementId: mongoose.Types.ObjectId,
  dateRange?: { start: Date; end: Date }
) {
  const matchStage: any = { advertisementId }
  
  if (dateRange) {
    matchStage.timestamp = {
      $gte: dateRange.start,
      $lte: dateRange.end
    }
  }
  
  const summary = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$eventType',
        total: { $sum: 1 },
        unique: {
          $sum: { $cond: [{ $eq: ['$isUnique', true] }, 1, 0] }
        }
      }
    }
  ])
  
  const result = {
    impressions: 0,
    uniqueImpressions: 0,
    clicks: 0,
    uniqueClicks: 0,
    conversions: 0,
    uniqueConversions: 0,
    ctr: 0
  }
  
  summary.forEach((item) => {
    if (item._id === 'impression') {
      result.impressions = item.total
      result.uniqueImpressions = item.unique
    } else if (item._id === 'click') {
      result.clicks = item.total
      result.uniqueClicks = item.unique
    } else if (item._id === 'conversion') {
      result.conversions = item.total
      result.uniqueConversions = item.unique
    }
  })
  
  // Calculate CTR
  if (result.impressions > 0) {
    result.ctr = (result.clicks / result.impressions) * 100
  }
  
  return result
}

adAnalyticsSchema.statics.getPerformanceByPlacement = async function (
  advertisementId: mongoose.Types.ObjectId,
  dateRange?: { start: Date; end: Date }
) {
  const matchStage: any = { advertisementId }
  
  if (dateRange) {
    matchStage.timestamp = {
      $gte: dateRange.start,
      $lte: dateRange.end
    }
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          placement: '$placement',
          eventType: '$eventType'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.placement',
        impressions: {
          $sum: {
            $cond: [{ $eq: ['$_id.eventType', 'impression'] }, '$count', 0]
          }
        },
        clicks: {
          $sum: {
            $cond: [{ $eq: ['$_id.eventType', 'click'] }, '$count', 0]
          }
        }
      }
    },
    {
      $project: {
        placement: '$_id',
        impressions: 1,
        clicks: 1,
        ctr: {
          $cond: [
            { $gt: ['$impressions', 0] },
            { $multiply: [{ $divide: ['$clicks', '$impressions'] }, 100] },
            0
          ]
        }
      }
    },
    { $sort: { impressions: -1 } }
  ])
}

adAnalyticsSchema.statics.getTopPerformingAds = async function (
  limit: number = 10,
  metric: 'impressions' | 'clicks' | 'ctr' = 'ctr',
  dateRange?: { start: Date; end: Date }
) {
  const matchStage: any = {}
  
  if (dateRange) {
    matchStage.timestamp = {
      $gte: dateRange.start,
      $lte: dateRange.end
    }
  }
  
  const pipeline: any[] = [
    { $match: matchStage },
    {
      $group: {
        _id: '$advertisementId',
        impressions: {
          $sum: { $cond: [{ $eq: ['$eventType', 'impression'] }, 1, 0] }
        },
        clicks: {
          $sum: { $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        advertisementId: '$_id',
        impressions: 1,
        clicks: 1,
        ctr: {
          $cond: [
            { $gt: ['$impressions', 0] },
            { $multiply: [{ $divide: ['$clicks', '$impressions'] }, 100] },
            0
          ]
        }
      }
    }
  ]
  
  const sortField: any = {}
  sortField[metric] = -1
  pipeline.push({ $sort: sortField })
  pipeline.push({ $limit: limit })
  
  return this.aggregate(pipeline)
}

const AdAnalytics = mongoose.model<IAdAnalytics>('AdAnalytics', adAnalyticsSchema)

export default AdAnalytics
