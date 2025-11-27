import mongoose, { Document, Schema } from 'mongoose'

export interface IEmailTemplate extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  key: string // unique identifier like 'contributor_submission', 'post_approved', 'weekly_newsletter'
  subject: string
  htmlContent: string
  textContent: string
  variables: string[] // available template variables
  type: 'contributor_submission' | 'post_approved' | 'weekly_newsletter' | 'custom'
  isActive: boolean
  description?: string
  createdAt: Date
  updatedAt: Date
}

const emailTemplateSchema = new Schema<IEmailTemplate>({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true
  },
  key: {
    type: String,
    required: [true, 'Template key is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true
  },
  htmlContent: {
    type: String,
    required: [true, 'HTML content is required']
  },
  textContent: {
    type: String,
    required: [true, 'Text content is required']
  },
  variables: [{
    type: String,
    trim: true
  }],
  type: {
    type: String,
    required: [true, 'Template type is required'],
    enum: ['contributor_submission', 'post_approved', 'weekly_newsletter', 'custom'],
    default: 'custom'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for faster queries
emailTemplateSchema.index({ type: 1 })
emailTemplateSchema.index({ isActive: 1 })

export default mongoose.model<IEmailTemplate>('EmailTemplate', emailTemplateSchema)
