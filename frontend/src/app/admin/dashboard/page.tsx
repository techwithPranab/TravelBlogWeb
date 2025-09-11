'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  FileText, 
  MapPin, 
  BookOpen, 
  Mail, 
  Clock,
  TrendingUp,
  Eye
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'

interface DashboardStats {
  totalUsers: number
  totalPosts: number
  totalDestinations: number
  totalGuides: number
  totalSubscribers: number
  pendingPosts: number
  totalPartners: number
  pendingPartners: number
}

interface RecentActivity {
  recentUsers: Array<{
    _id: string
    name: string
    email: string
    role: string
    createdAt: string
  }>
  recentPosts: Array<{
    _id: string
    title: string
    author: {
      name: string
    }
    status: string
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'contributor':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await adminApi.getDashboardStats() as any
        
        let dashboardStats = null
        if (response.success) {
          dashboardStats = response.data.stats
          console.log('Dashboard stats:', dashboardStats)
          setStats(dashboardStats)
          setRecentActivity(response.data.recentActivity)
        }

        // Fetch partner stats separately
        try {
          const partnerStatsResponse = await adminApi.getPartnerStats() as any
          if (partnerStatsResponse.success) {
            const updatedStats = {
              ...(dashboardStats || {}),
              totalPartners: partnerStatsResponse.data.totalPartners,
              pendingPartners: partnerStatsResponse.data.pendingPartners
            }
            setStats(updatedStats)
          }
        } catch (partnerError) {
          console.error('Failed to fetch partner stats:', partnerError)
        }
      } catch (err) {
        console.error('Dashboard error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      name: 'Total Posts',
      value: stats?.totalPosts || 0,
      icon: FileText,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      name: 'Destinations',
      value: stats?.totalDestinations || 0,
      icon: MapPin,
      color: 'bg-purple-500',
      change: '+5%'
    },
    {
      name: 'Guides',
      value: stats?.totalGuides || 0,
      icon: BookOpen,
      color: 'bg-orange-500',
      change: '+15%'
    },
    {
      name: 'Partners',
      value: stats?.totalPartners || 0,
      icon: Users,
      color: 'bg-indigo-500',
      change: '+10%'
    },
    {
      name: 'Subscribers',
      value: stats?.totalSubscribers || 0,
      icon: Mail,
      color: 'bg-pink-500',
      change: '+23%'
    },
    {
      name: 'Pending Posts',
      value: stats?.pendingPosts || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      change: stats?.pendingPosts ? 'Needs Review' : 'All Clear'
    },
    {
      name: 'Pending Partners',
      value: stats?.pendingPartners || 0,
      icon: Clock,
      color: 'bg-red-500',
      change: stats?.pendingPartners ? 'Needs Review' : 'All Clear'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">{stat.change}</span>
                <span className="text-sm text-gray-500">from last month</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-4">
            {recentActivity?.recentUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getRoleColor(user.role)
                  }`}>
                    {user.role}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h3>
          <div className="space-y-4">
            {recentActivity?.recentPosts.map((post) => (
              <div key={post._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-500">by {post.author.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => router.push('/admin/partners')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-900">Manage Partners</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Manage Users</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-900">Review Posts</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">View Site</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
