'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Filter, Eye, Edit, Trash2, Copy, MoreVertical } from 'lucide-react'
import { getAdvertisements, deleteAdvertisement, duplicateAdvertisement, bulkUpdateStatus } from '@/lib/adApi'
import { Advertisement } from '@/lib/adApi'
import toast from 'react-hot-toast'

export default function AdvertisementsPage() {
  const router = useRouter()
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [selectedAds, setSelectedAds] = useState<string[]>([])

  useEffect(() => {
    fetchAdvertisements()
  }, [page, search, statusFilter, typeFilter])

  const fetchAdvertisements = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const params: any = { page, limit: 20 }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.type = typeFilter

      const response = await getAdvertisements(params, token)
      
      if (response.success) {
        setAdvertisements(response.data)
        setTotalPages(response.pagination?.pages || 1)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch advertisements')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await deleteAdvertisement(id, token)
      toast.success('Advertisement deleted successfully')
      fetchAdvertisements()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete advertisement')
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await duplicateAdvertisement(id, token)
      toast.success('Advertisement duplicated successfully')
      fetchAdvertisements()
    } catch (error: any) {
      toast.error(error.message || 'Failed to duplicate advertisement')
    }
  }

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedAds.length === 0) {
      toast.error('Please select advertisements first')
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await bulkUpdateStatus({ ids: selectedAds, status }, token)
      toast.success(`${selectedAds.length} advertisement(s) ${status}`)
      setSelectedAds([])
      fetchAdvertisements()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update advertisements')
    }
  }

  const toggleSelectAd = (id: string) => {
    setSelectedAds((prev) =>
      prev.includes(id) ? prev.filter((adId) => adId !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedAds.length === advertisements.length) {
      setSelectedAds([])
    } else {
      setSelectedAds(advertisements.map((ad) => ad._id))
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advertisements</h1>
            <p className="text-gray-600 mt-1">Manage your advertisement campaigns</p>
          </div>
          <Link
            href="/admin/advertisements/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Advertisement
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search advertisements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="hotel">Hotel</option>
            <option value="airline">Airline</option>
            <option value="tour_operator">Tour Operator</option>
            <option value="travel_accessories">Travel Accessories</option>
            <option value="announcement">Announcement</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedAds.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <span className="text-blue-900 font-medium">
              {selectedAds.length} advertisement(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkStatusUpdate('active')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('paused')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Pause
              </button>
              <button
                onClick={() => setSelectedAds([])}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advertisements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading advertisements...</p>
          </div>
        ) : advertisements.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No advertisements found</p>
            <Link
              href="/admin/advertisements/new"
              className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create your first advertisement
            </Link>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedAds.length === advertisements.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Advertisement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {advertisements.map((ad) => (
                  <tr key={ad._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedAds.includes(ad._id)}
                        onChange={() => toggleSelectAd(ad._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {ad.content.imageUrl && (
                          <img
                            src={ad.content.imageUrl}
                            alt={ad.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{ad.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {ad.content.headline}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                      {ad.type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                          ad.status
                        )}`}
                      >
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        <div>{ad.performance.impressions.toLocaleString()} impressions</div>
                        <div>{ad.performance.clicks.toLocaleString()} clicks</div>
                        <div className="text-gray-500">
                          CTR:{' '}
                          {ad.performance.impressions > 0
                            ? ((ad.performance.clicks / ad.performance.impressions) * 100).toFixed(
                                2
                              )
                            : 0}
                          %
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        <div>Start: {formatDate(ad.schedule.startDate)}</div>
                        {ad.schedule.endDate && <div>End: {formatDate(ad.schedule.endDate)}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/advertisements/${ad._id}/analytics`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Analytics"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/admin/advertisements/${ad._id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(ad._id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Duplicate"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ad._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
