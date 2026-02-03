'use client'

import React from 'react'
import Image from 'next/image'
import { Advertisement } from '@/lib/adApi'
import { useAdImpression, useAdClick } from '@/hooks/useAd'

interface NativeAdProps {
  ad: Advertisement
  onImpression: () => void
  onClickTracked: () => void
  className?: string
  variant?: 'card' | 'horizontal' | 'minimal'
}

export default function NativeAd({
  ad,
  onImpression,
  onClickTracked,
  className = '',
  variant = 'card',
}: NativeAdProps) {
  const adRef = useAdImpression(ad, onImpression, {
    threshold: 0.5,
    delay: 1000,
  })
  const handleClick = useAdClick(ad, onClickTracked)

  if (!ad) return null

  const { content, link } = ad

  // Card variant - similar to blog post card
  if (variant === 'card') {
    return (
      <div
        ref={adRef}
        className={`relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}
      >
        {/* Sponsored Badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">
            Sponsored
          </span>
        </div>

        <a
          href={link.url}
          onClick={handleClick}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="block group"
        >
          {/* Image */}
          {content.imageUrl && (
            <div className="relative w-full h-48 overflow-hidden bg-gray-100">
              <Image
                src={content.imageUrl}
                alt={content.headline}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {content.headline}
            </h3>

            {content.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {content.description}
              </p>
            )}

            {content.callToAction && (
              <div className="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:text-blue-700">
                <span>{content.callToAction}</span>
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

  // Horizontal variant - inline with content
  if (variant === 'horizontal') {
    return (
      <div
        ref={adRef}
        className={`relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}
      >
        <a
          href={link.url}
          onClick={handleClick}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          className="flex gap-4 p-4 group"
        >
          {/* Image */}
          {content.imageUrl && (
            <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={content.imageUrl}
                alt={content.headline}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="128px"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Sponsored Badge */}
            <div className="mb-2">
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                Sponsored
              </span>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
              {content.headline}
            </h3>

            {content.description && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {content.description}
              </p>
            )}

            {content.callToAction && (
              <div className="flex items-center gap-1 text-blue-600 font-medium text-sm group-hover:text-blue-700">
                <span>{content.callToAction}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  // Minimal variant - text-focused
  return (
    <div
      ref={adRef}
      className={`relative p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors ${className}`}
    >
      <a
        href={link.url}
        onClick={handleClick}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className="block group"
      >
        {/* Sponsored Label */}
        <div className="mb-2">
          <span className="text-gray-500 text-xs uppercase tracking-wide">Sponsored</span>
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
          {content.headline}
        </h3>

        {content.description && (
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {content.description}
          </p>
        )}

        {content.callToAction && (
          <div className="text-blue-600 font-medium text-sm group-hover:text-blue-700">
            {content.callToAction} →
          </div>
        )}
      </a>
    </div>
  )
}
