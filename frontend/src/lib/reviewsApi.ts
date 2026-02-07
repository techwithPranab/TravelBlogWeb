import axios from 'axios'
import { CreateReviewData, UpdateReviewData, ItineraryReview, ReviewsResponse, ReviewResponse } from '@/types'

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

// Add response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API request failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)

export interface ReviewApiResponse {
  success: boolean
  data?: ItineraryReview | ItineraryReview[]
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Create a new review
export const createReview = async (reviewData: CreateReviewData): Promise<ReviewResponse> => {
  // Check if user is authenticated
  const token = localStorage.getItem('token')
  if (!token) {
    console.error('reviewsApi: No authentication token found')
    throw new Error('User not authenticated')
  }
  
  try {
    const response = await api.post<ReviewResponse>('/itinerary-reviews', reviewData)
    return response.data
  } catch (error: any) {
    console.error('reviewsApi: API call failed:', error)
    if (error.response?.data) {
      return error.response.data
    }
    throw new Error('Failed to create review')
  }
}

// Get reviews for an itinerary
export const getItineraryReviews = async (
  itineraryId: string,
  page: number = 1,
  limit: number = 10
): Promise<ReviewsResponse> => {
  try {
    const response = await api.get<ReviewsResponse>(`/itinerary-reviews/itinerary/${itineraryId}?page=${page}&limit=${limit}`)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    throw new Error('Failed to fetch reviews')
  }
}

// Get user's reviews
export const getUserReviews = async (
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<ReviewsResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    if (status) {
      params.append('status', status)
    }
    const response = await api.get<ReviewsResponse>(`/itinerary-reviews/my-reviews?${params}`)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    throw new Error('Failed to fetch user reviews')
  }
}

// Update a review
export const updateReview = async (
  reviewId: string,
  updateData: UpdateReviewData
): Promise<ReviewResponse> => {
  try {
    const response = await api.put<ReviewResponse>(`/itinerary-reviews/${reviewId}`, updateData)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    throw new Error('Failed to update review')
  }
}

// Delete a review
export const deleteReview = async (reviewId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await api.delete<{ success: boolean; message?: string }>(`/itinerary-reviews/${reviewId}`)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    throw new Error('Failed to delete review')
  }
}

// Mark review as helpful
export const markReviewHelpful = async (reviewId: string): Promise<ReviewResponse> => {
  try {
    const response = await api.post<ReviewResponse>(`/itinerary-reviews/${reviewId}/helpful`)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    throw new Error('Failed to mark review as helpful')
  }
}

// Get featured reviews
export const getFeaturedReviews = async (
  limit: number = 10
): Promise<ReviewsResponse> => {
  try {
    const response = await api.get(`/itinerary-reviews/featured?limit=${limit}`)
    const payload = response.data
    // Backend sometimes returns { reviews: [...] } or { data: [...] }
    const reviews = payload.data ?? payload.reviews ?? []
    return {
      success: Boolean(payload.success),
      data: reviews,
      message: payload.message
    }
  } catch (error: any) {
    if (error.response?.data) {
      const payload = error.response.data
      const reviews = payload.data ?? payload.reviews ?? []
      return {
        success: Boolean(payload.success),
        data: reviews,
        message: payload.message
      }
    }
    throw new Error('Failed to fetch featured reviews')
  }
}

// Validate review content (client-side validation)
export const validateReviewContent = async (
  title: string,
  comment: string
): Promise<{ isValid: boolean; violations: any[]; wordCount: number }> => {
  try {
    const response = await api.post<{
      success: boolean;
      data: { isValid: boolean; violations: any[]; wordCount: number }
    }>(
      '/itinerary-reviews/validate',
      { title, comment }
    )
    return response.data.data
  } catch (error: any) {
    console.error('Validation API error:', error)
    // If validation endpoint fails, allow submission
    return {
      isValid: true,
      violations: [],
      wordCount: comment.trim().split(/\s+/).length
    }
  }
}
