import mongoose, { Document, Schema } from 'mongoose'

export interface ISiteSettings extends Document {
  _id: mongoose.Types.ObjectId
  siteName: string
  siteDescription: string
  siteUrl: string
  contactEmail: string
  supportEmail: string
  contactPhone?: string
  contactAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  businessHours?: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  supportSettings?: {
    email: string
    responseTime: string
  }
  socialLinks: {
    facebook?: string
    twitter?: string
    instagram?: string
    youtube?: string
    linkedin?: string
  }
  seoSettings: {
    metaTitle: string
    metaDescription: string
    metaKeywords: string[]
    ogImage?: string
  }
  emailSettings: {
    smtpHost?: string
    smtpPort?: number
    smtpUser?: string
    smtpPassword?: string
    fromEmail: string
    fromName: string
  }
  generalSettings: {
    postsPerPage: number
    commentsEnabled: boolean
    registrationEnabled: boolean
    maintenanceMode: boolean
    analyticsCode?: string
  }
  theme: {
    primaryColor: string
    secondaryColor: string
    logo?: string
    favicon?: string
  }
  createdAt: Date
  updatedAt: Date
}

const siteSettingsSchema = new Schema<ISiteSettings>({
  siteName: {
    type: String,
    required: [true, 'Site name is required'],
    default: 'BagPackStories'
  },
  siteDescription: {
    type: String,
    required: [true, 'Site description is required'],
    default: 'Discover amazing travel destinations and guides'
  },
  siteUrl: {
    type: String,
    required: [true, 'Site URL is required'],
    default: 'https://yourdomain.com'
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  supportEmail: {
    type: String,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  contactPhone: {
    type: String,
    default: '+1 (555) 123-4567'
  },
  contactAddress: {
    street: { type: String, default: '123 Travel Street' },
    city: { type: String, default: 'San Francisco' },
    state: { type: String, default: 'CA' },
    zipCode: { type: String, default: '94105' },
    country: { type: String, default: 'USA' }
  },
  businessHours: {
    monday: { type: String, default: '9:00 AM - 6:00 PM' },
    tuesday: { type: String, default: '9:00 AM - 6:00 PM' },
    wednesday: { type: String, default: '9:00 AM - 6:00 PM' },
    thursday: { type: String, default: '9:00 AM - 6:00 PM' },
    friday: { type: String, default: '9:00 AM - 6:00 PM' },
    saturday: { type: String, default: '10:00 AM - 4:00 PM' },
    sunday: { type: String, default: 'Closed' }
  },
  supportSettings: {
    email: { type: String, default: process.env.SUPPORT_EMAIL || 'support@yourdomain.com' },
    responseTime: { type: String, default: 'Within 24 hours' }
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    youtube: String,
    linkedin: String
  },
  seoSettings: {
    metaTitle: {
      type: String,
      default: 'BagPackStories - Discover Amazing Destinations'
    },
    metaDescription: {
      type: String,
      default: 'Discover amazing travel destinations, guides, and tips from experienced travelers around the world.'
    },
    metaKeywords: [{
      type: String
    }],
    ogImage: String
  },
  emailSettings: {
    smtpHost: String,
    smtpPort: Number,
    smtpUser: String,
    smtpPassword: String,
    fromEmail: {
      type: String,
      required: [true, 'From email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    fromName: {
      type: String,
      required: [true, 'From name is required']
    }
  },
  generalSettings: {
    postsPerPage: {
      type: Number,
      default: 12,
      min: 1,
      max: 50
    },
    commentsEnabled: {
      type: Boolean,
      default: true
    },
    registrationEnabled: {
      type: Boolean,
      default: true
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    analyticsCode: String
  },
  theme: {
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    secondaryColor: {
      type: String,
      default: '#8B5CF6'
    },
    logo: String,
    favicon: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Ensure only one settings document exists
siteSettingsSchema.index({}, { unique: true })

export default mongoose.model<ISiteSettings>('SiteSettings', siteSettingsSchema)
