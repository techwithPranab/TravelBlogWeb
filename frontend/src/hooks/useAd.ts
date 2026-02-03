import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Advertisement,
  getAdsForPlacement,
  getAdsForBlogPost,
  trackImpression,
  trackClick,
  getUserContext,
} from '@/lib/adApi'

interface UseAdOptions {
  placement: string
  blogPostId?: string
  autoRefresh?: boolean
  refreshInterval?: number // in seconds
  onImpression?: (ad: Advertisement) => void
  onClick?: (ad: Advertisement) => void
}

export const useAd = ({
  placement,
  blogPostId,
  autoRefresh = false,
  refreshInterval = 30,
  onImpression,
  onClick,
}: UseAdOptions) => {
  const [ad, setAd] = useState<Advertisement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const impressionTracked = useRef(false)
  const adRef = useRef<Advertisement | null>(null)

  // Fetch ad
  const fetchAd = useCallback(async () => {
    try {
      console.log('🔄 Fetching ad...', { placement, blogPostId })
      setLoading(true)
      setError(null)
      
      const userContext = getUserContext()
      console.log('👤 User context:', userContext)
      
      console.log(' Fetching ad for placement:', placement)
      const response = await getAdsForPlacement(placement, userContext)

      console.log('📦 Ad response:', response)

      if (response.success && response.data) {
        console.log('✅ Ad loaded successfully:', response.data)
        setAd(response.data)
        adRef.current = response.data
        impressionTracked.current = false // Reset impression tracking for new ad
      } else {
        console.log('⚠️ No ad data in response')
        setAd(null)
        adRef.current = null
      }
    } catch (err: any) {
      console.error('❌ Error fetching ad:', err)
      setError(err.message || 'Failed to fetch advertisement')
      setAd(null)
      adRef.current = null
    } finally {
      setLoading(false)
    }
  }, [placement, blogPostId])

  // Track impression
  const trackAdImpression = useCallback(async () => {
    if (!adRef.current || impressionTracked.current) return

    try {
      const userContext = getUserContext()
      await trackImpression({
        advertisementId: adRef.current._id,
        placement,
        blogPostId,
        ...userContext,
      })

      impressionTracked.current = true
      onImpression?.(adRef.current)
    } catch (err) {
      console.error('Failed to track impression:', err)
    }
  }, [placement, blogPostId, onImpression])

  // Track click
  const trackAdClick = useCallback(async () => {
    if (!adRef.current) return

    try {
      const userContext = getUserContext()
      await trackClick({
        advertisementId: adRef.current._id,
        placement,
        blogPostId,
        ...userContext,
      })

      onClick?.(adRef.current)
    } catch (err) {
      console.error('Failed to track click:', err)
    }
  }, [placement, blogPostId, onClick])

  // Initial fetch
  useEffect(() => {
    fetchAd()
  }, [fetchAd])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(fetchAd, refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchAd])

  return {
    ad,
    loading,
    error,
    refresh: fetchAd,
    trackImpression: trackAdImpression,
    trackClick: trackAdClick,
  }
}

// Hook for tracking impression when element is visible
export const useAdImpression = (
  ad: Advertisement | null,
  onImpression: () => void,
  options: {
    threshold?: number
    delay?: number // delay in ms before tracking
  } = {}
) => {
  const { threshold = 0.5, delay = 1000 } = options
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const tracked = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!ref || !ad || tracked.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !tracked.current) {
            // Delay tracking to ensure user actually viewed the ad
            timeoutRef.current = setTimeout(() => {
              if (entry.isIntersecting) {
                onImpression()
                tracked.current = true
              }
            }, delay)
          } else if (!entry.isIntersecting && timeoutRef.current) {
            // Cancel tracking if user scrolled away before delay
            clearTimeout(timeoutRef.current)
          }
        })
      },
      { threshold }
    )

    observer.observe(ref)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      observer.disconnect()
    }
  }, [ref, ad, onImpression, threshold, delay])

  // Reset tracked flag when ad changes
  useEffect(() => {
    tracked.current = false
  }, [ad?._id])

  return setRef
}

// Hook for tracking click with proper event handling
export const useAdClick = (
  ad: Advertisement | null,
  onClickTracked: () => void
) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!ad) return

      // Track the click
      onClickTracked()

      // Allow default behavior (navigation)
      // The tracking happens in parallel
    },
    [ad, onClickTracked]
  )

  return handleClick
}

// Hook for managing multiple ads in a container
interface UseAdContainerOptions {
  placements: string[]
  blogPostId?: string
  maxAds?: number
  rotationType?: 'sequential' | 'random' | 'weighted'
}

export const useAdContainer = ({
  placements,
  blogPostId,
  maxAds = 3,
  rotationType = 'weighted',
}: UseAdContainerOptions) => {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const userContext = getUserContext()
      const adPromises = placements.map((placement) =>
        getAdsForPlacement(placement, userContext)
      )

      const responses = await Promise.all(adPromises)
      const fetchedAds = responses
        .filter((r) => r.success && r.data)
        .map((r) => r.data)
        .filter((ad): ad is Advertisement => ad !== null)
        .slice(0, maxAds)

      setAds(fetchedAds)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch advertisements')
      setAds([])
    } finally {
      setLoading(false)
    }
  }, [placements, blogPostId, maxAds])

  useEffect(() => {
    fetchAds()
  }, [fetchAds])

  return {
    ads,
    loading,
    error,
    refresh: fetchAds,
  }
}

// Hook for frequency capping (limit impressions per session)
export const useFrequencyCap = (adId: string, maxImpressions: number = 3) => {
  const [canShow, setCanShow] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const key = `ad_frequency_${adId}`
    const count = parseInt(sessionStorage.getItem(key) || '0', 10)

    if (count >= maxImpressions) {
      setCanShow(false)
    }
  }, [adId, maxImpressions])

  const incrementCount = useCallback(() => {
    if (typeof window === 'undefined') return

    const key = `ad_frequency_${adId}`
    const count = parseInt(sessionStorage.getItem(key) || '0', 10)
    sessionStorage.setItem(key, (count + 1).toString())

    if (count + 1 >= maxImpressions) {
      setCanShow(false)
    }
  }, [adId, maxImpressions])

  return { canShow, incrementCount }
}
