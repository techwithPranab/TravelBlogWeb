import Advertisement, { AdPlacement, IAdvertisement } from '../models/Advertisement'
import AdAnalytics from '../models/AdAnalytics'
import mongoose from 'mongoose'

/**
 * Service for ad selection and management logic
 */
class AdService {
  /**
   * Select the best ad for a given placement and context
   */
  async selectAdForPlacement(
    placement: AdPlacement,
    context: {
      blogPostId?: string
      categoryIds?: string[]
      tags?: string[]
      userId?: string
      sessionId: string
      deviceType: 'desktop' | 'mobile' | 'tablet'
      geoLocation?: { country?: string; countryCode?: string }
      userRole?: 'guest' | 'reader' | 'premium'
    }
  ): Promise<IAdvertisement | null> {
    try {
      // Get all active ads for this placement
      const activeAds = await Advertisement.findActiveAds(placement, context)
      
      if (!activeAds || activeAds.length === 0) {
        return null
      }
      
      // Filter by targeting rules
      const targetedAds = await this.filterByTargeting(activeAds, context)
      
      if (targetedAds.length === 0) {
        return null
      }
      
      // Apply frequency capping
      const eligibleAds = await this.applyFrequencyCapping(
        targetedAds,
        context.sessionId,
        context.userId
      )
      
      if (eligibleAds.length === 0) {
        return null
      }
      
      // Check budget availability
      const adsWithBudget = eligibleAds.filter((ad) =>
        this.checkBudgetAvailability(ad)
      )
      
      if (adsWithBudget.length === 0) {
        return null
      }
      
      // Select using weighted random selection
      const selectedAd = this.weightedRandomSelection(adsWithBudget, placement)
      
      return selectedAd
    } catch (error) {
      console.error('Error selecting ad for placement:', error)
      return null
    }
  }
  
  /**
   * Filter ads by targeting rules
   */
  private async filterByTargeting(
    ads: IAdvertisement[],
    context: any
  ): Promise<IAdvertisement[]> {
    return ads.filter((ad) => {
      // Category targeting
      if (ad.targeting.categories && ad.targeting.categories.length > 0) {
        if (!context.categoryIds || context.categoryIds.length === 0) {
          return false
        }
        const hasMatchingCategory = ad.targeting.categories.some((catId: any) =>
          context.categoryIds.includes(catId.toString())
        )
        if (!hasMatchingCategory) return false
      }
      
      // Tag targeting
      if (ad.targeting.tags && ad.targeting.tags.length > 0) {
        if (!context.tags || context.tags.length === 0) {
          return false
        }
        const hasMatchingTag = ad.targeting.tags.some((tag: string) =>
          context.tags.includes(tag)
        )
        if (!hasMatchingTag) return false
      }
      
      // Exclude categories
      if (ad.targeting.excludeCategories && ad.targeting.excludeCategories.length > 0) {
        if (context.categoryIds && context.categoryIds.length > 0) {
          const hasExcludedCategory = ad.targeting.excludeCategories.some((catId: any) =>
            context.categoryIds.includes(catId.toString())
          )
          if (hasExcludedCategory) return false
        }
      }
      
      // Exclude tags
      if (ad.targeting.excludeTags && ad.targeting.excludeTags.length > 0) {
        if (context.tags && context.tags.length > 0) {
          const hasExcludedTag = ad.targeting.excludeTags.some((tag: string) =>
            context.tags.includes(tag)
          )
          if (hasExcludedTag) return false
        }
      }
      
      // Device type targeting
      if (ad.targeting.deviceTypes && ad.targeting.deviceTypes.length > 0) {
        if (!ad.targeting.deviceTypes.includes(context.deviceType)) {
          return false
        }
      }
      
      // User role targeting
      if (ad.targeting.userRoles && ad.targeting.userRoles.length > 0) {
        if (!context.userRole || !ad.targeting.userRoles.includes(context.userRole)) {
          return false
        }
      }
      
      // Geo-location targeting
      if (ad.targeting.geoLocations && ad.targeting.geoLocations.length > 0) {
        if (!context.geoLocation?.countryCode) {
          return false
        }
        if (!ad.targeting.geoLocations.includes(context.geoLocation.countryCode)) {
          return false
        }
      }
      
      return ad.canShowToUser(context.userId, context)
    })
  }
  
  /**
   * Apply frequency capping
   */
  private async applyFrequencyCapping(
    ads: IAdvertisement[],
    sessionId: string,
    userId?: string
  ): Promise<IAdvertisement[]> {
    const eligible: IAdvertisement[] = []
    
    for (const ad of ads) {
      const placementConfig = ad.placements[0] // Get first placement config
      
      if (placementConfig?.maxImpressionsPerUser) {
        // Count impressions for this user/session
        const impressionCount = await AdAnalytics.countDocuments({
          advertisementId: ad._id,
          sessionId,
          eventType: 'impression'
        })
        
        if (impressionCount >= placementConfig.maxImpressionsPerUser) {
          continue // Skip this ad
        }
      }
      
      eligible.push(ad)
    }
    
    return eligible
  }
  
  /**
   * Check if ad has budget remaining
   */
  private checkBudgetAvailability(ad: IAdvertisement): boolean {
    if (!ad.budget || ad.budget.type === 'none') {
      return true
    }
    
    if (ad.budget.type === 'impressions' && ad.budget.maxImpressions) {
      if (ad.performance.impressions >= ad.budget.maxImpressions) {
        return false
      }
    }
    
    if (ad.budget.type === 'clicks' && ad.budget.maxClicks) {
      if (ad.performance.clicks >= ad.budget.maxClicks) {
        return false
      }
    }
    
    return true
  }
  
  /**
   * Weighted random selection based on priority and performance
   */
  private weightedRandomSelection(
    ads: IAdvertisement[],
    placement: AdPlacement
  ): IAdvertisement {
    // Calculate weights based on priority and CTR
    const weights = ads.map((ad) => {
      const placementConfig = ad.placements.find((p) => p.position === placement)
      const priority = placementConfig?.priority || 5
      
      // Weight = priority * (1 + CTR/100)
      // This gives higher priority ads more weight, and rewards good performance
      const ctr = ad.performance.ctr || 0
      return priority * (1 + ctr / 100)
    })
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight
    
    for (let i = 0; i < ads.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        return ads[i]
      }
    }
    
    return ads[ads.length - 1] // Fallback
  }
  
  /**
   * Increment impression count
   */
  async incrementImpressions(adId: string): Promise<void> {
    const ad = await Advertisement.findById(adId)
    if (ad) {
      await ad.incrementImpressions()
    }
  }
  
  /**
   * Increment click count
   */
  async incrementClicks(adId: string): Promise<void> {
    const ad = await Advertisement.findById(adId)
    if (ad) {
      await ad.incrementClicks()
    }
  }
  
  /**
   * Get top performing ads
   */
  async getTopPerformingAds(
    limit: number = 10,
    filters?: {
      type?: string
      placement?: AdPlacement
      dateRange?: { start: Date; end: Date }
    }
  ): Promise<any[]> {
    const matchStage: any = { status: 'active' }
    
    if (filters?.type) {
      matchStage.type = filters.type
    }
    
    if (filters?.placement) {
      matchStage['placements.position'] = filters.placement
    }
    
    const ads = await Advertisement.find(matchStage)
      .sort({ 'performance.ctr': -1 })
      .limit(limit)
      .select('name type format performance')
    
    return ads
  }
  
  /**
   * Auto-pause low performing ads
   */
  async autoPauseLowPerformers(threshold: number = 0.5): Promise<number> {
    const ads = await Advertisement.find({
      status: 'active',
      'performance.impressions': { $gte: 1000 }, // Min 1000 impressions
      'performance.ctr': { $lt: threshold }
    })
    
    let count = 0
    for (const ad of ads) {
      ad.status = 'paused'
      ad.notes = `Auto-paused due to low CTR (${ad.performance.ctr.toFixed(2)}%)`
      await ad.save()
      count++
    }
    
    return count
  }
}

export default new AdService()
