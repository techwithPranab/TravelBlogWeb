'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { ItineraryReview } from '@/types'
import {
  Star,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Calendar,
  ThumbsUp,
  Filter,
  Plus
} from 'lucide-react'
import ReviewForm from '@/components/itinerary/ReviewForm'
import { getUserReviews, updateReview, deleteReview } from '@/lib/reviewsApi'

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected'

export default function MyReviewsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [reviews, setReviews] = useState<ItineraryReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [editingReview, setEditingReview] = useState<ItineraryReview | null>(null)
  const [deletingReview, setDeletingReview] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchMyReviews()
  }, [isAuthenticated, router])

  const fetchMyReviews = async () => {
    try {
      setLoading(true)
      const response = await getUserReviews()

      if (response.success && response.data) {
        setReviews(response.data)
      } else {
        setError('Failed to load reviews')
      }
    } catch (err) {
      setError('Failed to load reviews')
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateReview = async (reviewId: string, updateData: any) => {
    try {
      const response = await updateReview(reviewId, updateData)

      if (response.success && response.data) {
        setReviews(prev => prev.map(review =>
          review._id === reviewId ? (response.data as ItineraryReview) : review
        ))
        setEditingReview(null)
      }
    } catch (err) {
      console.error('Error updating review:', err)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingReview(reviewId)
      const response = await deleteReview(reviewId)

      if (response.success) {
        setReviews(prev => prev.filter(review => review._id !== reviewId))
      }
    } catch (err) {
      console.error('Error deleting review:', err)
    } finally {
      setDeletingReview(null)
    }
  }

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true
    return review.status === filter
  })

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getStats = () => {
    const total = reviews.length
    const approved = reviews.filter(r => r.status === 'approved').length
    const pending = reviews.filter(r => r.status === 'pending').length
    const rejected = reviews.filter(r => r.status === 'rejected').length
    const totalHelpful = reviews.reduce((sum, r) => sum + r.helpfulCount, 0)

    return { total, approved, pending, rejected, totalHelpful }
  }

  const stats = getStats()

  // Helper to get itinerary label (title or short id)
  const getItineraryLabel = (review: ItineraryReview) => {
    const idOrObj: any = review.itineraryId
    if (!idOrObj) return 'N/A'
    if (typeof idOrObj === 'string') return `#${idOrObj.slice(-6)}`
    if (idOrObj.title) return idOrObj.title

    const id = idOrObj._id ?? (typeof idOrObj.toString === 'function' ? idOrObj.toString() : undefined)
    if (id) return `#${String(id).slice(-6)}`
    return 'N/A'
  }

  const getItineraryId = (review: ItineraryReview) => {
    const idOrObj: any = review.itineraryId
    if (!idOrObj) return ''
    return typeof idOrObj === 'string' ? idOrObj : String(idOrObj._id ?? (typeof idOrObj.toString === 'function' ? idOrObj.toString() : ''))
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">My Reviews</h1>
          <p className="text-gray-600">Manage your itinerary reviews and feedback</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ThumbsUp className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Helpful Votes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHelpful}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Filter by status:</span>
            <div className="flex gap-2">
              {(['all', 'approved', 'pending', 'rejected'] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All Reviews' : getStatusText(status)}
                  ({status === 'all' ? stats.total : stats[status as keyof typeof stats]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No reviews yet' : `No ${filter} reviews`}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? 'Start sharing your travel experiences by reviewing itineraries!'
                : `You don't have any ${filter} reviews.`
              }
            </p>
            <button
              onClick={() => router.push('/itinerary')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Browse Itineraries
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-lg font-medium">{review.rating}/5</span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(review.status)}
                        <span className={`text-sm font-medium ${
                          review.status === 'approved' ? 'text-green-600' :
                          review.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {getStatusText(review.status)}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {review.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Review for: <span className="font-medium">{getItineraryLabel(review)}</span>
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(review.reviewDate)}
                      </div>
                      {review.tripDate && (
                        <span>Trip: {formatDate(review.tripDate)}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {review.helpfulCount} helpful
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {review.comment}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    {review.status === 'pending' || review.status === 'rejected' ? (
                      <button
                        onClick={() => setEditingReview(review)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    ) : null}
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      disabled={deletingReview === review._id}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingReview === review._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>

                  {review.status === 'rejected' && review.rejectionReason && (
                    <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-md">
                      <strong>Rejection reason:</strong> {review.rejectionReason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Review Modal */}
        {editingReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Review</h2>
                <ReviewForm
                  itineraryId={getItineraryId(editingReview)}
                  itineraryTitle={getItineraryLabel(editingReview)} // Use the actual title when available
                  onSubmit={async (data) => {
                    await handleUpdateReview(editingReview._id, data)
                  }}
                  onCancel={() => setEditingReview(null)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
