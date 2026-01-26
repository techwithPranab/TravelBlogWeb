'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { ItineraryReview } from '@/types'
import { Itinerary } from '@/types/itinerary'
import {
  Star,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Calendar,
  ThumbsUp,
  Filter,
  Plus,
  MapPin,
  Search
} from 'lucide-react'
import ReviewForm from '@/components/itinerary/ReviewForm'
import { getUserReviews, deleteReview, createReview } from '@/lib/reviewsApi'
import { getUserItineraries } from '@/lib/itineraryApi'

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected'

export default function ReviewsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<ItineraryReview[]>([])
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [showAddReview, setShowAddReview] = useState(false)
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadData()
  }, [isAuthenticated, router, filter])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Fetch reviews
      const reviewsResponse = await getUserReviews(filter === 'all' ? undefined : filter)
      if (reviewsResponse?.success && reviewsResponse.data) {
        setReviews(reviewsResponse.data)
      } else {
        setReviews([])
      }

      // Fetch itineraries (don't fail if this fails)
      try {
        const itinerariesResponse = await getUserItineraries()
        if (itinerariesResponse?.success && itinerariesResponse.data) {
          setItineraries(itinerariesResponse.data)
        }
      } catch (itinErr) {
        console.error('Error loading itineraries:', itinErr)
        // Don't set error state for itineraries failure
      }
    } catch (err) {
      setError('Failed to load reviews')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return
    }

    try {
      const response = await deleteReview(reviewId)

      if (response.success) {
        setReviews(prev => prev.filter(review => review._id !== reviewId))
      }
    } catch (err) {
      console.error('Error deleting review:', err)
    }
  }

  const handleAddReview = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary)
    setShowAddReview(true)
  }

  const handleReviewSubmitted = async (reviewData: any) => {
    try {
      const response = await createReview(reviewData)
      
      if (response.success) {
        setShowAddReview(false)
        setSelectedItinerary(null)
        loadData() // Reload reviews to show the new pending review
      } else {
        alert(`Failed to submit review: ${response.message || 'Unknown error'}`)
      }
    } catch (err: any) {
      console.error('ReviewsPage: Error creating review:', err)
      alert(`Error submitting review: ${err.message || 'Unknown error'}`)
    }
  }

  const filteredReviews = reviews

  const filteredItineraries = itineraries.filter(itinerary =>
    itinerary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    itinerary.destinations.some(dest => dest.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Published'
      case 'pending':
        return 'Under Review'
      case 'rejected':
        return 'Rejected'
      default:
        return status
    }
  }

  // Safely derive the itinerary label for a review. Backend may return either a string id
  // or a populated itinerary object (when using .populate()). Handle both.
  const getItineraryLabel = (review: ItineraryReview) => {
    const idOrObj = review.itineraryId as any
    if (!idOrObj) return 'N/A'
    if (typeof idOrObj === 'string') return `#${idOrObj.slice(-6)}`
    if (idOrObj.title) return idOrObj.title

    // Try id property or toString fallback (handles ObjectId instances)
    const id = idOrObj._id ?? (typeof idOrObj.toString === 'function' ? idOrObj.toString() : undefined)
    if (id) return `#${String(id).slice(-6)}`
    return 'N/A'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container-max px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container-max px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Reviews</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your itinerary reviews and feedback</p>
        </div>

        {/* Add Review Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Review</h2>
            <button
              onClick={() => setShowAddReview(!showAddReview)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddReview ? 'Cancel' : 'Add Review'}</span>
            </button>
          </div>

          {showAddReview && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Itineraries
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by title or destination..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {filteredItineraries.map((itinerary) => (
                  <div
                    key={itinerary._id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{itinerary.title}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{itinerary.destinations.join(', ')}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{itinerary.duration} days</span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddReview(itinerary)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Review This
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* My Reviews Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Reviews</h2>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterStatus)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Reviews</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reviews yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start by reviewing one of your itineraries</p>
              <button
                onClick={() => setShowAddReview(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add Your First Review
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          for Itinerary {getItineraryLabel(review)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(review.createdAt)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(review.status)}
                          <span>{getStatusText(review.status)}</span>
                        </span>
                        {review.helpfulCount > 0 && (
                          <span className="flex items-center space-x-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{review.helpfulCount} helpful</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Review Modal */}
        {showAddReview && selectedItinerary && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                Review: {selectedItinerary.title}
              </h3>
              <ReviewForm
                itineraryId={selectedItinerary._id}
                itineraryTitle={selectedItinerary.title}
                onSubmit={handleReviewSubmitted}
                onCancel={() => {
                  setShowAddReview(false)
                  setSelectedItinerary(null)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
