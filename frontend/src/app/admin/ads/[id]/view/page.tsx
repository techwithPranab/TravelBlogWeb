'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getAdvertisementById } from '@/lib/adApi'
import { ArrowLeft, Eye, Edit, Calendar, Target, DollarSign, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function ViewAdvertisementPage() {
  const router = useRouter()
  const params = useParams()
  const adId = params.id as string

  const [ad, setAd] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdvertisement()
  }, [adId])

  const fetchAdvertisement = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const response = await getAdvertisementById(adId, token)

      if (response.success) {
        setAd(response.data)
      }
    } catch (error: any) {
      console.error('Failed to fetch advertisement:', error)
      router.push('/admin/ads')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Advertisement not found</h2>
          <Link
            href="/admin/ads"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Advertisements
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/ads"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Advertisements
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">View Advertisement</h1>
              <p className="mt-2 text-gray-600">{ad.name}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/ads/${ad._id}/analytics`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Link>
              <Link
                href={`/admin/ads/${ad._id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(ad.status)}`}>
                {ad.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{ad.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-sm text-gray-900">{ad.type?.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Format</label>
                <p className="mt-1 text-sm text-gray-900">{ad.format?.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <p className="mt-1 text-sm text-gray-900">{ad.priority || 5}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          {ad.content && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Content</h2>
              <div className="space-y-4">
                {ad.content.headline && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Headline</label>
                    <p className="mt-1 text-sm text-gray-900">{ad.content.headline}</p>
                  </div>
                )}
                {ad.content.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{ad.content.description}</p>
                  </div>
                )}
                {ad.content.callToAction && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Call to Action</label>
                    <p className="mt-1 text-sm text-gray-900">{ad.content.callToAction}</p>
                  </div>
                )}
                {ad.content.imageUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <div className="mt-1">
                      <img
                        src={ad.content.imageUrl}
                        alt={ad.name}
                        className="max-w-xs h-auto rounded border"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Link */}
          {ad.link && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Link</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">URL</label>
                <p className="mt-1 text-sm text-blue-600 hover:text-blue-800">
                  <a href={ad.link.url} target="_blank" rel="noopener noreferrer">
                    {ad.link.url}
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Placement */}
          {ad.placement && ad.placement.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Placement</h2>
              <div className="flex flex-wrap gap-2">
                {ad.placement.map((position: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {position.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Schedule */}
          {ad.schedule && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ad.schedule.startDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(ad.schedule.startDate)}</p>
                  </div>
                )}
                {ad.schedule.endDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(ad.schedule.endDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Performance */}
          {ad.performance && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{(ad.performance.impressions || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Impressions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{(ad.performance.clicks || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {ad.performance.impressions > 0
                      ? ((ad.performance.clicks / ad.performance.impressions) * 100).toFixed(2)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-600">CTR</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">${(ad.performance.revenue || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Revenue</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
