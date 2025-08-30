'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Calendar,
  User
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'

interface Post {
  _id: string
  title: string
  excerpt: string
  author: {
    name: string
    email: string
  }
  categories: Array<{
    name: string
    slug: string
  }>
  status: 'draft' | 'published'
  publishedAt: string
  createdAt: string
  views: number
  likes: number
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getPosts({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      }) as any

      if (response.success) {
        setPosts(response.data)
        setTotalPages(response.pagination?.pages || 1)
      }
    } catch (err) {
      console.error('Posts fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [currentPage, statusFilter])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchPosts()
  }

  const handleStatusUpdate = async (postId: string, newStatus: string) => {
    try {
      setUpdating(postId)
      const response = await adminApi.updatePostStatus(postId, newStatus) as any
      
      if (response.success) {
        setPosts(posts.map(post => 
          post._id === postId 
            ? { ...post, status: newStatus as 'draft' | 'published' }
            : post
        ))
      }
    } catch (err) {
      console.error('Status update error:', err)
      alert('Failed to update post status')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      setUpdating(postId)
      const response = await adminApi.deletePost(postId) as any
      
      if (response.success) {
        setPosts(posts.filter(post => post._id !== postId))
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete post')
    } finally {
      setUpdating(null)
    }
  }

  if (loading && posts.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-1">Manage all blog posts and their approval status</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Create New Post
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post, index) => (
                <motion.tr
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="max-w-sm">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.categories.slice(0, 2).map((category) => (
                          <span
                            key={category.slug}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {category.name}
                          </span>
                        ))}
                        {post.categories.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{post.categories.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                        <p className="text-xs text-gray-500">{post.author.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span>❤️</span>
                        <span>{post.likes}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      {post.status === 'published' && (
                        <p className="text-xs text-gray-400 mt-1">
                          Published: {new Date(post.publishedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {post.status === 'draft' ? (
                        <button
                          onClick={() => handleStatusUpdate(post._id, 'published')}
                          disabled={updating === post._id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusUpdate(post._id, 'draft')}
                          disabled={updating === post._id}
                          className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                          title="Unpublish"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        disabled={updating === post._id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200">
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
      </div>

      {posts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts found.</p>
        </div>
      )}
    </div>
  )
}
