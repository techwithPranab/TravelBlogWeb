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
    const url = `${API_BASE_URL}/admin${endpoint}`
    
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

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats')
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
    return this.request(endpoint)
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
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
    return this.request(endpoint)
  }

  async updatePostStatus(id: string, status: string) {
    return this.request(`/posts/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }

  async deletePost(id: string) {
    return this.request(`/posts/${id}`, {
      method: 'DELETE'
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
    return this.request(endpoint)
  }

  async deleteDestination(id: string) {
    return this.request(`/destinations/${id}`, {
      method: 'DELETE'
    })
  }

  // Guides Management
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
    return this.request(endpoint)
  }

  async deleteGuide(id: string) {
    return this.request(`/guides/${id}`, {
      method: 'DELETE'
    })
  }

  // Settings Management
  async getSettings() {
    return this.request('/settings')
  }

  async updateSettings(settings: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }
}

export const adminApi = new AdminApi()
export default adminApi
