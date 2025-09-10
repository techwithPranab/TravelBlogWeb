import mongoose, { Document, Schema } from 'mongoose'

export interface IPost extends Document {
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  images?: string[]
  author: mongoose.Types.ObjectId
  categories: mongoose.Types.ObjectId[]
  tags: string[]
  seo: {
    metaTitle?: string
    metaDescription?: string
    focusKeyword?: string
    ogImage?: string
  }
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'archived'
  isPremium: boolean
  readTime: number
  viewCount: number
  likeCount: number
  commentCount: number
  likes: mongoose.Types.ObjectId[]
  comments: mongoose.Types.ObjectId[]
  destination?: {
    country: string
    city?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  // Approval workflow fields
  submittedAt?: Date
  moderatedBy?: mongoose.Types.ObjectId
  moderatedAt?: Date
  moderationNotes?: string
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const postSchema = new Schema<IPost>({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: [true, 'Please provide an excerpt'],
    trim: true,
    maxlength: [500, 'Excerpt cannot be more than 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content']
  },
  featuredImage: {
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    },
    caption: {
      type: String
    }
  },
  images: [{
    type: String
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot be more than 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot be more than 160 characters']
    },
    focusKeyword: {
      type: String,
      maxlength: [50, 'Focus keyword cannot be more than 50 characters']
    },
    ogImage: String
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected', 'archived'],
    default: 'draft'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  readTime: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: []
  }],
  destination: {
    country: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  // Approval workflow fields
  submittedAt: {
    type: Date
  },
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  moderationNotes: {
    type: String,
    trim: true
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc: any, ret: any) {
      // Convert backend field names to match frontend API interface
      ret.views = ret.viewCount || 0
      ret.likes = ret.likeCount || 0
      ret.comments = ret.commentCount || 0
      
      // Ensure numeric fields have default values
      ret.viewCount = ret.viewCount || 0
      ret.likeCount = ret.likeCount || 0
      ret.commentCount = ret.commentCount || 0
      ret.readTime = ret.readTime || 0
      return ret
    }
  },
  toObject: { virtuals: true }
})

// Indexes for better performance
postSchema.index({ slug: 1 })
postSchema.index({ author: 1 })
postSchema.index({ categories: 1 })
postSchema.index({ tags: 1 })
postSchema.index({ status: 1 })
postSchema.index({ isPremium: 1 })
postSchema.index({ publishedAt: -1 })
postSchema.index({ viewCount: -1 })
postSchema.index({ createdAt: -1 })

// Text index for search
postSchema.index({
  title: 'text',
  excerpt: 'text',
  content: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    excerpt: 5,
    tags: 3,
    content: 1
  }
})

// Generate slug from title before saving
postSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
  }
  next()
})

// Calculate read time before saving
postSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200
    const words = this.content.trim().split(/\s+/).length
    this.readTime = Math.ceil(words / wordsPerMinute)
  }
  next()
})

// Set published date when status changes to published
postSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date()
    }
    if (this.status === 'pending' && !this.submittedAt) {
      this.submittedAt = new Date()
    }
  }
  next()
})

// Virtual for comments

export default mongoose.model<IPost>('Post', postSchema)
