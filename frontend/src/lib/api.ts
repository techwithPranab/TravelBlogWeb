const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Types
export interface Post {
  _id: string
  title: string
  excerpt: string
  content: string
  slug: string
  author: {
    _id: string
    name: string
    avatar?: string
  }
  categories: Array<{
    _id: string
    name: string
    slug: string
    color: string
  }>
  destinations?: Array<{
    _id: string
    name: string
    slug: string
  }>
  featuredImage?: {
    url: string
    alt: string
  }
  tags: string[]
  status: 'draft' | 'published'
  publishedAt: string
  readTime: number
  likes: number
  views: number
  comments: number
  createdAt: string
  updatedAt: string
}

export interface Destination {
  _id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  country: string
  region: string
  coordinates: {
    latitude: number
    longitude: number
  }
  images: Array<{
    url: string
    alt: string
    caption?: string
    isPrimary?: boolean
  }>
  highlights: string[]
  bestTimeToVisit: {
    months: string[]
    description: string
  }
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  budget: {
    currency: string
    low: number
    high: number
    description: string
  }
  tags: string[]
  activities: string[]
  isPopular?: boolean
  isFeatured?: boolean
  rating?: {
    average: number
    count: number
  }
  createdAt: string
  updatedAt: string
}

export interface Guide {
  _id: string
  title: string
  slug: string
  description: string
  content: string
  author: {
    _id: string
    name: string
    avatar?: string
  }
  destination: {
    _id: string
    name: string
    slug: string
  }
  category: {
    _id: string
    name: string
    slug: string
  }
  type: string
  duration: {
    days: number
    description: string
  }
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  budget: {
    currency: string
    amount: number
    description: string
  }
  itinerary?: Array<{
    day: number
    title: string
    description: string
    activities: string[]
    accommodation?: string
    meals?: string[]
    transportation?: string
    budget?: number
  }>
  tags: string[]
  isPublished: boolean
  isFeatured?: boolean
  publishedAt: string
  views: number
  likes: number
  createdAt: string
  updatedAt: string
}

export interface Category {
  _id: string
  name: string
  slug: string
  description: string
  color: string
  image?: string
  postCount: number
  createdAt: string
  updatedAt: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    pages: number
    total: number
    limit: number
  }
}

// Generic API function
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const config = { ...defaultOptions, ...options }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}

// Posts API
export const postsApi = {
  getAll: async (params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    sort?: string
  }): Promise<ApiResponse<Post[]>> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.category) searchParams.append('category', params.category)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.sort) searchParams.append('sort', params.sort)
    
    const query = searchParams.toString()
    return apiRequest<Post[]>(`/posts${query ? `?${query}` : ''}`)
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Post>> => {
    return apiRequest<Post>(`/posts/${slug}`)
  },

  getFeatured: async (): Promise<ApiResponse<Post[]>> => {
    return apiRequest<Post[]>('/posts/featured')
  },

  getPopular: async (): Promise<ApiResponse<Post[]>> => {
    return apiRequest<Post[]>('/posts/popular')
  },

  getByCategory: async (category: string, params?: {
    page?: number
    limit?: number
  }): Promise<ApiResponse<Post[]>> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    
    const query = searchParams.toString()
    return apiRequest<Post[]>(`/posts/category/${category}${query ? `?${query}` : ''}`)
  },

  search: async (query: string, params?: {
    page?: number
    limit?: number
  }): Promise<ApiResponse<Post[]>> => {
    const searchParams = new URLSearchParams({ q: query })
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    
    return apiRequest<Post[]>(`/posts/search?${searchParams.toString()}`)
  }
}

// Destinations API
export const destinationsApi = {
  getAll: async (params?: {
    page?: number
    limit?: number
    region?: string
    difficulty?: string
    sort?: string
  }): Promise<ApiResponse<Destination[]>> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.region) searchParams.append('region', params.region)
    if (params?.difficulty) searchParams.append('difficulty', params.difficulty)
    if (params?.sort) searchParams.append('sort', params.sort)
    
    const query = searchParams.toString()
    return apiRequest<Destination[]>(`/destinations${query ? `?${query}` : ''}`)
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Destination>> => {
    return apiRequest<Destination>(`/destinations/${slug}`)
  },

  getFeatured: async (): Promise<ApiResponse<Destination[]>> => {
    return apiRequest<Destination[]>('/destinations/featured')
  },

  getPopular: async (): Promise<ApiResponse<Destination[]>> => {
    return apiRequest<Destination[]>('/destinations/popular')
  }
}

// Guides API
export const guidesApi = {
  getAll: async (params?: {
    page?: number
    limit?: number
    destination?: string
    type?: string
    difficulty?: string
    sort?: string
  }): Promise<ApiResponse<Guide[]>> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.destination) searchParams.append('destination', params.destination)
    if (params?.type) searchParams.append('type', params.type)
    if (params?.difficulty) searchParams.append('difficulty', params.difficulty)
    if (params?.sort) searchParams.append('sort', params.sort)
    
    const query = searchParams.toString()
    return apiRequest<Guide[]>(`/guides${query ? `?${query}` : ''}`)
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Guide>> => {
    return apiRequest<Guide>(`/guides/${slug}`)
  },

  getFeatured: async (): Promise<ApiResponse<Guide[]>> => {
    return apiRequest<Guide[]>('/guides/featured')
  },

  getByDestination: async (destinationId: string): Promise<ApiResponse<Guide[]>> => {
    return apiRequest<Guide[]>(`/guides/destination/${destinationId}`)
  },

  getByType: async (type: string): Promise<ApiResponse<Guide[]>> => {
    return apiRequest<Guide[]>(`/guides/type/${type}`)
  }
}

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    return apiRequest<Category[]>('/categories')
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
    return apiRequest<Category>(`/categories/${slug}`)
  }
}

export default {
  posts: postsApi,
  destinations: destinationsApi,
  guides: guidesApi,
  categories: categoriesApi
}
