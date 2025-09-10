import mongoose, { Document, Schema } from 'mongoose'

export interface IDestination extends Document {
  name: string
  slug: string
  description: string
  country: string
  continent: string
  featuredImage: {
    url: string
    alt: string
  }
  gallery: Array<{
    url: string
    alt: string
  }>
  coordinates: {
    lat: number
    lng: number
  }
  bestTimeToVisit: string
  averageTemperature: {
    summer: string
    winter: string
  }
  currency: string
  language: string
  timezone: string
  rating: number
  totalReviews: number
  highlights: string[]
  activities: Array<{
    name: string
    icon: string
    description: string
  }>
  accommodation: {
    budget: string
    midRange: string
    luxury: string
  }
  transportation: string[]
  localCuisine: string[]
  travelTips: string[]
  relatedPosts: Array<{
    id: string
    title: string
    slug: string
    image: string
  }>
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
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  continent: {
    type: String,
    required: [true, 'Continent is required'],
    trim: true
  },
  featuredImage: {
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    }
  },
  gallery: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    }
  }],
  coordinates: {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  bestTimeToVisit: {
    type: String,
    required: true,
    trim: true
  },
  averageTemperature: {
    summer: {
      type: String,
      required: true
    },
    winter: {
      type: String,
      required: true
    }
  },
  currency: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: String,
    required: true,
    trim: true
  },
  timezone: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  highlights: [{
    type: String,
    trim: true
  }],
  activities: [{
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  accommodation: {
    budget: {
      type: String,
      required: true
    },
    midRange: {
      type: String,
      required: true
    },
    luxury: {
      type: String,
      required: true
    }
  },
  transportation: [{
    type: String,
    trim: true
  }],
  localCuisine: [{
    type: String,
    trim: true
  }],
  travelTips: [{
    type: String,
    trim: true
  }],
  relatedPosts: [{
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  }],
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
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      // Ensure numeric fields have default values
      ret.rating = ret.rating || 0
      ret.totalReviews = ret.totalReviews || 0
      return ret
    }
  }
})

// Indexes for better performance
destinationSchema.index({ slug: 1 })
destinationSchema.index({ country: 1, continent: 1 })
destinationSchema.index({ isPopular: 1, isFeatured: 1 })
destinationSchema.index({ rating: -1 })
destinationSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 })
destinationSchema.index({ isActive: 1 })

export default mongoose.model<IDestination>('Destination', destinationSchema)
