'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Save, 
  X, 
  Plus,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import { toast } from 'react-hot-toast'

export default function EditDestinationPage() {
  const router = useRouter()
  const params = useParams()
  const destinationId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [highlights, setHighlights] = useState<string[]>([])
  const [newHighlight, setNewHighlight] = useState('')
  const [attractions, setAttractions] = useState<string[]>([])
  const [newAttraction, setNewAttraction] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    description: '',
    overview: '',
    featuredImage: '',
    images: [] as string[],
    bestTimeToVisit: '',
    averageCost: '',
    difficulty: 'easy',
    duration: '',
    coordinates: {
      latitude: '',
      longitude: ''
    },
    seoTitle: '',
    seoDescription: '',
    isPopular: false,
    status: 'published'
  })

  const difficultyLevels = [
    { value: 'easy', label: 'Easy' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'challenging', label: 'Challenging' },
    { value: 'expert', label: 'Expert' }
  ]

  useEffect(() => {
    if (destinationId) {
      loadDestination()
    }
  }, [destinationId])

  const loadDestination = async () => {
    try {
      setInitialLoading(true)
      const response: any = await adminApi.getDestination(destinationId)
      const destination = response.data
      
      setFormData({
        name: destination.name || '',
        country: destination.country || '',
        description: destination.description || '',
        overview: destination.overview || '',
        featuredImage: destination.featuredImage || '',
        images: destination.images || [],
        bestTimeToVisit: destination.bestTimeToVisit || '',
        averageCost: destination.averageCost || '',
        difficulty: destination.difficulty || 'easy',
        duration: destination.duration || '',
        coordinates: {
          latitude: destination.coordinates?.latitude?.toString() || '',
          longitude: destination.coordinates?.longitude?.toString() || ''
        },
        seoTitle: destination.seo?.title || '',
        seoDescription: destination.seo?.description || '',
        isPopular: destination.isPopular || false,
        status: destination.status || 'published'
      })
      
      setHighlights(destination.highlights || [])
      setAttractions(destination.attractions || [])
    } catch (error) {
      toast.error('Failed to load destination')
      console.error('Error loading destination:', error)
      router.push('/admin/destinations')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }))
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleAddHighlight = () => {
    if (newHighlight.trim() && !highlights.includes(newHighlight.trim())) {
      setHighlights(prev => [...prev, newHighlight.trim()])
      setNewHighlight('')
    }
  }

  const handleRemoveHighlight = (highlightToRemove: string) => {
    setHighlights(prev => prev.filter(highlight => highlight !== highlightToRemove))
  }

  const handleAddAttraction = () => {
    if (newAttraction.trim() && !attractions.includes(newAttraction.trim())) {
      setAttractions(prev => [...prev, newAttraction.trim()])
      setNewAttraction('')
    }
  }

  const handleRemoveAttraction = (attractionToRemove: string) => {
    setAttractions(prev => prev.filter(attraction => attraction !== attractionToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const destinationData = {
        ...formData,
        highlights,
        attractions,
        coordinates: {
          latitude: parseFloat(formData.coordinates.latitude) || 0,
          longitude: parseFloat(formData.coordinates.longitude) || 0
        }
      }

      await adminApi.updateDestination(destinationId, destinationData)
      toast.success('Destination updated successfully!')
      router.push('/admin/destinations')
    } catch (error) {
      toast.error('Failed to update destination')
      console.error('Error updating destination:', error)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading destination...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/destinations')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Destinations
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Destination</h1>
                <p className="text-gray-600 mt-1">Update destination information</p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Update Destination
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Destination Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              />
            </div>
            
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              />
            </div>
          </div>

          <div className="mb-8">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              required
            />
          </div>

          {/* Travel Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="bestTimeToVisit" className="block text-sm font-medium text-gray-700 mb-2">
                Best Time to Visit
              </label>
              <input
                type="text"
                id="bestTimeToVisit"
                name="bestTimeToVisit"
                value={formData.bestTimeToVisit}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
            
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              >
                {difficultyLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Highlights</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                placeholder="Add highlight..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {highlights.map(highlight => (
                <span
                  key={highlight}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {highlight}
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(highlight)}
                    className="hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Attractions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Attractions</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAttraction}
                onChange={(e) => setNewAttraction(e.target.value)}
                placeholder="Add attraction..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={handleAddAttraction}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {attractions.map(attraction => (
                <span
                  key={attraction}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                >
                  {attraction}
                  <button
                    type="button"
                    onClick={() => handleRemoveAttraction(attraction)}
                    className="hover:text-green-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPopular"
                name="isPopular"
                checked={formData.isPopular}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPopular" className="ml-2 block text-sm text-gray-900">
                Mark as Popular Destination
              </label>
            </div>
            
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </form>
      </div>
    </div>
  )
}
