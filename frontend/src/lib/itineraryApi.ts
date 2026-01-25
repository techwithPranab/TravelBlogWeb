import axios from 'axios'
import {
  Itinerary,
  ItineraryFormData,
  ItineraryResponse,
  ItinerariesListResponse
} from '@/types/itinerary'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Generate new AI itinerary
 */
export const generateItinerary = async (
  data: ItineraryFormData
): Promise<ItineraryResponse> => {
  try {
    const response = await api.post<ItineraryResponse>('/itineraries', data)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    throw new Error('Failed to generate itinerary')
  }
}

/**
 * Get user's itineraries
 */
export const getUserItineraries = async (
  page = 1,
  limit = 10,
  status?: string
): Promise<ItinerariesListResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    if (status) {
      params.append('status', status)
    }

    const response = await api.get<ItinerariesListResponse>(
      `/itineraries?${params.toString()}`
    )
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch itineraries')
  }
}

/**
 * Get single itinerary by ID
 */
export const getItineraryById = async (id: string): Promise<ItineraryResponse> => {
  try {
    const response = await api.get<ItineraryResponse>(`/itineraries/${id}`)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch itinerary')
  }
}

/**
 * Update itinerary
 */
export const updateItinerary = async (
  id: string,
  updates: Partial<Itinerary>
): Promise<ItineraryResponse> => {
  try {
    const response = await api.put<ItineraryResponse>(`/itineraries/${id}`, updates)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update itinerary')
  }
}

/**
 * Update itinerary form data (excluding source and destinations)
 */
export const updateItineraryFormData = async (
  id: string,
  updates: Partial<ItineraryFormData>
): Promise<ItineraryResponse & { meta?: { editCount: number; maxEdits: number; editsRemaining: number } }> => {
  try {
    const response = await api.put<ItineraryResponse & { meta?: { editCount: number; maxEdits: number; editsRemaining: number } }>(
      `/itineraries/${id}/form-data`,
      updates
    )
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    throw new Error(error.response?.data?.message || 'Failed to update itinerary form data')
  }
}

/**
 * Delete itinerary
 */
export const deleteItinerary = async (id: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete<{ success: boolean }>(`/itineraries/${id}`)
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete itinerary')
  }
}

/**
 * Regenerate entire itinerary
 */
export const regenerateItinerary = async (id: string): Promise<ItineraryResponse> => {
  try {
    const response = await api.post<ItineraryResponse>(`/itineraries/${id}/regenerate`)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    throw new Error('Failed to regenerate itinerary')
  }
}

/**
 * Regenerate specific day
 */
export const regenerateDay = async (
  id: string,
  dayNumber: number
): Promise<ItineraryResponse> => {
  try {
    const response = await api.post<ItineraryResponse>(
      `/itineraries/${id}/regenerate-day`,
      { dayNumber }
    )
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to regenerate day')
  }
}

/**
 * Get shared itinerary (public)
 */
export const getSharedItinerary = async (token: string): Promise<ItineraryResponse> => {
  try {
    const response = await axios.get<ItineraryResponse>(
      `${API_URL}/itineraries/share/${token}`
    )
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch shared itinerary')
  }
}

export default {
  generateItinerary,
  getUserItineraries,
  getItineraryById,
  updateItinerary,
  deleteItinerary,
  regenerateItinerary,
  regenerateDay,
  getSharedItinerary
}

/**
 * Get subscription status
 */
export const getSubscriptionStatus = async (): Promise<any> => {
  try {
    const response = await api.get('/subscriptions/status')
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    throw new Error('Failed to get subscription status')
  }
}

/**
 * Get subscription usage statistics
 */
export const getSubscriptionUsage = async (): Promise<any> => {
  try {
    const response = await api.get('/subscriptions/usage')
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    throw new Error('Failed to get subscription usage')
  }
}

/**
 * Upgrade subscription
 */
export const upgradeSubscription = async (data: any): Promise<any> => {
  try {
    const response = await api.post('/subscriptions/upgrade', data)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    throw new Error('Failed to upgrade subscription')
  }
}

/**
 * Download itinerary as PDF
 */
export const downloadItineraryPDF = async (itineraryId: string): Promise<Blob> => {
  try {
    const response = await api.get(`/itineraries/${itineraryId}/download`, {
      responseType: 'blob'
    })
    return response.data
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error('PDF download is a premium feature. Please upgrade your subscription.')
    }
    throw new Error('Failed to download PDF')
  }
}

/**
 * Email itinerary
 */
export const emailItinerary = async (itineraryId: string, data: { to: string; message?: string }): Promise<any> => {
  try {
    const response = await api.post(`/itineraries/${itineraryId}/email`, data)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    if (error.response?.status === 403) {
      throw new Error('Email itinerary is a premium feature. Please upgrade your subscription.')
    }
    throw new Error('Failed to email itinerary')
  }
}

/**
 * Cancel subscription
 */
export const cancelSubscription = async (): Promise<any> => {
  try {
    const response = await api.post('/subscriptions/cancel')
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    throw new Error('Failed to cancel subscription')
  }
}
