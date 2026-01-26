'use client'

import React, { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { Search, Filter, Check, X, Star } from 'lucide-react'
import { ItineraryReview } from '@/types'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'pending' | 'all' | 'featured'>('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [filter, page])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      if (filter === 'pending') {
        const res = await adminApi.getPendingReviews({ page, limit: 10 }) as any
        if (res.success) {
          setReviews(res.reviews || [])
          setTotalPages(res.pagination?.totalPages || 1)
        }
      } else if (filter === 'featured') {
        const res = await adminApi.getFeaturedReviews() as any
        if (res.success) {
          setReviews(res.reviews || [])
          setTotalPages(1)
        }
      } else {
        const res = await adminApi.getAllReviews({ page, limit: 10, search: searchTerm || undefined }) as any
        if (res.success) {
          setReviews(res.reviews || [])
          setTotalPages(res.pagination?.totalPages || 1)
        }
      }
    } catch (err: any) {
      console.error('Admin reviews fetch error:', err)
      setError(err.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this review?')) return
    try {
      setUpdating(id)
      const res = await adminApi.approveReview(id) as any
      if (res.success) {
        // remove from pending list or update status
        setReviews(prev => prev.filter(r => r._id !== id))
      }
    } catch (err) {
      console.error('Approve error:', err)
      alert('Failed to approve review')
    } finally {
      setUpdating(null)
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason (min 10 characters):')
    if (!reason || reason.trim().length < 10) {
      alert('Rejection reason must be at least 10 characters')
      return
    }

    try {
      setUpdating(id)
      const res = await adminApi.rejectReview(id, reason) as any
      if (res.success) {
        setReviews(prev => prev.filter(r => r._id !== id))
      }
    } catch (err) {
      console.error('Reject error:', err)
      alert('Failed to reject review')
    } finally {
      setUpdating(null)
    }
  }

  const handleToggleFeatured = async (id: string) => {
    try {
      setUpdating(id)
      const res = await adminApi.toggleFeaturedReview(id) as any
      if (res.success) {
        setReviews(prev => prev.map(r => r._id === id ? { ...r, showOnHomePage: res.showOnHomePage } : r))
      }
    } catch (err) {
      console.error('Toggle featured error:', err)
      alert('Failed to toggle featured status')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Itinerary Reviews</h1>
          <p className="text-gray-600 mt-1">Approve and manage itinerary reviews</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search reviews or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchReviews()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value as any); setPage(1) }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="all">All</option>
              <option value="featured">Featured</option>
            </select>
            <button
              onClick={() => fetchReviews()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itinerary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((r, i) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 max-w-xl">
                    <div className="font-medium text-gray-900">{r.title}</div>
                    <div className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{r.comment}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">{r.itineraryId?.title || `#${String(r.itineraryId?._id || r.itineraryId).slice(-6)}`}</div>
                    <div className="text-gray-500 text-sm">{r.itineraryId?.destinations?.join(', ')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{r.userId?.name || r.userName}</div>
                    <div className="text-gray-500 text-sm">{r.userId?.email || r.userEmail}</div>
                  </td>
                  <td className="px-6 py-4">{r.rating}/5</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {r.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(r._id)}
                            disabled={updating === r._id}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(r._id)}
                            disabled={updating === r._id}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </>
                      )}

                      {r.status === 'approved' && (
                        <button
                          onClick={() => handleToggleFeatured(r._id)}
                          disabled={updating === r._id}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded ${r.showOnHomePage ? 'bg-yellow-500 text-white' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}
                        >
                          <Star className="w-4 h-4" /> {r.showOnHomePage ? 'Featured' : 'Feature'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 border rounded">Next</button>
        </div>
      )}
    </div>
  )
}
