'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Save, 
  Upload, 
  X, 
  Plus,
  ArrowLeft,
  Link as LinkIcon
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'
import { toast } from 'react-hot-toast'

interface GuideData {
  title: string
  description: string
  type: 'itinerary' | 'budget' | 'photography' | 'food' | 'adventure'
  destination: {
    name: string
    country: string
    slug: string
  }
  author: {
    name: string
    avatar: string
    bio: string
  }
  featuredImage: {
    url: string
    alt: string
  }
  additionalImages?: Array<{
    url: string
    alt: string
    caption?: string
  }>
  duration: string
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  budget: {
    range: string
    details: string
  }
  bestTime: string
  sections: Array<{
    title: string
    content: string
    tips?: string[]
    images?: Array<{
      url: string
      alt: string
      caption?: string
    }>
  }>
  itinerary?: Array<{
    day: number
    title: string
    activities: string[]
    meals: string[]
    accommodation: string
    budget: string
  }>
  packingList?: Array<{
    category: string
    items: string[]
  }>
  resources: Array<{
    title: string
    type: 'link' | 'document' | 'app'
    url: string
  }>
  relatedGuides: Array<{
    id: string
    title: string
    slug: string
    image: string
    type: string
  }>
}

export default function CreateGuidePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<GuideData>({
    title: '',
    description: '',
    type: 'itinerary',
    destination: {
      name: '',
      country: '',
      slug: ''
    },
    author: {
      name: '',
      avatar: '',
      bio: ''
    },
    featuredImage: {
      url: '',
      alt: ''
    },
    duration: '',
    difficulty: 'Easy',
    budget: {
      range: '',
      details: ''
    },
    bestTime: '',
    sections: [],
    itinerary: [],
    packingList: [],
    resources: [],
    relatedGuides: []
  })

  // UI state for dynamic sections
  const [newSection, setNewSection] = useState({ title: '', content: '', tips: [] as string[] })
  const [newSectionTip, setNewSectionTip] = useState('')
  const [newItineraryDay, setNewItineraryDay] = useState({ 
    day: 1, 
    title: '', 
    activities: [] as string[], 
    meals: [] as string[], 
    accommodation: '', 
    budget: '' 
  })
  const [newActivity, setNewActivity] = useState('')
  const [newMeal, setNewMeal] = useState('')
  const [newPackingItem, setNewPackingItem] = useState({ category: '', items: [] as string[] })
  const [newPackingItemText, setNewPackingItemText] = useState('')
  const [newResource, setNewResource] = useState({ title: '', type: 'link' as const, url: '' })
  const [newRelatedGuide, setNewRelatedGuide] = useState({ 
    id: '', 
    title: '', 
    slug: '', 
    image: '', 
    type: '' 
  })
  const [additionalImages, setAdditionalImages] = useState<Array<{url: string, alt: string, caption?: string}>>([])
  const [newImageAlt, setNewImageAlt] = useState('')
  const [newImageCaption, setNewImageCaption] = useState('')

  const guideTypes = [
    { value: 'itinerary', label: 'Itinerary' },
    { value: 'budget', label: 'Budget Guide' },
    { value: 'photography', label: 'Photography Guide' },
    { value: 'food', label: 'Food Guide' },
    { value: 'adventure', label: 'Adventure Guide' }
  ]

  const difficultyLevels = [
    { value: 'Easy', label: 'Easy' },
    { value: 'Moderate', label: 'Moderate' },
    { value: 'Challenging', label: 'Challenging' }
  ]

  const resourceTypes = [
    { value: 'link', label: 'Link' },
    { value: 'document', label: 'Document' },
    { value: 'app', label: 'App' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Section management
  const handleAddSection = () => {
    if (newSection.title.trim() && newSection.content.trim()) {
      setFormData(prev => ({
        ...prev,
        sections: [...prev.sections, { ...newSection }]
      }))
      setNewSection({ title: '', content: '', tips: [] })
      setNewSectionTip('')
    }
  }

  const handleRemoveSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }))
  }

  const handleAddSectionTip = () => {
    if (newSectionTip.trim()) {
      setNewSection(prev => ({
        ...prev,
        tips: [...prev.tips, newSectionTip.trim()]
      }))
      setNewSectionTip('')
    }
  }

  const handleRemoveSectionTip = (tipIndex: number) => {
    setNewSection(prev => ({
      ...prev,
      tips: prev.tips.filter((_, i) => i !== tipIndex)
    }))
  }

  // Itinerary management
  const handleAddItineraryDay = () => {
    if (newItineraryDay.title.trim()) {
      setFormData(prev => ({
        ...prev,
        itinerary: [...(prev.itinerary || []), { ...newItineraryDay }]
      }))
      setNewItineraryDay({ 
        day: (formData.itinerary?.length || 0) + 2, 
        title: '', 
        activities: [], 
        meals: [], 
        accommodation: '', 
        budget: '' 
      })
    }
  }

  const handleRemoveItineraryDay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: (prev.itinerary || []).filter((_, i) => i !== index)
    }))
  }

  const handleAddActivity = () => {
    if (newActivity.trim()) {
      setNewItineraryDay(prev => ({
        ...prev,
        activities: [...prev.activities, newActivity.trim()]
      }))
      setNewActivity('')
    }
  }

  const handleRemoveActivity = (activityIndex: number) => {
    setNewItineraryDay(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== activityIndex)
    }))
  }

  const handleAddMeal = () => {
    if (newMeal.trim()) {
      setNewItineraryDay(prev => ({
        ...prev,
        meals: [...prev.meals, newMeal.trim()]
      }))
      setNewMeal('')
    }
  }

  const handleRemoveMeal = (mealIndex: number) => {
    setNewItineraryDay(prev => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== mealIndex)
    }))
  }

  // Packing list management
  const handleAddPackingCategory = () => {
    if (newPackingItem.category.trim()) {
      setFormData(prev => ({
        ...prev,
        packingList: [...(prev.packingList || []), { ...newPackingItem }]
      }))
      setNewPackingItem({ category: '', items: [] })
    }
  }

  const handleRemovePackingCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      packingList: (prev.packingList || []).filter((_, i) => i !== index)
    }))
  }

  const handleAddPackingItem = (categoryIndex: number) => {
    if (newPackingItemText.trim()) {
      setFormData(prev => ({
        ...prev,
        packingList: (prev.packingList || []).map((category, index) => 
          index === categoryIndex 
            ? { ...category, items: [...category.items, newPackingItemText.trim()] }
            : category
        )
      }))
      setNewPackingItemText('')
    }
  }

  const handleRemovePackingItem = (categoryIndex: number, itemIndex: number) => {
    const updatedPackingList = (formData.packingList || []).map((category, index) => {
      if (index === categoryIndex) {
        return {
          ...category,
          items: category.items.filter((_, i) => i !== itemIndex)
        }
      }
      return category
    })
    
    setFormData(prev => ({
      ...prev,
      packingList: updatedPackingList
    }))
  }

  // Resource management
  const handleAddResource = () => {
    if (newResource.title.trim() && newResource.url.trim()) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, { ...newResource }]
      }))
      setNewResource({ title: '', type: 'link', url: '' })
    }
  }

  const handleRemoveResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }))
  }

  // Related guides management
  const handleAddRelatedGuide = () => {
    if (newRelatedGuide.title.trim() && newRelatedGuide.id.trim()) {
      setFormData(prev => ({
        ...prev,
        relatedGuides: [...prev.relatedGuides, { ...newRelatedGuide }]
      }))
      setNewRelatedGuide({ id: '', title: '', slug: '', image: '', type: '' })
    }
  }

  const handleRemoveRelatedGuide = (index: number) => {
    setFormData(prev => ({
      ...prev,
      relatedGuides: prev.relatedGuides.filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)

      const result = await adminApi.uploadGuideImage(formDataUpload)
      
      setFormData(prev => ({
        ...prev,
        featuredImage: {
          url: result.data.url,
          alt: prev.title || 'Guide image'
        }
      }))
      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload image')
      console.error('Error uploading image:', error)
    }
  }

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)

      const result = await adminApi.uploadGuideImage(formDataUpload)
      
      const newImage = {
        url: result.data.url,
        alt: newImageAlt || 'Additional guide image',
        caption: newImageCaption || undefined
      }
      
      setAdditionalImages(prev => [...prev, newImage])
      setNewImageAlt('')
      setNewImageCaption('')
      toast.success('Additional image uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload additional image')
      console.error('Error uploading additional image:', error)
    }
  }

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent, status?: boolean) => {
    e.preventDefault()
    setLoading(true)

    try {
      const guideData = {
        ...formData,
        additionalImages,
        isPublished: status || false
      }

      await adminApi.createGuide(guideData)
      toast.success(`Guide ${status ? 'published' : 'saved as draft'} successfully!`)
      router.push('/admin/guides')
    } catch (error) {
      toast.error('Failed to create guide')
      console.error('Error creating guide:', error)
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/guides')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Guide</h1>
                <p className="text-gray-600 mt-1">Create a comprehensive travel guide</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={(e) => handleSubmit(e, false)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </button>
              <button
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Publish
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Guide Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        Guide Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {guideTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty
                      </label>
                      <select
                        id="difficulty"
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {difficultyLevels.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Destination Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Destination</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="destination.name" className="block text-sm font-medium text-gray-700 mb-2">
                      Destination Name
                    </label>
                    <input
                      type="text"
                      id="destination.name"
                      name="destination.name"
                      value={formData.destination.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="destination.country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      id="destination.country"
                      name="destination.country"
                      value={formData.destination.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="destination.slug" className="block text-sm font-medium text-gray-700 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      id="destination.slug"
                      name="destination.slug"
                      value={formData.destination.slug}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Guide Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Guide Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 7 days"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="bestTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Best Time to Visit
                    </label>
                    <input
                      type="text"
                      id="bestTime"
                      name="bestTime"
                      value={formData.bestTime}
                      onChange={handleInputChange}
                      placeholder="e.g., April to June"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="budget.range" className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range
                    </label>
                    <input
                      type="text"
                      id="budget.range"
                      name="budget.range"
                      value={formData.budget.range}
                      onChange={handleInputChange}
                      placeholder="e.g., $1000 - $2000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="budget.details" className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Details
                    </label>
                    <input
                      type="text"
                      id="budget.details"
                      name="budget.details"
                      value={formData.budget.details}
                      onChange={handleInputChange}
                      placeholder="e.g., per person"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Guide Sections</h3>
                
                {/* Add New Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Section</h4>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Section title"
                      value={newSection.title}
                      onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <textarea
                      placeholder="Section content"
                      value={newSection.content}
                      onChange={(e) => setNewSection(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    {/* Tips Section */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Tips</h5>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a helpful tip"
                          value={newSectionTip}
                          onChange={(e) => setNewSectionTip(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddSectionTip()
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddSectionTip}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Display tips being added */}
                      <div className="flex flex-wrap gap-2">
                        {newSection.tips.map((tip, index) => (
                          <div key={`new-tip-${index}-${tip}`} className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                            <span>{tip}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSectionTip(index)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Section
                    </button>
                  </div>
                </div>

                {/* Existing Sections */}
                <div className="space-y-4">
                  {formData.sections.map((section, index) => (
                    <div key={`section-${index}-${section.title}`} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">{section.title}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove section"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{section.content}</p>
                      
                      {/* Display tips */}
                      {section.tips && section.tips.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700">Tips:</h5>
                          <div className="flex flex-wrap gap-2">
                            {section.tips.map((tip, tipIndex) => (
                              <div key={`tip-${index}-${tipIndex}-${tip}`} className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Itinerary */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Itinerary</h3>
                
                {/* Add New Day */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Day</h4>
                  
                  {/* Basic Day Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Day title"
                      value={newItineraryDay.title}
                      onChange={(e) => setNewItineraryDay(prev => ({ ...prev, title: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Accommodation"
                      value={newItineraryDay.accommodation}
                      onChange={(e) => setNewItineraryDay(prev => ({ ...prev, accommodation: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Budget"
                      value={newItineraryDay.budget}
                      onChange={(e) => setNewItineraryDay(prev => ({ ...prev, budget: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Activities Section */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Activities</h5>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Add activity"
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddActivity()
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddActivity}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newItineraryDay.activities.map((activity, index) => (
                        <div key={`new-activity-${index}-${activity}`} className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          <span>{activity}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(index)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meals Section */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Meals</h5>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Add meal"
                        value={newMeal}
                        onChange={(e) => setNewMeal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddMeal()
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddMeal}
                        className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newItineraryDay.meals.map((meal, index) => (
                        <div key={`new-meal-${index}-${meal}`} className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                          <span>{meal}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMeal(index)}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItineraryDay}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Day
                  </button>
                </div>

                {/* Existing Itinerary */}
                <div className="space-y-4">
                  {(formData.itinerary || []).map((day, index) => (
                    <div key={`itinerary-${index}-${day.day}`} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">Day {day.day}: {day.title}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveItineraryDay(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove day"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          <strong>Activities:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {day.activities.map((activity, actIndex) => (
                              <span key={`activity-${day.day}-${actIndex}-${activity}`} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>Meals:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {day.meals.map((meal, mealIndex) => (
                              <span key={`meal-${day.day}-${mealIndex}-${meal}`} className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                {meal}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>Accommodation:</strong> {day.accommodation}
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>Budget:</strong> {day.budget}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Packing List */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Packing List</h3>
                
                {/* Add New Category */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Category</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Category name (e.g., Clothing, Electronics)"
                      value={newPackingItem.category}
                      onChange={(e) => setNewPackingItem(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    {/* Add items to category */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-gray-600">Items in this category:</h5>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add item"
                          value={newPackingItemText}
                          onChange={(e) => setNewPackingItemText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              setNewPackingItem(prev => ({
                                ...prev,
                                items: [...prev.items, newPackingItemText.trim()]
                              }))
                              setNewPackingItemText('')
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewPackingItem(prev => ({
                              ...prev,
                              items: [...prev.items, newPackingItemText.trim()]
                            }))
                            setNewPackingItemText('')
                          }}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Display items being added */}
                      <div className="flex flex-wrap gap-2">
                        {newPackingItem.items.map((item, index) => (
                          <div key={`new-item-${index}-${item}`} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedItems = newPackingItem.items.filter((_, i) => i !== index)
                                setNewPackingItem(prev => ({
                                  ...prev,
                                  items: updatedItems
                                }))
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPackingCategory}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Category
                    </button>
                  </div>
                </div>

                {/* Existing Packing List */}
                <div className="space-y-4">
                  {(formData.packingList || []).map((category, index) => (
                    <div key={`packing-${index}-${category.category}`} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">{category.category}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemovePackingCategory(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove category"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Items in category */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">Items:</h5>
                        <div className="flex flex-wrap gap-2">
                          {category.items.map((item, itemIndex) => (
                            <div key={`item-${index}-${itemIndex}-${item}`} className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                              <span>{item}</span>
                              <button
                                type="button"
                                onClick={() => handleRemovePackingItem(index, itemIndex)}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        {/* Add item to existing category */}
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Add another item"
                            value={newPackingItemText}
                            onChange={(e) => setNewPackingItemText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddPackingItem(index)
                              }
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddPackingItem(index)}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
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
                      alt={formData.featuredImage.alt} 
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
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or WEBP</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
                <input
                  type="text"
                  placeholder="Image alt text"
                  value={formData.featuredImage.alt}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    featuredImage: { ...prev.featuredImage, alt: e.target.value }
                  }))}
                  className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Additional Images */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Images</h3>
                
                {/* Upload New Image */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Add Additional Images</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Image alt text"
                        value={newImageAlt}
                        onChange={(e) => setNewImageAlt(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Image caption (optional)"
                        value={newImageCaption}
                        onChange={(e) => setNewImageCaption(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-2 pb-3">
                        <Upload className="w-6 h-6 mb-2 text-gray-500" />
                        <p className="text-xs text-gray-500">
                          <span className="font-semibold">Click to upload</span> additional image
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or WEBP</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleAdditionalImageUpload} />
                    </label>
                  </div>
                </div>

                {/* Existing Additional Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {additionalImages.map((image, index) => (
                    <div key={`additional-image-${index}-${image.url}`} className="relative p-3 border border-gray-200 rounded-lg">
                      <img 
                        src={image.url} 
                        alt={image.alt} 
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-900 truncate">{image.alt}</p>
                        {image.caption && (
                          <p className="text-xs text-gray-600 truncate">{image.caption}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {additionalImages.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No additional images uploaded yet</p>
                )}
              </div>

              {/* Author Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Author Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="author.name" className="block text-sm font-medium text-gray-700 mb-2">
                      Author Name
                    </label>
                    <input
                      type="text"
                      id="author.name"
                      name="author.name"
                      value={formData.author.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="author.avatar" className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      id="author.avatar"
                      name="author.avatar"
                      value={formData.author.avatar}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="author.bio" className="block text-sm font-medium text-gray-700 mb-2">
                      Author Bio
                    </label>
                    <textarea
                      id="author.bio"
                      name="author.bio"
                      value={formData.author.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                
                {/* Add New Resource */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Resource title"
                      value={newResource.title}
                      onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                      value={newResource.type}
                      onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value as any }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {resourceTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <input
                      type="url"
                      placeholder="Resource URL"
                      value={newResource.url}
                      onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddResource}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Resource
                  </button>
                </div>

                {/* Existing Resources */}
                <div className="space-y-2">
                  {formData.resources.map((resource, index) => (
                    <div key={`resource-${index}-${resource.title}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{resource.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveResource(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Guides */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Guides</h3>
                
                {/* Add New Related Guide */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-3 mb-3">
                    <input
                      type="text"
                      placeholder="Guide title"
                      value={newRelatedGuide.title}
                      onChange={(e) => setNewRelatedGuide(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Guide ID"
                      value={newRelatedGuide.id}
                      onChange={(e) => setNewRelatedGuide(prev => ({ ...prev, id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Guide slug"
                      value={newRelatedGuide.slug}
                      onChange={(e) => setNewRelatedGuide(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRelatedGuide}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Related Guide
                  </button>
                </div>

                {/* Existing Related Guides */}
                <div className="space-y-2">
                  {formData.relatedGuides.map((guide, index) => (
                    <div key={`related-${index}-${guide.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{guide.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRelatedGuide(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
