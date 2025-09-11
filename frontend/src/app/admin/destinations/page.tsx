'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Plus,
  MapPin,
  Globe,
  Calendar
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'

interface Destination {
  _id: string
  name: string
  slug: string
  description: string
  country: string
  region: string
  difficulty: string
  isPopular: boolean
  isFeatured: boolean
  createdAt: string
}

export default function AdminDestinationsPage() {
  const router = useRouter()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updating, setUpdating] = useState<string | null>(null)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800'
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  const fetchDestinations = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getDestinations({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined
      }) as any

      if (response.success) {
        setDestinations(response.data)
        setTotalPages(response.pagination?.pages || 1)
      }
    } catch (err) {
      console.error('Destinations fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load destinations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDestinations()
  }, [currentPage])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchDestinations()
  }

  const handleDelete = async (destinationId: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) return

    try {
      setUpdating(destinationId)
      const response = await adminApi.deleteDestination(destinationId) as any
      
      if (response.success) {
        setDestinations(destinations.filter(dest => dest._id !== destinationId))
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete destination')
    } finally {
      setUpdating(null)
    }
  }

  if (loading && destinations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Destinations</h1>
          <p className="text-gray-600 mt-1">Manage travel destinations</p>
        </div>
        <button 
          onClick={() => router.push('/admin/destinations/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Destination
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((destination, index) => (
          <motion.div
            key={destination._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{destination.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{destination.country}</span>
                    <span>•</span>
                    <span>{destination.region}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{destination.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(destination.difficulty)}`}>
                  {destination.difficulty}
                </span>
                {destination.isFeatured && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Featured
                  </span>
                )}
                {destination.isPopular && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Popular
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(destination.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>{destination.slug}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => router.push(`/admin/destinations/${destination._id}/edit`)}
                  className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(destination._id)}
                  disabled={updating === destination._id}
                  className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {destinations.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No destinations found.</p>
        </div>
      )}
    </div>
  )
}
