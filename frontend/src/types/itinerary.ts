export interface Activity {
  time: string
  title: string
  description: string
  estimatedCost: number
  duration: string
  location?: string
  insiderTip?: string // Enhanced: Pro tips from locals
  bestTimeToVisit?: string // Enhanced: Optimal timing to avoid crowds
  bookingRequired?: boolean // Enhanced: Whether advance booking needed
}

export interface DayPlan {
  day: number
  date?: string
  morning: Activity[]
  afternoon: Activity[]
  evening: Activity[]
  totalEstimatedCost: number
  notes?: string
}

export interface Location {
  address: string
  area?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface AccommodationSuggestion {
  name: string
  type: string
  priceRange: string
  location: Location
  amenities: string[]
  proximityToAttractions?: string // Enhanced: How close to main attractions
  bookingTip?: string // Enhanced: When/where to book for best rates
  whyRecommended?: string // Enhanced: Why perfect for travel style
}

export interface TransportationTip {
  type: string
  description: string
  estimatedCost: number
  insiderTip?: string // Enhanced: Local hacks for saving money/time
  bookingInfo?: string // Enhanced: Where and how to book
}

export interface RestaurantRecommendation {
  name: string
  cuisine: string
  priceRange: string
  mealType: string[]
  location: Location
  mustTryDish?: string // Enhanced: Specific dish recommendation
  reservationNeeded?: boolean // Enhanced: Whether booking required
  localFavorite?: boolean // Enhanced: Whether it's a local favorite
}

export interface WeatherData {
  date: string // ISO date string
  temperature: {
    min: number
    max: number
    unit: 'C' | 'F'
  }
  conditions: string // e.g., "Sunny", "Rainy", "Cloudy"
  description: string // Detailed weather description
  precipitation: number // Precipitation percentage (0-100)
  humidity: number // Humidity percentage (0-100)
  windSpeed: number // Wind speed in km/h or mph
  uvIndex: number // UV index (0-11+)
  icon: string // Weather icon code (e.g., "01d", "02n")
  recommendations?: string[] // Weather-based activity suggestions
}

// Aggregated forecast summary covering the itinerary duration for a location
export interface ForecastSummary {
  minTemp: number
  maxTemp: number
  avgMin: number
  avgMax: number
  conditions: string
  avgPrecipitation: number
  recommendations: string[]
  icon?: string
  unit?: 'C' | 'F'
  estimated?: boolean // Whether this is an estimated seasonal summary
  source?: string // e.g., 'forecast' | 'seasonal-ai'
}

export interface WeatherForecast {
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  // Legacy day-wise forecast (optional)
  forecast?: WeatherData[]
  // Aggregated summary for itinerary duration (optional)
  dateRange?: { startDate: string, endDate: string }
  forecastSummary?: ForecastSummary | null
}

export type BudgetLevel = 'budget' | 'moderate' | 'luxury'
export type TravelStyle = 'solo' | 'couple' | 'family' | 'group'
export type TravelMode = 'air' | 'rail' | 'car' | 'bus' | 'mixed'
export type ItineraryStatus = 'generating' | 'completed' | 'failed' | 'edited'

export interface Itinerary {
  _id: string
  userId: string

  // Text-based inputs (no database reference)
  source: string // Origin city/location
  destinations: string[] // Array of destination cities/locations (1-5)
  travelMode: TravelMode // Preferred travel mode

  // Person count
  adults: number // Number of adults (1-20)
  children: number // Number of children (0-10)
  totalPeople: number // Calculated: adults + children

  // Currency information (from destination country)
  currency?: string // Currency code (e.g., USD, EUR, GBP, INR, JPY)
  currencySymbol?: string // Currency symbol (e.g., $, €, £, ₹, ¥)

  title: string
  duration: number // Calculated from startDate and endDate
  startDate: string // ISO date string for trip start date
  endDate: string // ISO date string for trip end date
  budget: BudgetLevel
  interests: string[]
  travelStyle: TravelStyle
  numberOfRooms?: number // Number of rooms for accommodation cost calculation
  dietType?: 'veg' | 'non-veg' | 'both' // Dietary preference for restaurant recommendations

  dayPlans: DayPlan[]
  accommodationSuggestions: AccommodationSuggestion[]
  transportationTips: TransportationTip[]
  restaurantRecommendations: RestaurantRecommendation[]
  generalTips: string[]
  weatherForecast?: WeatherForecast[] | null // Weather forecast for trip duration
  packingList?: string[] // Enhanced: Season-specific packing list
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
  }[] // Daily cost breakdown
  budgetBreakdown?: { // Enhanced: Detailed budget breakdown summary
    totalFlightCost: number
    totalAccommodationCost: number
    totalFoodCost: number
    totalSightseeingCost: number
    totalLocalTransportCost: number
    totalShoppingCost: number
    totalMiscellaneousCost: number
  }
  totalEstimatedCost: number

  isPublic: boolean
  shareToken?: string
  status: ItineraryStatus
  generatedBy: 'ai' | 'manual'
  aiModel: string

  isEdited: boolean
  lastEditedAt?: string
  
  viewCount: number
  shareCount: number
  
  createdAt: string
  updatedAt: string
}

export interface ItineraryFormData {
  source: string // Origin city/location
  destinations: string[] // Array of destination cities/locations (1-5)
  travelMode: TravelMode // Preferred travel mode
  startDate: string // Trip start date
  endDate: string // Trip end date
  duration?: number // Calculated from dates
  budget: BudgetLevel
  interests: string[]
  travelStyle: TravelStyle
  adults: number // Number of adults (1-20)
  children: number // Number of children (0-10)
  numberOfRooms?: number // Number of rooms for accommodation cost calculation
  dietType?: 'veg' | 'non-veg' | 'both' // Dietary preference for restaurant recommendations
  // Preference toggles to include/exclude heavy reference sections in the AI prompt
  // Unchecking these reduces input/output token usage by omitting sections
  includeAccommodationReference?: boolean
  includeRestaurantReference?: boolean
  includeWeatherReference?: boolean
}

export interface ItineraryResponse {
  success: boolean
  message?: string
  data?: Itinerary
  error?: {
    code: string
    limit: number
    current: number
    resetTime: string
    retryAfter: number
  }
}

export interface ItinerariesListResponse {
  success: boolean
  data?: Itinerary[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
