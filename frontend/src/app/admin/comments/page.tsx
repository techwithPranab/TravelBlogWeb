'use client'

import { useState, useEffect } from 'react'
import { 
  MessageCircle, 
  Search, 
  Filter, 
  Trash2, 
  Check, 
  X, 
  Flag, 
  Eye,
  Calendar,
  User,
  Globe,
  AlertTriangle
} from 'lucide-react'
import { adminApi } from '@/lib/api'

interface Comment {
  _id: string
  content: string
  author: {
    name: string
    email: string
    avatar: string
  }
  resourceType: string
  resourceId: {
    _id: string
    title?: string
    slug?: string
  }
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  createdAt: string
  updatedAt: string
  likes: number
  dislikes: number
  flagCount: number
  ipAddress?: string
  userAgent?: string
}

interface CommentsData {
  comments: Comment[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: {
    approved: number
    pending: number
    rejected: number
    flagged: number
  }
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [stats, setStats] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
    flagged: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [resourceTypeFilter, setResourceTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const fetchComments = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching comments with params:', {
        page: pagination.page,
        limit: pagination.limit,
        searchTerm: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        resourceType: resourceTypeFilter !== 'all' ? resourceTypeFilter : undefined,
        sortBy,
        sortOrder
      })
      
      const response = await adminApi.getAllComments({
        page: pagination.page,
        limit: pagination.limit,
        searchTerm: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        resourceType: resourceTypeFilter !== 'all' ? resourceTypeFilter : undefined,
        sortBy,
        sortOrder
      })

      console.log('📨 API Response:', response)

      if (response.success && response.data) {
        console.log('✅ Setting comments:', response.data.comments.length, 'comments')
        setComments(response.data.comments)
        setPagination(response.data.pagination)
        setStats(response.data.stats)
      } else {
        console.log('❌ API Response not successful:', response)
        setError('API response indicated failure')
      }
    } catch (err) {
      setError('Failed to fetch comments')
      console.error('❌ Error fetching comments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [pagination.page, statusFilter, resourceTypeFilter, sortBy, sortOrder])

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchComments()
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await adminApi.deleteComment(commentId)
      if (response.success) {
        setComments(prev => prev.filter(comment => comment._id !== commentId))
        setShowDeleteConfirm(null)
        // Update stats
        fetchComments()
      }
    } catch (err) {
      console.error('Error deleting comment:', err)
      setError('Failed to delete comment')
    }
  }

  const handleModerateComment = async (commentId: string, action: 'approve' | 'reject' | 'flag') => {
    try {
      const response = await adminApi.moderateComment(commentId, action)
      if (response.success) {
        // Update the comment status locally
        setComments(prev => prev.map(comment => 
          comment._id === commentId 
            ? { ...comment, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged' }
            : comment
        ))
        // Refresh to get updated stats
        fetchComments()
      }
    } catch (err) {
      console.error('Error moderating comment:', err)
      setError('Failed to moderate comment')
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'flagged': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && comments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading comments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            Comment Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and moderate user comments across all resources
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <X className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Flagged</p>
                <p className="text-2xl font-bold text-gray-900">{stats.flagged}</p>
              </div>
              <Flag className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search comments, authors, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
            </select>

            {/* Resource Type Filter */}
            <select
              value={resourceTypeFilter}
              onChange={(e) => setResourceTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="blog">Blog Posts</option>
              <option value="destination">Destinations</option>
              <option value="guide">Guides</option>
              <option value="photo">Photos</option>
            </select>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-')
                  setSortBy(newSortBy)
                  setSortOrder(newSortOrder)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="likes-desc">Most Liked</option>
                <option value="flagCount-desc">Most Flagged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="bg-white rounded-lg shadow-sm">
          {error && (
            <div className="p-4 border-b border-red-200 bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {comments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No comments found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {comments.map((comment) => (
                <div key={comment._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Comment Header */}
                      <div className="flex items-center gap-4 mb-3">
                        <img
                          src={comment.author.avatar || '/images/default-avatar.jpg'}
                          alt={comment.author.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{comment.author.name}</h4>
                          <p className="text-sm text-gray-500">{comment.author.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(comment.status)}`}>
                          {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                        </span>
                      </div>

                      {/* Comment Content */}
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{comment.content}</p>

                      {/* Comment Metadata */}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(comment.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {comment.resourceType}
                        </span>
                        {comment.resourceId?.title && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {comment.resourceId.title}
                          </span>
                        )}
                        <span>{comment.likes} likes</span>
                        {comment.flagCount > 0 && (
                          <span className="text-orange-600">{comment.flagCount} flags</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {comment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleModerateComment(comment._id, 'approve')}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleModerateComment(comment._id, 'reject')}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {comment.status !== 'flagged' && (
                        <button
                          onClick={() => handleModerateComment(comment._id, 'flag')}
                          className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                          title="Flag"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setShowDeleteConfirm(comment._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Comment</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteComment(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
