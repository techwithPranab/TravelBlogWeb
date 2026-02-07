import mongoose, { Schema, Document } from 'mongoose'

export interface IPlace extends Document {
  itineraryId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  destinationName: string
  name: string
  category: string // attraction, activity, landmark, museum, park, beach, etc.
  type?: string // historical, cultural, natural, adventure, etc.
  description?: string
  location: {
    address?: string
    area?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  duration?: string // e.g., "2-3 hours", "Half day", "Full day"
  entryFee?: {
    amount?: number
    currency?: string
    description?: string
  }
  timings?: {
    openTime?: string
    closeTime?: string
    days?: string[]
  }
  bestTimeToVisit?: string
  tips?: string[]
  activities?: string[]
  rating?: number
  popularity?: string // high, medium, low
  accessibility?: string[]
  contactInfo?: {
    phone?: string
    email?: string
    website?: string
  }
  isManuallyAdded: boolean
  createdAt: Date
  updatedAt: Date
}

const PlaceSchema = new Schema<IPlace>(
  {
    itineraryId: {
      type: Schema.Types.ObjectId,
      ref: 'Itinerary',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    destinationName: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String
    },
    description: {
      type: String
    },
    location: {
      address: { type: String },
      area: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    duration: {
      type: String
    },
    entryFee: {
      amount: { type: Number },
      currency: { type: String },
      description: { type: String }
    },
    timings: {
      openTime: { type: String },
      closeTime: { type: String },
      days: [{ type: String }]
    },
    bestTimeToVisit: {
      type: String
    },
    tips: [{
      type: String
    }],
    activities: [{
      type: String
    }],
    rating: {
      type: Number,
      min: 0,
      max: 5
    },
    popularity: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    accessibility: [{
      type: String
    }],
    contactInfo: {
      phone: { type: String },
      email: { type: String },
      website: { type: String }
    },
    isManuallyAdded: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// Indexes
PlaceSchema.index({ itineraryId: 1, destinationName: 1 })
PlaceSchema.index({ userId: 1, createdAt: -1 })
PlaceSchema.index({ category: 1 })
PlaceSchema.index({ type: 1 })

export default mongoose.model<IPlace>('Place', PlaceSchema)
