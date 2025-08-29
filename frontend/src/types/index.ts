export interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'reader' | 'contributor'
  bio?: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    facebook?: string
    website?: string
  }
  isPremium: boolean
  membershipExpiry?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Author {
  _id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    facebook?: string
    website?: string
  }
}

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  postCount: number
  createdAt: Date
}

export interface Tag {
  _id: string
  name: string
  slug: string
  postCount: number
}

export interface Post {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  images?: string[]
  author: Author
  categories: Category[]
  tags: Tag[]
  seo: {
    metaTitle?: string
    metaDescription?: string
    focusKeyword?: string
    ogImage?: string
  }
  status: 'draft' | 'published' | 'archived'
  isPremium: boolean
  readTime: number
  viewCount: number
  likeCount: number
  commentCount: number
  destination?: {
    country: string
    city?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  _id: string
  postId: string
  author: {
    name: string
    email: string
    avatar?: string
  }
  content: string
  parentId?: string
  replies?: Comment[]
  isApproved: boolean
  createdAt: Date
}

export interface Photo {
  _id: string
  title: string
  description?: string
  imageUrl: string
  thumbnailUrl?: string
  location: {
    country: string
    city?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  photographer: {
    name: string
    email: string
    userId?: string
  }
  tags: string[]
  category: 'landscape' | 'architecture' | 'food' | 'culture' | 'adventure' | 'wildlife' | 'people' | 'other'
  camera?: {
    make?: string
    model?: string
    settings?: {
      aperture?: string
      shutter?: string
      iso?: string
      focalLength?: string
    }
  }
  status: 'pending' | 'approved' | 'rejected'
  moderationNotes?: string
  likes: number
  views: number
  downloads: number
  isPublic: boolean
  isFeatured: boolean
  submittedAt: Date
  approvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  _id: string
  destination: string
  reviewer: {
    name: string
    email: string
    userId?: string
    avatar?: string
  }
  rating: number
  title: string
  content: string
  tripType: 'solo' | 'family' | 'couple' | 'friends' | 'business'
  travelDate: Date
  isVerified: boolean
  helpful: number
  notHelpful: number
  status: 'pending' | 'approved' | 'rejected'
  moderationNotes?: string
  replies: Array<{
    author: {
      name: string
      email: string
      isOwner?: boolean
    }
    content: string
    createdAt: Date
  }>
  createdAt: Date
  updatedAt: Date
}

export interface Resource {
  _id: string
  title: string
  description: string
  type: 'book' | 'guide' | 'tool' | 'gear'
  price?: number
  affiliateLink?: string
  image?: string
  rating?: number
  reviews?: number
  tags: string[]
  isDigital: boolean
  downloadUrl?: string
  createdAt: Date
}

export interface Transaction {
  _id: string
  userId: string
  type: 'purchase' | 'membership' | 'affiliate_click'
  amount?: number
  currency?: string
  resourceId?: string
  affiliateUrl?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  stripePaymentIntentId?: string
  createdAt: Date
}

export interface Newsletter {
  _id: string
  email: string
  name?: string
  isActive: boolean
  subscribedAt: Date
  unsubscribedAt?: Date
}

export interface Analytics {
  totalPosts: number
  totalUsers: number
  totalViews: number
  totalRevenue: number
  topPosts: {
    post: Post
    views: number
  }[]
  recentAffiliateClicks: Transaction[]
  monthlyRevenue: {
    month: string
    revenue: number
  }[]
  userGrowth: {
    month: string
    users: number
  }[]
}

export interface SearchFilters {
  category?: string
  tag?: string
  continent?: string
  country?: string
  activity?: string
  budget?: 'low' | 'medium' | 'high'
  sortBy?: 'latest' | 'popular' | 'views' | 'relevance'
  page?: number
  limit?: number
}

export interface SearchResult {
  posts: Post[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

export interface MapPin {
  id: string
  title: string
  coordinates: {
    lat: number
    lng: number
  }
  postId: string
  country: string
  city?: string
  image?: string
  category: string
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

export interface NewsletterForm {
  email: string
  name?: string
}

export interface CommentForm {
  name: string
  email: string
  content: string
  parentId?: string
}

export interface PostForm {
  title: string
  excerpt: string
  content: string
  featuredImage?: string
  categories: string[]
  tags: string[]
  seo: {
    metaTitle?: string
    metaDescription?: string
    focusKeyword?: string
  }
  status: 'draft' | 'published'
  isPremium: boolean
  destination?: {
    country: string
    city?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
}

export interface PhotoSubmissionForm {
  title: string
  description?: string
  imageUrl: string
  location: {
    country: string
    city?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  photographer: {
    name: string
    email: string
  }
  tags: string[]
  category: 'landscape' | 'architecture' | 'food' | 'culture' | 'adventure' | 'wildlife' | 'people' | 'other'
  camera?: {
    make?: string
    model?: string
    settings?: {
      aperture?: string
      shutter?: string
      iso?: string
      focalLength?: string
    }
  }
}

export interface ReviewForm {
  destination: string
  rating: number
  title: string
  content: string
  tripType: 'solo' | 'family' | 'couple' | 'friends' | 'business'
  travelDate: Date
  reviewer: {
    name: string
    email: string
  }
}

// Component Props Types
export interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedAt?: string
  author?: string
}

export interface ImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}
