'use client'

import { useState, useEffect } from 'react'
import { Search, BookOpen, Star, Eye, Filter, MapPin, User, Calendar } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { guidesApi, type Guide } from '@/lib/api'

export default function GuidesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch guides on component mount
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true)
        const response = await guidesApi.getAll({ limit: 50, sort: '-publishedAt' })
        
        if (response.success) {
          setGuides(response.data)
        }
      } catch (err) {
        console.error('Error fetching guides:', err)
        setError('Failed to load guides. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchGuides()
  }, [])

  // Get unique types and difficulties from guides
  const types = ['all', ...Array.from(new Set(guides.map(guide => guide.type)))]
  const difficulties = ['all', 'Easy', 'Moderate', 'Challenging']

  // Filter guides
  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || guide.type === selectedType
    const matchesDifficulty = selectedDifficulty === 'all' || guide.difficulty === selectedDifficulty
    return matchesSearch && matchesType && matchesDifficulty
  })

  const formatDuration = (duration: string | { days: number; description: string }) => {
    if (typeof duration === 'string') {
      return duration
    }
    if (typeof duration === 'object' && duration.days) {
      return duration.description || `${duration.days} days`
    }
    return 'N/A'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading travel guides...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Travel Guides & Itineraries
            </h1>
            <p className="text-xl mb-8 text-orange-100">
              Comprehensive travel guides, detailed itineraries, and expert tips to help you plan your perfect trip.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGuides.map((guide, index) => (
              <motion.div
                key={guide._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Guide Image */}
                <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {guide.type}
                    </span>
                    {guide.isFeatured && (
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4">
                    {(() => {
                      let difficultyClass = '';
                      if (guide.difficulty === 'Easy') {
                        difficultyClass = 'bg-green-100 text-green-700';
                      } else if (guide.difficulty === 'Moderate') {
                        difficultyClass = 'bg-yellow-100 text-yellow-700';
                      } else {
                        difficultyClass = 'bg-red-100 text-red-700';
                      }
                      return (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyClass}`}>
                          {guide.difficulty}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <BookOpen className="h-8 w-8 text-white mb-2" />
                  </div>
                </div>

                {/* Guide Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {guide.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {guide.description}
                  </p>

                  {/* Guide Meta */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{guide.destination?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{guide.author?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDuration(guide.duration)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{(guide.views || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>{(guide.likes || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="text-orange-600 font-medium">
                      {guide.budget ? `${guide.budget.currency} ${guide.budget.amount}` : 'N/A'}
                    </span>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="block w-full bg-orange-600 text-white text-center py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    View Guide
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredGuides.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No guides found matching your criteria.</p>
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
            className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Create Your Custom Itinerary</h2>
            <p className="text-xl mb-6 text-orange-100">
              Get personalized travel itineraries crafted by our expert travel writers.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-white text-orange-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Get Custom Guide
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
