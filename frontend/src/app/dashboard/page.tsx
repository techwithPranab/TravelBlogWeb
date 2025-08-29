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
  Users
} from 'lucide-react'
import { motion } from 'framer-motion'

interface DashboardStats {
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

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
    recentActivity: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // In a real app, you would fetch this from your API
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
        
        setStats({
          totalPosts: 12,
          totalLikes: 248,
          totalComments: 89,
          totalViews: 3421,
          recentActivity: [
            {
              id: '1',
              type: 'like',
              message: 'Sarah liked your post',
              date: '2 hours ago',
              postTitle: 'Hidden Gems of Southeast Asia'
            },
            {
              id: '2',
              type: 'comment',
              message: 'New comment on your travel guide',
              date: '4 hours ago',
              postTitle: 'Budget Travel Tips for Europe'
            },
            {
              id: '3',
              type: 'follow',
              message: 'Mike started following you',
              date: '1 day ago'
            },
            {
              id: '4',
              type: 'view',
              message: 'Your post gained 50 new views',
              date: '2 days ago',
              postTitle: 'Best Photography Spots in Japan'
            }
          ]
        })
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [isAuthenticated, router])

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

  const statCards = [
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+2 this month'
    },
    {
      title: 'Total Likes',
      value: stats.totalLikes,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: '+28 this week'
    },
    {
      title: 'Comments',
      value: stats.totalComments,
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+12 this week'
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
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
                {stats.recentActivity.map((activity) => (
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
