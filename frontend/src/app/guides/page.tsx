'use client'

import { useState } from 'react'
import { Search, BookOpen, Clock, Star, Download, Eye, Filter } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function GuidesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  // Sample guides data
  const guides = [
    {
      id: 1,
      title: 'Complete Guide to Solo Travel in Southeast Asia',
      description: 'Everything you need to know for your first solo adventure in Thailand, Vietnam, and Cambodia.',
      category: 'Solo Travel',
      difficulty: 'Beginner',
      readTime: '15 min read',
      downloads: 2340,
      views: 15670,
      rating: 4.8,
      image: '/images/guides/solo-asia.jpg',
      isPremium: false,
      slug: 'solo-travel-southeast-asia'
    },
    {
      id: 2,
      title: 'Budget Backpacking Europe: Complete 30-Day Itinerary',
      description: 'Detailed 30-day itinerary covering 12 countries with budget breakdowns and accommodation tips.',
      category: 'Budget Travel',
      difficulty: 'Intermediate',
      readTime: '25 min read',
      downloads: 4560,
      views: 28930,
      rating: 4.9,
      image: '/images/guides/europe-budget.jpg',
      isPremium: true,
      slug: 'budget-backpacking-europe'
    },
    {
      id: 3,
      title: 'Digital Nomad Starter Kit: Work & Travel Guide',
      description: 'Complete guide to becoming a digital nomad, including visa info, best destinations, and tools.',
      category: 'Digital Nomad',
      difficulty: 'Beginner',
      readTime: '20 min read',
      downloads: 3210,
      views: 19450,
      rating: 4.7,
      image: '/images/guides/digital-nomad.jpg',
      isPremium: false,
      slug: 'digital-nomad-starter-kit'
    },
    {
      id: 4,
      title: 'Adventure Photography: Capture Your Travels',
      description: 'Professional tips for taking stunning travel photos with any camera, from phone to DSLR.',
      category: 'Photography',
      difficulty: 'Intermediate',
      readTime: '18 min read',
      downloads: 1890,
      views: 12340,
      rating: 4.6,
      image: '/images/guides/photography.jpg',
      isPremium: true,
      slug: 'adventure-photography'
    },
    {
      id: 5,
      title: 'Family Travel Planning: Ultimate Guide',
      description: 'Plan amazing family vacations with kids of all ages, including packing lists and activities.',
      category: 'Family Travel',
      difficulty: 'Beginner',
      readTime: '22 min read',
      downloads: 2780,
      views: 16820,
      rating: 4.8,
      image: '/images/guides/family-travel.jpg',
      isPremium: false,
      slug: 'family-travel-planning'
    },
    {
      id: 6,
      title: 'Extreme Adventure Travel Safety Guide',
      description: 'Essential safety protocols for extreme sports and adventure activities worldwide.',
      category: 'Adventure',
      difficulty: 'Advanced',
      readTime: '30 min read',
      downloads: 1450,
      views: 8900,
      rating: 4.9,
      image: '/images/guides/extreme-adventure.jpg',
      isPremium: true,
      slug: 'extreme-adventure-safety'
    }
  ]

  const categories = [
    'all',
    'Solo Travel',
    'Budget Travel',
    'Digital Nomad',
    'Photography',
    'Family Travel',
    'Adventure'
  ]

  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced']

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || guide.difficulty === selectedDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  })

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
              Travel Guides & Resources
            </h1>
            <p className="text-xl mb-8 text-orange-100">
              Comprehensive travel guides, detailed itineraries, and practical resources to help you plan your perfect adventure.
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
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
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
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Guide Image */}
                <div className="relative h-48 bg-gray-200">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {guide.category}
                    </span>
                    {guide.isPremium && (
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Premium
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4">
                    {(() => {
                      let difficultyClass = '';
                      if (guide.difficulty === 'Beginner') {
                        difficultyClass = 'bg-green-100 text-green-700';
                      } else if (guide.difficulty === 'Intermediate') {
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
                </div>

                {/* Guide Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {guide.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {guide.description}
                  </p>

                  {/* Guide Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{guide.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{guide.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Download Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{guide.downloads.toLocaleString()} downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{guide.views.toLocaleString()} views</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="flex-1 bg-orange-600 text-white text-center py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                    >
                      Read Guide
                    </Link>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <BookOpen className="h-4 w-4" />
                    </button>
                  </div>
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

      {/* Featured Guide CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-center text-white"
          >
            <BookOpen className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Want More In-Depth Guides?</h2>
            <p className="text-xl mb-6 text-orange-100">
              Get access to our premium travel guides with detailed itineraries, budget breakdowns, and insider tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                View Premium Guides
              </button>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-orange-600 transition-colors"
              >
                Request Custom Guide
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
