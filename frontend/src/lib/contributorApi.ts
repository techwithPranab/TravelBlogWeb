const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
export interface ContributorStats {
  totalPosts: number
  publishedPosts: number
  pendingPosts: number
  rejectedPosts: number
  draftPosts: number
  totalViews: number
  totalLikes: number
}

export interface ContributorDashboardData {
  stats: ContributorStats
  recentPosts: {
    _id: string
    title: string
    status: string
    createdAt: string
    updatedAt: string
    publishedAt?: string
  }[]
  recentRejections: {
    _id: string
    title: string
    moderationNotes?: string
    moderatedAt?: string
    moderatedBy?: {
      name: string
    }
  }[]
}

export interface ContributorPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: {
    url: string
    alt: string
    caption?: string
  }
  categories: {
    _id: string
    name: string
    slug: string
  }[]
  tags: string[]
  destination?: {
    country?: string
    city?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  kmtravelled?: number
  youtubeVideos?: Array<{
    id: string
    title: string
    url: string
    description?: string
    order: number
  }>
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'archived' | 'inactive'
  isPremium: boolean
  readTime: number
  viewCount: number
  likeCount: number
  commentCount: number
  submittedAt?: string
  moderatedBy?: {
    _id: string
    name: string
  }
  moderatedAt?: string
  moderationNotes?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ContributorPostsResponse {
  success: boolean
  data: ContributorPost[]
  pagination: {
    page: number
    pages: number
    total: number
    limit: number
  }
  statusCounts: {
    draft: number
    pending: number
    published: number
    rejected: number
    archived: number
    inactive: number
  }
}

export interface CreatePostRequest {
  title: string
  excerpt: string
  content: string
  featuredImage?: {
    url: string
    alt: string
    caption?: string
  }
  images?: string[]
  categories: string[]
  tags?: string[]
  destination?: {
    country?: string
    city?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  kmtravelled?: number
  youtubeVideos?: Array<{
    id: string
    title: string
    url: string
    description?: string
    order: number
  }>
  status?: 'draft' | 'pending' | 'inactive'
  isFeatured?: boolean
  seoTitle?: string
  seoDescription?: string
  publishedAt?: string
  contentSections?: any[]
}

// Contributor API utility functions
class ContributorApi {
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
      console.error(`Contributor API Error (${endpoint}):`, error)
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
  async getDashboard(): Promise<ContributorDashboardData> {
    const response = await this.get<{ success: boolean; data: ContributorDashboardData }>('/contributor/dashboard')
    return response.data
  }

  // Posts management
  async getPosts(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<ContributorPostsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.status) searchParams.append('status', params.status)

    const query = searchParams.toString()
    const endpoint = query ? `/contributor/posts?${query}` : '/contributor/posts'

    return this.get<ContributorPostsResponse>(endpoint)
  }

  async createPost(postData: CreatePostRequest): Promise<{ success: boolean; message: string; data: ContributorPost }> {
    return this.post('/contributor/posts', postData)
  }

  async updatePost(id: string, postData: Partial<CreatePostRequest>): Promise<{ success: boolean; message: string; data: ContributorPost }> {
    return this.put(`/contributor/posts/${id}`, postData)
  }

  async deletePost(id: string): Promise<{ success: boolean; message: string }> {
    return this.delete(`/contributor/posts/${id}`)
  }

  // Image upload
  async uploadImage(file: File): Promise<{ success: boolean; data: { url: string; publicId: string } }> {
    const formData = new FormData()
    formData.append('image', file)

    const url = `${API_BASE_URL}/contributor/upload-image`
    const token = localStorage.getItem('token')

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        throw new Error('Session expired')
      }

      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Upload failed: ${response.status}`)
    }

    return await response.json()
  }
}

export const contributorApi = new ContributorApi()
