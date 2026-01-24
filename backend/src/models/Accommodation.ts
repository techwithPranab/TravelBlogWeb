import mongoose, { Schema, Document } from 'mongoose'

export interface IAccommodation extends Document {
  userId: mongoose.Types.ObjectId
  destinationName: string
  name: string
  type: string // hotel, hostel, resort, villa, etc.
  priceRange: string
  pricePerNight?: number
  currency?: string
  location: {
    address?: string
    area?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  amenities: string[]
  description?: string
  checkIn?: string
  checkOut?: string
  nights?: number
  rating?: number
  contactInfo?: {
    phone?: string
    email?: string
    website?: string
  }
  isManuallyAdded: boolean
  createdAt: Date
  updatedAt: Date
}

const AccommodationSchema = new Schema<IAccommodation>(
  {
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
    type: {
      type: String,
      required: true
    },
    priceRange: {
      type: String,
      required: true
    },
    pricePerNight: {
      type: Number
    },
    currency: {
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
    amenities: [{
      type: String
    }],
    description: {
      type: String
    },
    checkIn: {
      type: String
    },
    checkOut: {
      type: String
    },
    nights: {
      type: Number
    },
    rating: {
      type: Number,
      min: 0,
      max: 5
    },
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
AccommodationSchema.index({ userId: 1, createdAt: -1 })
// Compound index to prevent duplicate accommodations in same location
AccommodationSchema.index({ name: 1, 'location.address': 1, destinationName: 1 }, { unique: true, sparse: true })

export default mongoose.model<IAccommodation>('Accommodation', AccommodationSchema)
