const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Reader API utility functions
class ReaderApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - redirect to login
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          throw new Error('Session expired')
        }

        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Reader API Error (${endpoint}):`, error)
      throw error
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint)
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE'
    })
  }

  // Dashboard
  async getDashboard() {
    return this.request('/reader/dashboard')
  }

  // Profile Management
  async getProfile() {
    return this.request('/reader/profile')
  }

  async updateProfile(profileData: any) {
    return this.request('/reader/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  }

  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)

    const token = localStorage.getItem('token')
    const headers: any = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return this.request('/reader/avatar', {
      method: 'POST',
      headers,
      body: formData
    })
  }

  // Reading History
  async getReadingHistory(params?: {
    page?: number
    limit?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    const query = searchParams.toString()
    const endpoint = query ? `/reader/reading-history?${query}` : '/reader/reading-history'
    return this.request(endpoint)
  }

  // Posts (for readers)
  async getPosts(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.category) searchParams.append('category', params.category)
    if (params?.search) searchParams.append('search', params.search)

    const query = searchParams.toString()
    const endpoint = query ? `/posts?${query}` : '/posts'
    return this.request(endpoint)
  }

  async getPost(id: string) {
    return this.request(`/posts/${id}`)
  }

  // Photos (for readers)
  async getPhotos(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.category) searchParams.append('category', params.category)
    if (params?.search) searchParams.append('search', params.search)

    const query = searchParams.toString()
    const endpoint = query ? `/photos?${query}` : '/photos'
    return this.request(endpoint)
  }

  async getPhoto(id: string) {
    return this.request(`/photos/${id}`)
  }
}

export const readerApi = new ReaderApi()
export default readerApi
