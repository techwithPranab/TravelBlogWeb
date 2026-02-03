import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Types
export interface Advertisement {
  _id: string
  name: string
  title?: string
  description?: string
  type: 'hotel' | 'airline' | 'tour_operator' | 'travel_accessories' | 'travel_insurance' | 'booking_platform' | 'restaurant' | 'car_rental' | 'cruise' | 'rail' | 'bus' | 'adventure_sports' | 'photography_equipment' | 'travel_guide_books' | 'luggage' | 'currency_exchange' | 'financial_services' | 'travel_technology' | 'affiliate' | 'sponsored_content' | 'announcement' | 'other'
  format: 'banner' | 'rectangle' | 'leaderboard' | 'skyscraper' | 'native' | 'in_content' | 'sidebar' | 'sticky' | 'video' | 'carousel' | 'mobile_banner' | 'interstitial' | 'popup'
  creative: {
    imageUrl?: string
    imageAlt?: string
    mobileImageUrl?: string
    videoUrl?: string
    htmlContent?: string
    callToAction?: string
    buttonText?: string
    backgroundColor?: string
    textColor?: string
  }
  destinationUrl: string
  utmParameters?: Record<string, any>
  isSponsored: boolean
  seo?: {
    noFollow: boolean
    sponsored: boolean
    ugc: boolean
  }
}

export interface AdAnalytics {
  advertisement: string
  eventType: 'impression' | 'click' | 'conversion' | 'view'
  userContext: {
    sessionId: string
    ipAddressHash?: string
    userAgent?: string
    deviceType?: string
    country?: string
    city?: string
    referrer?: string
  }
  placement: string
  blogPost?: string
  timestamp: Date
}

export interface AdPlacementConfig {
  blogPost?: string
  category?: string
  placements: Array<{
    position: string
    maxAds: number
    rotationType: 'sequential' | 'random' | 'weighted' | 'a_b_test'
    allowedTypes?: string[]
    allowedFormats?: string[]
    refreshInterval?: number
  }>
  isActive: boolean
}

// API Functions

// Public APIs
export const getActiveAds = async (params?: {
  type?: string
  format?: string
  placement?: string
}) => {
  const response = await axios.get(`${API_BASE_URL}/ads/active`, { params })
  return response.data
}

export const getAdsForPlacement = async (
  position: string,
  userContext?: {
    sessionId: string
    deviceType?: string
    country?: string
    userRole?: string
  }
) => {
  try {
    console.log('🎯 Fetching ad for placement:', position)
    console.log('🎯 API URL:', `${API_BASE_URL}/ads/placement/${position}`)
    const response = await axios.get(`${API_BASE_URL}/ads/placement/${position}`, {
      params: userContext,
    })
    console.log('✅ Ad API response:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error fetching ad:', error)
    throw error
  }
}

export const getAdsForBlogPost = async (
  blogId: string,
  userContext?: {
    sessionId: string
    deviceType?: string
    country?: string
    userRole?: string
  }
) => {
  const response = await axios.get(`${API_BASE_URL}/ads/blog/${blogId}`, {
    params: userContext,
  })
  return response.data
}

// Tracking APIs
export const trackImpression = async (data: {
  advertisementId: string
  placement: string
  blogPostId?: string
  sessionId: string
  deviceType?: string
  country?: string
  referrer?: string
}) => {
  const response = await axios.post(`${API_BASE_URL}/ad-analytics/impression`, data)
  return response.data
}

export const trackClick = async (data: {
  advertisementId: string
  placement: string
  blogPostId?: string
  sessionId: string
  deviceType?: string
  country?: string
  referrer?: string
}) => {
  const response = await axios.post(`${API_BASE_URL}/ad-analytics/click`, data)
  return response.data
}

export const trackConversion = async (data: {
  advertisementId: string
  placement: string
  blogPostId?: string
  sessionId: string
  conversionValue?: number
  conversionType?: string
}) => {
  const response = await axios.post(`${API_BASE_URL}/ad-analytics/conversion`, data)
  return response.data
}

// Admin APIs (require authentication)
export const createAdvertisement = async (data: Partial<Advertisement>, token: string) => {
  const response = await axios.post(`${API_BASE_URL}/ads`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const getAdvertisements = async (
  params: {
    page?: number
    limit?: number
    status?: string
    type?: string
    format?: string
    search?: string
  },
  token: string
) => {
  const response = await axios.get(`${API_BASE_URL}/ads`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const getAdvertisementById = async (id: string, token: string) => {
  const response = await axios.get(`${API_BASE_URL}/ads/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const updateAdvertisement = async (
  id: string,
  data: Partial<Advertisement>,
  token: string
) => {
  const response = await axios.put(`${API_BASE_URL}/ads/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const deleteAdvertisement = async (id: string, token: string) => {
  const response = await axios.delete(`${API_BASE_URL}/ads/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const bulkUpdateStatus = async (
  data: { ids: string[]; status: string },
  token: string
) => {
  const response = await axios.patch(`${API_BASE_URL}/ads/bulk-status`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const duplicateAdvertisement = async (id: string, token: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/ads/${id}/duplicate`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  return response.data
}

export const getAdStatistics = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/ads/stats/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

// Analytics APIs (Admin)
export const getAdAnalytics = async (advertisementId: string, token: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/ad-analytics/advertisement/${advertisementId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  return response.data
}

export const getAnalyticsSummary = async (
  params: {
    startDate?: string
    endDate?: string
    advertisementId?: string
  },
  token: string
) => {
  const response = await axios.get(`${API_BASE_URL}/ad-analytics/summary`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const getPerformanceReport = async (
  params: {
    startDate?: string
    endDate?: string
    groupBy?: 'ad' | 'placement' | 'day'
  },
  token: string
) => {
  const response = await axios.get(`${API_BASE_URL}/ad-analytics/performance`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const exportAnalytics = async (
  params: {
    startDate?: string
    endDate?: string
    format?: 'csv' | 'json'
  },
  token: string
) => {
  const response = await axios.get(`${API_BASE_URL}/ad-analytics/export`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
    responseType: params.format === 'csv' ? 'blob' : 'json',
  })
  return response.data
}

export const getTopPerformers = async (
  params: {
    startDate?: string
    endDate?: string
    limit?: number
    metric?: 'ctr' | 'impressions' | 'clicks'
  },
  token: string
) => {
  const response = await axios.get(`${API_BASE_URL}/ad-analytics/top-performers`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const getRevenueAnalytics = async (
  params: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  },
  token: string
) => {
  const response = await axios.get(`${API_BASE_URL}/ad-analytics/revenue`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

// Helper function to generate session ID
export const generateSessionId = (): string => {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('ad_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      sessionStorage.setItem('ad_session_id', sessionId)
    }
    return sessionId
  }
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Helper function to get device type
export const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// Helper function to get user context
export const getUserContext = () => {
  return {
    sessionId: generateSessionId(),
    deviceType: getDeviceType(),
    referrer: typeof window !== 'undefined' ? document.referrer : undefined,
  }
}
