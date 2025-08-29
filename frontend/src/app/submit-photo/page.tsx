'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Upload, 
  MapPin, 
  Camera, 
  Tag, 
  User, 
  FileImage,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'
import { motion } from 'framer-motion'

interface PhotoData {
  title: string
  description: string
  imageUrl: string
  thumbnailUrl: string
  location: {
    country: string
    city: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  photographer: {
    name: string
    email: string
  }
  tags: string[]
  category: string
  camera: {
    make: string
    model: string
    settings: {
      aperture: string
      shutter: string
      iso: string
      focalLength: string
    }
  }
}

export default function SubmitPhotoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [tagInput, setTagInput] = useState('')
  
  const [formData, setFormData] = useState<PhotoData>({
    title: '',
    description: '',
    imageUrl: '',
    thumbnailUrl: '',
    location: {
      country: '',
      city: ''
    },
    photographer: {
      name: '',
      email: ''
    },
    tags: [],
    category: '',
    camera: {
      make: '',
      model: '',
      settings: {
        aperture: '',
        shutter: '',
        iso: '',
        focalLength: ''
      }
    }
  })

  const categories = [
    { value: 'landscape', label: 'Landscape' },
    { value: 'architecture', label: 'Architecture' },
    { value: 'food', label: 'Food & Cuisine' },
    { value: 'culture', label: 'Culture & People' },
    { value: 'adventure', label: 'Adventure & Sports' },
    { value: 'wildlife', label: 'Wildlife & Nature' },
    { value: 'people', label: 'Portraits & People' },
    { value: 'other', label: 'Other' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const keys = name.split('.')
      setFormData(prev => {
        const newData = { ...prev }
        let current: any = newData
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]]
        }
        current[keys[keys.length - 1]] = value
        
        return newData
      })
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload to a cloud storage service
      // For now, we'll simulate with a placeholder URL
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setFormData(prev => ({
          ...prev,
          imageUrl,
          thumbnailUrl: imageUrl // In real app, generate thumbnail
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required'
    if (!formData.imageUrl) return 'Image is required'
    if (!formData.location.country.trim()) return 'Country is required'
    if (!formData.photographer.name.trim()) return 'Photographer name is required'
    if (!formData.photographer.email.trim()) return 'Email is required'
    if (!formData.category) return 'Category is required'
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.photographer.email)) {
      return 'Please enter a valid email address'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        setIsSuccess(true)
        // Reset form after successful submission
        setTimeout(() => {
          router.push('/gallery')
        }, 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to submit photo')
      }
    } catch (err) {
      console.error('Photo submission error:', err)
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Photo Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your submission. Your photo is now under review and will be published once approved.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to gallery in a few seconds...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Camera className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Submit Your Travel Photo</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your amazing travel photography with our community. All submissions are reviewed before publication.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                <FileImage className="w-5 h-5 inline mr-2" />
                Photo Upload *
              </label>
              
              {!formData.imageUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">Click to upload your photo</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports: JPG, PNG, WebP (Max 10MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <Image
                    src={formData.imageUrl}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="rounded-lg object-cover mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '', thumbnailUrl: '' }))}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Photo Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Photo Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a captivating title"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about this photo - the story behind it, what makes it special..."
              />
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location.country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    id="location.country"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Greece"
                  />
                </div>

                <div>
                  <label htmlFor="location.city" className="block text-sm font-medium text-gray-700 mb-2">
                    City/Region
                  </label>
                  <input
                    type="text"
                    id="location.city"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Santorini"
                  />
                </div>
              </div>
            </div>

            {/* Photographer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Photographer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="photographer.name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="photographer.name"
                    name="photographer.name"
                    value={formData.photographer.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="photographer.email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="photographer.email"
                    name="photographer.email"
                    value={formData.photographer.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags
              </label>
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add tags (e.g., sunset, beach, vacation)"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Camera Information (Optional) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Camera Information (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="camera.make" className="block text-sm font-medium text-gray-700 mb-2">
                    Camera Make
                  </label>
                  <input
                    type="text"
                    id="camera.make"
                    name="camera.make"
                    value={formData.camera.make}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Canon"
                  />
                </div>

                <div>
                  <label htmlFor="camera.model" className="block text-sm font-medium text-gray-700 mb-2">
                    Camera Model
                  </label>
                  <input
                    type="text"
                    id="camera.model"
                    name="camera.model"
                    value={formData.camera.model}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., EOS R5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label htmlFor="camera.settings.aperture" className="block text-sm font-medium text-gray-700 mb-2">
                    Aperture
                  </label>
                  <input
                    type="text"
                    id="camera.settings.aperture"
                    name="camera.settings.aperture"
                    value={formData.camera.settings.aperture}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="f/2.8"
                  />
                </div>

                <div>
                  <label htmlFor="camera.settings.shutter" className="block text-sm font-medium text-gray-700 mb-2">
                    Shutter Speed
                  </label>
                  <input
                    type="text"
                    id="camera.settings.shutter"
                    name="camera.settings.shutter"
                    value={formData.camera.settings.shutter}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1/500s"
                  />
                </div>

                <div>
                  <label htmlFor="camera.settings.iso" className="block text-sm font-medium text-gray-700 mb-2">
                    ISO
                  </label>
                  <input
                    type="text"
                    id="camera.settings.iso"
                    name="camera.settings.iso"
                    value={formData.camera.settings.iso}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label htmlFor="camera.settings.focalLength" className="block text-sm font-medium text-gray-700 mb-2">
                    Focal Length
                  </label>
                  <input
                    type="text"
                    id="camera.settings.focalLength"
                    name="camera.settings.focalLength"
                    value={formData.camera.settings.focalLength}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="85mm"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 pt-8">
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Photo for Review'}
                </button>
                
                <p className="text-sm text-gray-500 mt-4">
                  By submitting, you agree to our terms and conditions. Photos are reviewed within 24-48 hours.
                </p>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
