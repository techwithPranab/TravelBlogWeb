import { Response } from 'express'
import { AuthenticatedRequest } from '../types/express'
import Itinerary from '../models/Itinerary'
import Subscription from '../models/Subscription'
import aiItineraryService from '../services/aiItineraryService'
import pdfService from '../services/pdfService'
import { emailService } from '../services/emailService'
import { deepParseIfString } from '../utils/aiParsing'

// Helper: convert values to a normalized array of strings
const toStringArray = (val: any): string[] => {
  if (!val) return []
  if (Array.isArray(val)) return val.map((v: any) => typeof v === 'string' ? v : String(v))
  if (typeof val === 'string') {
    const parsed = deepParseIfString(val)
    if (Array.isArray(parsed)) return parsed.map((v: any) => String(v))
    // fallback: split on common separators
    return val.split(/[,;|\n]+/).map(s => String(s).trim()).filter(Boolean)
  }
  return [String(val)]
}

// Sanitize accommodations into objects with expected fields and normalized amenities array
const sanitizeAccommodations = (arr: any): any[] => {
  const list = Array.isArray(arr) ? arr : (arr ? [arr] : [])
  const out: any[] = []
  for (let item of list) {
    if (typeof item === 'string') {
      const parsed = deepParseIfString(item)
      if (Array.isArray(parsed)) {
        out.push(...sanitizeAccommodations(parsed))
        continue
      } else if (parsed && typeof parsed === 'object') {
        item = parsed
      } else {
        out.push({ name: String(item), type: 'Hotel', priceRange: '', location: '', amenities: [] })
        continue
      }
    }

    if (item && typeof item === 'object') {
      const name = item.name || item.title || item.hotelName || 'Accommodation'
      const type = item.type || 'Hotel'
      const priceRange = item.priceRange || item.price || ''
      const location = item.location || item.address || ''

      let amenities: string[] = []
      if (Array.isArray(item.amenities)) {
        amenities = item.amenities.map((a: any) => String(a).trim())
      } else if (typeof item.amenities === 'string') {
        const parsed = deepParseIfString(item.amenities)
        if (Array.isArray(parsed)) amenities = parsed.map((a: any) => String(a).trim())
        else amenities = String(item.amenities).split(/[,;|\n]+/).map((s: string) => s.trim()).filter(Boolean)
      }

      out.push({ name: String(name), type: String(type), priceRange: String(priceRange), location: String(location), amenities })
    } else {
      out.push({ name: String(item) })
    }
  }
  return out
}

// Sanitize transportation tips
const sanitizeTransportation = (arr: any): any[] => {
  const list = Array.isArray(arr) ? arr : (arr ? [arr] : [])
  return list.map((item: any) => {
    if (typeof item === 'string') {
      const parsed = deepParseIfString(item)
      if (typeof parsed === 'object') {
        item = parsed
      } else {
        return { type: 'general', description: String(item), estimatedCost: 0 }
      }
    }
    return {
      type: item.type || item.mode || 'general',
      description: item.description || item.details || String(item),
      estimatedCost: Number(item.estimatedCost) || 0
    }
  })
}

// Sanitize restaurants
const sanitizeRestaurants = (arr: any): any[] => {
  const list = Array.isArray(arr) ? arr : (arr ? [arr] : [])
  return list.map((item: any) => {
    if (typeof item === 'string') {
      const parsed = deepParseIfString(item)
      if (Array.isArray(parsed)) return parsed.map((p: any) => sanitizeRestaurants([p]))[0]
      if (typeof parsed === 'object') item = parsed
      else return { name: String(item), cuisine: 'Various', priceRange: '' }
    }
    return {
      name: item.name || item.title || 'Restaurant',
      cuisine: Array.isArray(item.cuisine) ? item.cuisine.join(', ') : (item.cuisine || 'Various'),
      priceRange: item.priceRange || item.price || '',
      mealType: Array.isArray(item.mealType) ? item.mealType : (item.mealType ? [item.mealType] : []),
      location: item.location || item.address || ''
    }
  })
}

/**
 * Generate new AI itinerary
 * POST /api/itineraries
 */
export const generateItinerary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      source,
      destinations,
      travelMode,
      startDate,
      endDate,
      duration,
      budget,
      interests,
      travelStyle,
      adults = 1,
      children = 0,
      includeAccommodationReference = true,
      includeRestaurantReference = true,
      includeWeatherReference = true
    } = req.body
    const userId = req.user._id

    // Validate input
    if (!source || !destinations || !Array.isArray(destinations) || destinations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Source and at least one destination are required'
      })
    }

    if (!travelMode || !budget || !interests || !travelStyle) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: travelMode, budget, interests, travelStyle'
      })
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      })
    }

    // Calculate duration from dates if not provided
    const calculatedDuration = duration || Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))

    if (calculatedDuration < 1 || calculatedDuration > 30) {
      return res.status(400).json({
        success: false,
        message: 'Trip duration must be between 1 and 30 days'
      })
    }

    if (destinations.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 destinations allowed'
      })
    }

    // Check subscription limits
    let subscription = await Subscription.findOne({ userId })
    
    // Create free subscription if doesn't exist
    if (!subscription) {
      await Subscription.createFreeSubscription(userId)
      subscription = await Subscription.findOne({ userId })
    }

    // Ensure subscription exists (should never be null after above logic)
    if (!subscription) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create or retrieve subscription'
      })
    }    // Validate subscription status
    if (!subscription.isActive()) {
      return res.status(403).json({
        success: false,
        message: 'Your subscription has expired. Please upgrade to continue creating itineraries.',
        data: {
          subscriptionType: subscription.subscriptionType,
          subscriptionEndDate: subscription.subscriptionEndDate
        }
      })
    }

    // Check if user can create more itineraries
    if (!subscription.canCreateItinerary()) {
      return res.status(403).json({
        success: false,
        message: `You have reached your itinerary limit (${subscription.itinerariesLimit} per year). Please upgrade to Premium for more itineraries.`,
        data: {
          subscriptionType: subscription.subscriptionType,
          itinerariesUsed: subscription.itinerariesUsed,
          itinerariesLimit: subscription.itinerariesLimit,
          upgradeUrl: '/subscription/upgrade'
        }
      })
    }

    // Create initial itinerary record with 'generating' status
    const itinerary = new Itinerary({
      userId,
      source,
      destinations,
      travelMode,
      adults,
      children,
      totalPeople: adults + children,
      title: `${calculatedDuration}-Day Trip: ${destinations.join(' → ')}`,
      duration: calculatedDuration,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget,
      interests,
      travelStyle,
      status: 'generating',
      generatedBy: 'ai',
      aiModel: 'gpt-4',
      includeAccommodationReference,
      includeRestaurantReference,
      includeWeatherReference
    })

    await itinerary.save()
    
    // Store itinerary ID for logging
    const itineraryId = itinerary._id as any

    // Log preference flags for debugging
    console.log('[ITINERARY] Preference flags:', {
      includeAccommodationReference,
      includeRestaurantReference,
      includeWeatherReference
    })

    // Generate itinerary asynchronously
    try {
      const generatedContent = await aiItineraryService.generateItinerary({
        source,
        destinations, // Pass the full destinations array
        travelMode,
        duration: calculatedDuration,
        startDate,
        endDate,
        budget,
        interests,
        travelStyle,
        adults,
        children,
        totalPeople: adults + children,
        includeAccommodationReference,
        includeRestaurantReference,
        includeWeatherReference
      }, userId, itineraryId)

      // Update itinerary with generated content
      // The AI service already returns properly formatted data after sanitization
      // We only need deep parsing for dayPlans, generalTips, and packingList
      const parsedDayPlans = deepParseIfString(generatedContent.dayPlans)
      const parsedGeneralTips = deepParseIfString(generatedContent.generalTips)
      const parsedPackingList = deepParseIfString(generatedContent.packingList)
      const parsedBudgetBreakdown = deepParseIfString(generatedContent.budgetBreakdown)
      const parsedDailyCostBreakdown = deepParseIfString(generatedContent.dailyCostBreakdown)
      // Use the already sanitized data from AI service directly
      itinerary.dayPlans = Array.isArray(parsedDayPlans) ? parsedDayPlans : []
      
      // Ensure plain objects by double-serializing to remove any VM-evaluated remnants
      itinerary.accommodationSuggestions = Array.isArray(generatedContent.accommodationSuggestions) 
        ? JSON.parse(JSON.stringify(generatedContent.accommodationSuggestions))
        : []
      itinerary.transportationTips = Array.isArray(generatedContent.transportationTips)
        ? JSON.parse(JSON.stringify(generatedContent.transportationTips))
        : []
      itinerary.restaurantRecommendations = Array.isArray(generatedContent.restaurantRecommendations)
        ? JSON.parse(JSON.stringify(generatedContent.restaurantRecommendations))
        : []
      itinerary.generalTips = toStringArray(parsedGeneralTips)
      itinerary.packingList = toStringArray(parsedPackingList)
      itinerary.dailyCostBreakdown = Array.isArray(parsedDailyCostBreakdown) ? parsedDailyCostBreakdown : []
      itinerary.budgetBreakdown = (parsedBudgetBreakdown && typeof parsedBudgetBreakdown === 'object') ? parsedBudgetBreakdown : {}
      itinerary.totalEstimatedCost = generatedContent.totalEstimatedCost

      // Save currency information if provided by AI
      if (generatedContent.currency) {
        itinerary.currency = generatedContent.currency
      }
      if (generatedContent.currencySymbol) {
        itinerary.currencySymbol = generatedContent.currencySymbol
      }

      // Save weather forecast if provided by AI
      if (generatedContent.weatherForecast) {
        console.log('🌤️ [CONTROLLER] Saving weather forecast to itinerary:', generatedContent.weatherForecast.length, 'location(s)')
        try {
          const sample = generatedContent.weatherForecast[0]
          const sampleInfo = sample ? { location: sample.location, hasSummary: !!sample.forecastSummary, dateRange: sample.dateRange || null, forecastDays: Array.isArray(sample.forecast) ? sample.forecast.length : 0 } : null
          console.log('🌤️ [CONTROLLER] Weather sample:', sampleInfo)
        } catch (e) { /* ignore */ }
        itinerary.weatherForecast = generatedContent.weatherForecast
      } else {
        console.log('⚠️ [CONTROLLER] No weather forecast in generated content')
      }

      itinerary.status = 'completed'

      // Pre-sanitize: convert any stringified JSON in known arrays to proper objects to prevent save failures
      try {
        // Accommodations
        itinerary.accommodationSuggestions = (itinerary.accommodationSuggestions || []).map((acc: any, idx: number) => {
          if (typeof acc === 'string') {
            const parsed = deepParseIfString(acc)
            if (Array.isArray(parsed) && parsed.length > 0) acc = parsed[0]
            else if (parsed && typeof parsed === 'object') acc = parsed
            else acc = { name: String(acc) }
          }

          const amenities = Array.isArray(acc?.amenities)
            ? acc.amenities.map((a: any) => String(a).trim())
            : (acc?.amenities ? String(acc.amenities).split(/[,;|\n]+/).map((s: string) => s.trim()).filter(Boolean) : [])

          return {
            name: acc?.name || `Accommodation ${idx + 1}`,
            type: acc?.type || 'Hotel',
            priceRange: acc?.priceRange || acc?.price || '',
            location: acc?.location || acc?.address || '',
            amenities
          }
        })

        // Transportation: deep-parse strings to objects/arrays
        itinerary.transportationTips = ((itinerary.transportationTips || []) as any[])
          .flatMap((t: any) => {
            if (typeof t === 'string') {
              const parsed = deepParseIfString(t)
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map((p: any) => ({
                  type: p?.type || p?.mode || 'general',
                  description: p?.description || p?.details || String(p),
                  estimatedCost: Number(p?.estimatedCost) || 0,
                  insiderTip: p?.insiderTip || p?.insider || p?.tip || '',
                  bookingInfo: p?.bookingInfo || p?.booking || ''
                }))
              }
              if (parsed && typeof parsed === 'object') {
                return [{
                  type: parsed?.type || parsed?.mode || 'general',
                  description: parsed?.description || String(parsed),
                  estimatedCost: Number(parsed?.estimatedCost) || 0,
                  insiderTip: parsed?.insiderTip || parsed?.insider || parsed?.tip || '',
                  bookingInfo: parsed?.bookingInfo || parsed?.booking || ''
                }]
              }
              return [{ type: 'general', description: String(t), estimatedCost: 0, insiderTip: '', bookingInfo: '' }]
            }
            if (t && typeof t === 'object') {
              return [{ type: t?.type || t?.mode || 'general', description: t?.description || String(t), estimatedCost: Number(t?.estimatedCost) || 0, insiderTip: t?.insiderTip || t?.insider || t?.tip || '', bookingInfo: t?.bookingInfo || t?.booking || '' }]
            }
            return []
          })

        // Restaurants: deep-parse stringified values
        itinerary.restaurantRecommendations = ((itinerary.restaurantRecommendations || []) as any[])
          .flatMap((r: any) => {
            if (typeof r === 'string') {
              const parsed = deepParseIfString(r)
              if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') return parsed
              if (parsed && typeof parsed === 'object') return [parsed]
              return [{ name: String(r), cuisine: 'Various', priceRange: '' }]
            }
            if (r && typeof r === 'object') return [r]
            return []
          })

        console.log('⚙️ [SANITIZE] Pre-save sanitization complete: accommodations:', itinerary.accommodationSuggestions.length, 'transportationTips:', itinerary.transportationTips.length, 'restaurants:', itinerary.restaurantRecommendations.length)
      } catch (preSanErr) {
        console.warn('⚠️ [SANITIZE] Pre-save sanitization failed:', preSanErr)
      }

      try {
        await itinerary.save()
      } catch (saveErr: any) {
        console.error('Error saving itinerary after AI generation:', saveErr)
        // Log a truncated sample of the generated content to help debugging
        try { console.error('Generated content (truncated):', JSON.stringify(generatedContent).substring(0, 2000)) } catch (e) { /* ignore */ }

        // Attempt best-effort sanitization for known problematic fields
        if (saveErr.name === 'ValidationError' || /Cast to/.test(saveErr.message)) {
          try {
            // Normalize accommodation suggestions into simple objects
            itinerary.accommodationSuggestions = (itinerary.accommodationSuggestions || []).map((acc: any, idx: number) => {
              if (typeof acc === 'string') {
                const parsed = deepParseIfString(acc)
                if (Array.isArray(parsed) && parsed.length > 0) acc = parsed[0]
                else acc = { name: String(acc) }
              }

              const amenities = Array.isArray(acc?.amenities)
                ? acc.amenities.map((a: any) => String(a).trim())
                : (acc?.amenities ? String(acc.amenities).split(/[,;|\n]+/).map((s: string) => s.trim()).filter(Boolean) : [])

              return {
                name: acc?.name || `Accommodation ${idx + 1}`,
                type: acc?.type || 'Hotel',
                priceRange: acc?.priceRange || acc?.price || '',
                location: acc?.location || acc?.address || '',
                amenities
              }
            })

            // Normalize transportation tips (deep-parse strings when possible)
            itinerary.transportationTips = ((itinerary.transportationTips || []) as any[])
              .flatMap((t: any) => {
                if (typeof t === 'string') {
                  const parsed = deepParseIfString(t)
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.map((p: any) => ({
                      type: p?.type || p?.mode || 'general',
                      description: p?.description || p?.details || String(p),
                      estimatedCost: Number(p?.estimatedCost) || 0,
                      insiderTip: p?.insiderTip || p?.insider || p?.tip || '',
                      bookingInfo: p?.bookingInfo || p?.booking || ''
                    }))
                  }
                  if (parsed && typeof parsed === 'object') {
                    return [{
                      type: parsed?.type || parsed?.mode || 'general',
                      description: parsed?.description || String(parsed),
                      estimatedCost: Number(parsed?.estimatedCost) || 0,
                      insiderTip: parsed?.insiderTip || parsed?.insider || parsed?.tip || '',
                      bookingInfo: parsed?.bookingInfo || parsed?.booking || ''
                    }]
                  }
                  return [{ type: 'general', description: String(t), estimatedCost: 0, insiderTip: '', bookingInfo: '' }]
                }
                if (t && typeof t === 'object') {
                  return [{ type: t?.type || t?.mode || 'general', description: t?.description || String(t), estimatedCost: Number(t?.estimatedCost) || 0, insiderTip: t?.insiderTip || t?.insider || t?.tip || '', bookingInfo: t?.bookingInfo || t?.booking || '' }]
                }
                return []
              })

            // Normalize restaurants (deep-parse stringified objects/arrays)
            itinerary.restaurantRecommendations = ((itinerary.restaurantRecommendations || []) as any[])
              .flatMap((r: any) => {
                if (typeof r === 'string') {
                  const parsed = deepParseIfString(r)
                  if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') return parsed
                  if (parsed && typeof parsed === 'object') return [parsed]
                  return [{ name: String(r), cuisine: 'Various', priceRange: '' }]
                }
                if (r && typeof r === 'object') return [r]
                return []
              })

            console.log('⚙️ [SANITIZE] After sanitization - accommodations:', itinerary.accommodationSuggestions.length, 'transportationTips:', itinerary.transportationTips.length, 'restaurants:', itinerary.restaurantRecommendations.length)

            await itinerary.save()
          } catch (err2: any) {
            console.error('Failed to save itinerary after sanitization:', err2)
            itinerary.status = 'failed'
            await itinerary.save().catch(() => {})
            return res.status(500).json({ success: false, message: 'Failed to save itinerary after sanitization', error: err2.message })
          }
        } else {
          itinerary.status = 'failed'
          await itinerary.save().catch(() => {})
          return res.status(500).json({ success: false, message: 'Failed to save itinerary', error: saveErr.message })
        }
      }

      // Increment subscription usage
      await subscription.incrementUsage()

      res.status(201).json({
        success: true,
        message: 'Itinerary generated successfully',
        data: itinerary,
        subscription: {
          itinerariesUsed: subscription.itinerariesUsed + 1,
          itinerariesRemaining: subscription.getRemainingItineraries() - 1
        }
      })

    } catch (aiError: any) {
      // Update status to failed
      itinerary.status = 'failed'
      await itinerary.save()

      throw aiError
    }

  } catch (error: any) {
    console.error('Generate itinerary error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate itinerary',
      error: error.message
    })
  }
}

/**
 * Get user's itineraries
 * GET /api/itineraries
 */
export const getUserItineraries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id
    const { status, page = 1, limit = 10 } = req.query

    const query: any = { userId }
    if (status) {
      query.status = status
    }

    const itineraries = await Itinerary.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Itinerary.countDocuments(query)

    res.json({
      success: true,
      data: itineraries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })

  } catch (error: any) {
    console.error('Get itineraries error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch itineraries',
      error: error.message
    })
  }
}

/**
 * Get single itinerary by ID
 * GET /api/itineraries/:id
 */
export const getItineraryById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const itinerary = await Itinerary.findOne({ _id: id, userId })

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      })
    }

    // Increment view count
    itinerary.viewCount++
    await itinerary.save()

    res.json({
      success: true,
      data: itinerary
    })

  } catch (error: any) {
    console.error('Get itinerary error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch itinerary',
      error: error.message
    })
  }
}

/**
 * Update itinerary
 * PUT /api/itineraries/:id
 */
export const updateItinerary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const updates = req.body

    const itinerary = await Itinerary.findOne({ _id: id, userId })

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      })
    }

    // Allow updating certain fields only
    const allowedUpdates = [
      'title', 'dayPlans', 'accommodationSuggestions',
      'transportationTips', 'restaurantRecommendations',
      'generalTips', 'isPublic'
    ]

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        (itinerary as any)[key] = updates[key]
      }
    })

    itinerary.isEdited = true
    itinerary.lastEditedAt = new Date()
    itinerary.status = 'edited'

    await itinerary.save()

    res.json({
      success: true,
      message: 'Itinerary updated successfully',
      data: itinerary
    })

  } catch (error: any) {
    console.error('Update itinerary error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update itinerary',
      error: error.message
    })
  }
}

/**
 * Delete itinerary
 * DELETE /api/itineraries/:id
 */
export const deleteItinerary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const itinerary = await Itinerary.findOneAndDelete({ _id: id, userId })

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      })
    }

    res.json({
      success: true,
      message: 'Itinerary deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete itinerary error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete itinerary',
      error: error.message
    })
  }
}

/**
 * Regenerate itinerary with AI
 * POST /api/itineraries/:id/regenerate
 */
export const regenerateItinerary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const itinerary = await Itinerary.findOne({ _id: id, userId })

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      })
    }

    // Check subscription limits for regeneration
    const subscription = await Subscription.findOne({ userId })
    if (!subscription || !subscription.canCreateItinerary()) {
      return res.status(403).json({
        success: false,
        message: 'Subscription limit reached. Cannot regenerate itinerary.',
        data: {
          subscriptionType: subscription?.subscriptionType || 'free',
          itinerariesUsed: subscription?.itinerariesUsed || 0,
          itinerariesLimit: subscription?.itinerariesLimit || 5
        }
      })
    }

    // Set status to generating
    itinerary.status = 'generating'
    await itinerary.save()
    
    const itineraryId = itinerary._id as any

    // Log preferences being used for regeneration
    console.log('[ITINERARY] Regenerate - Preference flags from stored itinerary:', {
      includeAccommodationReference: itinerary.includeAccommodationReference,
      includeRestaurantReference: itinerary.includeRestaurantReference,
      includeWeatherReference: itinerary.includeWeatherReference
    })

    try {
      const generatedContent = await aiItineraryService.generateItinerary({
        source: itinerary.source,
        destinations: itinerary.destinations, // Pass the full destinations array
        travelMode: itinerary.travelMode,
        duration: itinerary.duration,
        budget: itinerary.budget,
        interests: itinerary.interests,
        travelStyle: itinerary.travelStyle,
        adults: itinerary.adults,
        children: itinerary.children,
        totalPeople: itinerary.totalPeople,
        includeAccommodationReference: itinerary.includeAccommodationReference,
        includeRestaurantReference: itinerary.includeRestaurantReference,
        includeWeatherReference: itinerary.includeWeatherReference
      }, userId, itineraryId)

      // Update itinerary with generated content
      // The AI service already returns properly formatted data after sanitization
      // We only need deep parsing for dayPlans, generalTips, and packingList
      const parsedDayPlans = deepParseIfString(generatedContent.dayPlans)
      const parsedGeneralTips = deepParseIfString(generatedContent.generalTips)
      const parsedPackingList = deepParseIfString(generatedContent.packingList)
      const parsedBudgetBreakdown = deepParseIfString(generatedContent.budgetBreakdown)
      const parsedDailyCostBreakdown = deepParseIfString(generatedContent.dailyCostBreakdown)
      // Use the already sanitized data from AI service directly
      itinerary.dayPlans = Array.isArray(parsedDayPlans) ? parsedDayPlans : []
      
      // Ensure plain objects by double-serializing to remove any VM-evaluated remnants
      itinerary.accommodationSuggestions = Array.isArray(generatedContent.accommodationSuggestions) 
        ? JSON.parse(JSON.stringify(generatedContent.accommodationSuggestions))
        : []
      itinerary.transportationTips = Array.isArray(generatedContent.transportationTips)
        ? JSON.parse(JSON.stringify(generatedContent.transportationTips))
        : []
      itinerary.restaurantRecommendations = Array.isArray(generatedContent.restaurantRecommendations)
        ? JSON.parse(JSON.stringify(generatedContent.restaurantRecommendations))
        : []
      itinerary.generalTips = toStringArray(parsedGeneralTips)
      itinerary.packingList = toStringArray(parsedPackingList)
      itinerary.dailyCostBreakdown = Array.isArray(parsedDailyCostBreakdown) ? parsedDailyCostBreakdown : []
      itinerary.budgetBreakdown = (parsedBudgetBreakdown && typeof parsedBudgetBreakdown === 'object') ? parsedBudgetBreakdown : {}
      itinerary.totalEstimatedCost = generatedContent.totalEstimatedCost

      // Save currency information if provided by AI
      if (generatedContent.currency) {
        itinerary.currency = generatedContent.currency
      }
      if (generatedContent.currencySymbol) {
        itinerary.currencySymbol = generatedContent.currencySymbol
      }

      // Save weather forecast if provided by AI
      if (generatedContent.weatherForecast) {
        console.log('🌤️ [CONTROLLER] Saving weather forecast to itinerary (regenerate):', generatedContent.weatherForecast.length, 'location(s)')
        try {
          const sample = generatedContent.weatherForecast[0]
          const sampleInfo = sample ? { location: sample.location, hasSummary: !!sample.forecastSummary, dateRange: sample.dateRange || null, forecastDays: Array.isArray(sample.forecast) ? sample.forecast.length : 0 } : null
          console.log('🌤️ [CONTROLLER] Weather sample:', sampleInfo)
        } catch (e) { /* ignore */ }
        itinerary.weatherForecast = generatedContent.weatherForecast
      } else {
        console.log('⚠️ [CONTROLLER] No weather forecast in generated content (regenerate)')
      }

      itinerary.status = 'completed'

      // Pre-sanitize: convert any stringified JSON in known arrays to proper objects to prevent save failures
      try {
        // Accommodations
        itinerary.accommodationSuggestions = (itinerary.accommodationSuggestions || []).map((acc: any, idx: number) => {
          if (typeof acc === 'string') {
            const parsed = deepParseIfString(acc)
            if (Array.isArray(parsed) && parsed.length > 0) acc = parsed[0]
            else if (parsed && typeof parsed === 'object') acc = parsed
            else acc = { name: String(acc) }
          }

          const amenities = Array.isArray(acc?.amenities)
            ? acc.amenities.map((a: any) => String(a).trim())
            : (acc?.amenities ? String(acc.amenities).split(/[,;|\n]+/).map((s: string) => s.trim()).filter(Boolean) : [])

          return {
            name: acc?.name || `Accommodation ${idx + 1}`,
            type: acc?.type || 'Hotel',
            priceRange: acc?.priceRange || acc?.price || '',
            location: acc?.location || acc?.address || '',
            amenities
          }
        })

        // Transportation: deep-parse strings to objects/arrays
        itinerary.transportationTips = ((itinerary.transportationTips || []) as any[])
          .flatMap((t: any) => {
            if (typeof t === 'string') {
              const parsed = deepParseIfString(t)
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map((p: any) => ({
                  type: p?.type || p?.mode || 'general',
                  description: p?.description || p?.details || String(p),
                  estimatedCost: Number(p?.estimatedCost) || 0,
                  insiderTip: p?.insiderTip || p?.insider || p?.tip || '',
                  bookingInfo: p?.bookingInfo || p?.booking || ''
                }))
              }
              if (parsed && typeof parsed === 'object') {
                return [{
                  type: parsed?.type || parsed?.mode || 'general',
                  description: parsed?.description || String(parsed),
                  estimatedCost: Number(parsed?.estimatedCost) || 0,
                  insiderTip: parsed?.insiderTip || parsed?.insider || parsed?.tip || '',
                  bookingInfo: parsed?.bookingInfo || parsed?.booking || ''
                }]
              }
              return [{ type: 'general', description: String(t), estimatedCost: 0, insiderTip: '', bookingInfo: '' }]
            }
            if (t && typeof t === 'object') {
              return [{ type: t?.type || t?.mode || 'general', description: t?.description || String(t), estimatedCost: Number(t?.estimatedCost) || 0, insiderTip: t?.insiderTip || t?.insider || t?.tip || '', bookingInfo: t?.bookingInfo || t?.booking || '' }]
            }
            return []
          })

        // Restaurants: deep-parse stringified values
        itinerary.restaurantRecommendations = ((itinerary.restaurantRecommendations || []) as any[])
          .flatMap((r: any) => {
            if (typeof r === 'string') {
              const parsed = deepParseIfString(r)
              if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') return parsed
              if (parsed && typeof parsed === 'object') return [parsed]
              return [{ name: String(r), cuisine: 'Various', priceRange: '' }]
            }
            if (r && typeof r === 'object') return [r]
            return []
          })

        console.log('⚙️ [SANITIZE] Pre-save sanitization complete: accommodations:', itinerary.accommodationSuggestions.length, 'transportationTips:', itinerary.transportationTips.length, 'restaurants:', itinerary.restaurantRecommendations.length)
      } catch (preSanErr) {
        console.warn('⚠️ [SANITIZE] Pre-save sanitization failed:', preSanErr)
      }

      try {
        await itinerary.save()
      } catch (saveErr: any) {
        console.error('Error saving itinerary after AI regeneration:', saveErr)
        // Log a truncated sample of the generated content to help debugging
        try { console.error('Generated content (truncated):', JSON.stringify(generatedContent).substring(0, 2000)) } catch (e) { /* ignore */ }

        // Attempt best-effort sanitization for known problematic fields
        if (saveErr.name === 'ValidationError' || /Cast to/.test(saveErr.message)) {
          try {
            itinerary.accommodationSuggestions = (itinerary.accommodationSuggestions || []).map((acc: any, idx: number) => {
              if (typeof acc === 'string') {
                const parsed = deepParseIfString(acc)
                if (Array.isArray(parsed) && parsed.length > 0) acc = parsed[0]
                else acc = { name: String(acc) }
              }

              const amenities = Array.isArray(acc?.amenities)
                ? acc.amenities.map((a: any) => String(a).trim())
                : (acc?.amenities ? String(acc.amenities).split(/[,;|\n]+/).map((s: string) => s.trim()).filter(Boolean) : [])

              return {
                name: acc?.name || `Accommodation ${idx + 1}`,
                type: acc?.type || 'Hotel',
                priceRange: acc?.priceRange || acc?.price || '',
                location: acc?.location || acc?.address || '',
                amenities
              }
            })

            // Normalize transportation tips (deep-parse strings when possible)
            itinerary.transportationTips = ((itinerary.transportationTips || []) as any[])
              .flatMap((t: any) => {
                if (typeof t === 'string') {
                  const parsed = deepParseIfString(t)
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.map((p: any) => ({
                      type: p?.type || p?.mode || 'general',
                      description: p?.description || p?.details || String(p),
                      estimatedCost: Number(p?.estimatedCost) || 0,
                      insiderTip: p?.insiderTip || p?.insider || p?.tip || '',
                      bookingInfo: p?.bookingInfo || p?.booking || ''
                    }))
                  }
                  if (parsed && typeof parsed === 'object') {
                    return [{
                      type: parsed?.type || parsed?.mode || 'general',
                      description: parsed?.description || String(parsed),
                      estimatedCost: Number(parsed?.estimatedCost) || 0,
                      insiderTip: parsed?.insiderTip || parsed?.insider || parsed?.tip || '',
                      bookingInfo: parsed?.bookingInfo || parsed?.booking || ''
                    }]
                  }
                  return [{ type: 'general', description: String(t), estimatedCost: 0, insiderTip: '', bookingInfo: '' }]
                }
                if (t && typeof t === 'object') {
                  return [{ type: t?.type || t?.mode || 'general', description: t?.description || String(t), estimatedCost: Number(t?.estimatedCost) || 0, insiderTip: t?.insiderTip || t?.insider || t?.tip || '', bookingInfo: t?.bookingInfo || t?.booking || '' }]
                }
                return []
              })

            // Normalize restaurants (deep-parse stringified objects/arrays)
            itinerary.restaurantRecommendations = ((itinerary.restaurantRecommendations || []) as any[])
              .flatMap((r: any) => {
                if (typeof r === 'string') {
                  const parsed = deepParseIfString(r)
                  if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') return parsed
                  if (parsed && typeof parsed === 'object') return [parsed]
                  return [{ name: String(r), cuisine: 'Various', priceRange: '' }]
                }
                if (r && typeof r === 'object') return [r]
                return []
              })

            console.log('⚙️ [SANITIZE] After sanitization - accommodations:', itinerary.accommodationSuggestions.length, 'transportationTips:', itinerary.transportationTips.length, 'restaurants:', itinerary.restaurantRecommendations.length)

            await itinerary.save()
          } catch (err2: any) {
            console.error('Failed to save itinerary after sanitization:', err2)
            itinerary.status = 'failed'
            await itinerary.save().catch(() => {})
            return res.status(500).json({ success: false, message: 'Failed to save itinerary after sanitization', error: err2.message })
          }
        } else {
          itinerary.status = 'failed'
          await itinerary.save().catch(() => {})
          return res.status(500).json({ success: false, message: 'Failed to save itinerary', error: saveErr.message })
        }
      }

      // Increment subscription usage
      await subscription.incrementUsage()

      res.status(201).json({
        success: true,
        message: 'Itinerary regenerated successfully',
        data: itinerary,
        subscription: {
          itinerariesUsed: subscription.itinerariesUsed + 1,
          itinerariesRemaining: subscription.getRemainingItineraries() - 1
        }
      })

    } catch (aiError: any) {
      // Update status to failed
      itinerary.status = 'failed'
      await itinerary.save()

      throw aiError
    }

  } catch (error: any) {
    console.error('Regenerate itinerary error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate itinerary',
      error: error.message
    })
  }
}

/**
 * Regenerate specific day
 * POST /api/itineraries/:id/regenerate-day
 */
export const regenerateDay = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const { dayNumber } = req.body
    const userId = req.user._id

    const itinerary = await Itinerary.findOne({ _id: id, userId })

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      })
    }

    if (typeof dayNumber !== 'number' || dayNumber < 1 || dayNumber > itinerary.duration) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day number'
      })
    }

    const newDay = await aiItineraryService.regenerateDay(
      itinerary.source,
      itinerary.destinations,
      itinerary.travelMode,
      dayNumber,
      {
        source: itinerary.source,
        destinations: itinerary.destinations,
        travelMode: itinerary.travelMode,
        duration: itinerary.duration,
        budget: itinerary.budget,
        interests: itinerary.interests,
        travelStyle: itinerary.travelStyle,
        adults: itinerary.adults,
        children: itinerary.children,
        totalPeople: itinerary.totalPeople
      }
    )

    // Update the specific day
    const dayIndex = itinerary.dayPlans.findIndex((d: any) => d.day === dayNumber)
    if (dayIndex !== -1) {
      itinerary.dayPlans[dayIndex] = newDay
    } else {
      itinerary.dayPlans.push(newDay)
    }

    itinerary.isEdited = true
    itinerary.lastEditedAt = new Date()

    await itinerary.save()

    res.json({
      success: true,
      message: 'Day regenerated successfully',
      data: itinerary
    })

  } catch (error: any) {
    console.error('Regenerate day error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate day',
      error: error.message
    })
  }
}

/**
 * Download itinerary as PDF
 * GET /api/itineraries/:id/download
 */
export const downloadItineraryPDF = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const itinerary = await Itinerary.findOne({ _id: id, userId })
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' })
    }

    const pdfBuffer = await pdfService.generateItineraryPDF(itinerary)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${(itinerary.title || 'itinerary').replace(/"/g, '')}.pdf"`)
    res.send(pdfBuffer)
  } catch (error: any) {
    console.error('Download itinerary PDF error:', error)
    res.status(500).json({ success: false, message: 'Failed to generate PDF', error: error.message })
  }
}

/**
 * Email itinerary PDF to a provided email
 * POST /api/itineraries/:id/email
 */
export const emailItinerary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const { to } = req.body
    const userId = req.user._id

    if (!to) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' })
    }

    const itinerary = await Itinerary.findOne({ _id: id, userId })
    if (!itinerary) {
      return res.status(404).json({ success: false, message: 'Itinerary not found' })
    }

    // Send itinerary as HTML email template instead of PDF
    const sent = await emailService.sendItineraryEmail(to, itinerary)

    if (!sent) {
      return res.status(500).json({ success: false, message: 'Failed to send email' })
    }

    res.json({ success: true, message: 'Itinerary emailed successfully' })
  } catch (error: any) {
    console.error('Email itinerary error:', error)
    res.status(500).json({ success: false, message: 'Failed to email itinerary', error: error.message })
  }
}

/**
 * Get public itinerary by share token
 * GET /api/itineraries/share/:token
 */
export const getSharedItinerary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { token } = req.params
    const itinerary = await Itinerary.findOne({ shareToken: token, isPublic: true })

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Shared itinerary not found'
      })
    }

    // Increment share count
    itinerary.shareCount = (itinerary.shareCount || 0) + 1
    await itinerary.save()

    res.json({
      success: true,
      data: itinerary
    })
  } catch (error: any) {
    console.error('Get shared itinerary error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared itinerary',
      error: error.message
    })
  }
}
