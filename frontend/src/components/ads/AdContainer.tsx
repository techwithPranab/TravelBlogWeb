'use client'

import React from 'react'
import { useAd } from '@/hooks/useAd'
import BannerAd from './BannerAd'
import NativeAd from './NativeAd'
import SidebarAd from './SidebarAd'
import { Advertisement } from '@/lib/adApi'

interface AdContainerProps {
  placement: string
  blogPostId?: string
  variant?: 'banner' | 'native-card' | 'native-horizontal' | 'native-minimal' | 'sidebar'
  className?: string
  sticky?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  fallback?: React.ReactNode
}

export default function AdContainer({
  placement,
  blogPostId,
  variant = 'banner',
  className = '',
  sticky = false,
  autoRefresh = false,
  refreshInterval = 30,
  fallback,
}: AdContainerProps) {
  const { ad, loading, error, trackImpression, trackClick } = useAd({
    placement,
    blogPostId,
    autoRefresh,
    refreshInterval,
  })

  console.log('📺 AdContainer render:', { placement, ad: !!ad, loading, error })

  // Loading state
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-64"></div>
      </div>
    )
  }

  // Error or no ad available
  if (error || !ad) {
    console.log('⚠️ No ad to display:', { error, hasAd: !!ad })
    
    // Show a message if ads are blocked by browser
    if (error && error.includes('Network Error')) {
      return (
        <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center ${className}`}>
          <p className="text-sm text-yellow-800">
            ⚠️ Content blocker detected. Advertisement blocked by browser.
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Try using Chrome or disable content blockers for localhost
          </p>
        </div>
      )
    }
    
    return fallback ? <>{fallback}</> : null
  }

  // Render appropriate ad component based on variant
  const renderAd = () => {
    switch (variant) {
      case 'banner':
        return (
          <BannerAd
            ad={ad}
            onImpression={trackImpression}
            onClickTracked={trackClick}
            className={className}
          />
        )

      case 'native-card':
        return (
          <NativeAd
            ad={ad}
            onImpression={trackImpression}
            onClickTracked={trackClick}
            variant="card"
            className={className}
          />
        )

      case 'native-horizontal':
        return (
          <NativeAd
            ad={ad}
            onImpression={trackImpression}
            onClickTracked={trackClick}
            variant="horizontal"
            className={className}
          />
        )

      case 'native-minimal':
        return (
          <NativeAd
            ad={ad}
            onImpression={trackImpression}
            onClickTracked={trackClick}
            variant="minimal"
            className={className}
          />
        )

      case 'sidebar':
        return (
          <SidebarAd
            ad={ad}
            onImpression={trackImpression}
            onClickTracked={trackClick}
            sticky={sticky}
            className={className}
          />
        )

      default:
        return (
          <BannerAd
            ad={ad}
            onImpression={trackImpression}
            onClickTracked={trackClick}
            className={className}
          />
        )
    }
  }

  return <>{renderAd()}</>
}
