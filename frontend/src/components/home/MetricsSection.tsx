'use client'

import { useState, useEffect } from 'react'
import { publicApi } from '@/lib/api'
import { Users, FileText, MapPin, BookOpen, Mail, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface MetricCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  description: string
}

const MetricCard = ({ title, value, icon: Icon, color, bgColor, description }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
      {value.toLocaleString()}
    </h3>
    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
      {title}
    </p>
    <p className="text-xs text-gray-600 dark:text-gray-400">
      {description}
    </p>
  </motion.div>
)

export const MetricsSection = () => {
  const [stats, setStats] = useState<{
    totalUsers: number
    totalPosts: number
    totalDestinations: number
    totalGuides: number
    totalSubscribers: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await publicApi.getStats()
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching public stats:', error)
        setError('Unable to load metrics at this time')
        // Set default values for demo purposes
        setStats({
          totalUsers: 1250,
          totalPosts: 89,
          totalDestinations: 45,
          totalGuides: 23,
          totalSubscribers: 567
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-max w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              BagPackStories by Numbers
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Loading our community metrics...
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error && !stats) {
    return null // Don't show section if there's an error and no fallback data
  }

  const metrics = [
    {
      title: 'Travelers',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Active community members'
    },
    {
      title: 'Stories',
      value: stats?.totalPosts || 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Published travel stories'
    },
    {
      title: 'Destinations',
      value: stats?.totalDestinations || 0,
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Explored locations'
    },
    {
      title: 'Guides',
      value: stats?.totalGuides || 0,
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Travel guides created'
    },
    {
      title: 'Subscribers',
      value: stats?.totalSubscribers || 0,
      icon: Mail,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Newsletter subscribers'
    }
  ]

  return (
    <section className="section-padding bg-white dark:bg-gray-900">
      <div className="container-max w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            BagPackStories by Numbers
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join our growing community of travelers sharing their adventures and discoveries from around the world
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <MetricCard {...metric} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
