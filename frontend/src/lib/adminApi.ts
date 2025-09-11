const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Admin API utility functions
class AdminApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('adminToken')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}` // Remove /admin prefix for generic requests
    
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - redirect to login
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          window.location.href = '/admin/login'
          throw new Error('Session expired')
        }
        
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Request failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Admin API Error (${endpoint}):`, error)
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

  // Legacy method for admin endpoints
  private async adminRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(`/admin${endpoint}`, options)
  }

  // Dashboard
  async getDashboardStats() {
    return this.adminRequest('/dashboard/stats')
  }

  // Users Management
  async getUsers(params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.role) searchParams.append('role', params.role)
    
    const query = searchParams.toString()
    const endpoint = query ? `/users?${query}` : '/users'
    return this.adminRequest(endpoint)
  }

  async createUser(userData: any) {
    return this.adminRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async updateUser(id: string, userData: any) {
    return this.adminRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  }

  async deleteUser(id: string) {
    return this.adminRequest(`/users/${id}`, {
      method: 'DELETE'
    })
  }

  // Posts Management
  async getPosts(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    category?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.category) searchParams.append('category', params.category)
    
    const query = searchParams.toString()
    const endpoint = query ? `/posts?${query}` : '/posts'
    return this.adminRequest(endpoint)
  }

  async updatePostStatus(id: string, status: string) {
    return this.adminRequest(`/posts/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }

  async deletePost(id: string) {
    return this.adminRequest(`/posts/${id}`, {
      method: 'DELETE'
    })
  }

  async createPost(postData: any) {
    return this.adminRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    })
  }

  async updatePost(id: string, postData: any) {
    return this.adminRequest(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData)
    })
  }

  async getPost(id: string) {
    return this.adminRequest(`/posts/${id}`)
  }

  async approvePost(id: string) {
    return this.adminRequest(`/posts/${id}/approve`, {
      method: 'PUT'
    })
  }

  // Destinations Management
  async getDestinations(params?: {
    page?: number
    limit?: number
    search?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    
    const query = searchParams.toString()
    const endpoint = query ? `/destinations?${query}` : '/destinations'
    return this.adminRequest(endpoint)
  }

  async deleteDestination(id: string) {
    return this.adminRequest(`/destinations/${id}`, {
      method: 'DELETE'
    })
  }

  async createDestination(destinationData: any) {
    return this.adminRequest('/destinations', {
      method: 'POST',
      body: JSON.stringify(destinationData)
    })
  }

  async updateDestination(id: string, destinationData: any) {
    return this.adminRequest(`/destinations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(destinationData)
    })
  }

  async getDestination(id: string) {
    return this.adminRequest(`/destinations/${id}`)
  }

  // Image upload
  async uploadDestinationImage(formData: FormData) {
    const url = `${API_BASE_URL}/destinations/upload-image`
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: formData
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          window.location.href = '/admin/login'
          throw new Error('Session expired')
        }
        
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Upload failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }

  // Guides Management
  async createGuide(guideData: any) {
    return this.adminRequest('/guides', {
      method: 'POST',
      body: JSON.stringify(guideData)
    })
  }

  async updateGuide(id: string, guideData: any) {
    return this.adminRequest(`/guides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(guideData)
    })
  }

  async getGuide(id: string) {
    return this.adminRequest(`/guides/${id}`)
  }

  async getGuides(params?: {
    page?: number
    limit?: number
    search?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    
    const query = searchParams.toString()
    const endpoint = query ? `/guides?${query}` : '/guides'
    return this.adminRequest(endpoint)
  }

  async deleteGuide(id: string) {
    return this.adminRequest(`/guides/${id}`, {
      method: 'DELETE'
    })
  }

  // Guide image upload
  async uploadGuideImage(formData: FormData) {
    const url = `${API_BASE_URL}/guides/upload-image`
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: formData
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          window.location.href = '/admin/login'
          throw new Error('Session expired')
        }
        
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Upload failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Guide image upload error:', error)
      throw error
    }
  }

  // Partners Management
  async getPartners(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    
    const query = searchParams.toString()
    const endpoint = query ? `/partners?${query}` : '/partners'
    return this.request(endpoint)
  }

  async getPartner(id: string) {
    return this.request(`/partners/${id}`)
  }

  async updatePartnerStatus(id: string, status: string) {
    return this.request(`/partners/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }

  async deletePartner(id: string) {
    return this.request(`/partners/${id}`, {
      method: 'DELETE'
    })
  }

  async getPartnerStats() {
    return this.request('/partners/stats')
  }

  // Settings Management
  async getSettings() {
    return this.adminRequest('/settings')
  }

  async updateSettings(settings: any) {
    return this.adminRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }
}

export const adminApi = new AdminApi()
export default adminApi
