import mongoose, { Document, Schema } from 'mongoose'

export interface IDestination extends Document {
  name: string
  slug: string
  description: string
  shortDescription: string
  country: string
  region: string
  coordinates: {
    latitude: number
    longitude: number
  }
  images: {
    url: string
    alt: string
    caption?: string
    isPrimary: boolean
  }[]
  highlights: string[]
  bestTimeToVisit: {
    months: string[]
    description: string
  }
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Expert'
  budget: {
    currency: string
    low: number
    high: number
    description: string
  }
  tags: string[]
  activities: string[]
  accommodation: {
    type: string
    description: string
    priceRange: string
  }[]
  transportation: {
    type: string
    description: string
    cost?: string
  }[]
  posts: mongoose.Types.ObjectId[]
  guides: mongoose.Types.ObjectId[]
  rating: {
    average: number
    count: number
  }
  isPopular: boolean
  isFeatured: boolean
  isActive: boolean
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt: Date
}

const destinationSchema = new Schema<IDestination>({
  name: {
    type: String,
    required: [true, 'Destination name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
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
  shortDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  region: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
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
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  highlights: [{
    type: String,
    trim: true
  }],
  bestTimeToVisit: {
    months: [{
      type: String,
      enum: ['January', 'February', 'March', 'April', 'May', 'June', 
             'July', 'August', 'September', 'October', 'November', 'December']
    }],
    description: {
      type: String,
      trim: true
    }
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Challenging', 'Expert'],
    default: 'Easy'
  },
  budget: {
    currency: {
      type: String,
      default: 'USD'
    },
    low: {
      type: Number,
      min: 0
    },
    high: {
      type: Number,
      min: 0
    },
    description: {
      type: String,
      trim: true
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  activities: [{
    type: String,
    trim: true
  }],
  accommodation: [{
    type: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    priceRange: {
      type: String,
      required: true
    }
  }],
  transportation: [{
    type: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    cost: String
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  guides: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide'
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  isPopular: {
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
  seoTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'SEO title cannot exceed 60 characters']
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'SEO description cannot exceed 160 characters']
  }
}, {
  timestamps: true
})

// Indexes for better performance
destinationSchema.index({ slug: 1 })
destinationSchema.index({ country: 1, region: 1 })
destinationSchema.index({ isPopular: 1, isFeatured: 1 })
destinationSchema.index({ tags: 1 })
destinationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 })
destinationSchema.index({ isActive: 1 })

export default mongoose.model<IDestination>('Destination', destinationSchema)
