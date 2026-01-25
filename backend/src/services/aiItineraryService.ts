import OpenAI from 'openai'
import mongoose from 'mongoose'
import { IItinerary } from '../models/Itinerary'
import AICallLog from '../models/AICallLog'
import Accommodation from '../models/Accommodation'
import Restaurant from '../models/Restaurant'
import Place from '../models/Place'
import weatherService, { WeatherData } from './weatherService'

interface ItineraryParams {
  source: string
  destinations: string[] // Changed from destination to destinations array
  travelMode: 'air' | 'rail' | 'car' | 'bus' | 'mixed'
  duration: number
  startDate?: string // ISO date string
  endDate?: string // ISO date string
  budget: 'budget' | 'moderate' | 'luxury'
  interests: string[]
  travelStyle: 'solo' | 'couple' | 'family' | 'group'
  adults?: number
  children?: number
  totalPeople?: number
  numberOfRooms?: number // Number of rooms for accommodation cost calculation
  dietType?: 'veg' | 'non-veg' | 'both' // Dietary preference for restaurant recommendations
  // New preference flags to optionally include heavy reference sections
  includeAccommodationReference?: boolean
  includeRestaurantReference?: boolean
  includeWeatherReference?: boolean
}

interface GeneratedItinerary {
  currency?: string
  currencySymbol?: string
  dayPlans: any[]
  accommodationSuggestions: any[]
  transportationTips: any[]
  restaurantRecommendations: any[]
  generalTips: string[]
  weatherForecast?: any[] | null // Weather forecast for trip duration
  packingList?: string[]
  dailyCostBreakdown?: any[]
  budgetBreakdown?: any
  totalEstimatedCost: number
}

class AIItineraryService {
  private openai: OpenAI
  private model: string
  private maxTokens: number
  private temperature: number
  private weatherService: typeof weatherService

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured')
    }
    
    this.model = process.env.OPENAI_MODEL || 'gpt-4.1-nano'
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '8000') // Increased from 4000 to 8000 for detailed itineraries
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
    
    this.openai = new OpenAI({ apiKey })
    this.weatherService = weatherService
  }

  /**
   * Generate AI-powered itinerary
   */
  async generateItinerary(
    params: ItineraryParams, 
    userId: mongoose.Types.ObjectId, 
    itineraryId?: mongoose.Types.ObjectId
  ): Promise<GeneratedItinerary> {
    const startTime = Date.now()
    let logStatus: 'success' | 'failed' | 'partial' = 'success'
    let errorMessage: string | undefined
    let response: string | undefined
    let tokenUsage: any
    
    try {
      // Build the enhanced prompt with advanced features
      const prompt = this.buildEnhancedPrompt(params)

      // Call OpenAI API with GPT-4
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert travel planner and local guide with deep knowledge of destinations worldwide. You have access to:
- Real-time seasonal insights and weather patterns
- Local cultural events and festivals
- Hidden gems and off-the-beaten-path locations
- Insider tips from local experts
- Safety advisories and travel restrictions
- Optimal timing for activities to avoid crowds
- Money-saving strategies and local hacks
- Authentic local experiences

Provide detailed, practical, and personalized travel itineraries in JSON format. Include specific timing, realistic costs, exact locations, and insider knowledge that goes beyond typical tourist information.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        response_format: { type: 'json_object' }
      })

      response = completion.choices[0]?.message?.content || undefined
      tokenUsage = completion.usage
      
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      // Parse and validate response using a robust parser
      let generatedItinerary: any
      try {
        generatedItinerary = this.robustParseJSON(response)
      } catch (parseErr) {
        console.error('Failed to parse AI response as JSON:', parseErr)
        console.error('AI raw response (truncated):', response.substring(0, 2000))
        throw new Error('Invalid JSON response from AI')
      }

      // Debug: Check what OpenAI actually returned
      console.log('🤖 OpenAI Response Sample:', {
        hasAccommodations: !!generatedItinerary.accommodationSuggestions,
        accommodationsType: typeof generatedItinerary.accommodationSuggestions,
        accommodationsIsArray: Array.isArray(generatedItinerary.accommodationSuggestions),
        accommodationsLength: Array.isArray(generatedItinerary.accommodationSuggestions) ? generatedItinerary.accommodationSuggestions.length : 'N/A',
        accommodationsSample: Array.isArray(generatedItinerary.accommodationSuggestions) && generatedItinerary.accommodationSuggestions.length > 0 
          ? JSON.stringify(generatedItinerary.accommodationSuggestions[0]).substring(0, 200) : 'No accommodations',
        hasTransportation: !!generatedItinerary.transportationTips,
        transportationType: typeof generatedItinerary.transportationTips,
        transportationIsArray: Array.isArray(generatedItinerary.transportationTips)
      })

      // Validate and structure the response
      const structuredItinerary = this.validateAndStructureResponse(generatedItinerary, params)

      // Save extracted data to separate collections if itineraryId is provided
      if (itineraryId) {
        await this.saveExtractedData(structuredItinerary, itineraryId, userId, params)
      }

      // Save AI call log
      await this.saveAICallLog({
        userId,
        itineraryId,
        modelName: this.model,
        prompt,
        parameters: params,
        response: generatedItinerary,
        parsedResponse: generatedItinerary,
        rawResponse: response,
        wasRepaired: !!this.lastParseRepair,
        repairedResponse: this.lastParseRepair,
        tokenUsage,
        status: logStatus,
        responseTime: Date.now() - startTime
      })
      
      // Fetch weather data for the itinerary (only if user enabled it)
      if (params.includeWeatherReference !== false) {
        try {
          console.log('🌤️ [WEATHER] Starting weather fetch for itinerary...')
          const weatherForecast = await this.fetchWeatherForItinerary(structuredItinerary, params)
          structuredItinerary.weatherForecast = weatherForecast
          console.log('🌤️ [WEATHER] Weather fetch completed:', weatherForecast ? `${weatherForecast.length} location(s)` : 'No data')
        } catch (weatherError) {
          console.warn('⚠️ [WEATHER] Failed to fetch weather data:', weatherError)
          // Continue without weather data - don't fail the entire itinerary generation
          structuredItinerary.weatherForecast = null
        }
      } else {
        console.log('🌤️ [WEATHER] Skipping weather fetch per user preference')
        structuredItinerary.weatherForecast = null
      }
      
      return structuredItinerary

    } catch (error: any) {
      console.error('AI Itinerary Generation Error:', error)
      logStatus = 'failed'
      errorMessage = error.message
      
      // Save failed AI call log
      let parsedFailureResponse: any = {}
      if (response) {
        try {
          parsedFailureResponse = this.robustParseJSON(response)
        } catch (e) {
          parsedFailureResponse = response
        }
      }

      await this.saveAICallLog({
        userId,
        itineraryId,
        modelName: this.model,
        prompt: this.buildEnhancedPrompt(params),
        parameters: params,
        response: parsedFailureResponse,
        parsedResponse: parsedFailureResponse,
        rawResponse: response,
        wasRepaired: !!this.lastParseRepair,
        repairedResponse: this.lastParseRepair,
        tokenUsage,
        status: logStatus,
        errorMessage,
        responseTime: Date.now() - startTime
      })
      
      throw new Error(`Failed to generate itinerary: ${error.message}`)
    }
  }
  
  /**
   * Fetch weather forecast for the itinerary locations
   */
  /**
   * Extract clean city names from location strings
   * Removes specific addresses, street names, and extracts main city
   */
  private extractCityName(location: string): string | null {
    if (!location || typeof location !== 'string') return null
    
    // Remove common noise words and patterns
    let cleanLocation = location
      // Remove specific addresses and street names
      .replace(/\d+\s+[A-Za-z\s]+(?:Road|Rd|Street|St|Avenue|Ave|Mawatha|Lane|Drive|Dr)[,\s]*/gi, '')
      // Remove postal codes
      .replace(/\d{5,}/g, '')
      // Remove "to" patterns (like "Colombo to Kandy")
      .replace(/\s+to\s+/gi, ' ')
      // Remove airport codes
      .replace(/\b[A-Z]{3}\b/g, '')
      // Remove "Station", "Fort", "Center", "Central", "Market", "area", "Near"
      .replace(/\b(Station|Fort|Center|Central|Market|area|Near|City|downtown|old town)\b/gi, '')
      // Remove extra whitespace
      .trim()
      .replace(/\s+/g, ' ')
    
    // If location contains comma, take the last part (usually city/country)
    if (cleanLocation.includes(',')) {
      const parts = cleanLocation.split(',').map(p => p.trim()).filter(p => p.length > 0)
      // Prefer the second-to-last part (city) over country
      cleanLocation = parts.length > 1 ? parts[parts.length - 2] : parts[parts.length - 1]
    }
    
    // If result is too short or empty, return null
    if (cleanLocation.length < 3) return null
    
    return cleanLocation
  }

  private async fetchWeatherForItinerary(structuredItinerary: any, params?: ItineraryParams): Promise<any[] | null> {
    try {
      // Extract unique major cities/destinations only
      const locations = new Set<string>()
      
      // Priority 1: Add main destination cities from params (most reliable)
      if (params?.destinations && Array.isArray(params.destinations)) {
        params.destinations.forEach((dest: string) => {
          const cleanCity = this.extractCityName(dest)
          if (cleanCity) locations.add(cleanCity)
        })
      }
      
      // Priority 2: Add source city if different
      if (params?.source) {
        const cleanSource = this.extractCityName(params.source)
        if (cleanSource && !locations.has(cleanSource)) {
          locations.add(cleanSource)
        }
      }
      
      // Priority 3: Extract major cities from day plans (only if we have very few locations)
      if (locations.size < 3 && structuredItinerary.dayPlans && Array.isArray(structuredItinerary.dayPlans)) {
        const citiesFromActivities = new Set<string>()
        structuredItinerary.dayPlans.forEach((day: any) => {
          const activities = [...(day.morning || []), ...(day.afternoon || []), ...(day.evening || [])]
          activities.forEach((activity: any) => {
            if (activity.location) {
              const cleanCity = this.extractCityName(activity.location)
              if (cleanCity) citiesFromActivities.add(cleanCity)
            }
          })
        })
        
        // Add only the most common cities (appearing more than once)
        const cityFrequency = new Map<string, number>()
        citiesFromActivities.forEach(city => {
          cityFrequency.set(city, (cityFrequency.get(city) || 0) + 1)
        })
        
        // Add cities that appear multiple times or if we have very few locations
        cityFrequency.forEach((count, city) => {
          if (count > 1 || locations.size < 2) {
            locations.add(city)
          }
        })
      }
      
      if (locations.size === 0) {
        console.warn('No valid locations found in itinerary for weather data')
        return null
      }
      
      console.log(`Fetching weather for ${locations.size} location(s):`, Array.from(locations).join(', '))
      
      // Get date range from params or calculate from duration
      const normalizeDate = (d: string) => {
        if (!d) return null
        // If already a YYYY-MM-DD string, return as-is to avoid timezone parsing issues
        const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/)
        if (m) return `${m[1]}-${m[2]}-${m[3]}`

        // Otherwise parse and normalize to UTC date string
        const dt = new Date(d)
        return new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate())).toISOString().split('T')[0]
      }

      const addDays = (dateStr: string, days: number) => {
        const [y, m, day] = dateStr.split('-').map(Number)
        const dt = new Date(Date.UTC(y, m - 1, day))
        dt.setUTCDate(dt.getUTCDate() + days)
        return dt.toISOString().split('T')[0]
      }

      let startDate: string
      let endDate: string

      if (params?.startDate && params?.endDate) {
        startDate = normalizeDate(params.startDate)!
        endDate = normalizeDate(params.endDate)!
      } else if (params?.startDate && params?.duration) {
        startDate = normalizeDate(params.startDate)!
        endDate = addDays(startDate, params.duration)
      } else {
        // Default to next 7 days if no dates provided
        const today = new Date()
        startDate = today.toISOString().split('T')[0]
        const end = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000)
        endDate = end.toISOString().split('T')[0]
      }
      
      // Fetch weather for each unique location
      const weatherPromises = Array.from(locations).map(async (location) => {
        try {
          // First get coordinates for the location
          const coordinates = await this.weatherService.getCoordinates(location)
          if (!coordinates) {
            console.warn(`Could not get coordinates for ${location}`)
            return null
          }
          
          // Then get weather forecast
          const weatherData = await this.weatherService.getWeatherForecast(
            coordinates.lat,
            coordinates.lng,
            startDate,
            endDate
          )
          
          // Return weather data with location info
          return {
            location,
            coordinates,
            forecast: weatherData
          }
        } catch (error) {
          console.warn(`Failed to fetch weather for ${location}:`, error)
          return null
        }
      })
      
      const weatherResults = await Promise.all(weatherPromises)
      const validWeatherData = weatherResults.filter(result => result !== null)

      // Debug: log summary of weather results (location + forecast length)
      try {
        console.log('🌤️ [WEATHER] Weather summary (raw days):', validWeatherData.map(w => ({ location: w.location, forecastCount: Array.isArray(w.forecast) ? w.forecast.length : 0 })))
      } catch (e) { /* ignore logging failures */ }

      // Convert daywise forecasts into a single summary per location for the trip duration
      const aggregated = await Promise.all(validWeatherData.map(async ({ location, coordinates, forecast }) => {
        // If no day forecasts, try an AI seasonal fallback summary
        if (!Array.isArray(forecast) || forecast.length === 0) {
          try {
            const seasonal = await this.generateSeasonalSummaryForLocation(location, startDate, endDate)
            if (seasonal) {
              return {
                location,
                coordinates,
                dateRange: { startDate, endDate },
                forecastSummary: seasonal
              }
            }
          } catch (e) {
            console.warn(`Failed seasonal fallback for ${location}:`, e)
          }
          // No fallback available
          return { location, coordinates, dateRange: { startDate, endDate }, forecastSummary: null }
        }

        // Calculate aggregates
        const allMins = forecast.map((d: any) => d.temperature?.min ?? 0)
        const allMaxs = forecast.map((d: any) => d.temperature?.max ?? 0)
        const avgMin = Math.round(allMins.reduce((a: number, b: number) => a + b, 0) / allMins.length)
        const avgMax = Math.round(allMaxs.reduce((a: number, b: number) => a + b, 0) / allMaxs.length)
        const minTemp = Math.min(...allMins)
        const maxTemp = Math.max(...allMaxs)

        // Most frequent condition
        const conditionCounts: Record<string, number> = {}
        forecast.forEach((d: any) => {
          const c = (d.conditions || 'Unknown').toLowerCase()
          conditionCounts[c] = (conditionCounts[c] || 0) + 1
        })
        const mostCommonCondition = Object.keys(conditionCounts).reduce((a, b) => conditionCounts[a] > conditionCounts[b] ? a : b)

        // Average precipitation
        const avgPrecip = Math.round((forecast.reduce((acc: number, d: any) => acc + (d.precipitation || 0), 0) / forecast.length))

        // Aggregate recommendations and pick unique ones (limit to 5)
        const recommendationsSet = new Set<string>()
        forecast.flatMap((d: any) => d.recommendations || []).forEach((r: any) => { if (r) recommendationsSet.add(String(r).trim()) })
        const recommendations = Array.from(recommendationsSet).slice(0, 5)

        // Pick an icon from the most common day's icon if available
        const icon = (forecast[0] && forecast[0].icon) || null

        return {
          location,
          coordinates,
          dateRange: { startDate, endDate },
          forecastSummary: {
            minTemp,
            maxTemp,
            avgMin,
            avgMax,
            conditions: mostCommonCondition,
            avgPrecipitation: avgPrecip,
            recommendations,
            icon,
            unit: 'C'
          }
        }
      }))

      return aggregated.length > 0 ? aggregated : null
      
    } catch (error) {
      console.error('Error fetching weather for itinerary:', error)
      return null
    }
  }
  
  /**
   * Save AI call log to database
   */
  private async saveAICallLog(logData: any): Promise<void> {
    try {
      const cost = logData.tokenUsage ? this.calculateCost(logData.tokenUsage) : undefined
      
      await AICallLog.create({
        ...logData,
        cost
      })
    } catch (error) {
      console.error('Failed to save AI call log:', error)
      // Don't throw error - logging failure shouldn't break the main flow
    }
  }
  
  /**
   * Calculate cost based on token usage
   * GPT-4 pricing: $0.03/1K prompt tokens, $0.06/1K completion tokens
   */
  private calculateCost(tokenUsage: any): number {
    const promptCost = (tokenUsage.prompt_tokens || 0) * 0.03 / 1000
    const completionCost = (tokenUsage.completion_tokens || 0) * 0.06 / 1000
    return promptCost + completionCost
  }
  
  private async saveExtractedData(
    generatedItinerary: any,
    itineraryId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    params: ItineraryParams
  ): Promise<void> {
    try {
      const currency = generatedItinerary.currency || 'USD'
      let accommodationCount = 0
      let restaurantCount = 0
      
      // Extract and save accommodations
      if (generatedItinerary.accommodationSuggestions && Array.isArray(generatedItinerary.accommodationSuggestions)) {
        const accommodations = generatedItinerary.accommodationSuggestions.map((acc: any) => ({
          userId,
          destinationName: acc.destination || params.destinations[0],
          name: acc.name || '',
          type: acc.type || 'hotel',
          priceRange: acc.priceRange || '',
          pricePerNight: acc.pricePerNight ? this.parseCurrencyToNumber(acc.pricePerNight) : undefined,
          currency,
          location: {
            address: acc.location?.address || acc.location || acc.address,
            area: acc.location?.area || acc.area,
            coordinates: acc.location?.coordinates || acc.coordinates
          },
          amenities: Array.isArray(acc.amenities) ? acc.amenities : [],
          description: acc.description,
          rating: acc.rating,
          contactInfo: acc.contactInfo,
          isManuallyAdded: false
        }))
        
        if (accommodations.length > 0) {
          // Use upsert operations to handle duplicates gracefully
          const bulkOps = accommodations.map((acc: any) => ({
            updateOne: {
              filter: {
                name: acc.name,
                'location.address': acc.location.address,
                destinationName: acc.destinationName
              },
              update: { $set: acc },
              upsert: true
            }
          }))
          
          if (bulkOps.length > 0) {
            await Accommodation.bulkWrite(bulkOps)
            accommodationCount = accommodations.length
          }
        }
      }
      
      // Extract and save restaurants
      if (generatedItinerary.restaurantRecommendations && Array.isArray(generatedItinerary.restaurantRecommendations)) {
        const restaurants = generatedItinerary.restaurantRecommendations.map((rest: any) => ({
          userId,
          destinationName: rest.destination || params.destinations[0],
          name: rest.name || '',
          cuisine: Array.isArray(rest.cuisine) ? rest.cuisine : [rest.cuisine || 'Various'],
          priceRange: rest.priceRange || '',
          averageCost: rest.averageCost ? this.parseCurrencyToNumber(rest.averageCost) : undefined,
          currency,
          location: {
            address: rest.location?.address || rest.location || rest.address,
            area: rest.location?.area || rest.area,
            coordinates: rest.location?.coordinates || rest.coordinates
          },
          specialties: Array.isArray(rest.specialties) ? rest.specialties : [],
          description: rest.description,
          mealType: rest.mealType,
          dietaryOptions: rest.dietaryOptions,
          rating: rest.rating,
          mustTry: rest.mustTry,
          contactInfo: rest.contactInfo,
          isManuallyAdded: false
        }))
        
        if (restaurants.length > 0) {
          // Use upsert operations to handle duplicates gracefully
          const bulkOps = restaurants.map((rest: any) => ({
            updateOne: {
              filter: {
                name: rest.name,
                'location.address': rest.location.address,
                destinationName: rest.destinationName
              },
              update: { $set: rest },
              upsert: true
            }
          }))
          
          if (bulkOps.length > 0) {
            await Restaurant.bulkWrite(bulkOps)
            restaurantCount = restaurants.length
          }
        }
      }
      
      // Extract and save places from day plans
      const places: any[] = []
      if (generatedItinerary.dayPlans && Array.isArray(generatedItinerary.dayPlans)) {
        for (const dayPlan of generatedItinerary.dayPlans) {
          if (dayPlan.activities && Array.isArray(dayPlan.activities)) {
            for (const activity of dayPlan.activities) {
              if (activity.place || activity.location || activity.name) {
                places.push({
                  itineraryId,
                  userId,
                  destinationName: dayPlan.destination || params.destinations[0],
                  name: activity.place || activity.location || activity.name || '',
                  category: activity.category || activity.type || 'attraction',
                  type: activity.activityType || activity.category,
                  description: activity.description || activity.details,
                  location: {
                    address: activity.address,
                    area: activity.area,
                    coordinates: activity.coordinates
                  },
                  duration: activity.duration,
                  entryFee: activity.entryFee ? {
                    amount: this.parseCurrencyToNumber(activity.entryFee),
                    currency,
                    description: activity.feeDescription
                  } : undefined,
                  timings: activity.timings,
                  bestTimeToVisit: activity.bestTime,
                  tips: Array.isArray(activity.tips) ? activity.tips : [],
                  activities: Array.isArray(activity.activities) ? activity.activities : [],
                  rating: activity.rating,
                  popularity: activity.popularity,
                  accessibility: activity.accessibility,
                  contactInfo: activity.contactInfo,
                  isManuallyAdded: false
                })
              }
            }
          }
        }
        
        if (places.length > 0) {
          await Place.insertMany(places)
        }
      }
      
      console.log(`Saved extracted data: ${accommodationCount} accommodations, ${restaurantCount} restaurants, ${places.length} places`)
    } catch (error) {
      console.error('Failed to save extracted data:', error)
      // Don't throw error - data extraction failure shouldn't break the main flow
    }
  }

  /**
   * Build enhanced prompt with advanced features
   */
  private buildEnhancedPrompt(params: ItineraryParams): string {
    const budgetDescriptions = {
      budget: '$50-100 per day (backpacker/budget-friendly)',
      moderate: '$100-250 per day (comfortable mid-range)',
      luxury: '$250+ per day (premium/luxury experiences)'
    }

    const travelStyleDescriptions = {
      solo: 'solo traveler seeking flexibility, personal growth, and authentic connections',
      couple: 'couple looking for romantic experiences, quality time, and shared memories',
      family: 'family with children needing safe, educational, and fun activities for all ages',
      group: 'group of friends wanting social experiences, adventure, and shared activities'
    }

    const travelModeDetails = {
      air: 'Flying between locations - prioritize proximity to airports, efficient connections',
      rail: 'Train travel - focus on scenic routes, station proximity, rail pass optimization',
      car: 'Road trip by car - include scenic drives, parking info, driving distances, fuel stops',
      bus: 'Bus travel - budget-friendly, consider comfort stops, scenic routes',
      mixed: 'Combination of transport modes - optimize for cost and time efficiency'
    }

    // Get travel period from start date if provided, otherwise use current month
    const travelDate = params.startDate ? new Date(params.startDate) : new Date()
    const travelMonth = travelDate.toLocaleString('default', { month: 'long' })
    const travelYear = travelDate.getFullYear()
    
    // Format person count information
    const adults = params.adults || 1
    const children = params.children || 0
    const totalPeople = params.totalPeople || adults + children
    const personCountInfo = children > 0 
      ? `${adults} adult(s) and ${children} child(ren), total ${totalPeople} people`
      : `${adults} adult(s)`
    
    // Format accommodation information
    const numberOfRooms = params.numberOfRooms || 1 // Use captured value, default to 1 (don't calculate from people count)
    const dietType = params.dietType || 'both' // Default: both veg and non-veg options

    const destinationText = params.destinations.length === 1 
      ? params.destinations[0] 
      : `${params.destinations.join(', ')} (multi-destination trip)`;
    const primaryDestination = params.destinations[0]; // Use first destination for general context
    const sourceLocation = params.source; // Source location for currency context

    // Preference flags (default true)
    const includeAccommodation = params.includeAccommodationReference !== false
    const includeRestaurant = params.includeRestaurantReference !== false
    const includeWeather = params.includeWeatherReference !== false

    console.log('🔧 AI Service - Preference flags:', {
      includeAccommodationReference: params.includeAccommodationReference,
      includeAccommodation: includeAccommodation,
      includeRestaurantReference: params.includeRestaurantReference,
      includeRestaurant: includeRestaurant,
      includeWeatherReference: params.includeWeatherReference,
      includeWeather: includeWeather
    })

    return `Create a comprehensive ${params.duration}-day travel itinerary from ${params.source} to ${destinationText}.

TRAVELER PROFILE:
- Origin: ${params.source}
- Destination(s): ${destinationText}
- Duration: ${params.duration} days
- Travel Group: ${personCountInfo}
- Number of Rooms: ${numberOfRooms} room${numberOfRooms > 1 ? 's' : ''} for accommodation
- Dietary Preference: ${dietType === 'veg' ? 'Vegetarian options only' : dietType === 'non-veg' ? 'Non-vegetarian options only' : 'Both vegetarian and non-vegetarian options'}
- Budget: ${params.budget} (${budgetDescriptions[params.budget]})
- Travel Style: ${travelStyleDescriptions[params.travelStyle]}
- Interests: ${params.interests.join(', ')}
- Travel Mode: ${params.travelMode} (${travelModeDetails[params.travelMode]})
- Travel Period: ${travelMonth} ${travelYear}

${children > 0 ? `
IMPORTANT: FAMILY-FRIENDLY CONSIDERATIONS (${children} children in group):
- Prioritize child-safe and age-appropriate activities
- Include rest breaks and nap times in the schedule
- Suggest family-friendly restaurants with kids menus
- Recommend accommodations with family amenities
- Consider stroller/wheelchair accessibility
- Include educational and entertaining activities for children
- Suggest backup indoor activities in case of bad weather
- Include emergency contacts and nearby medical facilities
` : ''}

CRITICAL: ALL COSTS MUST BE IN THE LOCAL CURRENCY OF ${sourceLocation} (TRAVELER'S HOME CURRENCY)
- Identify the official currency of ${sourceLocation} (e.g., USD for USA, EUR for France, JPY for Japan, INR for India, GBP for UK, etc.)
- Express ALL monetary amounts in this source currency with the proper currency symbol/code
- For price ranges, use source currency format (e.g., "$500-1000" for USA, "€50-80" for France)
- Include currency symbol in every cost field: estimatedCost, priceRange, totalEstimatedCost, budgetBreakdown
- Convert destination costs to source currency for consistency
${totalPeople > 1 ? `- ALL COSTS should reflect the total for ${totalPeople} people, not per person` : ''}

ADVANCED PLANNING REQUIREMENTS:

🌍 **Destination Intelligence:**
${includeWeather ? `- Current season and weather patterns for ${primaryDestination}` : `- (Weather details omitted per user preference)`}
- Local festivals, events, and cultural celebrations happening during visit
- Best times to visit popular attractions (avoid peak crowds)
- Seasonal specialties (food, activities, nature)
- Safety considerations and areas to avoid
- Local customs and etiquette tips

✈️ **Travel Logistics (${params.travelMode} mode):**
${params.travelMode === 'air' ? `
- Flight options from ${params.source} to ${primaryDestination}${params.destinations.length > 1 ? ` and between destinations (${params.destinations.slice(1).join(', ')})` : ''}
- INCLUDE REALISTIC FLIGHT COSTS from ${params.source} to ${primaryDestination} in the budget breakdown (typically 3000-6000 for economy domestic flights, 15000-30000 for domestic business class)
- Airport transfer recommendations and costs
- Proximity of activities to airports
` : params.travelMode === 'rail' ? `
- Train routes and connections from ${params.source}
- INCLUDE REALISTIC TRAIN COSTS from ${params.source} to ${primaryDestination} in the budget breakdown (typically 500-1500 for regional trains, 1500-2500 for high-speed/long-distance trains)
- Railway station locations and transfers
- Scenic rail journey recommendations
- Rail pass options and savings
` : params.travelMode === 'car' ? `
- Road trip route from ${params.source} to ${primaryDestination}${params.destinations.length > 1 ? ` and between destinations (${params.destinations.slice(1).join(', ')})` : ''}
- INCLUDE ESTIMATED CAR RENTAL, FUEL, and TOLL COSTS from ${params.source} to ${primaryDestination} in the budget breakdown
- Estimated driving times and distances
- Scenic stops and photo opportunities
- Parking availability and costs
- Fuel cost estimates
- Car rental recommendations
` : params.travelMode === 'bus' ? `
- Bus routes and companies
- INCLUDE REALISTIC BUS COSTS from ${params.source} to ${primaryDestination} in the budget breakdown (typically 10-100 for long-distance buses)
- Comfort and facilities considerations
- Scenic stops and rest areas
- Cost comparison with other modes
` : `
- Mixed transport recommendations
- INCLUDE ESTIMATED TRAVEL COSTS from ${params.source} to ${primaryDestination} in the budget breakdown
- Cost-time optimization
- Seamless connections between modes
`}

💰 **Budget Optimization:**
- Money-saving tips specific to ${primaryDestination}${params.destinations.length > 1 ? ` and other destinations (${params.destinations.slice(1).join(', ')})` : ''}
- Free or low-cost activities
- Best value-for-money experiences
- Local food markets vs tourist restaurants
- Discount cards or passes available
- Tipping customs and expected amounts

🎯 **Insider Knowledge:**
- Hidden gems and off-beaten-path locations
- Local favorites (restaurants, cafes, bars)
- Best photo spots and golden hour timing
- Areas where locals hang out
- Authentic vs touristy experiences
- Common tourist traps to avoid

🍽️ **Food & Dining:**
- Must-try local dishes and specialties
- Best neighborhoods for food
- Street food recommendations and safety
- Dietary restriction options (${dietType === 'veg' ? 'FOCUS ON VEGETARIAN OPTIONS ONLY' : dietType === 'non-veg' ? 'FOCUS ON NON-VEGETARIAN OPTIONS ONLY' : 'Include both vegetarian and non-vegetarian options'})
- ${dietType === 'veg' ? 'Prioritize pure vegetarian restaurants, Jain-friendly options, and plant-based cuisine' : dietType === 'non-veg' ? 'Include meat, seafood, and non-vegetarian specialties' : 'Balance vegetarian and non-vegetarian recommendations'}
- Breakfast, lunch, dinner timing norms
- Local dining etiquette

📱 **Practical Tips:**
- Mobile connectivity (SIM cards, WiFi spots)
- Essential apps for ${primaryDestination}${params.destinations.length > 1 ? ` and other destinations (${params.destinations.slice(1).join(', ')})` : ''}
- Language basics and useful phrases
- Currency exchange tips
- Emergency contacts
- Healthcare facilities nearby

💱 **CURRENCY INSTRUCTIONS (CRITICAL):**
- Identify the local currency of ${primaryDestination}
- Use proper currency symbols: $ (USD), € (EUR), £ (GBP), ¥ (JPY/CNY), ₹ (INR), etc.
- ALL estimatedCost values MUST be NUMERIC ONLY (e.g., 150, 2500.50) - NO currency symbols, NO commas, NO text
- Currency symbol goes in "currencySymbol" field at the top level
- Do NOT include currency symbols in any cost fields (estimatedCost, totalEstimatedCost, etc.)

⚠️ **CRITICAL FORMATTING RULES:**
1. "estimatedCost": NUMERIC value ONLY (e.g., 150, 2500, 50.5) - NO "₹24,000" or "$150"
2. "totalEstimatedCost": NUMERIC value ONLY - sum of all costs
3. All budgetBreakdown costs: NUMERIC values ONLY
4. Example CORRECT: "estimatedCost": 24000 ✅
5. Example WRONG: "estimatedCost": "₹24,000" ❌
6. Example WRONG: "estimatedCost": "$150" ❌

REQUIRED JSON STRUCTURE (with ${sourceLocation} currency):

{
  "currency": "${sourceLocation} currency code (e.g., USD, EUR, GBP, JPY, INR, etc.)",
  "currencySymbol": "Currency symbol (e.g., $, €, £, ¥, ₹, etc.)",
  "dayPlans": [
    {
      "day": 1,
      "morning": [
        {
          "time": "Varies based on departure",
          "title": "Travel from ${params.source} to ${primaryDestination}",
          "description": "CRITICAL: Include detailed ${params.travelMode} travel information from ${params.source} to ${primaryDestination}. Include departure time, arrival time, journey duration, and any transit information.",
          "estimatedCost": ${params.travelMode === 'air' ? '300' : params.travelMode === 'rail' ? '80' : params.travelMode === 'bus' ? '25' : params.travelMode === 'car' ? '150' : '200'},
          "duration": "Estimated travel time",
          "location": "${params.source} to ${primaryDestination}",
          "insiderTip": "Best booking options and time-saving tips for this route",
          "bookingRequired": true
        },
        {
          "time": "After arrival",
          "title": "Hotel Check-in & Rest",
          "description": "Settle into accommodation and rest after journey",
          "estimatedCost": 12000,
          "duration": "1-2 hours",
          "location": "Hotel/Accommodation",
          "insiderTip": "Pro tip for check-in process"
        }
      ],
      "afternoon": [
        {
          "time": "After settling in",
          "title": "First Activity in ${primaryDestination}",
          "description": "Detailed description with insider tips and why this timing is optimal",
          "estimatedCost": 1500,
          "duration": "2 hours",
          "location": "Exact address or landmark",
          "insiderTip": "Pro tip for best experience",
          "bestTimeToVisit": "Afternoon for first-day energy",
          "bookingRequired": false
        }
      ],
      "evening": [...],
      "totalEstimatedCost": 37500,
      "notes": "Special tips for Day 1 including arrival, settling in, and first impressions"
    },
    {
      "day": 2,
      "morning": [...],
      "afternoon": [...],
      "evening": [...],
      "totalEstimatedCost": 5500,
      "notes": "Daily tips"
    }
  ],
  "accommodationSuggestions": [
    {
      "name": "Hotel/Hostel Name",
      "type": "Hotel/Hostel/Airbnb/Guesthouse/Resort",
      "priceRange": "Source currency range for ${numberOfRooms} room${numberOfRooms > 1 ? 's' : ''} per night (e.g., $100-200 for USA, €50-100 for France)",
      "location": {
        "address": "Full complete address (e.g., '123 Main Street, Downtown District, City, Country')",
        "area": "Neighborhood/Area",
        "coordinates": {
          "lat": 12.345678,
          "lng": -98.765432
        }
      },
      "amenities": ["WiFi", "Breakfast", "Pool"],
      "proximityToAttractions": "Central location, 10 min to main square",
      "bookingTip": "Book 2 months ahead for best rates",
      "whyRecommended": "Perfect for ${params.travelStyle} travelers with ${numberOfRooms} room${numberOfRooms > 1 ? 's' : ''} needed"
    }
  ],
  "transportationTips": [
    {
      "type": "${params.travelMode}",
      "description": "Detailed how-to and when to use",
      "estimatedCost": 500,
      "insiderTip": "Local hack for saving money or time",
      "bookingInfo": "Where and how to book"
    }
  ],
  "restaurantRecommendations": [
    {
      "name": "Restaurant Name",
      "cuisine": "Cuisine Type",
      "priceRange": "Source currency per meal (e.g., $15-25 for USA, €10-20 for France)",
      "mealType": ["breakfast", "lunch", "dinner"],
      "dietaryOptions": "${dietType === 'veg' ? '[\\"vegetarian\\", \\\"vegan\\"]' : dietType === 'non-veg' ? '[\\"non-vegetarian\\", \\\"meat\\", \\\"seafood\\"]' : '[\\"vegetarian\\", \\\"non-vegetarian\\", \\\"vegan\\", \\\"meat\\", \\\"seafood\\"]'}",
      "location": {
        "address": "Full complete address (e.g., '456 Food Street, Culinary District, City, Country')",
        "area": "Neighborhood/Area",
        "coordinates": {
          "lat": 12.345678,
          "lng": -98.765432
        }
      },
      "mustTryDish": "Specific dish recommendation",
      "reservationNeeded": true/false,
      "localFavorite": true/false
    }
  ],
  "generalTips": [
    "Seasonal tip for ${travelMonth}",
    "Money-saving hack",
    "Safety consideration",
    "Cultural etiquette",
    "Best time for photos",
    "Hidden gem recommendation",
    "Common mistake to avoid",
    "Local secret"
  ],
  "packingList": [
    "Season-specific items for ${travelMonth}",
    "Activity-specific gear",
    "Don't forget items"
  ],
  "dailyCostBreakdown": [
    {
      "day": 1,
      "flightCost": ${params.travelMode === 'air' ? '300' : params.travelMode === 'rail' ? '80' : params.travelMode === 'bus' ? '25' : params.travelMode === 'car' ? '150' : '200'},
      "accommodationCost": 120,
      "foodCost": 45,
      "sightseeingCost": 25,
      "localTransportCost": 15,
      "shoppingCost": 20,
      "miscellaneousCost": 10,
      "totalDayCost": 535
    },
    // ... repeat for each day until ${params.duration}
  ],
  "budgetBreakdown": {
    "totalFlightCost": ${params.travelMode === 'air' ? '600' : params.travelMode === 'rail' ? '160' : params.travelMode === 'bus' ? '50' : params.travelMode === 'car' ? '300' : '400'},
    "totalAccommodationCost": 840,
    "totalFoodCost": 315,
    "totalSightseeingCost": 175,
    "totalLocalTransportCost": 105,
    "totalShoppingCost": 140,
    "totalMiscellaneousCost": 70
  },
  "totalEstimatedCost": 2385
}

CRITICAL INSTRUCTIONS:
1. Create exactly ${params.duration} day plans
2. **DAY 1 MUST START WITH TRAVEL FROM ${params.source} TO ${primaryDestination}** - First activity of Day 1 morning MUST be the ${params.travelMode} journey
3. Day 1: Include travel + 1-2 activities after arrival; Days 2-N: 2-3 morning activities, 2-3 afternoon, 1-2 evening
4. **ALL COSTS MUST BE IN ${sourceLocation}'S LOCAL CURRENCY** - Not destination currency! Identify the currency of ${sourceLocation} and use it consistently
5. Use proper currency symbols ($ for USA, € for Europe, ¥ for Japan, £ for UK, ₹ for India, etc.)
6. Include SPECIFIC FULL ADDRESSES with coordinates for all accommodations and restaurants
7. **DAILY COST BREAKDOWN**: For each day (1 to ${params.duration}), provide REALISTIC NUMERIC VALUES ONLY based on ${params.travelMode} travel:
   - flightCost: ${params.travelMode} cost (Day 1: from ${params.source} to ${primaryDestination} - ${params.travelMode === 'air' ? '150-400 economy, 400-1200 business' : params.travelMode === 'rail' ? '20-150 regional, 50-400 high-speed' : params.travelMode === 'bus' ? '10-80 long-distance' : params.travelMode === 'car' ? '50-200 rental + fuel' : 'varies by mode'}, Last day: return journey, other days: 0 or inter-city travel)
   - accommodationCost: Hotel/hostel cost for that night (${params.budget} budget, ${numberOfRooms} room${numberOfRooms > 1 ? 's' : ''} for ${totalPeople} people)
   - foodCost: Total food for ${totalPeople} people (breakfast, lunch, dinner, snacks - ${params.budget} budget)
   - sightseeingCost: Entry fees, tickets, guided tours for that day
   - localTransportCost: Taxis, metro, local buses within destination city
   - shoppingCost: Estimated shopping/souvenirs for that day
   - miscellaneousCost: Tips, emergency fund, other expenses
   - totalDayCost: Sum of all above costs for that day
8. **BUDGET BREAKDOWN SUMMARY**: Calculate REALISTIC totals across ALL days based on ${params.travelMode} travel and ${params.budget} budget - NUMERIC VALUES ONLY:
   - totalFlightCost: Sum of all flightCost from dailyCostBreakdown (roundtrip ${params.travelMode} - ${params.travelMode === 'air' ? '300-800 economy, 800-2400 business' : params.travelMode === 'rail' ? '40-300 regional, 100-800 high-speed' : params.travelMode === 'bus' ? '20-160 long-distance' : params.travelMode === 'car' ? '100-400 rental + fuel' : 'varies by mode'})
   - totalAccommodationCost: Sum of all accommodationCost from dailyCostBreakdown (${params.duration} nights, ${params.budget} budget)
   - totalFoodCost: Sum of all foodCost from dailyCostBreakdown (${totalPeople} people, ${params.budget} budget)
   - totalSightseeingCost: Sum of all sightseeingCost from dailyCostBreakdown
   - totalLocalTransportCost: Sum of all localTransportCost from dailyCostBreakdown
   - totalShoppingCost: Sum of all shoppingCost from dailyCostBreakdown
   - totalMiscellaneousCost: Sum of all miscellaneousCost from dailyCostBreakdown
9. **CRITICAL**: totalEstimatedCost = sum of all 7 totals in budgetBreakdown - NUMERIC VALUE ONLY
10. Add insider tips that aren't on typical tourist sites
11. Consider ${travelMonth} weather and seasonal events
12. Optimize for ${params.travelMode} travel mode
13. Focus heavily on: ${params.interests.join(', ')}
14. Tailor for ${params.travelStyle} travel style
      ${ (includeAccommodation || includeRestaurant) ? `15. ${ includeAccommodation ? 'Include 5-8 accommodations, ' : '' }Include 5-8 transport tips${ includeRestaurant ? ', 8-12 restaurants ' + (dietType !== 'both' ? `(FOCUS ON ${dietType.toUpperCase()} OPTIONS ONLY)` : '') : '' }` : `15. DO NOT include accommodation or restaurant recommendations in the output. Set "accommodationSuggestions": [], "restaurantRecommendations": []` }
15. Provide 10-15 general tips with actionable advice
16. Add packing list relevant to season and activities

Make this itinerary BETTER than free ChatGPT by including:
- Exact timing optimization (best hours to visit)
- Real money-saving strategies
- Actual hidden gems locals know
- Specific seasonal recommendations
- Practical booking information
- Cultural insights and etiquette
- Safety and health tips
- Photo opportunity spots and timing
- Crowd avoidance strategies
- Authentic local experiences`
  }

  private lastParseRepair?: string

  // Robust parser for AI response (tries JSON, JSON5, substring extraction, and a safe VM eval fallback)
  private robustParseJSON(str: string): any {
    // reset last repair info for each parse attempt
    this.lastParseRepair = undefined

    const tryParse = (s: string | undefined) => {
      if (!s || typeof s !== 'string') return undefined
      try {
        return JSON.parse(s)
      } catch (e) {}
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const JSON5 = require('json5')
        return JSON5.parse(s)
      } catch (e) {}
      return undefined
    }

    // Direct parse attempts
    let parsed = tryParse(str)
    if (parsed !== undefined) return parsed

    // Try extracting a top-level object substring
    const firstBrace = str.indexOf('{')
    const lastBrace = str.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = str.substring(firstBrace, lastBrace + 1)
      parsed = tryParse(candidate)
      if (parsed !== undefined) {
        this.lastParseRepair = undefined
        return parsed
      }
    }

    // Fallback: attempt a safe VM evaluation of a JS-like object literal
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const vm = require('vm')
      // Wrap in parentheses to make it an expression
      const evaluated = vm.runInNewContext('(' + str + ')', {}, { timeout: 1000 })
      if (evaluated !== undefined) {
        this.lastParseRepair = undefined
        // Convert the evaluated object to JSON and back to ensure it's properly serialized
        try {
          const jsonString = JSON.stringify(evaluated)
          return JSON.parse(jsonString)
        } catch (e) {
          // If serialization fails, return the evaluated object as-is
          return evaluated
        }
      }
    } catch (e) {
      // ignore
    }

    // Attempt to repair truncated/malformed JSON by closing unbalanced strings and brackets
    try {
      let inString = false
      let escape = false
      const stack: string[] = []

      for (let i = 0; i < str.length; i++) {
        const ch = str[i]
        if (escape) { escape = false; continue }
        if (ch === '\\') { escape = true; continue }
        if (ch === '"') { inString = !inString; continue }
        if (!inString) {
          if (ch === '{') stack.push('}')
          else if (ch === '[') stack.push(']')
          else if (ch === '}' || ch === ']') {
            if (stack.length > 0 && stack[stack.length - 1] === ch) stack.pop()
          }
        }
      }

      let repaired = str
      // If a string wasn't closed, close it
      if (inString) repaired += '"'

      // Append required closing brackets in correct order
      while (stack.length > 0) repaired += stack.pop()

      // Remove trailing commas before closers
      repaired = repaired.replace(/,\s*([\]\}])/g, '$1')

      // Try parsing repaired string
      const tryParseAgain = (s: string) => {
        try { return JSON.parse(s) } catch (e) {}
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const JSON5 = require('json5')
          return JSON5.parse(s)
        } catch (e) {}
        return undefined
      }

      const parsedRepaired = tryParseAgain(repaired)
      if (parsedRepaired !== undefined) {
        this.lastParseRepair = repaired
        console.log('🤖 AI response repaired and parsed (truncated):', repaired.substring(0, 500))
        return parsedRepaired
      }
    } catch (repairErr) {
      // ignore repair failure
    }

    throw new Error('Unable to parse AI response as JSON')
  }

  private validateAndStructureResponse(
    response: any,
    params: ItineraryParams
  ): GeneratedItinerary {
    // Use the robust parser
    const parseJsonOrArray = (d: any) => this.parseJsonOrArrayInternal(d)

    // Validate day plans
    if (!response.dayPlans || !Array.isArray(response.dayPlans)) {
      throw new Error('Invalid day plans structure')
    }

    if (response.dayPlans.length !== params.duration) {
      throw new Error(`Expected ${params.duration} days, got ${response.dayPlans.length}`)
    }

    const normalizeActivity = (activity: any) => ({
      time: activity?.time || activity?.Time || 'TBD',
      title: activity?.title || activity?.name || activity?.activity || 'Activity',
      description: activity?.description || activity?.details || '',
      estimatedCost: this.parseCurrencyToNumber(activity?.estimatedCost ?? activity?.cost ?? 0),
      duration: activity?.duration || activity?.time || 'N/A',
      location: activity?.location || activity?.address || '' ,
      insiderTip: activity?.insiderTip || activity?.tip || '' ,
      bestTimeToVisit: activity?.bestTimeToVisit || activity?.bestTime || '' ,
      bookingRequired: typeof activity?.bookingRequired === 'boolean' ? activity.bookingRequired : undefined
    })

    const processedDayPlans = response.dayPlans.map((day: any, index: number) => {
      // Ensure day is an object (handles string-wrapped objects)
      if (typeof day === 'string') {
        const parsed = this.parseJsonOrArrayInternal(day)
        day = parsed && parsed.length > 0 && typeof parsed[0] === 'object' ? parsed[0] : {}
      }

      const morningArray = parseJsonOrArray(day.morning)
      const afternoonArray = parseJsonOrArray(day.afternoon)
      const eveningArray = parseJsonOrArray(day.evening)

      const processedDay = {
        day: day.day || index + 1,
        morning: morningArray.map((activity: any) => normalizeActivity(activity)),
        afternoon: afternoonArray.map((activity: any) => normalizeActivity(activity)),
        evening: eveningArray.map((activity: any) => normalizeActivity(activity)),
        totalEstimatedCost: this.parseCurrencyToNumber(day.totalEstimatedCost ?? 0),
        notes: day.notes || ''
      }
      return processedDay
    })

    // Process accommodations
    const rawAccommodations = parseJsonOrArray(response.accommodationSuggestions)
    
    // Debug log
    console.log('🏨 Raw accommodations type:', typeof rawAccommodations, 'isArray:', Array.isArray(rawAccommodations))
    console.log('🏨 Raw accommodations sample:', JSON.stringify(rawAccommodations).substring(0, 500))
    
    const processedAccommodations = rawAccommodations.map((acc: any, idx: number) => {
      if (typeof acc === 'string') {
        console.log(`⚠️ Accommodation ${idx} is a string:`, acc.substring(0, 100))
        // try to parse inner string to object if it's JSON-like
        const parsed = this.parseJsonOrArrayInternal(acc)
        if (parsed.length > 0 && typeof parsed[0] === 'object') acc = parsed[0]
        else return { name: acc, type: 'Hotel', priceRange: '', location: '', amenities: [] }
      }

      // Ensure amenities is always an array of strings
      let amenitiesArray: string[] = []
      if (Array.isArray(acc.amenities)) {
        amenitiesArray = acc.amenities.map((a: any) => String(a))
      } else if (typeof acc.amenities === 'string') {
        amenitiesArray = [acc.amenities]
      }

      return {
        name: acc.name || acc.title || 'Accommodation',
        type: acc.type || 'Hotel',
        priceRange: acc.priceRange || acc.price || '',
        location: {
          address: acc.location?.address || acc.location || acc.address || '',
          area: acc.location?.area || '',
          coordinates: acc.location?.coordinates ? {
            lat: acc.location.coordinates.lat || 0,
            lng: acc.location.coordinates.lng || 0
          } : undefined
        },
        amenities: amenitiesArray,
        proximityToAttractions: acc.proximityToAttractions || '',
        bookingTip: acc.bookingTip || '',
        whyRecommended: acc.whyRecommended || ''
      }
    })

    console.log('🏨 Processed accommodations count:', processedAccommodations.length)
    if (processedAccommodations.length > 0) {
      console.log('🏨 First processed accommodation:', JSON.stringify(processedAccommodations[0]).substring(0, 300))
    }

    // Process transportation tips and parse costs
    const rawTransportation = parseJsonOrArray(response.transportationTips)
    const processedTransportationTips = rawTransportation.map((tip: any) => {
      if (typeof tip === 'string') {
        return {
          type: 'general',
          description: tip,
          estimatedCost: this.parseCurrencyToNumber(0),
          insiderTip: '',
          bookingInfo: ''
        }
      }

      return {
        type: tip.type || tip.mode || 'general',
        description: tip.description || tip.details || '',
        estimatedCost: this.parseCurrencyToNumber(tip.estimatedCost ?? 0),
        insiderTip: tip.insiderTip || tip.insider || tip.tip || '',
        bookingInfo: tip.bookingInfo || tip.booking || ''
      }
    })

    // Process restaurants
    const rawRestaurants = parseJsonOrArray(response.restaurantRecommendations)
    const dietType = params.dietType || 'both'
    const processedRestaurants = rawRestaurants
      .map((rest: any) => {
        if (typeof rest === 'string') {
          const parsed = this.parseJsonOrArrayInternal(rest)
          if (parsed.length > 0 && typeof parsed[0] === 'object') rest = parsed[0]
          else return { name: rest }
        }

        return {
          name: rest.name || rest.title || 'Restaurant',
          cuisine: Array.isArray(rest.cuisine) ? rest.cuisine.join(', ') : (rest.cuisine || 'Various'),
          priceRange: rest.priceRange || rest.price || '',
          mealType: Array.isArray(rest.mealType) ? rest.mealType : (rest.mealType ? [rest.mealType] : []),
          dietaryOptions: Array.isArray(rest.dietaryOptions) ? rest.dietaryOptions : (rest.dietaryOptions ? [rest.dietaryOptions] : ['vegetarian', 'non-vegetarian']),
          location: {
            address: rest.location?.address || rest.location || rest.address || '',
            area: rest.location?.area || rest.area,
            coordinates: rest.location?.coordinates ? {
              lat: rest.location.coordinates.lat || 0,
              lng: rest.location.coordinates.lng || 0
            } : undefined
          },
          mustTryDish: rest.mustTryDish || '',
          reservationNeeded: rest.reservationNeeded || false,
          localFavorite: rest.localFavorite || false
        }
      })
      .filter((rest: any) => {
        // Filter restaurants based on dietary preference
        if (dietType === 'veg') {
          return rest.dietaryOptions?.some((option: string) =>
            option.toLowerCase().includes('veg') || option.toLowerCase().includes('vegetarian') || option.toLowerCase().includes('vegan')
          )
        } else if (dietType === 'non-veg') {
          return rest.dietaryOptions?.some((option: string) =>
            option.toLowerCase().includes('non-veg') || option.toLowerCase().includes('meat') || option.toLowerCase().includes('seafood')
          )
        }
        // For 'both', include all restaurants
        return true
      })

    // Debug logging
    console.log('📊 Processed data types:', {
      accommodations: Array.isArray(processedAccommodations) ? 'array' : typeof processedAccommodations,
      accommodationsLength: Array.isArray(processedAccommodations) ? processedAccommodations.length : 'N/A',
      transportationTips: Array.isArray(processedTransportationTips) ? 'array' : typeof processedTransportationTips,
      restaurants: Array.isArray(processedRestaurants) ? 'array' : typeof processedRestaurants
    })

    // Final sanity check - ensure all arrays contain plain objects, not stringified representations
    const sanitizeArray = (arr: any[]): any[] => {
      if (!Array.isArray(arr)) return []
      return arr.map((item, idx) => {
        if (typeof item === 'string') {
          console.warn(`⚠️ Found string in array at index ${idx}, converting to object`)
          return { name: item }
        }
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          // Ensure the object is a plain object by serializing and deserializing
          try {
            return JSON.parse(JSON.stringify(item))
          } catch (e) {
            console.warn(`⚠️ Failed to serialize object at index ${idx}`)
            return item
          }
        }
        return item
      })
    }

    const finalAccommodations = sanitizeArray(processedAccommodations)
    const finalTransportation = sanitizeArray(processedTransportationTips)
    const finalRestaurants = sanitizeArray(processedRestaurants)

    // Process daily cost breakdown
    const rawDailyCostBreakdown = parseJsonOrArray(response.dailyCostBreakdown)
    // Use the actual numberOfRooms from params, not recalculated
    const numberOfRooms = params.numberOfRooms || 1 // Use captured value, default to 1
    const processedDailyCostBreakdown = rawDailyCostBreakdown.map((day: any) => ({
      day: day.day || 0,
      flightCost: this.parseCurrencyToNumber(day.flightCost || 0),
      accommodationCost: this.parseCurrencyToNumber(day.accommodationCost || 0), // AI already provides total for all rooms
      foodCost: this.parseCurrencyToNumber(day.foodCost || 0),
      sightseeingCost: this.parseCurrencyToNumber(day.sightseeingCost || 0),
      localTransportCost: this.parseCurrencyToNumber(day.localTransportCost || 0),
      shoppingCost: this.parseCurrencyToNumber(day.shoppingCost || 0),
      miscellaneousCost: this.parseCurrencyToNumber(day.miscellaneousCost || 0),
      totalDayCost: this.parseCurrencyToNumber(day.totalDayCost || 0) // AI already provides total
    }))

    // Sync day plans totalEstimatedCost with dailyCostBreakdown
    if (processedDailyCostBreakdown.length > 0) {
      processedDayPlans.forEach((dayPlan: any) => {
        const costBreakdown = processedDailyCostBreakdown.find((db: any) => db.day === dayPlan.day)
        if (costBreakdown) {
          // Override the day plan's totalEstimatedCost with the dailyCostBreakdown's totalDayCost
          dayPlan.totalEstimatedCost = costBreakdown.totalDayCost
        }
      })
    }

    // Calculate budget breakdown from daily cost breakdown for consistency
    let calculatedBudgetBreakdown: any = undefined
    let calculatedTotalCost = 0

    if (processedDailyCostBreakdown.length > 0) {
      const totals = processedDailyCostBreakdown.reduce((acc, day) => ({
        totalFlightCost: acc.totalFlightCost + day.flightCost,
        totalAccommodationCost: acc.totalAccommodationCost + day.accommodationCost,
        totalFoodCost: acc.totalFoodCost + day.foodCost,
        totalSightseeingCost: acc.totalSightseeingCost + day.sightseeingCost,
        totalLocalTransportCost: acc.totalLocalTransportCost + day.localTransportCost,
        totalShoppingCost: acc.totalShoppingCost + day.shoppingCost,
        totalMiscellaneousCost: acc.totalMiscellaneousCost + day.miscellaneousCost
      }), {
        totalFlightCost: 0,
        totalAccommodationCost: 0,
        totalFoodCost: 0,
        totalSightseeingCost: 0,
        totalLocalTransportCost: 0,
        totalShoppingCost: 0,
        totalMiscellaneousCost: 0
      })

      calculatedBudgetBreakdown = totals
      calculatedTotalCost = Object.values(totals).reduce((sum: number, cost: any) => sum + cost, 0)
    }

    // Respect user preference flags: if user opted out, clear respective sections
    if (params.includeAccommodationReference === false) {
      // eslint-disable-next-line no-param-reassign
      finalAccommodations.length = 0
    }
    if (params.includeRestaurantReference === false) {
      // eslint-disable-next-line no-param-reassign
      finalRestaurants.length = 0
    }

    // Ensure all required fields exist with defaults
    return {
      currency: response.currency,
      currencySymbol: response.currencySymbol,
      dayPlans: processedDayPlans,
      accommodationSuggestions: finalAccommodations,
      transportationTips: finalTransportation,
      restaurantRecommendations: finalRestaurants,
      generalTips: Array.isArray(response.generalTips) ? response.generalTips : [],
      packingList: Array.isArray(response.packingList) ? response.packingList : undefined,
      dailyCostBreakdown: processedDailyCostBreakdown.length > 0 ? processedDailyCostBreakdown : undefined,
      budgetBreakdown: calculatedBudgetBreakdown,
      totalEstimatedCost: calculatedTotalCost || this.parseCurrencyToNumber(response.totalEstimatedCost),
      // If user disabled weather, ensure it's not included
      weatherForecast: params.includeWeatherReference === false ? null : response.weatherForecast
    }
  }

  /**
   * Regenerate specific day in itinerary
   */
  async regenerateDay(
    source: string,
    destinations: string[], // Changed from destination string to destinations array
    travelMode: string,
    dayNumber: number,
    params: ItineraryParams
  ): Promise<any> {
    const destinationText = destinations.length === 1 
      ? destinations[0] 
      : destinations.join(', ');
    
    try {
      const prompt = `Generate a single day plan (day ${dayNumber}) for a trip from ${source} to ${destinationText}.

Budget: ${params.budget}
Interests: ${params.interests.join(', ')}
Travel Style: ${params.travelStyle}
Travel Mode: ${travelMode}

Return JSON:
{
  "day": ${dayNumber},
  "morning": [...activities with insiderTip, bestTimeToVisit, bookingRequired...],
  "afternoon": [...activities...],
  "evening": [...activities...],
  "totalEstimatedCost": 0,
  "notes": ""
}`

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a travel planner. Generate a single day itinerary in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        response_format: { type: 'json_object' }
      })

      const response = completion.choices[0]?.message?.content
      if (!response) return null
      try {
        return this.robustParseJSON(response)
      } catch (err) {
        throw new Error(`Failed to parse regenerated day response: ${err instanceof Error ? err.message : String(err)}`)
      }

    } catch (error: any) {
      throw new Error(`Failed to regenerate day: ${error.message}`)
    }
  }

  /**
   * Get AI suggestions for user edits
   */
  async getSuggestions(
    itinerary: IItinerary,
    userEdit: string
  ): Promise<string[]> {
    try {
      const prompt = `A user is editing their ${itinerary.duration}-day itinerary for ${itinerary.destination}.

Current budget: ${itinerary.budget}
Travel Mode: ${itinerary.travelMode}
User's edit request: "${userEdit}"

Provide 3-5 helpful suggestions to improve the itinerary based on this edit.
Return JSON: { "suggestions": ["suggestion1", "suggestion2", ...] }`

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful travel assistant providing brief suggestions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        response_format: { type: 'json_object' }
      })

      const response = completion.choices[0]?.message?.content
      if (!response) return []

      try {
        const parsed = this.robustParseJSON(response)
        return parsed.suggestions || []
      } catch (err) {
        console.error('Failed to parse AI suggestions response:', err instanceof Error ? err.message : err)
        return []
      }
    } catch (error) {
      console.error('Failed to get AI suggestions:', error)
      return []
    }
  }

  /**
   * Parse currency string to number (e.g., "₹12,000" -> 12000, "$50" -> 50)
   */
  private parseCurrencyToNumber(currencyString: string | number): number {
    if (typeof currencyString === 'number') {
      return currencyString
    }

    if (typeof currencyString === 'string') {
      // Handle strings with calculations like "₹ 800 + ₹ 6,000 = ₹ 6,800"
      // First, check if there's an equals sign and extract the final result
      const equalsMatch = currencyString.match(/=\s*[^0-9]*([0-9,]+\.?[0-9]*)/)
      if (equalsMatch) {
        const cleaned = equalsMatch[1].replace(/,/g, '')
        const parsed = parseFloat(cleaned)
        if (!isNaN(parsed)) {
          return parsed
        }
      }

      // Fallback: extract all numbers and take the last one (usually the total)
      const numberMatches = currencyString.match(/[0-9,]+\.?[0-9]*/g)
      if (numberMatches && numberMatches.length > 0) {
        // Take the last number found (usually the total)
        const lastNumber = numberMatches[numberMatches.length - 1]
        const cleaned = lastNumber.replace(/,/g, '')
        const parsed = parseFloat(cleaned)
        if (!isNaN(parsed)) {
          return parsed
        }
      }

      // Final fallback: Remove currency symbols and extract first number
      const cleaned = currencyString.replace(/[^\d.,-]/g, '').replace(/,/g, '')
      const parsed = parseFloat(cleaned)
      return isNaN(parsed) ? 0 : parsed
    }

    return 0
  }

  // Robust JSON/JS-like parsing helper (handles JSON5 / single quotes / string-wrapped arrays)
  private parseJsonOrArrayInternal(data: any): any[] {
    const tryParse = (str: string): any => {
      str = (str || '').trim()
      if (!str) return undefined
      try {
        return JSON.parse(str)
      } catch (e) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const JSON5 = require('json5')
          return JSON5.parse(str)
        } catch (e2) {
          // fallback: attempt minor cleanup (convert single quotes to double quotes conservatively)
          try {
            const cleaned = str.replace(/:\s*'([^']*)'/g, ':"$1"')
            const cleaned2 = cleaned.replace(/'/g, '"')
            return JSON.parse(cleaned2)
          } catch (e3) {
            return undefined
          }
        }
      }
    }

    if (Array.isArray(data)) {
      const out: any[] = []
      for (const el of data) {
        if (typeof el === 'string') {
          const parsed = tryParse(el)
          if (parsed !== undefined) {
            if (Array.isArray(parsed)) out.push(...parsed)
            else out.push(parsed)
          } else {
            out.push(el)
          }
        } else {
          out.push(el)
        }
      }
      return out
    }

    if (typeof data === 'string') {
      const parsed = tryParse(data)
      if (parsed === undefined) return []
      return Array.isArray(parsed) ? parsed : [parsed]
    }

    return []
  }

  // Public test helper to call the private fetchWeatherForItinerary (local debugging only)
  public async testFetchWeather(params: ItineraryParams): Promise<any[] | null> {
    return this.fetchWeatherForItinerary({}, params)
  }

  private async generateSeasonalSummaryForLocation(location: string, startDate: string, endDate: string): Promise<any | null> {
    try {
      console.log(`🌤️ [WEATHER] No daywise forecast for ${location} between ${startDate} and ${endDate}, generating seasonal estimate via AI...`)

      const prompt = `You are a concise climatology assistant. For the location "${location}", provide a compact JSON summary of the typical weather between ${startDate} and ${endDate} (inclusive). The JSON must include the following keys:\n- minTemp: number (typical minimum temperature in °C)\n- maxTemp: number (typical maximum temperature in °C)\n- avgMin: number (average minimum in °C)\n- avgMax: number (average maximum in °C)\n- conditions: short string (e.g., "clear", "clouds", "rain")\n- avgPrecipitation: number (0-100 percent chance)\n- recommendations: array of short strings (packing/activity tips)\nReturn only valid JSON object. Be concise.`

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a professional travel climatology assistant who provides short, factual summaries.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.0,
        max_tokens: 400,
        response_format: { type: 'json_object' }
      })

      const response = completion.choices[0]?.message?.content
      if (!response) return null

      let parsed: any
      try {
        parsed = this.robustParseJSON(response)
      } catch (e) {
        console.warn('🌤️ [WEATHER] Seasonal AI returned non-JSON or could not be parsed', e)
        return null
      }

      // Normalize fields and ensure types
      parsed.minTemp = Number(parsed.minTemp ?? parsed.min ?? 0)
      parsed.maxTemp = Number(parsed.maxTemp ?? parsed.max ?? 0)
      parsed.avgMin = Number(parsed.avgMin ?? parsed.avg_min ?? Math.round((parsed.minTemp || 0)))
      parsed.avgMax = Number(parsed.avgMax ?? parsed.avg_max ?? Math.round((parsed.maxTemp || 0)))
      parsed.conditions = String(parsed.conditions || parsed.condition || 'Unknown')
      parsed.avgPrecipitation = Math.round(Number(parsed.avgPrecipitation ?? parsed.avg_precipitation ?? parsed.precipitation ?? 0))
      parsed.recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 5) : (parsed.recommendations ? [String(parsed.recommendations)] : [])
      parsed.source = 'seasonal-ai'
      parsed.estimated = true
      parsed.unit = parsed.unit || 'C'

      console.log(`🌤️ [WEATHER] Seasonal summary generated for ${location}:`, { source: parsed.source, estimated: parsed.estimated })

      return parsed
    } catch (error) {
      console.warn('🌤️ [WEATHER] Failed to generate seasonal summary:', error)
      return null
    }
  }
}

export default new AIItineraryService()
