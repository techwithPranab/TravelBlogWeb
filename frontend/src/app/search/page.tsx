'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Calendar, User, ArrowLeft, Filter, MapPin, Tag, Camera, BookOpen, FileText, Image } from 'lucide-react'
import { postsApi, Post, Destination, Guide } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface UnifiedSearchResults {
  posts: { count: number; data: Post[] }
  destinations: { count: number; data: Destination[] }
  guides: { count: number; data: Guide[] }
  photos: { count: number; data: any[] }
  total: number
}

// Separate component that uses useSearchParams
function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UnifiedSearchResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      performSearch(q)
    }
  }, [searchParams])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await postsApi.unifiedSearch(searchQuery)
      console.log('Unified search response:', response)
      setResults(response.data)
    } catch (error) {
      console.error('Search error:', error)
      setError('Failed to perform search. Please try again.')
      toast.error('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', query)
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'blue': 'bg-blue-100 text-blue-800',
      'green': 'bg-green-100 text-green-800',
      'purple': 'bg-purple-100 text-purple-800',
      'red': 'bg-red-100 text-red-800',
      'yellow': 'bg-yellow-100 text-yellow-800',
      'indigo': 'bg-indigo-100 text-indigo-800',
      'pink': 'bg-pink-100 text-pink-800',
      'gray': 'bg-gray-100 text-gray-800'
    }
    return colorMap[color] || 'bg-gray-100 text-gray-800'
  }

  const renderPostsSection = () => {
    if (!results?.posts.data.length) return null

    return (
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Blog Posts ({results.posts.count})
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.posts.data.map((post, index) => (
            <motion.article
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {post.featuredImage && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-6">
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.categories.slice(0, 2).map((category) => (
                      <Link
                        key={category._id}
                        href={`/blog?category=${category.slug}`}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category.color)} hover:opacity-80 transition-opacity`}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{post.author?.name || 'Unknown Author'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{post.readTime} min read</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    )
  }

  const renderDestinationsSection = () => {
    if (!results?.destinations.data.length) return null

    return (
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Destinations ({results.destinations.count})
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.destinations.data.map((destination, index) => (
            <motion.article
              key={destination._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {destination.featuredImage && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={destination.featuredImage.url}
                    alt={destination.featuredImage.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  <Link
                    href={`/destinations/${destination.slug}`}
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {destination.name}
                  </Link>
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {destination.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{destination.country}, {destination.continent}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>⭐ {destination.rating} ({destination.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    )
  }

  const renderGuidesSection = () => {
    if (!results?.guides.data.length) return null

    return (
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Travel Guides ({results.guides.count})
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.guides.data.map((guide, index) => (
            <motion.article
              key={guide._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {guide.featuredImage && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={guide.featuredImage.url}
                    alt={guide.featuredImage.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {guide.title}
                  </Link>
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {guide.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {guide.type}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {guide.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>⭐ {guide.rating} ({guide.totalReviews})</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    )
  }

  const renderPhotosSection = () => {
    if (!results?.photos.data.length) return null

    return (
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Camera className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Photos ({results.photos.count})
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {results.photos.data.map((photo, index) => (
            <motion.article
              key={photo._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={photo.thumbnailUrl || photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                  {photo.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                  {photo.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{photo.category}</span>
                  <span>{photo.location?.country}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-max px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
              Search Results
            </h1>
            <div></div> {/* Spacer */}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destinations, travel tips, guides, photos..."
                className="w-full pl-12 pr-4 py-3 text-lg rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                disabled={isLoading}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="container-max px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Search Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <Button onClick={() => performSearch(query)}>
              Try Again
            </Button>
          </div>
        ) : hasSearched && results && results.total === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No results found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search terms or browse our categories below.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/blog?category=destinations">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors">
                  Destinations
                </span>
              </Link>
              <Link href="/blog?category=travel-tips">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors">
                  Travel Tips
                </span>
              </Link>
              <Link href="/photography">
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm hover:bg-orange-200 transition-colors">
                  Photography
                </span>
              </Link>
            </div>
          </div>
        ) : results && results.total > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Found {results.total} result{results.total !== 1 ? 's' : ''} for "{query}"
              </p>
            </div>

            {renderPostsSection()}
            {renderDestinationsSection()}
            {renderGuidesSection()}
            {renderPhotosSection()}
          </>
        ) : hasSearched ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Start your search
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter a search term above to find travel stories, destinations, guides, and photos.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// Fallback component for suspense
function SearchPageFallback() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Searching...</p>
      </div>
    </div>
  )
}

// Main export with Suspense wrapper
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageContent />
    </Suspense>
  )
}
