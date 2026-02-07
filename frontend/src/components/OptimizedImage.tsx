import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  fallbackSrc?: string
  showLoader?: boolean
  priority?: boolean
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto'
  sizes?: string
}

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  showLoader = true,
  priority = false,
  className = '',
  aspectRatio = 'auto',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  width,
  height,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate aspect ratio classes to prevent layout shift
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case 'video':
        return 'aspect-video'
      case 'portrait':
        return 'aspect-[3/4]'
      case 'landscape':
        return 'aspect-[4/3]'
      default:
        return ''
    }
  }

  // Generate responsive srcSet for WebP with fallback
  const generateSrcSet = (baseSrc: string) => {
    if (typeof baseSrc !== 'string') return undefined

    // For external URLs, return as-is (Next.js handles optimization)
    if (baseSrc.startsWith('http')) return undefined

    // For local images, Next.js will automatically generate responsive versions
    return undefined
  }

  return (
    <div className={`relative overflow-hidden ${getAspectRatioClass()}`}>
      {showLoader && isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm text-center p-4">
            <div className="w-12 h-12 mx-auto mb-2 opacity-50">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            Image unavailable
          </div>
        </div>
      )}

      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading && !hasError ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 object-cover`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc)
          } else {
            setHasError(true)
            setIsLoading(false)
          }
        }}
        loading={priority ? undefined : 'lazy'}
        priority={priority}
        quality={85}
        sizes={sizes}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
      />
    </div>
  )
}
