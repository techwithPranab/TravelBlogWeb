import mongoose, { Document, Schema } from 'mongoose'

// Enums
export enum AdType {
  ANNOUNCEMENT = 'announcement',
  HOTEL = 'hotel',
  TRAVEL_ACCESSORIES = 'travel_accessories',
  TOUR_OPERATOR = 'tour_operator',
  AIRLINE = 'airline',
  INSURANCE = 'insurance',
  BOOKING_PLATFORM = 'booking_platform',
  DESTINATION_PROMOTION = 'destination_promotion',
  RESTAURANT = 'restaurant',
  TRANSPORTATION = 'transportation',
  PHOTOGRAPHY = 'photography',
  EXPERIENCE = 'experience',
  FINANCIAL = 'financial',
  TECHNOLOGY = 'technology',
  AFFILIATE = 'affiliate',
  SPONSORED_CONTENT = 'sponsored_content',
  CUSTOM = 'custom'
}

export enum AdFormat {
  BANNER = 'banner',
  RECTANGLE = 'rectangle',
  SKYSCRAPER = 'skyscraper',
  LEADERBOARD = 'leaderboard',
  MOBILE_BANNER = 'mobile_banner',
  NATIVE = 'native',
  INTERSTITIAL = 'interstitial',
  STICKY = 'sticky',
  IN_CONTENT = 'in_content',
  SIDEBAR = 'sidebar',
  POPUP = 'popup',
  VIDEO = 'video',
  CAROUSEL = 'carousel'
}

export enum AdPlacement {
  // Header Area
  HEADER_TOP = 'header_top',
  HEADER_BOTTOM = 'header_bottom',
  
  // Featured Image Area
  BEFORE_FEATURED_IMAGE = 'before_featured_image',
  AFTER_FEATURED_IMAGE = 'after_featured_image',
  OVERLAY_FEATURED_IMAGE = 'overlay_featured_image',
  
  // Content Area
  CONTENT_TOP = 'content_top',
  CONTENT_PARAGRAPH_1 = 'content_paragraph_1',
  CONTENT_PARAGRAPH_2 = 'content_paragraph_2',
  CONTENT_PARAGRAPH_3 = 'content_paragraph_3',
  CONTENT_MIDDLE = 'content_middle',
  CONTENT_BOTTOM = 'content_bottom',
  BETWEEN_SECTIONS = 'between_sections',
  
  // Gallery Area
  BEFORE_GALLERY = 'before_gallery',
  AFTER_GALLERY = 'after_gallery',
  IN_GALLERY = 'in_gallery',
  
  // Video Area
  BEFORE_VIDEOS = 'before_videos',
  AFTER_VIDEOS = 'after_videos',
  
  // Sidebar
  SIDEBAR_TOP = 'sidebar_top',
  SIDEBAR_MIDDLE = 'sidebar_middle',
  SIDEBAR_BOTTOM = 'sidebar_bottom',
  SIDEBAR_STICKY = 'sidebar_sticky',
  
  // Comments Area
  BEFORE_COMMENTS = 'before_comments',
  AFTER_COMMENTS = 'after_comments',
  IN_COMMENTS = 'in_comments',
  
  // Author Bio
  BEFORE_AUTHOR_BIO = 'before_author_bio',
  AFTER_AUTHOR_BIO = 'after_author_bio',
  
  // Page Bottom
  PAGE_BOTTOM = 'page_bottom',
  
  // Floating/Sticky
  FLOATING_BOTTOM_RIGHT = 'floating_bottom_right',
  FLOATING_BOTTOM_LEFT = 'floating_bottom_left',
  STICKY_FOOTER = 'sticky_footer',
  STICKY_HEADER = 'sticky_header'
}

export interface IAdvertisement extends Document {
  // Basic Info
  name: string
  title?: string
  description?: string
  
  // Advertisement Type & Format
  type: AdType
  format: AdFormat
  
  // Creative Assets
  creative: {
    imageUrl?: string
    imageAlt?: string
    mobileImageUrl?: string
    videoUrl?: string
    htmlContent?: string
    callToAction?: string
    buttonText?: string
    backgroundColor?: string
    textColor?: string
  }
  
  // Links & Tracking
  destinationUrl: string
  utmParameters?: {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
  }
  
  // Targeting
  targeting: {
    categories?: mongoose.Types.ObjectId[]
    tags?: string[]
    destinations?: string[]
    excludeCategories?: mongoose.Types.ObjectId[]
    excludeTags?: string[]
    deviceTypes?: ('desktop' | 'mobile' | 'tablet')[]
    userRoles?: ('guest' | 'reader' | 'premium')[]
    geoLocations?: string[]
    dayOfWeek?: number[]
    timeOfDay?: {
      start: string
      end: string
    }
  }
  
  // Placement
  placements: Array<{
    position: AdPlacement
    priority: number
    frequency?: number
    maxImpressionsPerUser?: number
  }>
  
  // Scheduling
  schedule: {
    startDate: Date
    endDate?: Date
    timezone?: string
  }
  
  // Budget & Limits
  budget?: {
    type: 'impressions' | 'clicks' | 'none'
    maxImpressions?: number
    maxClicks?: number
    dailyBudget?: number
    totalBudget?: number
  }
  
  // Performance
  performance: {
    impressions: number
    clicks: number
    ctr: number
    conversions?: number
    revenue?: number
    lastImpressionAt?: Date
    lastClickAt?: Date
  }
  
  // Status & Management
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
  isPremium: boolean
  isSponsored: boolean
  
  // Partner Info
  partner?: {
    id?: mongoose.Types.ObjectId
    name: string
    email?: string
    commission?: number
  }
  
  // A/B Testing
  abTest?: {
    enabled: boolean
    variantId?: string
    parentAdId?: mongoose.Types.ObjectId
    trafficSplit?: number
  }
  
  // SEO & Compliance
  seo: {
    noFollow: boolean
    sponsored: boolean
    ugc: boolean
  }
  
  // Admin
  createdBy: mongoose.Types.ObjectId
  updatedBy?: mongoose.Types.ObjectId
  notes?: string
  
  createdAt: Date
  updatedAt: Date
  
  // Instance methods
  canShowToUser(userId: string, context: any): boolean
  isActive(): boolean
  incrementImpressions(): Promise<void>
  incrementClicks(): Promise<void>
  calculateCTR(): number
}

// Model interface with static methods
export interface IAdvertisementModel extends mongoose.Model<IAdvertisement> {
  findActiveAds(placement?: AdPlacement, filters?: any): Promise<IAdvertisement[]>
}

const advertisementSchema = new Schema<IAdvertisement>(
  {
    name: {
      type: String,
      required: [true, 'Advertisement name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    type: {
      type: String,
      enum: Object.values(AdType),
      required: [true, 'Advertisement type is required']
    },
    format: {
      type: String,
      enum: Object.values(AdFormat),
      required: [true, 'Advertisement format is required']
    },
    creative: {
      imageUrl: { type: String },
      imageAlt: { type: String },
      mobileImageUrl: { type: String },
      videoUrl: { type: String },
      htmlContent: { type: String },
      callToAction: { type: String, maxlength: 100 },
      buttonText: { type: String, maxlength: 50 },
      backgroundColor: { type: String, match: /^#[0-9A-Fa-f]{6}$/ },
      textColor: { type: String, match: /^#[0-9A-Fa-f]{6}$/ }
    },
    destinationUrl: {
      type: String,
      required: [true, 'Destination URL is required'],
      match: [/^https?:\/\/.+/, 'Please provide a valid URL']
    },
    utmParameters: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String
    },
    targeting: {
      categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
      tags: [String],
      destinations: [String],
      excludeCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
      excludeTags: [String],
      deviceTypes: [{ type: String, enum: ['desktop', 'mobile', 'tablet'] }],
      userRoles: [{ type: String, enum: ['guest', 'reader', 'premium'] }],
      geoLocations: [String],
      dayOfWeek: [{ type: Number, min: 0, max: 6 }],
      timeOfDay: {
        start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
        end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
      }
    },
    placements: [
      {
        position: {
          type: String,
          enum: Object.values(AdPlacement),
          required: true
        },
        priority: {
          type: Number,
          min: 1,
          max: 10,
          default: 5
        },
        frequency: {
          type: Number,
          min: 1
        },
        maxImpressionsPerUser: {
          type: Number,
          min: 1
        }
      }
    ],
    schedule: {
      startDate: {
        type: Date,
        required: [true, 'Start date is required']
      },
      endDate: Date,
      timezone: {
        type: String,
        default: 'UTC'
      }
    },
    budget: {
      type: {
        type: String,
        enum: ['impressions', 'clicks', 'none'],
        default: 'none'
      },
      maxImpressions: { type: Number, min: 0 },
      maxClicks: { type: Number, min: 0 },
      dailyBudget: { type: Number, min: 0 },
      totalBudget: { type: Number, min: 0 }
    },
    performance: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      ctr: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      lastImpressionAt: Date,
      lastClickAt: Date
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed', 'archived'],
      default: 'draft'
    },
    isPremium: {
      type: Boolean,
      default: false
    },
    isSponsored: {
      type: Boolean,
      default: true
    },
    partner: {
      id: { type: Schema.Types.ObjectId, ref: 'Partner' },
      name: { type: String, trim: true },
      email: { type: String, lowercase: true },
      commission: { type: Number, min: 0, max: 100 }
    },
    abTest: {
      enabled: { type: Boolean, default: false },
      variantId: String,
      parentAdId: { type: Schema.Types.ObjectId, ref: 'Advertisement' },
      trafficSplit: { type: Number, min: 0, max: 100 }
    },
    seo: {
      noFollow: { type: Boolean, default: true },
      sponsored: { type: Boolean, default: true },
      ugc: { type: Boolean, default: false }
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
)

// Indexes for performance
advertisementSchema.index({ status: 1, 'schedule.startDate': 1, 'schedule.endDate': 1 })
advertisementSchema.index({ type: 1, status: 1 })
advertisementSchema.index({ 'placements.position': 1, status: 1 })
advertisementSchema.index({ createdBy: 1 })
advertisementSchema.index({ 'partner.id': 1 })

// Virtual for isActive
advertisementSchema.virtual('active').get(function () {
  return this.isActive()
})

// Instance Methods
advertisementSchema.methods.isActive = function (): boolean {
  if (this.status !== 'active') return false
  
  const now = new Date()
  if (this.schedule.startDate > now) return false
  if (this.schedule.endDate && this.schedule.endDate < now) return false
  
  // Check budget limits
  if (this.budget?.type === 'impressions' && this.budget.maxImpressions) {
    if (this.performance.impressions >= this.budget.maxImpressions) return false
  }
  
  if (this.budget?.type === 'clicks' && this.budget.maxClicks) {
    if (this.performance.clicks >= this.budget.maxClicks) return false
  }
  
  return true
}

advertisementSchema.methods.canShowToUser = function (
  userId: string,
  context: any
): boolean {
  if (!this.isActive()) return false
  
  // Check device type targeting
  if (this.targeting.deviceTypes && this.targeting.deviceTypes.length > 0) {
    if (!this.targeting.deviceTypes.includes(context.deviceType)) return false
  }
  
  // Check day of week targeting
  if (this.targeting.dayOfWeek && this.targeting.dayOfWeek.length > 0) {
    const currentDay = new Date().getDay()
    if (!this.targeting.dayOfWeek.includes(currentDay)) return false
  }
  
  // Check time of day targeting
  if (this.targeting.timeOfDay?.start && this.targeting.timeOfDay?.end) {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    if (currentTime < this.targeting.timeOfDay.start || currentTime > this.targeting.timeOfDay.end) {
      return false
    }
  }
  
  return true
}

advertisementSchema.methods.incrementImpressions = async function (): Promise<void> {
  this.performance.impressions += 1
  this.performance.lastImpressionAt = new Date()
  this.performance.ctr = this.calculateCTR()
  await this.save()
}

advertisementSchema.methods.incrementClicks = async function (): Promise<void> {
  this.performance.clicks += 1
  this.performance.lastClickAt = new Date()
  this.performance.ctr = this.calculateCTR()
  await this.save()
}

advertisementSchema.methods.calculateCTR = function (): number {
  if (this.performance.impressions === 0) return 0
  return (this.performance.clicks / this.performance.impressions) * 100
}

// Static Methods
advertisementSchema.statics.findActiveAds = async function (
  placement: AdPlacement,
  context: any
) {
  const now = new Date()
  
  return this.find({
    status: 'active',
    'placements.position': placement,
    'schedule.startDate': { $lte: now },
    $or: [
      { 'schedule.endDate': { $exists: false } },
      { 'schedule.endDate': null },
      { 'schedule.endDate': { $gte: now } }
    ]
  })
    .populate('targeting.categories', 'name slug')
    .populate('partner.id', 'firstName lastName company')
    .sort({ 'placements.priority': -1 })
}

// Pre-save middleware to sanitize HTML content
advertisementSchema.pre('save', function (next) {
  // HTML sanitization would go here using a library like DOMPurify
  // For now, we'll just ensure it exists
  if (this.creative.htmlContent) {
    // Sanitize HTML (implement with isomorphic-dompurify)
    // this.creative.htmlContent = sanitizeHTML(this.creative.htmlContent)
  }
  next()
})

const Advertisement = mongoose.model<IAdvertisement, IAdvertisementModel>('Advertisement', advertisementSchema)

export default Advertisement
