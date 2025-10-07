'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import {
  User,
  BookOpen,
  Heart,
  MessageCircle,
  Camera,
  TrendingUp,
  Eye,
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit
} from 'lucide-react'
import { motion } from 'framer-motion'
import { readerApi } from '@/lib/readerApi'
import { contributorApi, ContributorDashboardData } from '@/lib/contributorApi'

interface ReaderDashboardStats {
  totalPosts: number
  totalLikes: number
  totalComments: number
  totalViews: number
  recentActivity: ActivityItem[]
}

interface ActivityItem {
  id: string
  type: 'like' | 'comment' | 'view' | 'follow'
  message: string
  date: string
  postTitle?: string
}

type DashboardStats = ReaderDashboardStats | ContributorDashboardData

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('reader')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Determine user role
    const role = user?.role || 'reader'
    setUserRole(role)

    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (role === 'contributor' || role === 'admin') {
          // Load contributor dashboard data
          const dashboardData = await contributorApi.getDashboard()
          setStats(dashboardData)
        } else {
          // Load reader dashboard data
          const dashboardData: any = await readerApi.getDashboard()
          setStats({
            totalPosts: dashboardData.stats?.totalPosts || 0,
            totalLikes: dashboardData.stats?.totalLikes || 0,
            totalComments: dashboardData.stats?.totalComments || 0,
            totalViews: dashboardData.stats?.totalViews || 0,
            recentActivity: dashboardData.recentActivity || []
          })
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
        setError('Failed to load dashboard data. Please try again.')
        setStats(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [isAuthenticated, router, user?.role])

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 max-w-md mx-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render contributor dashboard
  if (userRole === 'contributor' || userRole === 'admin') {
    const contributorStats = stats as ContributorDashboardData

    const statCards = [
      {
        title: 'Total Posts',
        value: contributorStats.stats.totalPosts,
        icon: FileText,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        change: 'All time'
      },
      {
        title: 'Published',
        value: contributorStats.stats.publishedPosts,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        change: 'Live posts'
      },
      {
        title: 'Pending Review',
        value: contributorStats.stats.pendingPosts,
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        change: 'Awaiting approval'
      },
      {
        title: 'Rejected',
        value: contributorStats.stats.rejectedPosts,
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        change: 'Need revision'
      }
    ]

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'published': return 'text-green-600 bg-green-100'
        case 'pending': return 'text-yellow-600 bg-yellow-100'
        case 'rejected': return 'text-red-600 bg-red-100'
        case 'draft': return 'text-gray-600 bg-gray-100'
        default: return 'text-gray-600 bg-gray-100'
      }
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Contributor Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your blog posts and track their performance
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {statCards.map((stat, index) => (
              <div
                key={stat.title}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {stat.change}
                </p>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Recent Posts
                  </h2>
                  <button
                    onClick={() => router.push('/contributor/posts/new')}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Post</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {contributorStats.recentPosts.map((post) => (
                    <div
                      key={post._id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Updated {new Date(post.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/contributor/posts/${post._id}/edit`)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/contributor/posts/${post._id}`)}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Rejections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Recent Feedback
                </h2>
                <div className="space-y-4">
                  {contributorStats.recentRejections.map((rejection) => (
                    <div
                      key={rejection._id}
                      className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                    >
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {rejection.title}
                          </h4>
                          {rejection.moderationNotes && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {rejection.moderationNotes}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {rejection.moderatedAt ? new Date(rejection.moderatedAt).toLocaleDateString() : 'N/A'}
                            {rejection.moderatedBy && ` by ${rejection.moderatedBy.name}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {contributorStats.recentRejections.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No recent feedback
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/contributor/posts/new')}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Create New Post
                    </span>
                  </button>
                  <button
                    onClick={() => router.push('/contributor/posts')}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Manage Posts
                    </span>
                  </button>
                  <button
                    onClick={() => router.push('/profile')}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <User className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Edit Profile
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // Render reader dashboard (original code)
  const readerStats = stats as ReaderDashboardStats

  const statCards = [
    {
      title: 'Total Posts',
      value: readerStats.totalPosts,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+2 this month'
    },
    {
      title: 'Total Likes',
      value: readerStats.totalLikes,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: '+28 this week'
    },
    {
      title: 'Comments',
      value: readerStats.totalComments,
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+12 this week'
    },
    {
      title: 'Total Views',
      value: readerStats.totalViews,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+156 this week'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />
      case 'follow': return <Users className="w-4 h-4 text-green-500" />
      case 'view': return <Eye className="w-4 h-4 text-purple-500" />
      default: return <TrendingUp className="w-4 h-4 text-gray-500" />
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your travel blog
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((stat, index) => (
            <div
              key={stat.title}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-sm text-green-600 font-medium">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {readerStats.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      {activity.postTitle && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          on "{activity.postTitle}"
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Create New Post
                  </span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <Camera className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Upload Photos
                  </span>
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full flex items-center space-x-3 p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <User className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Edit Profile
                  </span>
                </button>
              </div>
            </div>

            {/* Performance Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                This Month
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Posts Published</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">New Followers</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">14</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</span>
                  <span className="text-lg font-semibold text-green-600">8.4%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
