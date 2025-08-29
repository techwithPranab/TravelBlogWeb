import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short') {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (format === 'relative') {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`
    
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) return `${diffInMonths}mo ago`
    
    const diffInYears = Math.floor(diffInDays / 365)
    return `${diffInYears}y ago`
  }

  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatNumber(number: number) {
  return new Intl.NumberFormat('en-US').format(number)
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

export function calculateReadTime(content: string) {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const readTime = Math.ceil(words / wordsPerMinute)
  return readTime
}

export function generateExcerpt(content: string, maxLength = 160) {
  // Remove HTML tags and markdown
  const plainText = content
    .replace(/<[^>]*>/g, '')
    .replace(/[#*`_~\[\]]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  
  return truncateText(plainText, maxLength)
}

export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = reject
    img.src = url
  })
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function generateSEOTitle(title: string, siteName = 'Travel Blog'): string {
  if (title.includes(siteName)) return title
  return `${title} | ${siteName}`
}

export function generateMetaDescription(content: string, maxLength = 160): string {
  return generateExcerpt(content, maxLength)
}

export function getOgImageUrl(title: string, image?: string): string {
  if (image) return image
  
  // Generate dynamic OG image URL
  const encodedTitle = encodeURIComponent(title)
  return `/api/og?title=${encodedTitle}`
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export function generateCanonicalUrl(path: string): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}
