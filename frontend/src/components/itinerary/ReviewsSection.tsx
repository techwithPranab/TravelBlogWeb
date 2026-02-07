'use client'

import React, { useState, useEffect } from 'react'
import { ItineraryReview, CreateReviewData } from '@/types'
import { Star, ThumbsUp, User, Calendar, CheckCircle, Clock, AlertCircle, MessageSquare, Plus } from 'lucide-react'
import ReviewForm from './ReviewForm'
import { getItineraryReviews, markReviewHelpful, createReview } from '@/lib/reviewsApi'

interface ReviewsSectionProps {
  itineraryId: string
  itineraryTitle: string
  showWriteReview?: boolean
}

interface ReviewsResponse {
  success: boolean
  data?: ItineraryReview[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function ReviewsSection({ itineraryId, itineraryTitle, showWriteReview = true }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ItineraryReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [helpfulLoading, setHelpfulLoading] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const fetchReviews = async (pageNum: number = 1) => {
    try {
      setLoading(true)
      const response = await getItineraryReviews(itineraryId, pageNum, 10)
        console.log('Fetched reviews:', response);
      if (response.success && response.data) {
        if (pageNum === 1) {
          setReviews(response.data)
        } else {
          setReviews(prev => [...prev, ...(response.data || [])])
        }
        setHasMore(response.pagination ? pageNum < response.pagination.pages : false)
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

  const markHelpful = async (reviewId: string) => {
    try {
      setHelpfulLoading(reviewId)
      const response = await markReviewHelpful(reviewId)

      if (response.success && response.data) {
        setReviews(prev => prev.map(review =>
          review._id === reviewId ? (response.data as ItineraryReview) : review
        ))
      }
    } catch (err) {
      console.error('Error marking review as helpful:', err)
    } finally {
      setHelpfulLoading(null)
    }
  }

  const handleReviewSubmit = async (reviewData: CreateReviewData) => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('ReviewsSection: No authentication token found')
      alert('You must be logged in to submit a review')
      return
    }
    
    try {
      const response = await createReview(reviewData)

      if (response.success && response.data) {
        // Add the new review to the list (it will be pending approval)
        setReviews(prev => [response.data as ItineraryReview, ...prev])
        setShowReviewForm(false)
        // Refresh reviews to get updated list
        fetchReviews(1)
      } else {
        alert(`Failed to submit review: ${response.message || 'Unknown error'}`)
      }
    } catch (err: any) {
      console.error('ReviewsSection: Error submitting review:', err)
      alert(`Error submitting review: ${err.message || 'Unknown error'}`)
      throw err
    }
  }

  useEffect(() => {
    fetchReviews(1)
  }, [itineraryId])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchReviews(nextPage)
  }

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
        return 'Verified Review'
      case 'pending':
        return 'Under Review'
      case 'rejected':
        return 'Review Rejected'
      default:
        return ''
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Write Review Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-serif text-gray-900">
          Reviews ({reviews.length})
        </h2>
        {showWriteReview && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <ReviewForm
            itineraryId={itineraryId}
            itineraryTitle={itineraryTitle}
            onSubmit={handleReviewSubmit}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {loading && reviews.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Star className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600">
            Be the first to share your experience with this itinerary!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className={`bg-white rounded-lg shadow-sm border p-6 ${
                review.status !== 'approved' ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
              }`}
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{review.userName}</span>
                      {review.status !== 'approved' && (
                        <div className="flex items-center gap-1 text-sm">
                          {getStatusIcon(review.status)}
                          <span className="text-gray-600">{getStatusText(review.status)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {renderStars(review.rating)}
                      <span>{review.rating}/5</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(review.reviewDate)}
                      </div>
                      {review.tripDate && (
                        <span>Trip: {formatDate(review.tripDate)}</span>
                      )}
                      {review.isVerifiedTrip && (
                        <span className="text-green-600 font-medium">✓ Verified Trip</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">{review.title}</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {review.comment}
                </p>
              </div>

              {/* Review Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => markHelpful(review._id)}
                    disabled={helpfulLoading === review._id}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ThumbsUp className={`w-4 h-4 ${helpfulLoading === review._id ? 'animate-pulse' : ''}`} />
                    <span>Helpful ({review.helpfulCount})</span>
                  </button>
                </div>

                {review.status === 'rejected' && review.rejectionReason && (
                  <div className="text-sm text-red-600">
                    Rejection reason: {review.rejectionReason}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load More Reviews'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
