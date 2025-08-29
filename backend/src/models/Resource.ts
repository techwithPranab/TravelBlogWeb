import mongoose, { Document, Schema } from 'mongoose'

export interface IResource extends Document {
  title: string
  slug: string
  description: string
  category: 'Booking' | 'Gear' | 'Apps' | 'Websites' | 'Services' | 'Transportation' | 'Insurance' | 'Other'
  type: 'Tool' | 'Service' | 'Product' | 'Website' | 'App' | 'Guide' | 'Template'
  url?: string
  images: {
    url: string
    alt: string
    caption?: string
  }[]
  features: string[]
  pros: string[]
  cons: string[]
  pricing: {
    type: 'Free' | 'Paid' | 'Freemium' | 'Subscription'
    amount?: number
    currency?: string
    description: string
  }
  rating: {
    overall: number
    usability: number
    value: number
    support: number
    features: number
  }
  tags: string[]
  destinations: mongoose.Types.ObjectId[]
  isAffiliate: boolean
  affiliateLink?: string
  isRecommended: boolean
  isFeatured: boolean
  isActive: boolean
  author: mongoose.Types.ObjectId
  reviews: {
    user: mongoose.Types.ObjectId
    rating: number
    comment: string
    date: Date
  }[]
  totalReviews: number
  averageRating: number
  clickCount: number
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

const resourceSchema = new Schema<IResource>({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Booking', 'Gear', 'Apps', 'Websites', 'Services', 'Transportation', 'Insurance', 'Other'],
    required: true
  },
  type: {
    type: String,
    enum: ['Tool', 'Service', 'Product', 'Website', 'App', 'Guide', 'Template'],
    required: true
  },
  url: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v)
      },
      message: 'Please enter a valid URL'
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    },
    caption: String
  }],
  features: [{
    type: String,
    trim: true
  }],
  pros: [{
    type: String,
    trim: true
  }],
  cons: [{
    type: String,
    trim: true
  }],
  pricing: {
    type: {
      type: String,
      enum: ['Free', 'Paid', 'Freemium', 'Subscription'],
      required: true
    },
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  },
  rating: {
    overall: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    usability: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    value: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    support: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    features: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  destinations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  }],
  isAffiliate: {
    type: Boolean,
    default: false
  },
  affiliateLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v)
      },
      message: 'Please enter a valid affiliate URL'
    }
  },
  isRecommended: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  totalReviews: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  clickCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes for better performance
resourceSchema.index({ slug: 1 })
resourceSchema.index({ category: 1, type: 1 })
resourceSchema.index({ isRecommended: 1, isFeatured: 1 })
resourceSchema.index({ tags: 1 })
resourceSchema.index({ destinations: 1 })
resourceSchema.index({ averageRating: -1 })
resourceSchema.index({ isActive: 1 })
resourceSchema.index({ author: 1 })

export default mongoose.model<IResource>('Resource', resourceSchema)
