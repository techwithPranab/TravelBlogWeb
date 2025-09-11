'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Save, 
  Upload, 
  X, 
  Plus,
  Loader2
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import { toast } from 'react-hot-toast'

export default function CreateDestinationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [highlights, setHighlights] = useState<string[]>([])
  const [newHighlight, setNewHighlight] = useState('')
  const [attractions, setAttractions] = useState<string[]>([])
  const [newAttraction, setNewAttraction] = useState('')
  
  // New state for additional sections
  const [activities, setActivities] = useState<Array<{ name: string; icon: string; description: string }>>([])
  const [newActivity, setNewActivity] = useState({ name: '', icon: '', description: '' })
  const [localCuisine, setLocalCuisine] = useState<string[]>([])
  const [newCuisine, setNewCuisine] = useState('')
  const [travelTips, setTravelTips] = useState<string[]>([])
  const [newTravelTip, setNewTravelTip] = useState('')
  
  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false)
  const featuredImageInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    country: '',
    continent: '',
    featuredImage: {
      url: '',
      alt: ''
    },
    gallery: [] as Array<{ url: string; alt: string }>,
    coordinates: {
      lat: '',
      lng: ''
    },
    bestTimeToVisit: '',
    averageTemperature: {
      summer: '',
      winter: ''
    },
    currency: '',
    language: '',
    timezone: '',
    rating: 0,
    totalReviews: 0,
    highlights: [] as string[],
    activities: [] as Array<{ name: string; icon: string; description: string }>,
    transportation: [] as string[],
    localCuisine: [] as string[],
    travelTips: [] as string[],
    relatedPosts: [] as Array<{ id: string; title: string; slug: string; image: string }>,
    isPopular: false,
    isFeatured: false,
    isActive: true,
    seoTitle: '',
    seoDescription: '',
    averageCost: '',
    difficulty: '',
    duration: '',
    status: 'active'
  })

  const continents = [
    'Africa',
    'Asia',
    'Europe',
    'North America',
    'South America',
    'Australia',
    'Antarctica'
  ]

  const difficultyLevels = [
    { value: 'easy', label: 'Easy' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'challenging', label: 'Challenging' },
    { value: 'expert', label: 'Expert' }
  ]

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

  // New handler functions for additional sections
  const handleAddActivity = () => {
    if (newActivity.name.trim() && newActivity.description.trim()) {
      setActivities(prev => [...prev, { ...newActivity }])
      setNewActivity({ name: '', icon: '', description: '' })
    }
  }

  const handleRemoveActivity = (index: number) => {
    setActivities(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddCuisine = () => {
    if (newCuisine.trim() && !localCuisine.includes(newCuisine.trim())) {
      setLocalCuisine(prev => [...prev, newCuisine.trim()])
      setNewCuisine('')
    }
  }

  const handleRemoveCuisine = (cuisineToRemove: string) => {
    setLocalCuisine(prev => prev.filter(cuisine => cuisine !== cuisineToRemove))
  }

  const handleAddTravelTip = () => {
    if (newTravelTip.trim() && !travelTips.includes(newTravelTip.trim())) {
      setTravelTips(prev => [...prev, newTravelTip.trim()])
      setNewTravelTip('')
    }
  }

  const handleRemoveTravelTip = (tipToRemove: string) => {
    setTravelTips(prev => prev.filter(tip => tip !== tipToRemove))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'featured' | 'gallery') => {
    const files = e.target.files
    if (!files) return

    // Handle multiple files for gallery, single file for featured
    if (type === 'featured') {
      const imageUrl = URL.createObjectURL(files[0])
      setFormData(prev => ({
        ...prev,
        featuredImage: {
          url: imageUrl,
          alt: prev.name || 'Featured image'
        }
      }))
    } else {
      const newImages = Array.from(files).map(file => ({
        url: URL.createObjectURL(file),
        alt: `Gallery image ${formData.gallery.length + 1}`
      }))
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...newImages]
      }))
    }
    
    toast.success('Image(s) uploaded successfully')
  }

  // Image upload handlers
  const handleFeaturedImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)
      
      const response = await adminApi.uploadDestinationImage(formDataUpload)
      
      setFormData(prev => ({
        ...prev,
        featuredImage: {
          url: response.data.url,
          alt: response.data.alt
        }
      }))
      
      toast.success('Featured image uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload featured image')
      console.error('Error uploading image:', error)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleGalleryImageUpload = async (files: FileList) => {
    setUploadingImage(true)
    try {
      const newImages: Array<{ url: string; alt: string }> = []
      
      for (const file of Array.from(files)) {
        const formDataUpload = new FormData()
        formDataUpload.append('image', file)
        
        const response = await adminApi.uploadDestinationImage(formDataUpload)
        newImages.push({
          url: response.data.url,
          alt: response.data.alt
        })
      }
      
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...newImages]
      }))
      
      toast.success(`${files.length} gallery image(s) uploaded successfully!`)
    } catch (error) {
      toast.error('Failed to upload gallery images')
      console.error('Error uploading images:', error)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const destinationData = {
        ...formData,
        coordinates: {
          lat: parseFloat(formData.coordinates.lat) || 0,
          lng: parseFloat(formData.coordinates.lng) || 0
        },
        highlights,
        attractions,
        activities,
        localCuisine,
        travelTips
      }

      await adminApi.createDestination(destinationData)
      toast.success('Destination created successfully!')
      router.push('/admin/destinations')
    } catch (error) {
      toast.error('Failed to create destination')
      console.error('Error creating destination:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Destination</h1>
              <p className="text-gray-600 mt-1">Add a new travel destination to your platform</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Create Destination
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="e.g., Santorini"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="e.g., santorini-greece"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="continent" className="block text-sm font-medium text-gray-700 mb-2">
                      Continent *
                    </label>
                    <select
                      id="continent"
                      name="continent"
                      value={formData.continent}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    >
                      <option value="">Select continent</option>
                      {continents.map(continent => (
                        <option key={continent} value={continent}>{continent}</option>
                      ))}
                    </select>
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
                      placeholder="e.g., Greece"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={8}
                    placeholder="Detailed description of the destination..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required
                  />
                </div>
              </div>

              {/* Travel Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Travel Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                      Currency *
                    </label>
                    <input
                      type="text"
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      placeholder="e.g., EUR"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Language *
                    </label>
                    <input
                      type="text"
                      id="language"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      placeholder="e.g., Greek"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone *
                    </label>
                    <input
                      type="text"
                      id="timezone"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      placeholder="e.g., GMT+2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="averageTemperature.summer" className="block text-sm font-medium text-gray-700 mb-2">
                      Average Summer Temperature *
                    </label>
                    <input
                      type="text"
                      id="averageTemperature.summer"
                      name="averageTemperature.summer"
                      value={formData.averageTemperature.summer}
                      onChange={handleInputChange}
                      placeholder="e.g., 25-30°C"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="averageTemperature.winter" className="block text-sm font-medium text-gray-700 mb-2">
                      Average Winter Temperature *
                    </label>
                    <input
                      type="text"
                      id="averageTemperature.winter"
                      name="averageTemperature.winter"
                      value={formData.averageTemperature.winter}
                      onChange={handleInputChange}
                      placeholder="e.g., 10-15°C"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bestTimeToVisit" className="block text-sm font-medium text-gray-700 mb-2">
                      Best Time to Visit *
                    </label>
                    <input
                      type="text"
                      id="bestTimeToVisit"
                      name="bestTimeToVisit"
                      value={formData.bestTimeToVisit}
                      onChange={handleInputChange}
                      placeholder="e.g., April to October"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Recommended Duration
                    </label>
                    <input
                      type="text"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 3-5 days"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Location Coordinates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="coordinates.lat" className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      id="coordinates.lat"
                      name="coordinates.lat"
                      value={formData.coordinates.lat}
                      onChange={handleInputChange}
                      placeholder="e.g., 36.3932"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="coordinates.lng" className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      id="coordinates.lng"
                      name="coordinates.lng"
                      value={formData.coordinates.lng}
                      onChange={handleInputChange}
                      placeholder="e.g., 25.4615"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      id="seoTitle"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      placeholder="SEO optimized title..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      id="seoDescription"
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="SEO meta description..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Activities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Activities</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="activity-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Activity Name
                      </label>
                      <input
                        type="text"
                        id="activity-name"
                        value={newActivity.name}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Hiking"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div>
                      <label htmlFor="activity-icon" className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                      </label>
                      <input
                        type="text"
                        id="activity-icon"
                        value={newActivity.icon}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="e.g., 🥾"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddActivity}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Activity
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="activity-description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="activity-description"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      placeholder="Describe this activity..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {Array.isArray(activities) && activities.map((activity, index) => (
                    <div key={`activity-${activity.name}-${index}`} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">{activity.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{activity.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveActivity(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Cuisine */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Local Cuisine</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCuisine}
                    onChange={(e) => setNewCuisine(e.target.value)}
                    placeholder="Add local dish..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCuisine()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCuisine}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Dish
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(localCuisine) && localCuisine.map((dish, index) => (
                    <div
                      key={`cuisine-${dish}-${index}`}
                      className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-full text-sm"
                    >
                      <span>{dish}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCuisine(dish)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Travel Tips */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Travel Tips</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTravelTip}
                    onChange={(e) => setNewTravelTip(e.target.value)}
                    placeholder="Add travel tip..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTravelTip()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTravelTip}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Tip
                  </button>
                </div>
                <div className="space-y-2">
                  {Array.isArray(travelTips) && travelTips.map((tip, index) => (
                    <div
                      key={`tip-${tip}-${index}`}
                      className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                    >
                      <span className="text-sm text-purple-800">{tip}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTravelTip(tip)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Featured Image */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h3>
                {formData.featuredImage.url ? (
                  <div className="relative">
                    <img 
                      src={formData.featuredImage.url} 
                      alt="Featured" 
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, featuredImage: { url: '', alt: '' } }))}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full h-40 border-2 border-gray-300 border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => featuredImageInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-gray-500 text-sm">Click to upload featured image</span>
                    <span className="text-gray-400 text-xs mt-1">PNG, JPG up to 10MB</span>
                  </button>
                )}
                <input
                  ref={featuredImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFeaturedImageUpload(file)
                    }
                  }}
                  className="hidden"
                />
                {uploadingImage && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>

              {/* Image Gallery */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Gallery</h3>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {Array.isArray(formData.gallery) && formData.gallery.map((image, index) => (
                    <div key={`gallery-${index}-${image.url.slice(-10)}`} className="relative">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full p-3 border-2 border-gray-300 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
                >
                  <Upload className="h-5 w-5 inline mr-2" />
                  Add Gallery Images
                </button>
                
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files
                    if (files && files.length > 0) {
                      handleGalleryImageUpload(files)
                    }
                  }}
                  className="hidden"
                />
                
                {uploadingImage && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
                
                {formData.gallery.length === 0 && !uploadingImage && (
                  <div className="w-full h-16 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center bg-gray-50 mt-2">
                    <span className="text-gray-500 text-sm">No gallery images</span>
                  </div>
                )}
              </div>

              {/* Highlights */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Highlights</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    placeholder="Add highlight..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddHighlight()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {Array.isArray(highlights) && highlights.map(highlight => (
                    <div
                      key={highlight}
                      className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
                    >
                      <span className="text-sm text-blue-800">{highlight}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(highlight)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Attractions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Attractions</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newAttraction}
                    onChange={(e) => setNewAttraction(e.target.value)}
                    placeholder="Add attraction..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddAttraction()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddAttraction}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {Array.isArray(attractions) && attractions.map(attraction => (
                    <div
                      key={attraction}
                      className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
                    >
                      <span className="text-sm text-green-800">{attraction}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttraction(attraction)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
                <div className="space-y-4">
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
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                      Mark as Featured Destination
                    </label>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
