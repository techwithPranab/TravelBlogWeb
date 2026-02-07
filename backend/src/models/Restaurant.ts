import mongoose, { Schema, Document } from 'mongoose'

export interface IRestaurant extends Document {
  userId: mongoose.Types.ObjectId
  destinationName: string
  name: string
  cuisine: string[]
  priceRange: string
  averageCost?: number
  currency?: string
  location: {
    address?: string
    area?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  specialties: string[]
  description?: string
  mealType?: string[] // breakfast, lunch, dinner, snacks
  dietaryOptions?: string[] // vegetarian, vegan, gluten-free, etc.
  rating?: number
  mustTry?: string[]
  contactInfo?: {
    phone?: string
    email?: string
    website?: string
  }
  isManuallyAdded: boolean
  createdAt: Date
  updatedAt: Date
}

const RestaurantSchema = new Schema<IRestaurant>(
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
    cuisine: [{
      type: String,
      required: true
    }],
    priceRange: {
      type: String,
      required: true
    },
    averageCost: {
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
    specialties: [{
      type: String
    }],
    description: {
      type: String
    },
    mealType: [{
      type: String
    }],
    dietaryOptions: [{
      type: String
    }],
    rating: {
      type: Number,
      min: 0,
      max: 5
    },
    mustTry: [{
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
RestaurantSchema.index({ userId: 1, createdAt: -1 })
RestaurantSchema.index({ cuisine: 1 })
// Compound index to prevent duplicate restaurants in same location
RestaurantSchema.index({ name: 1, 'location.address': 1, destinationName: 1 }, { unique: true, sparse: true })

export default mongoose.model<IRestaurant>('Restaurant', RestaurantSchema)
