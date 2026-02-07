'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getAdAnalytics, getAdvertisementById } from '@/lib/adApi'
import { ArrowLeft, Eye, MousePointer, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  summary: {
    totalImpressions: number
    totalClicks: number
    totalConversions: number
    ctr: number
    conversionRate: number
    revenue: number
  }
  performanceByPlacement: Array<{
    placement: string
    impressions: number
    clicks: number
    conversions: number
    ctr: number
    conversionRate: number
  }>
}

export default function AdAnalyticsPage() {
  const router = useRouter()
  const params = useParams()
  const adId = params.id as string

  const [loading, setLoading] = useState(true)
  const [ad, setAd] = useState<any>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetchData()
  }, [adId, dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      // Fetch ad details and analytics in parallel
      const [adResponse, analyticsResponse] = await Promise.all([
        getAdvertisementById(adId, token),
        getAdAnalytics(adId, token)
      ])

      if (adResponse.success) {
        setAd(adResponse.data)
      }

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data)
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const formatPercentage = (num: number) => {
    return (num * 100).toFixed(2) + '%'
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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
              <h1 className="text-3xl font-bold text-gray-900">Ad Analytics</h1>
              <p className="mt-2 text-gray-600">{ad.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Last 30 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {analytics?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Impressions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(analytics.summary.totalImpressions)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <MousePointer className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(analytics.summary.totalClicks)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">CTR</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPercentage(analytics.summary.ctr)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-sm">$</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${formatNumber(analytics.summary.revenue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance by Placement */}
        {analytics?.performanceByPlacement && analytics.performanceByPlacement.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Performance by Placement</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Placement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impressions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CTR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.performanceByPlacement.map((placement, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {placement.placement.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(placement.impressions)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(placement.clicks)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPercentage(placement.ctr)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(placement.conversions)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Analytics Message */}
        {!analytics?.summary && !loading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No analytics data available for this advertisement yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
