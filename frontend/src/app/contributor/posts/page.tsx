'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { contributorApi, ContributorPost } from '@/lib/contributorApi'
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react'

interface PostsResponse {
  success: boolean
  data: ContributorPost[]
  pagination: {
    page: number
    pages: number
    total: number
    limit: number
  }
  statusCounts: {
    draft: number
    pending: number
    published: number
    rejected: number
    archived: number
  }
}

export default function ContributorPostsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<ContributorPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusCounts, setStatusCounts] = useState({
    draft: 0,
    pending: 0,
    published: 0,
    rejected: 0,
    archived: 0
  })

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'contributor' && user?.role !== 'admin')) {
      router.push('/login')
      return
    }

    loadPosts()
  }, [isAuthenticated, user, router, currentPage, statusFilter, searchQuery])

  const loadPosts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params: any = {
        page: currentPage,
        limit: 10
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }

      const response: PostsResponse = await contributorApi.getPosts(params)
      setPosts(response.data)
      setTotalPages(response.pagination.pages)
      setStatusCounts(response.statusCounts)
    } catch (error) {
      console.error('Error loading posts:', error)
      setError('Failed to load posts. Please try again.')
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      await contributorApi.deletePost(postId)
      // Reload posts
      loadPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post. Please try again.')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'draft':
        return <Edit className="w-4 h-4 text-gray-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      case 'draft':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isAuthenticated || (user?.role !== 'contributor' && user?.role !== 'admin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Posts
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your blog posts and track their status
              </p>
            </div>
            <button
              onClick={() => router.push('/contributor/posts/new')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Post</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Edit className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {statusCounts.draft}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {statusCounts.pending}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {statusCounts.published}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {statusCounts.rejected}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Archived</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {statusCounts.archived}
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Drafts</option>
                <option value="pending">Pending Review</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Posts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          {(() => {
            if (isLoading) {
              return (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              )
            }

            if (error) {
              return (
                <div className="p-6 text-center">
                  <div className="text-red-500 mb-4">
                    <AlertCircle className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Error Loading Posts
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {error}
                  </p>
                  <button
                    onClick={loadPosts}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )
            }

            if (posts.length === 0) {
              return (
                <div className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Edit className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No posts found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Get started by creating your first post.'
                    }
                  </p>
                  <button
                    onClick={() => router.push('/contributor/posts/new')}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create New Post</span>
                  </button>
                </div>
              )
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-750">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Post
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {posts.map((post) => (
                      <tr key={post._id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {post.featuredImage?.url && (
                              <img
                                src={post.featuredImage.url}
                                alt={post.title}
                                className="w-10 h-10 rounded-lg object-cover mr-3"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {post.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {post.excerpt}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(post.status)}
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                              {post.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(post.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {post.viewCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => router.push(`/posts/${post.slug}`)}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="View Post"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/contributor/posts/${post._id}/edit`)}
                              className="text-gray-400 hover:text-green-600 transition-colors"
                              title="Edit Post"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete Post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })()}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-between mt-6"
          >
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
