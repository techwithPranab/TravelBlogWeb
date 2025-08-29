'use client'

import { useState } from 'react'
import { Search, Download, ExternalLink, Star, BookOpen, CreditCard, Shield, Wifi } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Sample resources data
  const resources = [
    {
      id: 1,
      title: 'Travel Insurance Comparison Guide',
      description: 'Compare top travel insurance providers and find the best coverage for your trip.',
      category: 'Insurance',
      type: 'guide',
      rating: 4.8,
      downloads: 1250,
      isPremium: false,
      url: '/resources/travel-insurance-guide.pdf',
      icon: Shield
    },
    {
      id: 2,
      title: 'Budget Travel Spreadsheet Template',
      description: 'Track your travel expenses and plan your budget with this comprehensive spreadsheet.',
      category: 'Planning',
      type: 'template',
      rating: 4.9,
      downloads: 2340,
      isPremium: false,
      url: '/resources/budget-spreadsheet.xlsx',
      icon: CreditCard
    },
    {
      id: 3,
      title: 'Ultimate Packing Checklist',
      description: 'Never forget anything again with our comprehensive packing checklist for all trip types.',
      category: 'Packing',
      type: 'checklist',
      rating: 4.7,
      downloads: 3210,
      isPremium: false,
      url: '/resources/packing-checklist.pdf',
      icon: BookOpen
    },
    {
      id: 4,
      title: 'Travel Apps Directory',
      description: 'Curated list of essential travel apps for navigation, translation, and booking.',
      category: 'Technology',
      type: 'directory',
      rating: 4.6,
      downloads: 890,
      isPremium: true,
      url: '/resources/travel-apps-directory',
      icon: Wifi
    },
    {
      id: 5,
      title: 'Visa Requirements Database',
      description: 'Comprehensive database of visa requirements for travelers from different countries.',
      category: 'Documentation',
      type: 'database',
      rating: 4.8,
      downloads: 1560,
      isPremium: true,
      url: '/resources/visa-database',
      icon: BookOpen
    },
    {
      id: 6,
      title: 'Currency Exchange Calculator',
      description: 'Real-time currency converter with historical rates and travel money tips.',
      category: 'Finance',
      type: 'tool',
      rating: 4.5,
      downloads: 720,
      isPremium: false,
      url: '/resources/currency-calculator',
      icon: CreditCard
    }
  ]

  const categories = [
    'all',
    'Planning',
    'Insurance',
    'Packing',
    'Technology',
    'Documentation',
    'Finance'
  ]

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const resourcesByCategory = categories.slice(1).map(category => ({
    name: category,
    resources: resources.filter(resource => resource.category === category)
  }))

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Travel Resources & Tools
            </h1>
            <p className="text-xl mb-8 text-indigo-100">
              Essential tools, guides, and resources to help you plan, book, and enjoy your travels with confidence.
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
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {category === 'all' ? 'All Resources' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Resource Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <resource.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium">
                      {resource.category}
                    </span>
                    {resource.isPremium && (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                        Premium
                      </span>
                    )}
                  </div>
                </div>

                {/* Resource Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {resource.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {resource.description}
                </p>

                {/* Resource Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{resource.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{resource.downloads} downloads</span>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2">
                  {resource.type === 'tool' ? (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      Use Tool
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No resources found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Resource Categories Overview */}
      {selectedCategory === 'all' && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Browse by Category</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find exactly what you need with our organized resource categories.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resourcesByCategory.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{category.name}</h3>
                  <p className="text-gray-600 mb-4">
                    {category.resources.length} resources available
                  </p>
                  <div className="space-y-2">
                    {category.resources.slice(0, 3).map((resource) => (
                      <div key={resource.id} className="text-sm text-gray-500">
                        • {resource.title}
                      </div>
                    ))}
                    {category.resources.length > 3 && (
                      <div className="text-sm text-indigo-600 font-medium">
                        +{category.resources.length - 3} more
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white"
          >
            <BookOpen className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Get New Resources First</h2>
            <p className="text-xl mb-6 text-indigo-100">
              Subscribe to our newsletter and be the first to access new travel resources and tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
