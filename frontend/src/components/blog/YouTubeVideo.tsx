'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

interface YouTubeVideoProps {
  video: {
    id: string
    title: string
    url: string
    description?: string
    order: number
  }
}

// Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

export default function YouTubeVideo({ video }: YouTubeVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const videoId = getYouTubeVideoId(video.url)

  if (!videoId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">Invalid YouTube URL: {video.url}</p>
      </div>
    )
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="relative aspect-video bg-gray-900">
        {!isLoaded ? (
          <button
            onClick={() => setIsLoaded(true)}
            className="absolute inset-0 w-full h-full group cursor-pointer"
            aria-label={`Play video: ${video.title}`}
          >
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to standard quality thumbnail if maxres not available
                const target = e.target as HTMLImageElement
                target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              }}
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          </button>
        ) : (
          <iframe
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </div>
  )
}
