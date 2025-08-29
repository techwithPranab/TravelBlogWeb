'use client'

import { useState } from 'react'
import { MapPin, Star, Clock, Camera, Users, Search } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function DestinationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')

  // Sample destinations data
  const destinations = [
    {
      id: 1,
      name: 'Santorini, Greece',
      region: 'Europe',
      country: 'Greece',
      image: '/images/destinations/santorini.jpg',
      rating: 4.8,
      reviews: 324,
      description: 'Famous for its white-washed buildings, blue domes, and stunning sunsets over the Aegean Sea.',
      highlights: ['Sunset Views', 'Architecture', 'Wine Tasting', 'Beaches'],
      bestTime: 'April - October',
      budget: '$150-300/day',
      slug: 'santorini-greece'
    },
    {
      id: 2,
      name: 'Kyoto, Japan',
      region: 'Asia',
      country: 'Japan',
      image: '/images/destinations/kyoto.jpg',
      rating: 4.9,
      reviews: 567,
      description: 'Ancient capital filled with temples, traditional architecture, and beautiful gardens.',
      highlights: ['Temples', 'Gardens', 'Culture', 'Food'],
      bestTime: 'March - May, October - November',
      budget: '$100-200/day',
      slug: 'kyoto-japan'
    },
    {
      id: 3,
      name: 'Machu Picchu, Peru',
      region: 'South America',
      country: 'Peru',
      image: '/images/destinations/machu-picchu.jpg',
      rating: 4.7,
      reviews: 892,
      description: 'Ancient Incan citadel perched high in the Andes Mountains, one of the New Seven Wonders.',
      highlights: ['History', 'Hiking', 'Mountains', 'Culture'],
      bestTime: 'May - September',
      budget: '$80-150/day',
      slug: 'machu-picchu-peru'
    },
    {
      id: 4,
      name: 'Maldives',
      region: 'Asia',
      country: 'Maldives',
      image: '/images/destinations/maldives.jpg',
      rating: 4.9,
      reviews: 421,
      description: 'Tropical paradise with crystal-clear waters, luxury resorts, and pristine beaches.',
      highlights: ['Beaches', 'Diving', 'Luxury', 'Romance'],
      bestTime: 'November - April',
      budget: '$300-800/day',
      slug: 'maldives'
    },
    {
      id: 5,
      name: 'Iceland Ring Road',
      region: 'Europe',
      country: 'Iceland',
      image: '/images/destinations/iceland.jpg',
      rating: 4.6,
      reviews: 298,
      description: 'Dramatic landscapes featuring waterfalls, glaciers, geysers, and the Northern Lights.',
      highlights: ['Nature', 'Northern Lights', 'Waterfalls', 'Glaciers'],
      bestTime: 'June - August (summer), October - March (Northern Lights)',
      budget: '$120-250/day',
      slug: 'iceland-ring-road'
    },
    {
      id: 6,
      name: 'Bali, Indonesia',
      region: 'Asia',
      country: 'Indonesia',
      image: '/images/destinations/bali.jpg',
      rating: 4.5,
      reviews: 1024,
      description: 'Island paradise known for its temples, rice terraces, beaches, and vibrant culture.',
      highlights: ['Temples', 'Beaches', 'Culture', 'Wellness'],
      bestTime: 'April - October',
      budget: '$40-100/day',
      slug: 'bali-indonesia'
    }
  ]

  const regions = ['all', 'Asia', 'Europe', 'South America', 'Africa', 'North America', 'Oceania']

  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = selectedRegion === 'all' || destination.region === selectedRegion
    return matchesSearch && matchesRegion
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing Destinations
            </h1>
            <p className="text-xl mb-8 text-green-100">
              Explore breathtaking places around the world with our curated destination guides and travel insights.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Region Filter */}
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedRegion === region
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {region === 'all' ? 'All Regions' : region}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Destination Image */}
                <div className="relative h-64 bg-gray-200">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {destination.region}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {destination.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-white" />
                      <span className="text-white text-sm">{destination.country}</span>
                    </div>
                  </div>
                </div>

                {/* Destination Content */}
                <div className="p-6">
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{destination.rating}</span>
                    </div>
                    <span className="text-gray-500 text-sm">({destination.reviews} reviews)</span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {destination.description}
                  </p>

                  {/* Highlights */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {destination.highlights.slice(0, 3).map((highlight) => (
                        <span
                          key={highlight}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {highlight}
                        </span>
                      ))}
                      {destination.highlights.length > 3 && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          +{destination.highlights.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Travel Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Best time: {destination.bestTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Budget: {destination.budget}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/destinations/${destination.slug}`}
                      className="flex-1 bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Explore
                    </Link>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredDestinations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No destinations found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Plan Your Next Adventure</h2>
            <p className="text-xl mb-6 text-green-100">
              Get personalized travel recommendations and detailed guides for your dream destinations.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Get Travel Advice
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
