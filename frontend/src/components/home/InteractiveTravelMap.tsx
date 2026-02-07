'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps'
import { MapPin, Camera, Calendar, ExternalLink, X, ZoomIn, ZoomOut } from 'lucide-react'
import { publicApi } from '@/lib/api'

// World map topology data URL
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

interface TravelLocation {
  id: string
  name: string
  country: string
  coordinates: [number, number] // [lng, lat]
  description: string
  photos: string[]
  visitDate: string
  highlights: string[]
  blogPost?: string
  posts?: Array<{
    id: string
    title: string
    slug: string
    excerpt: string
    featuredImage?: {
      url: string
      alt: string
      caption?: string
    }
    publishedAt: string
    viewCount: number
  }>
  totalPosts?: number
  totalViews?: number
}

export function InteractiveTravelMap() {
  const [travelLocations, setTravelLocations] = useState<TravelLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<TravelLocation | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchTravelLocations = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await publicApi.getTravelLocations()
        setTravelLocations(response.data)
      } catch (error) {
        console.error('Error fetching travel locations:', error)
        setError('Failed to load travel locations')
      } finally {
        setLoading(false)
      }
    }

    fetchTravelLocations()
  }, [])

  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom * 1.5, 8)) // Max zoom of 8x
  }

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom / 1.5, 0.5)) // Min zoom of 0.5x
  }

  const closeModal = () => {
    setSelectedLocation(null)
  }

  // Don't render the map if there are no locations
  if (!loading && travelLocations.length === 0 && !error) {
    return null
  }

  if (loading) {
    return (
      <div className="animate-fade-up">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-4">
            Global Travel Destinations Map
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Loading travel destinations...
          </p>
        </div>
        <div className="relative rounded-lg overflow-hidden shadow-lg bg-gradient-to-b from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fade-up">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-4">
            Global Travel Destinations Map
          </h2>
          <p className="text-lg text-red-500 dark:text-red-400">
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-6">
            Global Travel Destinations Map
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Explore our comprehensive collection of destination guides and travel stories. Click on any location to discover authentic reviews, practical tips, and insider recommendations from experienced travelers worldwide.
          </p>
        </motion.div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          ref={mapRef}
          className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-gray-200/50 dark:border-gray-700/50 mb-16"
        >
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 shadow-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 shadow-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 120,
            center: [0, 20]
          }}
          width={800}
          height={300}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup zoom={zoom} center={[0, 20]} onMoveEnd={({ zoom: newZoom }) => setZoom(newZoom)}>
            <Geographies geography={geoUrl}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#EAEAEC"
                    stroke="#D6D6DA"
                    strokeWidth={0.5}
                    style={{
                      default: {
                        fill: "#EAEAEC",
                        stroke: "#D6D6DA",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      hover: {
                        fill: "#F53",
                        stroke: "#D6D6DA",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      pressed: {
                        fill: "#E42",
                        stroke: "#D6D6DA",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Location Markers */}
            {travelLocations.map((location) => (
              <Marker
                key={location.id}
                coordinates={[location.coordinates[0], location.coordinates[1]]}
              >
                <motion.g
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredLocation(location.id)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  onClick={() => setSelectedLocation(location)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <circle
                    r={8}
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth={2}
                    className="drop-shadow-lg"
                  />
                  <circle
                    r={8}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth={2}
                    className="animate-ping opacity-75"
                  />
                  <MapPin
                    className="w-4 h-4 text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    fill="currentColor"
                  />
                </motion.g>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip */}
        {hoveredLocation && (
          <div className="absolute top-4 left-4 bg-black text-white px-3 py-2 rounded-lg text-sm z-10">
            {travelLocations.find(loc => loc.id === hoveredLocation)?.name},{' '}
            {travelLocations.find(loc => loc.id === hoveredLocation)?.country}
          </div>
        )}
        </motion.div>

        {/* Location Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {travelLocations.map((location) => (
            <motion.div
              key={location.id}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer"
              onClick={() => setSelectedLocation(location)}
              whileHover={{ y: -4 }}
            >
              <div className="p-8 h-full">
                {/* Location icon */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <MapPin className="w-6 h-6 text-white" fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {location.name}
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {location.country}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-base mb-6 leading-relaxed">
                  {location.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{location.visitDate}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <Camera className="w-4 h-4" />
                      <span>{location.photos?.length || 0}</span>
                    </div>
                  </div>
                  {location.totalPosts && (
                    <div className="text-blue-600 dark:text-blue-400 font-semibold">
                      {location.totalPosts} posts
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Location Detail Modal */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedLocation.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedLocation.country}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photos */}
              {selectedLocation.photos && selectedLocation.photos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Photos
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLocation.photos.slice(0, 4).map((photo, index) => (
                      <div
                        key={photo || index}
                        className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden"
                      >
                        {photo ? (
                          <img
                            src={photo}
                            alt={`${selectedLocation.name} photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <Camera className="w-8 h-8 text-gray-400" />
                            <span className="ml-2 text-sm text-gray-500">Photo</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blog Posts */}
              {selectedLocation.posts && selectedLocation.posts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Related Blog Posts ({selectedLocation.totalPosts})
                  </h3>
                  <div className="space-y-3">
                    {selectedLocation.posts.slice(0, 3).map((post) => (
                      <a
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {post.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                          <span>{post.viewCount} views</span>
                        </div>
                      </a>
                    ))}
                    {selectedLocation.posts.length > 3 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        And {selectedLocation.posts.length - 3} more posts...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  About this destination
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedLocation.description}
                </p>
              </div>

              {/* Highlights */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Highlights
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedLocation.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visit Date and Stats */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Latest visit: {selectedLocation.visitDate}</span>
                </div>
                {selectedLocation.totalViews && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total views: {selectedLocation.totalViews.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedLocation.blogPost && (
                  <a
                    href={selectedLocation.blogPost}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>Read Story</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {selectedLocation.posts && selectedLocation.posts.length > 1 && (
                  <a
                    href={`/blog?location=${encodeURIComponent(selectedLocation.name)}`}
                    className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span>View All Posts</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
