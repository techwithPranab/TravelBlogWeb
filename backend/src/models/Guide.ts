import mongoose, { Document, Schema } from 'mongoose'

export interface IGuide extends Document {
  id: string
  title: string
  description: string
  type: 'itinerary' | 'budget' | 'photography' | 'food' | 'adventure'
  destination: {
    name: string
    country: string
    slug: string
  }
  author: {
    name: string
    avatar: string
    bio: string
  }
  featuredImage: {
    url: string
    alt: string
  }
  duration: string
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  budget: {
    range: string
    details: string
  }
  bestTime: string
  rating: number
  totalReviews: number
  publishedAt: string
  lastUpdated: string
  isPremium: boolean
  downloadCount: number
  sections: Array<{
    title: string
    content: string
    tips?: string[]
    images?: Array<{
      url: string
      alt: string
      caption?: string
    }>
  }>
  itinerary?: Array<{
    day: number
    title: string
    activities: string[]
    meals: string[]
    accommodation: string
    budget: string
  }>
  packingList?: Array<{
    category: string
    items: string[]
  }>
  resources: Array<{
    title: string
    type: 'link' | 'document' | 'app'
    url: string
  }>
  relatedGuides: Array<{
    id: string
    title: string
    slug: string
    image: string
    type: string
  }>
  slug?: string
  isPublished?: boolean
  views?: number
  createdAt?: Date
  updatedAt?: Date
}

const guideSchema = new Schema<IGuide>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Guide title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['itinerary', 'budget', 'photography', 'food', 'adventure'],
    required: true
  },
  destination: {
    name: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    }
  },
  author: {
    name: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      required: true
    },
    bio: {
      type: String,
      required: true
    }
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
  duration: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Challenging'],
    default: 'Easy'
  },
  budget: {
    range: {
      type: String,
      required: true
    },
    details: {
      type: String,
      required: true
    }
  },
  bestTime: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: String,
    required: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  sections: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    tips: [String],
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
    }]
  }],
  itinerary: [{
    day: {
      type: Number,
      required: true,
      min: 1
    },
    title: {
      type: String,
      required: true
    },
    activities: [{
      type: String,
      required: true
    }],
    meals: [{
      type: String,
      required: true
    }],
    accommodation: {
      type: String,
      required: true
    },
    budget: {
      type: String,
      required: true
    }
  }],
  packingList: [{
    category: {
      type: String,
      required: true
    },
    items: [{
      type: String,
      required: true
    }]
  }],
  resources: [{
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['link', 'document', 'app'],
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  relatedGuides: [{
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
    },
    type: {
      type: String,
      required: true
    }
  }],
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      // Ensure duration is always a string
      if (ret.duration && typeof ret.duration === 'object') {
        if (ret.duration.days && ret.duration.description) {
          ret.duration = ret.duration.description
        } else if (ret.duration.days) {
          ret.duration = `${ret.duration.days} ${ret.duration.unit || 'days'}`
        } else {
          ret.duration = 'Duration not specified'
        }
      }
      // Ensure numeric fields have default values
      ret.rating = ret.rating || 0
      ret.totalReviews = ret.totalReviews || 0
      ret.views = ret.views || 0
      ret.downloadCount = ret.downloadCount || 0
      // Ensure nested objects have default values
      ret.featuredImage = ret.featuredImage || { url: '', alt: '' }
      ret.author = ret.author || { name: 'Unknown', avatar: '', bio: '' }
      ret.budget = ret.budget || { range: 'N/A', details: '' }
      ret.destination = ret.destination || { name: 'Unknown', country: '', slug: '' }
      // Ensure arrays have default values
      ret.sections = ret.sections || []
      ret.resources = ret.resources || []
      ret.relatedGuides = ret.relatedGuides || []
      return ret
    }
  }
})

// Indexes for better performance
guideSchema.index({ id: 1 })
guideSchema.index({ slug: 1 })
guideSchema.index({ type: 1 })
guideSchema.index({ 'destination.slug': 1 })
guideSchema.index({ isPublished: 1, publishedAt: -1 })
guideSchema.index({ rating: -1 })
guideSchema.index({ views: -1 })

export default mongoose.model<IGuide>('Guide', guideSchema)
