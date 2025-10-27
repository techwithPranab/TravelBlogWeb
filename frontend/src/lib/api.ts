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
    caption?: string
  }
  images?: string[]
  tags: string[]
  status: 'draft' | 'published' | 'inactive'
  publishedAt: string
  readTime: number
  views: number
  likes: number
  comments: number
  createdAt: string
  updatedAt: string
  // Additional fields from backend
  viewCount?: number
  likeCount?: number
  commentCount?: number
  destination?: {
    country: string
    city?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
}

export interface Destination {
  _id: string
  name: string
  slug: string
  description: string
  country: string
  continent: string
  featuredImage: {
    url: string
    alt: string
  }
  gallery: Array<{
    url: string
    alt: string
  }>
  coordinates: {
    lat: number
    lng: number
  }
  bestTimeToVisit: string
  averageTemperature: {
    summer: string
    winter: string
  }
  currency: string
  language: string
  timezone: string
  rating: number
  totalReviews: number
  highlights: string[]
  activities: Array<{
    name: string
    icon: string
    description: string
  }>
  accommodation: Array<{
    type: string
    name: string
    description: string
    priceRange: string
    rating?: number
    amenities?: string[]
    bookingUrl?: string
  }>
  transportation: string[]
  localCuisine: string[]
  travelTips: string[]
  howToReach: {
    byAir: {
      nearestAirport: string
      distanceFromCity: string
      travelTime: string
      domesticFlights: string
      internationalFlights: string
      transportToCity: string
      estimatedCost: string
    }
    byRail: {
      nearestStation: string
      majorTrains: string
      connections: string
      travelTime: string
      transportToCity: string
      estimatedCost: string
      booking: string
    }
    byRoad: {
      majorHighways: string
      distanceFromDelhi: string
      distanceFromLucknow: string
      distanceFromKanpur?: string
      distanceFromPatna?: string
      travelTime: string
      busServices: string
      privateCar: string
      estimatedCost: string
    }
  }
  relatedPosts: Array<{
    id: string
    title: string
    slug: string
    image: string
  }>
  isPopular: boolean
  isFeatured: boolean
  isActive: boolean
  status: 'published' | 'draft' | 'inactive'
  seoTitle?: string
  seoDescription?: string
  createdAt: string
  updatedAt: string
}

export interface Guide {
  _id: string
  id: string
  title: string
  slug: string
  description: string
  content: string
  author: {
    _id: string
    name: string
    avatar: string
    bio: string
  }
  destination: {
    _id: string
    name: string
    slug: string
    country: string
  }
  category: {
    _id: string
    name: string
    slug: string
  }
  type: 'itinerary' | 'budget' | 'photography' | 'food' | 'adventure'
  duration: string | {
    days: number
    description: string
  }
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  budget: {
    currency: string
    amount: number
    description: string
    range: string
    details: string
  }
  itinerary?: Array<{
    day: number
    title: string
    description: string
    activities: string[]
    accommodation: string
    meals: string[]
    transportation?: string
    budget: string
  }>
  tags: string[]
  isPublished: boolean
  isFeatured?: boolean
  publishedAt: string
  views: number
  likes: number
  createdAt: string
  updatedAt: string
  // Additional properties from the detailed Guide interface
  bestTime: string
  rating: number
  totalReviews: number
  lastUpdated: string
  isPremium: boolean
  downloadCount: number
  featuredImage: {
    url: string
    alt: string
  }
  sections: Array<{
    title: string
    content: string
    tips?: string[]
    images?: Array<{
      url: string
      alt: string
      caption?: string
    }>
  }>
  packingList?: Array<{
    category: string
    items: string[]
  }>
  resources: Array<{
    title: string
    type: 'link' | 'document' | 'app'
    url: string
  }>
  relatedGuides: Array<{
    id: string
    title: string
    slug: string
    image: string
    type: string
  }>
}

export interface Partner {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  website?: string
  partnershipType: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt?: string
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

export interface DashboardStats {
  totalUsers: number
  totalPosts: number
  totalDestinations: number
  totalGuides: number
  totalSubscribers: number
  pendingPosts: number
  recentUsers: Array<{
    _id: string
    name: string
    email: string
    createdAt: string
  }>
  recentPosts: Array<{
    _id: string
    title: string
    slug: string
    author: {
      _id: string
      name: string
    }
    createdAt: string
  }>
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
    const endpoint = query ? `/posts?${query}` : '/posts'
    return apiRequest<Post[]>(endpoint)
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
    const endpoint = query ? `/posts/category/${category}?${query}` : `/posts/category/${category}`
    return apiRequest<Post[]>(endpoint)
  },

  unifiedSearch: async (query: string): Promise<ApiResponse<{
    posts: { count: number; data: Post[] }
    destinations: { count: number; data: Destination[] }
    guides: { count: number; data: Guide[] }
    photos: { count: number; data: any[] }
    total: number
  }>> => {
    const searchParams = new URLSearchParams({ q: query })
    return apiRequest<{
      posts: { count: number; data: Post[] }
      destinations: { count: number; data: Destination[] }
      guides: { count: number; data: Guide[] }
      photos: { count: number; data: any[] }
      total: number
    }>(`/posts/unified-search?${searchParams.toString()}`)
  }
}

// Destinations API
export const destinationsApi = {
  getAll: async (params?: {
    page?: number
    limit?: number
    continent?: string
    sort?: string
  }): Promise<ApiResponse<Destination[]>> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.continent) searchParams.append('continent', params.continent)
    if (params?.sort) searchParams.append('sort', params.sort)
    
    const query = searchParams.toString()
    const endpoint = query ? `/destinations?${query}` : '/destinations'
    return apiRequest<Destination[]>(endpoint)
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
    const endpoint = query ? `/guides?${query}` : '/guides'
    return apiRequest<Guide[]>(endpoint)
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

// Partners API
export const partnersApi = {
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }): Promise<ApiResponse<{ partners: Partner[]; totalPages: number; currentPage: number; total: number }>> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    
    const query = searchParams.toString()
    const endpoint = query ? `/partners?${query}` : '/partners'
    return apiRequest<{ partners: Partner[]; totalPages: number; currentPage: number; total: number }>(endpoint)
  },

  updateStatus: async (partnerId: string, status: 'pending' | 'approved' | 'rejected'): Promise<ApiResponse<Partner>> => {
    return apiRequest<Partner>(`/partners/${partnerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  },

  delete: async (partnerId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest<{ message: string }>(`/partners/${partnerId}`, {
      method: 'DELETE'
    })
  },

  getById: async (partnerId: string): Promise<ApiResponse<Partner>> => {
    return apiRequest<Partner>(`/partners/${partnerId}`)
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

// Admin API
export const adminApi = {
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiRequest<DashboardStats>('/admin/dashboard/stats')
  }
}

// Public API
export const publicApi = {
  getStats: async (): Promise<ApiResponse<{
    totalUsers: number
    totalPosts: number
    totalDestinations: number
    totalGuides: number
    totalSubscribers: number
  }>> => {
    return apiRequest<{
      totalUsers: number
      totalPosts: number
      totalDestinations: number
      totalGuides: number
      totalSubscribers: number
    }>('/public/stats')
  },

  getTestimonials: async (): Promise<ApiResponse<Array<{
    id: string
    name: string
    role: string
    avatar?: string
    rating: number
    text: string
    featured?: boolean
  }>>> => {
    return apiRequest<Array<{
      id: string
      name: string
      role: string
      avatar?: string
      rating: number
      text: string
      featured?: boolean
    }>>('/public/testimonials')
  },

  getContact: async (): Promise<ApiResponse<{
    email: string
    phone: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    socialLinks: {
      facebook: string
      twitter: string
      instagram: string
      youtube: string
    }
    businessHours: {
      monday: string
      tuesday: string
      wednesday: string
      thursday: string
      friday: string
      saturday: string
      sunday: string
    }
    support: {
      email: string
      responseTime: string
    }
  }>> => {
    return apiRequest<{
      email: string
      phone: string
      address: {
        street: string
        city: string
        state: string
        zipCode: string
        country: string
      }
      socialLinks: {
        facebook: string
        twitter: string
        instagram: string
        youtube: string
      }
      businessHours: {
        monday: string
        tuesday: string
        wednesday: string
        thursday: string
        friday: string
        saturday: string
        sunday: string
      }
      support: {
        email: string
        responseTime: string
      }
    }>('/public/contact')
  }
}

export default {
  posts: postsApi,
  destinations: destinationsApi,
  guides: guidesApi,
  partners: partnersApi,
  categories: categoriesApi,
  admin: adminApi,
  public: publicApi
}
