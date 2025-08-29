'use client'

import { motion } from 'framer-motion'
import { MapPin, Globe } from 'lucide-react'

export function TravelMap() {
  const destinations = [
    { id: 1, name: 'Tokyo, Japan', posts: 12, lat: 35.6762, lng: 139.6503 },
    { id: 2, name: 'Paris, France', posts: 8, lat: 48.8566, lng: 2.3522 },
    { id: 3, name: 'Bali, Indonesia', posts: 15, lat: -8.3405, lng: 115.0920 },
    { id: 4, name: 'New York, USA', posts: 6, lat: 40.7128, lng: -74.0060 },
    { id: 5, name: 'London, UK', posts: 9, lat: 51.5074, lng: -0.1278 },
    { id: 6, name: 'Sydney, Australia', posts: 7, lat: -33.8688, lng: 151.2093 },
  ]

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Globe className="h-8 w-8 text-blue-600" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Explore Our Travel Map
          </h2>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover amazing destinations through our travel stories from around the world
        </p>
      </motion.div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Map Placeholder */}
        <div className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
          <div className="text-center">
            <Globe className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Interactive Map Coming Soon
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Explore destinations with our interactive travel map
            </p>
          </div>
          
          {/* Animated destination markers */}
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="absolute"
              style={{
                left: `${20 + (index % 3) * 25}%`,
                top: `${30 + Math.floor(index / 3) * 25}%`,
              }}
            >
              <div className="relative group cursor-pointer">
                <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {destination.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {destination.posts} stories
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Destinations Grid */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Popular Destinations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-red-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {destination.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {destination.posts} stories
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
