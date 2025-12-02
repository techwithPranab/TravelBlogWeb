'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { contributorApi } from '@/lib/contributorApi'
import YouTubeVideoManager from '@/components/admin/YouTubeVideoManager'
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Image as ImageIcon,
  MapPin,
  Tag,
  AlertCircle
} from 'lucide-react'

interface Category {
  _id: string
  name: string
  slug: string
}

interface Destination {
  _id: string
  name: string
  slug: string
}

export default function EditPostPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPost, setIsLoadingPost] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    destination: {
      country: '',
      city: '',
      coordinates: {
        lat: 0,
        lng: 0
      }
    },
    kmtravelled: 0,
    tags: '',
    featured: false
  })

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'contributor' && user?.role !== 'admin')) {
      router.push('/login')
      return
    }

    const loadData = async () => {
      try {
        // Load categories and destinations
        const [categoriesResponse, destinationsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/destinations`)
        ])

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.data || categoriesData)
        }

        if (destinationsResponse.ok) {
          const destinationsData = await destinationsResponse.json()
          setDestinations(destinationsData.data || destinationsData)
        }

        // Load post data
        const postsResponse = await contributorApi.getPosts({ status: 'all' })
        const post = postsResponse.data.find(p => p._id === postId)

        if (!post) {
          setError('Post not found')
          return
        }

        // Populate form data
        setFormData({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.categories?.[0]?._id || '',
          destination: post.destination ? {
            country: post.destination.country || '',
            city: post.destination.city || '',
            coordinates: {
              lat: post.destination.coordinates?.lat || 0,
              lng: post.destination.coordinates?.lng || 0
            }
          } : {
            country: '',
            city: '',
            coordinates: {
              lat: 0,
              lng: 0
            }
          },
          kmtravelled: post.kmtravelled || 0,
          tags: post.tags.join(', '),
          featured: post.isPremium || false
        })

        // Set existing images
        if (post.featuredImage?.url) {
          setExistingImages([post.featuredImage.url])
        }

        // Set YouTube videos
        setYoutubeVideos(post.youtubeVideos || [])

      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load post data')
      } finally {
        setIsLoadingPost(false)
      }
    }

    if (postId) {
      loadData()
    }
  }, [isAuthenticated, user, router, postId])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + selectedImages.length > 10) {
      alert('Maximum 10 images allowed')
      return
    }

    setSelectedImages(prev => [...prev, ...files])

    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        if (result && typeof result === 'string') {
          setImagePreviews(prev => [...prev, result])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  // Handle image preview updates
  useEffect(() => {
    const previews: string[] = []

    if (selectedImages.length > 0) {
      selectedImages.forEach((file) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result
          if (result && typeof result === 'string') {
            previews.push(result)
            if (previews.length === selectedImages.length) {
              setImagePreviews([...previews])
            }
          }
        }
        reader.readAsDataURL(file)
      })
    } else {
      setImagePreviews([])
    }
  }, [selectedImages])

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      alert('Title, excerpt, and content are required')
      return
    }

    setIsLoading(true)

    try {
      // Upload new images first if any
      let uploadedImages: string[] = []
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map(file => contributorApi.uploadImage(file))
        const uploadResults = await Promise.all(uploadPromises)
        uploadedImages = uploadResults.map(result => result.data.url)
      }

      // Create update data matching CreatePostRequest interface
      const updateData: any = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        categories: formData.category ? [formData.category] : [],
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        destination: formData.destination ? {
          country: formData.destination,
          city: ''
        } : undefined,
        youtubeVideos: youtubeVideos
      }

      // Handle featured image
      if (uploadedImages.length > 0) {
        updateData.featuredImage = {
          url: uploadedImages[0],
          alt: formData.title
        }
      } else if (existingImages.length > 0) {
        updateData.featuredImage = {
          url: existingImages[0],
          alt: formData.title
        }
      }
      // If no images, don't include featuredImage (it will remain unchanged or be removed)

      await contributorApi.updatePost(postId, updateData)

      // Redirect to posts list
      router.push('/contributor/posts')
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (!isAuthenticated || (user?.role !== 'contributor' && user?.role !== 'admin')) {
    return null
  }

  if (isLoadingPost) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 max-w-md mx-4">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <button
              onClick={() => router.back()}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Edit Post
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your travel story
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter your post title"
            />
          </div>

          {/* Excerpt */}
          <div className="mb-6">
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt *
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Brief description of your post"
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
              placeholder="Write your travel story here..."
            />
          </div>

          {/* Category and Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Destination
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.destination.country}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      destination: { ...prev.destination, country: e.target.value }
                    }))}
                    placeholder="e.g., India"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.destination.city}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      destination: { ...prev.destination, city: e.target.value }
                    }))}
                    placeholder="e.g., Mumbai"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.destination.coordinates.lat}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      destination: { 
                        ...prev.destination, 
                        coordinates: { ...prev.destination.coordinates, lat: parseFloat(e.target.value) || 0 }
                      }
                    }))}
                    placeholder="e.g., 19.0760"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.destination.coordinates.lng}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      destination: { 
                        ...prev.destination, 
                        coordinates: { ...prev.destination.coordinates, lng: parseFloat(e.target.value) || 0 }
                      }
                    }))}
                    placeholder="e.g., 72.8777"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Kilometers Travelled (optional)
                </label>
                <input
                  type="number"
                  value={formData.kmtravelled || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    kmtravelled: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="e.g., 500"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter tags separated by commas (e.g., adventure, hiking, photography)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Featured */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Mark as featured post
              </span>
            </label>
          </div>

          {/* YouTube Videos Section */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <YouTubeVideoManager
              videos={youtubeVideos}
              onChange={setYoutubeVideos}
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Images ({selectedImages.length}/10)
            </label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={`existing-image-${image}-${index}`} className="relative group">
                      <img
                        src={image}
                        alt={`Current ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-primary-600 hover:text-primary-500">
                      Upload new images
                    </span>
                  </label>
                  <input
                    id="image-upload"
                    name="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="sr-only"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>
            </div>

            {/* New Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={`image-preview-${index}-${preview.slice(-10)}`} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Update Post</span>
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
