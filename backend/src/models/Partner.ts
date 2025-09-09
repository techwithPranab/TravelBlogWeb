import mongoose, { Document, Schema } from 'mongoose'

export interface IPartner extends Document {
  firstName: string
  lastName: string
  email: string
  company: string
  partnershipType: 'hotel' | 'tour' | 'brand' | 'creator' | 'other'
  message: string
  status: 'pending' | 'reviewed' | 'approved' | 'rejected'
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
}

const partnerSchema = new Schema<IPartner>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  company: {
    type: String,
    required: [true, 'Company/organization name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  partnershipType: {
    type: String,
    required: [true, 'Partnership type is required'],
    enum: {
      values: ['hotel', 'tour', 'brand', 'creator', 'other'],
      message: 'Partnership type must be one of: hotel, tour, brand, creator, other'
    }
  },
  message: {
    type: String,
    required: [true, 'Partnership proposal message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Indexes for better performance
partnerSchema.index({ email: 1 })
partnerSchema.index({ status: 1 })
partnerSchema.index({ partnershipType: 1 })
partnerSchema.index({ createdAt: -1 })
partnerSchema.index({ status: 1, createdAt: -1 })

// Virtual for full name
partnerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Ensure virtual fields are serialized
partnerSchema.set('toJSON', { virtuals: true })
partnerSchema.set('toObject', { virtuals: true })

export default mongoose.model<IPartner>('Partner', partnerSchema)
