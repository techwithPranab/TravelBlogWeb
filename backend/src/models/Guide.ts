import mongoose, { Document, Schema } from 'mongoose'

export interface IGuide extends Document {
  title: string
  slug: string
  description: string
  content: string
  author: mongoose.Types.ObjectId
  destination?: mongoose.Types.ObjectId
  category: mongoose.Types.ObjectId
  images: {
    url: string
    alt: string
    caption?: string
    isPrimary: boolean
  }[]
  type: 'Itinerary' | 'Tips' | 'Budget' | 'Transportation' | 'Accommodation' | 'Activities' | 'General'
  duration?: {
    days: number
    description: string
  }
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Expert'
  budget: {
    currency: string
    amount: number
    description: string
  }
  itinerary?: {
    day: number
    title: string
    description: string
    activities: string[]
    accommodation?: string
    meals?: string[]
    transportation?: string
    budget?: number
    tips?: string[]
  }[]
  tips: {
    category: string
    title: string
    description: string
  }[]
  whatToBring: string[]
  requirements: string[]
  tags: string[]
  isPublished: boolean
  isFeatured: boolean
  views: number
  likes: mongoose.Types.ObjectId[]
  likesCount: number
  comments: mongoose.Types.ObjectId[]
  commentsCount: number
  seoTitle?: string
  seoDescription?: string
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const guideSchema = new Schema<IGuide>({
  title: {
    type: String,
    required: [true, 'Guide title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
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
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
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
  type: {
    type: String,
    enum: ['Itinerary', 'Tips', 'Budget', 'Transportation', 'Accommodation', 'Activities', 'General'],
    required: true
  },
  duration: {
    days: {
      type: Number,
      min: 1
    },
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
    amount: {
      type: Number,
      min: 0
    },
    description: {
      type: String,
      trim: true
    }
  },
  itinerary: [{
    day: {
      type: Number,
      required: true,
      min: 1
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    activities: [{
      type: String,
      trim: true
    }],
    accommodation: String,
    meals: [String],
    transportation: String,
    budget: Number,
    tips: [String]
  }],
  tips: [{
    category: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  }],
  whatToBring: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  commentsCount: {
    type: Number,
    default: 0
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
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Indexes for better performance
guideSchema.index({ slug: 1 })
guideSchema.index({ author: 1 })
guideSchema.index({ destination: 1 })
guideSchema.index({ category: 1 })
guideSchema.index({ type: 1 })
guideSchema.index({ isPublished: 1, publishedAt: -1 })
guideSchema.index({ isFeatured: 1 })
guideSchema.index({ tags: 1 })
guideSchema.index({ views: -1 })

export default mongoose.model<IGuide>('Guide', guideSchema)
