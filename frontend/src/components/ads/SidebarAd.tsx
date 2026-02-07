'use client'

import React from 'react'
import Image from 'next/image'
import { Advertisement } from '@/lib/adApi'
import { useAdImpression, useAdClick } from '@/hooks/useAd'

interface SidebarAdProps {
  ad: Advertisement
  onImpression: () => void
  onClickTracked: () => void
  className?: string
  sticky?: boolean
}

export default function SidebarAd({
  ad,
  onImpression,
  onClickTracked,
  className = '',
  sticky = false,
}: SidebarAdProps) {
  const adRef = useAdImpression(ad, onImpression, {
    threshold: 0.5,
    delay: 1000,
  })
  const handleClick = useAdClick(ad, onClickTracked)

  if (!ad) return null

  const { creative, destinationUrl } = ad

  return (
    <div
      ref={adRef}
      className={`${
        sticky ? 'sticky top-20' : ''
      } overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {/* Sponsored Badge */}
      <div className="absolute top-2 right-2 z-10">
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
          Sponsored
        </span>
      </div>

      <a
        href={destinationUrl}
        onClick={handleClick}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className="block group"
      >
        {/* Image */}
        {creative.imageUrl && (
          <div className="relative w-full h-40 overflow-hidden bg-gray-100">
            <Image
              src={creative.imageUrl}
              alt={creative.imageAlt || ad.title || 'Advertisement'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="300px"
            />
          </div>
        )}

        {/* Custom HTML */}
        {creative.htmlContent && !creative.imageUrl && (
          <div
            className="w-full h-40 flex items-center justify-center bg-gray-50"
            dangerouslySetInnerHTML={{ __html: creative.htmlContent }}
          />
        )}

        {/* Content */}
        <div className="p-4">
          <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {ad.title}
          </h3>

          {ad.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {ad.description}
            </p>
          )}

          {creative.callToAction && (
            <div className="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:text-blue-700">
              <span>{creative.callToAction}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          )}
        </div>
      </a>
    </div>
  )
}
