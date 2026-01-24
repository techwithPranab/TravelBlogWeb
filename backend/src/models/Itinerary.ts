import mongoose, { Schema, Document } from 'mongoose'

export interface IActivity {
  time: string
  title: string
  description: string
  estimatedCost: number
  duration: string
  location?: string
}

export interface IDayPlan {
  day: number
  date?: string
  morning: IActivity[]
  afternoon: IActivity[]
  evening: IActivity[]
  totalEstimatedCost: number
  notes?: string
}

export interface IItinerary extends Document {
  userId: mongoose.Types.ObjectId
  
  // User Input - Text Based
  source: string // Origin city/location
  destinations: string[] // Multiple destinations in order of visit
  travelMode: 'air' | 'rail' | 'car' | 'bus' | 'mixed' // Preferred travel mode
  
  // Person count
  adults: number // Number of adults
  children: number // Number of children
  totalPeople: number // Total people (calculated)
  numberOfRooms?: number // Number of rooms for accommodation cost calculation
  dietType?: 'veg' | 'non-veg' | 'both' // Dietary preference for restaurant recommendations
  includeAccommodationReference?: boolean // User preference to include accommodation reference
  includeRestaurantReference?: boolean // User preference to include restaurant reference
  includeWeatherReference?: boolean // User preference to include weather reference
  
  title: string
  duration: number // in days (calculated from startDate and endDate)
  startDate?: Date // Trip start date (optional for backward compatibility)
  endDate?: Date // Trip end date (optional for backward compatibility)
  budget: 'budget' | 'moderate' | 'luxury'
  interests: string[]
  travelStyle: 'solo' | 'couple' | 'family' | 'group'
  
  // Currency information (from destination country)
  currency?: string // Currency code (e.g., USD, EUR, GBP, INR, JPY)
  currencySymbol?: string // Currency symbol (e.g., $, €, £, ₹, ¥)
  
  // Legacy field for backward compatibility
  destination?: string
  
  // Generated content
  dayPlans: IDayPlan[]
  accommodationSuggestions: {
    name: string
    type: string
    priceRange: string
    location: {
      address: string
      area?: string
      coordinates?: {
        lat: number
        lng: number
      }
    }
    amenities: string[]
    proximityToAttractions?: string
    bookingTip?: string
    whyRecommended?: string
  }[]
  transportationTips: {
    type: string
    description: string
    estimatedCost: number
  }[]
  restaurantRecommendations: {
    name: string
    cuisine: string
    priceRange: string
    mealType: string[]
    location: {
      address: string
      area?: string
      coordinates?: {
        lat: number
        lng: number
      }
    }
    mustTryDish?: string
    reservationNeeded?: boolean
    localFavorite?: boolean
  }[]
  generalTips: string[]
  packingList?: string[] // Enhanced feature: season-specific packing list
  weatherForecast?: any[] | null // Weather forecast for trip duration
  dailyCostBreakdown?: {
    day: number
    flightCost: number
    accommodationCost: number
    foodCost: number
    sightseeingCost: number
    localTransportCost: number
    shoppingCost: number
    miscellaneousCost: number
    totalDayCost: number
  }[] // Daily cost breakdown for each day
  budgetBreakdown?: {
    totalFlightCost: number
    totalAccommodationCost: number
    totalFoodCost: number
    totalSightseeingCost: number
    totalLocalTransportCost: number
    totalShoppingCost: number
    totalMiscellaneousCost: number
  } // Enhanced feature: detailed budget breakdown summary
  totalEstimatedCost: number
  
  // Metadata
  isPublic: boolean
  shareToken: string
  status: 'generating' | 'completed' | 'failed' | 'edited'
  generatedBy: 'ai' | 'manual'
  aiModel: string
  
  // User modifications
  isEdited: boolean
  lastEditedAt?: Date
  
  // Analytics
  viewCount: number
  shareCount: number
  
  createdAt: Date
  updatedAt: Date
}

const ActivitySchema = new Schema({
  time: { type: String, default: 'TBD' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  estimatedCost: { type: Number, default: 0 },
  duration: { type: String, default: 'N/A' },
  location: { type: String }
})

const DayPlanSchema = new Schema({
  day: { type: Number, required: true },
  date: { type: String },
  morning: [ActivitySchema],
  afternoon: [ActivitySchema],
  evening: [ActivitySchema],
  totalEstimatedCost: { type: Number, required: true },
  notes: { type: String }
})

const TransportationTipSchema = new Schema({
  type: { type: String },
  description: { type: String },
  estimatedCost: { type: Number },
  insiderTip: { type: String },
  bookingInfo: { type: String }
}, { _id: false })

const ItinerarySchema = new Schema<IItinerary>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    source: {
      type: String,
      required: true,
      trim: true
    },
    destinations: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0 && v.length <= 5,
        message: 'At least 1 and maximum 5 destinations are allowed'
      }
    },
    destination: {
      type: String,
      trim: true
    },
    travelMode: {
      type: String,
      enum: ['air', 'rail', 'car', 'bus', 'mixed'],
      required: true
    },
    adults: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
      default: 1
    },
    children: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 0
    },
    totalPeople: {
      type: Number,
      required: true,
      min: 1,
      max: 30
    },
    numberOfRooms: {
      type: Number,
      required: false,
      min: 1,
      max: 10,
      default: 1
    },
    dietType: {
      type: String,
      enum: ['veg', 'non-veg', 'both'],
      required: false,
      default: 'both'
    },
    includeAccommodationReference: {
      type: Boolean,
      default: true
    },
    includeRestaurantReference: {
      type: Boolean,
      default: true
    },
    includeWeatherReference: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 30
    },
    startDate: {
      type: Date,
      required: false // Made optional for backward compatibility
    },
    endDate: {
      type: Date,
      required: false // Made optional for backward compatibility
    },
    budget: {
      type: String,
      enum: ['budget', 'moderate', 'luxury'],
      required: true
    },
    interests: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one interest is required'
      }
    },
    travelStyle: {
      type: String,
      enum: ['solo', 'couple', 'family', 'group'],
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    currencySymbol: {
      type: String,
      default: '$'
    },
    dayPlans: {
      type: [DayPlanSchema],
      default: []
    },
    accommodationSuggestions: {
      type: [{
        name: String,
        type: String,
        priceRange: String,
        location: {
          address: String,
          area: String,
          coordinates: {
            lat: Number,
            lng: Number
          }
        },
        amenities: [String],
        proximityToAttractions: String,
        bookingTip: String,
        whyRecommended: String
      }],
      default: []
    },
    transportationTips: {
      type: [TransportationTipSchema],
      default: []
    },
    restaurantRecommendations: {
      type: [{
        name: String,
        cuisine: String,
        priceRange: String,
        mealType: [String],
        location: {
          address: String,
          area: String,
          coordinates: {
            lat: Number,
            lng: Number
          }
        },
        mustTryDish: String,
        reservationNeeded: Boolean,
        localFavorite: Boolean
      }],
      default: []
    },
    generalTips: {
      type: [String],
      default: []
    },
    packingList: {
      type: [String],
      default: []
    },
    weatherForecast: {
      type: Schema.Types.Mixed,
      default: null
    },
    dailyCostBreakdown: {
      type: [{
        day: Number,
        flightCost: { type: Number, default: 0 },
        accommodationCost: { type: Number, default: 0 },
        foodCost: { type: Number, default: 0 },
        sightseeingCost: { type: Number, default: 0 },
        localTransportCost: { type: Number, default: 0 },
        shoppingCost: { type: Number, default: 0 },
        miscellaneousCost: { type: Number, default: 0 },
        totalDayCost: { type: Number, default: 0 }
      }],
      default: []
    },
    budgetBreakdown: {
      type: {
        totalFlightCost: { type: Number, default: 0 },
        totalAccommodationCost: { type: Number, default: 0 },
        totalFoodCost: { type: Number, default: 0 },
        totalSightseeingCost: { type: Number, default: 0 },
        totalLocalTransportCost: { type: Number, default: 0 },
        totalShoppingCost: { type: Number, default: 0 },
        totalMiscellaneousCost: { type: Number, default: 0 }
      },
      default: {}
    },
    totalEstimatedCost: {
      type: Number,
      default: 0
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true
    },
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed', 'edited'],
      default: 'generating'
    },
    generatedBy: {
      type: String,
      enum: ['ai', 'manual'],
      default: 'ai'
    },
    aiModel: {
      type: String,
      default: 'gpt-4'
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    lastEditedAt: {
      type: Date
    },
    viewCount: {
      type: Number,
      default: 0
    },
    shareCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

// Indexes for better query performance
ItinerarySchema.index({ userId: 1, createdAt: -1 })
ItinerarySchema.index({ shareToken: 1 })
ItinerarySchema.index({ status: 1 })

// Calculate totalPeople before saving
ItinerarySchema.pre('save', function(next) {
  // Calculate total people
  this.totalPeople = this.adults + this.children
  
  // Set destination from destinations array for backward compatibility
  if (this.destinations && this.destinations.length > 0) {
    this.destination = this.destinations.join(', ')
  }
  
  // Generate share token if public
  if (!this.shareToken && this.isPublic) {
    this.shareToken = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15)
  }
  next()
})

export default mongoose.model<IItinerary>('Itinerary', ItinerarySchema)
