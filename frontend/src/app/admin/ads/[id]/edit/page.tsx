'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getAdvertisementById, updateAdvertisement } from '@/lib/adApi'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditAdvertisementPage() {
  const router = useRouter()
  const params = useParams()
  const adId = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    type: 'hotel',
    format: 'banner',
    placement: [] as string[],
    content: {
      headline: '',
      description: '',
      callToAction: '',
      imageUrl: '',
      videoUrl: '',
      customHtml: '',
    },
    link: {
      url: '',
      trackingParams: {},
    },
    targeting: {
      categories: [] as string[],
      tags: [] as string[],
      countries: [] as string[],
      deviceTypes: [] as string[],
      userRoles: [] as string[],
    },
    schedule: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    },
    budget: {
      type: 'unlimited',
      limit: undefined,
    },
    status: 'draft',
  })

  const adTypes = [
    'hotel', 'airline', 'tour_operator', 'travel_accessories', 'travel_insurance',
    'booking_platform', 'restaurant', 'car_rental', 'cruise', 'rail', 'bus',
    'adventure_sports', 'photography_equipment', 'travel_guide_books', 'luggage',
    'currency_exchange', 'financial_services', 'travel_technology', 'affiliate',
    'sponsored_content', 'announcement', 'other'
  ]

  const adFormats = [
    'banner', 'rectangle', 'leaderboard', 'skyscraper', 'native', 'in_content',
    'sidebar', 'sticky', 'video', 'carousel', 'mobile_banner', 'interstitial', 'popup'
  ]

  const placementOptions = [
    'header_top', 'header_bottom', 'before_featured_image', 'after_featured_image',
    'overlay_featured_image', 'content_top', 'content_paragraph_1', 'content_paragraph_2',
    'content_paragraph_3', 'content_middle', 'content_bottom', 'between_sections',
    'before_gallery', 'after_gallery', 'in_gallery', 'before_videos', 'after_videos',
    'sidebar_top', 'sidebar_middle', 'sidebar_bottom', 'sidebar_sticky',
    'before_comments', 'after_comments', 'in_comments', 'before_author_bio',
    'after_author_bio', 'page_bottom', 'floating_bottom_right', 'floating_bottom_left',
    'sticky_footer', 'sticky_header'
  ]

  const deviceTypes = ['desktop', 'mobile', 'tablet']
  const userRoles = ['guest', 'registered', 'premium']

  useEffect(() => {
    fetchAdvertisement()
  }, [adId])

  const fetchAdvertisement = async () => {
    try {
      setFetchLoading(true)
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const response = await getAdvertisementById(adId, token)

      if (response.success) {
        const ad = response.data
        setFormData({
          name: ad.name || '',
          type: ad.type || 'hotel',
          format: ad.format || 'banner',
          placement: ad.placements ? ad.placements.map((p: any) => p.position) : [],
          content: {
            headline: ad.creative?.callToAction || '',
            description: ad.description || '',
            callToAction: ad.creative?.buttonText || '',
            imageUrl: ad.creative?.imageUrl || '',
            videoUrl: ad.creative?.videoUrl || '',
            customHtml: ad.creative?.htmlContent || '',
          },
          link: {
            url: ad.destinationUrl || '',
            trackingParams: ad.utmParameters || {},
          },
          targeting: {
            categories: ad.targeting?.categories || [],
            tags: ad.targeting?.tags || [],
            countries: ad.targeting?.geoLocations || [],
            deviceTypes: ad.targeting?.deviceTypes || [],
            userRoles: ad.targeting?.userRoles || [],
          },
          schedule: {
            startDate: ad.schedule?.startDate ? new Date(ad.schedule.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            endDate: ad.schedule?.endDate ? new Date(ad.schedule.endDate).toISOString().split('T')[0] : '',
          },
          budget: {
            type: ad.budget?.type === 'none' ? 'unlimited' : (ad.budget?.type || 'unlimited'),
            limit: ad.budget?.maxImpressions || ad.budget?.maxClicks,
          },
          status: ad.status || 'draft',
        })
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch advertisement')
      router.push('/admin/ads')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Please enter an advertisement name')
      return
    }

    if (!formData.link.url.trim()) {
      toast.error('Please enter a destination URL')
      return
    }

    if (formData.placement.length === 0) {
      toast.error('Please select at least one placement position')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const submitData: any = {
        name: formData.name,
        type: formData.type,
        format: formData.format,
        description: formData.content.description,
        creative: {
          imageUrl: formData.content.imageUrl,
          videoUrl: formData.content.videoUrl,
          htmlContent: formData.content.customHtml,
          callToAction: formData.content.headline,
          buttonText: formData.content.callToAction,
        },
        destinationUrl: formData.link.url,
        utmParameters: formData.link.trackingParams,
        placements: formData.placement.map(position => ({
          position,
          priority: 1,
        })),
        targeting: {
          categories: formData.targeting.categories,
          tags: formData.targeting.tags,
          geoLocations: formData.targeting.countries,
          deviceTypes: formData.targeting.deviceTypes,
          userRoles: formData.targeting.userRoles,
        },
        schedule: {
          startDate: new Date(formData.schedule.startDate),
          endDate: formData.schedule.endDate ? new Date(formData.schedule.endDate) : undefined,
        },
        budget: formData.budget.type === 'unlimited' ? { type: 'none' } : {
          type: formData.budget.type,
          maxImpressions: formData.budget.type === 'impressions' ? formData.budget.limit : undefined,
          maxClicks: formData.budget.type === 'clicks' ? formData.budget.limit : undefined,
        },
        status: formData.status,
      }

      const response = await updateAdvertisement(adId, submitData, token)

      if (response.success) {
        toast.success('Advertisement updated successfully')
        router.push('/admin/ads')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update advertisement')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value
      }
    }))
  }

  const toggleArrayField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter((item: string) => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }))
  }

  const toggleNestedArrayField = (parent: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: (prev[parent as keyof typeof prev] as any)[field].includes(value)
          ? (prev[parent as keyof typeof prev] as any)[field].filter((item: string) => item !== value)
          : [...(prev[parent as keyof typeof prev] as any)[field], value]
      }
    }))
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/ads"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Advertisements
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Advertisement</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => updateFormData('type', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {adTypes.map(type => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Format</label>
                <select
                  value={formData.format}
                  onChange={(e) => updateFormData('format', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {adFormats.map(format => (
                    <option key={format} value={format}>{format.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => updateFormData('status', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Placement */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Placement</h2>
            <p className="text-sm text-gray-600 mb-4">Select where this ad should appear</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Positions *</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {placementOptions.map(position => (
                  <label key={position} className="flex items-center p-2 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.placement.includes(position)}
                      onChange={() => toggleArrayField('placement', position)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm text-gray-700">{position.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Headline</label>
                <input
                  type="text"
                  value={formData.content.headline}
                  onChange={(e) => updateNestedFormData('content', 'headline', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.content.description}
                  onChange={(e) => updateNestedFormData('content', 'description', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Call to Action</label>
                <input
                  type="text"
                  value={formData.content.callToAction}
                  onChange={(e) => updateNestedFormData('content', 'callToAction', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="url"
                  value={formData.content.imageUrl}
                  onChange={(e) => updateNestedFormData('content', 'imageUrl', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Video URL</label>
                <input
                  type="url"
                  value={formData.content.videoUrl}
                  onChange={(e) => updateNestedFormData('content', 'videoUrl', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Custom HTML</label>
                <textarea
                  value={formData.content.customHtml}
                  onChange={(e) => updateNestedFormData('content', 'customHtml', e.target.value)}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Custom HTML code for advanced ad formats"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Destination URL</label>
                <input
                  type="url"
                  value={formData.link.url}
                  onChange={(e) => updateNestedFormData('link', 'url', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>



          {/* Schedule */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={formData.schedule.startDate}
                  onChange={(e) => updateNestedFormData('schedule', 'startDate', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.schedule.endDate}
                  onChange={(e) => updateNestedFormData('schedule', 'endDate', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget Type</label>
                <select
                  value={formData.budget.type}
                  onChange={(e) => updateNestedFormData('budget', 'type', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="unlimited">Unlimited</option>
                  <option value="impressions">Impressions</option>
                  <option value="clicks">Clicks</option>
                </select>
              </div>
              {formData.budget.type !== 'unlimited' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Budget Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.budget.limit || ''}
                    onChange={(e) => updateNestedFormData('budget', 'limit', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Maximum ${formData.budget.type}`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/ads"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Advertisement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
