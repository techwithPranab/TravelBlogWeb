import mongoose, { Document, Schema } from 'mongoose'

export interface ICategory extends Document {
  name: string
  slug: string
  description?: string
  color?: string
  image?: string
  postCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  image: {
    type: String
  },
  postCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index for better performance
categorySchema.index({ slug: 1 })
categorySchema.index({ isActive: 1 })

export default mongoose.model<ICategory>('Category', categorySchema)
