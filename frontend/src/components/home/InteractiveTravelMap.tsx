'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Camera, Calendar, ExternalLink, X } from 'lucide-react'

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
}

// Sample travel locations data
const travelLocations: TravelLocation[] = [
  {
    id: '1',
    name: 'Tokyo',
    country: 'Japan',
    coordinates: [139.6917, 35.6895],
    description: 'Amazing blend of traditional and modern culture, incredible food scene.',
    photos: ['/images/destinations/tokyo-1.jpg', '/images/destinations/tokyo-2.jpg'],
    visitDate: 'March 2024',
    highlights: ['Shibuya Crossing', 'Tsukiji Fish Market', 'Sensoji Temple', 'Tokyo Skytree'],
    blogPost: '/blog/tokyo-travel-guide'
  },
  {
    id: '2',
    name: 'Paris',
    country: 'France',
    coordinates: [2.3522, 48.8566],
    description: 'City of lights with incredible architecture, art, and cuisine.',
    photos: ['/images/destinations/paris-1.jpg'],
    visitDate: 'June 2023',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Champs-Élysées'],
    blogPost: '/blog/paris-photography-guide'
  },
  {
    id: '3',
    name: 'Bali',
    country: 'Indonesia',
    coordinates: [115.0920, -8.4095],
    description: 'Tropical paradise with beautiful beaches, temples, and rice terraces.',
    photos: ['/images/destinations/bali-1.jpg'],
    visitDate: 'September 2023',
    highlights: ['Uluwatu Temple', 'Rice Terraces', 'Ubud Monkey Forest', 'Kuta Beach']
  },
  {
    id: '4',
    name: 'New York',
    country: 'USA',
    coordinates: [-74.0060, 40.7128],
    description: 'The city that never sleeps, iconic skyline and endless entertainment.',
    photos: ['/images/destinations/nyc-1.jpg'],
    visitDate: 'October 2023',
    highlights: ['Central Park', 'Statue of Liberty', 'Times Square', 'Brooklyn Bridge']
  },
  {
    id: '5',
    name: 'Iceland',
    country: 'Iceland',
    coordinates: [-19.0208, 64.9631],
    description: 'Land of fire and ice with stunning waterfalls and northern lights.',
    photos: ['/images/destinations/iceland-1.jpg'],
    visitDate: 'February 2024',
    highlights: ['Blue Lagoon', 'Gullfoss Waterfall', 'Northern Lights', 'Geysir']
  }
]

export function InteractiveTravelMap() {
  const [selectedLocation, setSelectedLocation] = useState<TravelLocation | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  // Simple coordinate to pixel conversion for demo purposes
  const coordinateToPixel = (coordinates: [number, number], mapWidth: number, mapHeight: number) => {
    // Simple projection (not geographically accurate, just for demo)
    const [lng, lat] = coordinates
    const x = ((lng + 180) / 360) * mapWidth
    const y = ((90 - lat) / 180) * mapHeight
    return { x, y }
  }

  const closeModal = () => {
    setSelectedLocation(null)
  }

  return (
    <div className="animate-fade-up">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Interactive Travel Map
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Explore destinations I've visited around the world
        </p>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef}
        className="relative bg-gradient-to-b from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 rounded-lg overflow-hidden"
        style={{ height: '500px' }}
      >
        {/* World Map Background */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 1000 500" className="w-full h-full">
            {/* Simplified world map shapes */}
            <path
              d="M150,200 L200,180 L280,200 L320,240 L280,280 L200,260 L150,240 Z"
              fill="currentColor"
              className="text-gray-600"
            />
            <path
              d="M400,150 L500,130 L600,150 L650,200 L600,250 L500,230 L400,200 Z"
              fill="currentColor"
              className="text-gray-600"
            />
            <path
              d="M700,180 L800,160 L850,200 L800,240 L700,220 Z"
              fill="currentColor"
              className="text-gray-600"
            />
          </svg>
        </div>

        {/* Location Pins */}
        {travelLocations.map((location) => {
          const position = coordinateToPixel(location.coordinates, 1000, 500)
          return (
            <motion.button
              key={location.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 ${
                hoveredLocation === location.id ? 'scale-125' : 'scale-100'
              }`}
              style={{ 
                left: `${position.x / 10}%`, 
                top: `${position.y / 5}%` 
              }}
              onMouseEnter={() => setHoveredLocation(location.id)}
              onMouseLeave={() => setHoveredLocation(null)}
              onClick={() => setSelectedLocation(location)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="relative">
                <MapPin className="w-8 h-8 text-red-500 drop-shadow-lg" fill="currentColor" />
                {/* Pulse animation */}
                <div className="absolute inset-0 animate-ping">
                  <MapPin className="w-8 h-8 text-red-300 opacity-75" />
                </div>
                
                {/* Location tooltip */}
                {hoveredLocation === location.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
                  >
                    {location.name}, {location.country}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                  </motion.div>
                )}
              </div>
            </motion.button>
          )
        })}

        {/* Travel Routes (simplified) */}
        <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 1000 500">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Example route lines */}
          <path
            d="M200,300 Q400,200 600,280"
            stroke="url(#routeGradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="10,5"
            className="animate-pulse"
          />
          <path
            d="M600,280 Q700,250 750,300"
            stroke="url(#routeGradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="10,5"
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Location Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {travelLocations.map((location) => (
          <motion.div
            key={location.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedLocation(location)}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {location.name}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {location.country}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {location.description}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{location.visitDate}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Camera className="w-4 h-4" />
                <span>{location.photos.length} photos</span>
              </div>
            </div>
          </motion.div>
        ))}
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
            onClick={(e) => e.stopPropagation()}
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
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  {selectedLocation.photos.map((photo) => (
                    <div
                      key={photo}
                      className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                    >
                      <Camera className="w-8 h-8 text-gray-400" />
                      <span className="ml-2 text-sm text-gray-500">Photo</span>
                    </div>
                  ))}
                </div>
              </div>

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

              {/* Visit Date */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Visited in {selectedLocation.visitDate}</span>
                </div>
              </div>

              {/* Blog Post Link */}
              {selectedLocation.blogPost && (
                <div>
                  <a
                    href={selectedLocation.blogPost}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <span>Read Full Story</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
