'use client'

import React from 'react'
import Image from 'next/image'
import { Advertisement } from '@/lib/adApi'
import { useAdImpression, useAdClick } from '@/hooks/useAd'

interface BannerAdProps {
  ad: Advertisement
  onImpression: () => void
  onClickTracked: () => void
  className?: string
}

export default function BannerAd({
  ad,
  onImpression,
  onClickTracked,
  className = '',
}: BannerAdProps) {
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
      className={`relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {/* Ad Label */}
      <div className="absolute top-2 right-2 z-10">
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
          Advertisement
        </span>
      </div>

      <a
        href={destinationUrl}
        onClick={handleClick}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className="block group"
        aria-label={ad.title}
      >
        {/* Image */}
        {creative.imageUrl && (
          <div className="relative w-full h-[200px] md:h-[250px] overflow-hidden bg-gray-100">
            <Image
              src={creative.imageUrl}
              alt={creative.imageAlt || ad.title || ad.name || 'Advertisement'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Custom HTML (if provided) */}
        {creative.htmlContent && !creative.imageUrl && (
          <div
            className="w-full h-[200px] md:h-[250px] flex items-center justify-center bg-gray-50"
            dangerouslySetInnerHTML={{ __html: creative.htmlContent }}
          />
        )}

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Headline */}
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {ad.title || ad.name}
          </h3>

          {/* Description */}
          {ad.description && (
            <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-2">
              {ad.description}
            </p>
          )}

          {/* CTA Button */}
          {creative.callToAction && (
            <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:text-blue-700">
              <span>{creative.callToAction}</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
