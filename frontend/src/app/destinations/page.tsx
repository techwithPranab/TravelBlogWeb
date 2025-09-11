'use client'

import { useState, useEffect } from 'react'
import { MapPin, Star, Clock, Camera, Search } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Head from 'next/head'
import { destinationsApi, type Destination } from '@/lib/api'
import { CountryFilter } from '@/components/common/CountryFilter'

export default function DestinationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContinent, setSelectedContinent] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Generate SEO metadata for destinations page
  const generateSEOMetadata = () => {
    const title = 'Travel Destinations - Explore Amazing Places Around the World | TravelBlog'
    const description = 'Discover incredible travel destinations with detailed guides, photos, and insider tips. From hidden gems to popular hotspots, find your perfect travel destination.'
    const keywords = [
      'travel destinations',
      'places to visit',
      'travel guides',
      'destination guides',
      'travel spots',
      'vacation destinations',
      'travel locations',
      'world destinations',
      'travel planning',
      'destination reviews'
    ].join(', ')

    return { title, description, keywords }
  }

  const seoData = generateSEOMetadata()

  // Generate structured data for destinations page
  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Travel Destinations",
      "description": seoData.description,
      "url": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/destinations`,
      "mainEntity": {
        "@type": "ItemList",
        "name": "Travel Destinations",
        "description": "Curated collection of amazing travel destinations around the world"
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Destinations",
            "item": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/destinations`
          }
        ]
      }
    }

    return JSON.stringify(structuredData)
  }

  // Fetch destinations on component mount
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true)
        const response = await destinationsApi.getAll({ limit: 50, sort: '-rating' })
        
        if (response.success) {
          setDestinations(response.data)
        }
      } catch (err) {
        console.error('Error fetching destinations:', err)
        setError('Failed to load destinations. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchDestinations()
  }, [])

  // Get unique continents from destinations
  const continents = ['all', ...Array.from(new Set(destinations.map(dest => dest.continent)))]

  // Get unique countries from destinations
  const countries = Array.from(new Set(destinations.map(dest => dest.country)))

  // Filter destinations
  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesContinent = selectedContinent === 'all' || destination.continent === selectedContinent
    const matchesCountry = selectedCountry === 'all' || destination.country === selectedCountry
    return matchesSearch && matchesContinent && matchesCountry
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading destinations...</p>
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
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  return (
    <>
      <Head>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/destinations`} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/og-destinations.jpg`} />
        <meta property="og:site_name" content="TravelBlog" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/destinations`} />
        <meta property="twitter:title" content={seoData.title} />
        <meta property="twitter:description" content={seoData.description} />
        <meta property="twitter:image" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/og-destinations.jpg`} />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="TravelBlog Team" />
        <meta name="language" content="English" />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/destinations`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateStructuredData(),
          }}
        />
      </Head>

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

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Country Filter */}
              <CountryFilter
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                countries={countries}
                placeholder="All Countries"
              />

              {/* Continent Filter */}
              <div className="flex flex-wrap gap-2">
                {continents.map((continent) => (
                  <button
                    key={continent}
                    onClick={() => setSelectedContinent(continent)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedContinent === continent
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {continent === 'all' ? 'All Continents' : continent}
                  </button>
                ))}
              </div>
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
                key={destination._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Destination Image */}
                <div className="relative h-64 bg-gray-200">
                  {destination.featuredImage && (
                    <img 
                      src={destination.featuredImage.url} 
                      alt={destination.featuredImage.alt}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {destination.continent}
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
                  {destination.rating !== undefined && destination.rating !== null && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{destination.rating}</span>
                      </div>
                      <span className="text-gray-500 text-sm">({destination.totalReviews || 0} reviews)</span>
                    </div>
                  )}

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
                      <span>Best time: {destination.bestTimeToVisit}</span>
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
    </>
  )
}
