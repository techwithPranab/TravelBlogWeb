'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAdvertisement } from '@/lib/adApi'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewAdvertisementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
    priority: 5,
  })

  const adTypes = [
    'hotel', 'airline', 'tour_operator', 'travel_accessories', 'travel_insurance',
    'booking_platform', 'restaurant', 'car_rental', 'cruise', 'rail',
    'adventure_sports', 'photography_equipment', 'luggage', 'currency_exchange',
    'financial_services', 'travel_technology', 'affiliate', 'sponsored_content',
    'announcement', 'other'
  ]

  const adFormats = [
    'banner', 'rectangle', 'leaderboard', 'skyscraper', 'native', 'in_content',
    'sidebar', 'sticky', 'video', 'carousel', 'mobile_banner', 'interstitial', 'popup'
  ]

  const placementPositions = [
    'header_top', 'header_bottom', 'content_top', 'content_middle', 'content_bottom',
    'sidebar_top', 'sidebar_middle', 'sidebar_bottom', 'sidebar_sticky',
    'content_paragraph_1', 'content_paragraph_2', 'content_paragraph_3',
    'after_featured_image', 'before_content', 'after_content', 'before_gallery',
    'after_gallery', 'before_video', 'after_video', 'before_comments', 'after_comments',
    'floating_bottom_left', 'floating_bottom_right', 'sticky_footer', 'page_takeover'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.content.headline || !formData.link.url) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.placement.length === 0) {
      toast.error('Please select at least one placement position')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const submitData: any = {
        ...formData,
        schedule: {
          startDate: new Date(formData.schedule.startDate),
          endDate: formData.schedule.endDate ? new Date(formData.schedule.endDate) : undefined,
        },
      }

      if (formData.budget.type !== 'unlimited' && formData.budget.limit) {
        submitData.budget = {
          type: formData.budget.type,
          limit: parseInt(formData.budget.limit as any),
          spent: 0,
        }
      } else {
        submitData.budget = { type: 'unlimited', spent: 0 }
      }

      const response = await createAdvertisement(submitData, token)
      
      if (response.success) {
        toast.success('Advertisement created successfully!')
        router.push('/admin/advertisements')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create advertisement')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...(prev as any)[parent], [field]: value },
    }))
  }

  const toggleArrayField = (parent: string, field: string, value: string) => {
    setFormData((prev) => {
      const array = (prev as any)[parent][field] || []
      const newArray = array.includes(value)
        ? array.filter((item: string) => item !== value)
        : [...array, value]
      return {
        ...prev,
        [parent]: { ...(prev as any)[parent], [field]: newArray },
      }
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/advertisements"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Advertisements
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Advertisement</h1>
        <p className="text-gray-600 mt-1">Fill in the details below to create a new advertisement</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advertisement Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Summer Hotel Promotion 2026"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => updateField('type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {adTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.format}
                  onChange={(e) => updateField('format', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {adFormats.map((format) => (
                    <option key={format} value={format}>
                      {format.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => updateField('priority', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Advertisement Content</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Headline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.content.headline}
                onChange={(e) => updateNestedField('content', 'headline', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Catchy headline for your ad"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.content.description}
                onChange={(e) => updateNestedField('content', 'description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of your offer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call to Action
              </label>
              <input
                type="text"
                value={formData.content.callToAction}
                onChange={(e) => updateNestedField('content', 'callToAction', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Book Now, Learn More, Shop Now"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={formData.content.imageUrl}
                onChange={(e) => updateNestedField('content', 'imageUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.link.url}
                onChange={(e) => updateNestedField('link', 'url', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/landing-page"
                required
              />
            </div>
          </div>
        </div>

        {/* Placement */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Placement Positions <span className="text-red-500">*</span>
          </h2>
          <p className="text-sm text-gray-600 mb-4">Select where this ad should appear</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {placementPositions.map((position) => (
              <label
                key={position}
                className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.placement.includes(position)}
                  onChange={() => updateField('placement', 
                    formData.placement.includes(position)
                      ? formData.placement.filter(p => p !== position)
                      : [...formData.placement, position]
                  )}
                  className="rounded border-gray-300"
                />
                <span className="text-sm capitalize">
                  {position.replace(/_/g, ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.schedule.startDate}
                onChange={(e) => updateNestedField('schedule', 'startDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.schedule.endDate}
                onChange={(e) => updateNestedField('schedule', 'endDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Type
              </label>
              <select
                value={formData.budget.type}
                onChange={(e) => updateNestedField('budget', 'type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="unlimited">Unlimited</option>
                <option value="impressions">Impressions</option>
                <option value="clicks">Clicks</option>
              </select>
            </div>

            {formData.budget.type !== 'unlimited' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Limit
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.budget.limit || ''}
                  onChange={(e) => updateNestedField('budget', 'limit', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Maximum ${formData.budget.type}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/advertisements"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Advertisement'}
          </button>
        </div>
      </form>
    </div>
  )
}
