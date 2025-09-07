'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Camera, 
  MapPin, 
  Heart, 
  Download, 
  Search, 
  Filter,
  Clock,
  User,
  Grid3X3,
  List,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Photo {
  _id: string
  title: string
  description: string
  imageUrl: string
  thumbnailUrl: string
  location: {
    country: string
    city: string
  }
  photographer: {
    name: string
    email: string
  }
  tags: string[]
  category: string
  likes: number
  downloads: number
  isLiked?: boolean
  createdAt: string
  camera?: {
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

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'landscape', label: 'Landscape' },
    { value: 'architecture', label: 'Architecture' },
    { value: 'food', label: 'Food & Cuisine' },
    { value: 'culture', label: 'Culture & People' },
    { value: 'adventure', label: 'Adventure & Sports' },
    { value: 'wildlife', label: 'Wildlife & Nature' },
    { value: 'people', label: 'Portraits & People' },
    { value: 'other', label: 'Other' }
  ]

  useEffect(() => {
    fetchPhotos()
  }, [])

  useEffect(() => {
    filterPhotos()
  }, [photos, searchTerm, selectedCategory, selectedLocation])

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/photos`)
      console.log('Fetch photos response:', response);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched photos:', data);
        setPhotos(data.data || [])
      } else {
        setError('Failed to load photos')
      }
    } catch (err) {
      console.error('Failed to fetch photos:', err)
      setError('Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  const filterPhotos = () => {
    let filtered = photos

    if (searchTerm) {
      filtered = filtered.filter(photo =>
        photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        photo.location.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.location.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(photo => photo.category === selectedCategory)
    }

    if (selectedLocation) {
      filtered = filtered.filter(photo => 
        photo.location.country.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    }

    setFilteredPhotos(filtered)
  }

  const handleLike = async (photoId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/photos/${photoId}/like`, {
        method: 'POST',
      })
      
      if (response.ok) {
        setPhotos(prev => prev.map(photo => 
          photo._id === photoId 
            ? { ...photo, likes: photo.likes + 1, isLiked: true }
            : photo
        ))
      }
    } catch (err) {
      console.error('Failed to like photo:', err)
    }
  }

  const handleDownload = async (photoId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/photos/${photoId}/download`, {
        method: 'POST',
      })
      
      if (response.ok) {
        setPhotos(prev => prev.map(photo => 
          photo._id === photoId 
            ? { ...photo, downloads: photo.downloads + 1 }
            : photo
        ))
      }
    } catch (err) {
      console.error('Failed to track download:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const uniqueCountries = Array.from(new Set(photos.map(photo => photo.location.country)))

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-gray-600">Loading amazing photos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPhotos}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Camera className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Travel Photo Gallery</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Discover breathtaking travel photography from around the world, submitted by our amazing community
            </p>
            <Link
              href="/submit-photo"
              className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <Camera className="w-5 h-5 mr-2" />
              Submit Your Photo
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search photos, locations, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  {uniqueCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600'} rounded-l-lg transition-colors`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'} rounded-r-lg transition-colors`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredPhotos.length} of {photos.length} photos
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="container mx-auto px-4 py-8">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No photos found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters, or be the first to submit a photo!
            </p>
            <Link
              href="/submit-photo"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-5 h-5 mr-2" />
              Submit First Photo
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            {viewMode === 'grid' ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                layout
              >
                {filteredPhotos.map((photo, index) => (
                  <motion.div
                    key={photo._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={photo.thumbnailUrl}
                        alt={photo.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {photo.category}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {photo.title}
                      </h3>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {photo.location.city ? `${photo.location.city}, ` : ''}{photo.location.country}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <User className="w-4 h-4 mr-1" />
                        {photo.photographer.name}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLike(photo._id)
                            }}
                            className={`flex items-center gap-1 hover:text-red-500 transition-colors ${photo.isLiked ? 'text-red-500' : ''}`}
                          >
                            <Heart className={`w-4 h-4 ${photo.isLiked ? 'fill-current' : ''}`} />
                            {photo.likes}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownload(photo._id)
                            }}
                            className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            {photo.downloads}
                          </button>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(photo.createdAt)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div className="space-y-6" layout>
                {filteredPhotos.map((photo, index) => (
                  <motion.div
                    key={photo._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative w-full md:w-80 h-64 md:h-48">
                        <Image
                          src={photo.thumbnailUrl}
                          alt={photo.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 320px"
                        />
                      </div>
                      
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {photo.title}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              {photo.location.city ? `${photo.location.city}, ` : ''}{photo.location.country}
                            </div>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                            {photo.category}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {photo.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-1" />
                            {photo.photographer.name}
                            <span className="mx-2">•</span>
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(photo.createdAt)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleLike(photo._id)
                              }}
                              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${photo.isLiked ? 'text-red-500' : ''}`}
                            >
                              <Heart className={`w-4 h-4 ${photo.isLiked ? 'fill-current' : ''}`} />
                              {photo.likes}
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownload(photo._id)
                              }}
                              className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              {photo.downloads}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Image
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  width={800}
                  height={600}
                  className="w-full h-auto rounded-t-2xl"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedPhoto.title}
                    </h2>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-5 h-5 mr-2" />
                      {selectedPhoto.location.city ? `${selectedPhoto.location.city}, ` : ''}{selectedPhoto.location.country}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User className="w-5 h-5 mr-2" />
                      {selectedPhoto.photographer.name}
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {selectedPhoto.category}
                  </span>
                </div>
                
                {selectedPhoto.description && (
                  <p className="text-gray-700 mb-6">
                    {selectedPhoto.description}
                  </p>
                )}
                
                {selectedPhoto.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPhoto.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedPhoto.camera && (selectedPhoto.camera.make || selectedPhoto.camera.model) && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Camera className="w-5 h-5 mr-2" />
                      Camera Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {(selectedPhoto.camera.make || selectedPhoto.camera.model) && (
                        <p className="text-gray-700 mb-2">
                          <strong>Camera:</strong> {selectedPhoto.camera.make} {selectedPhoto.camera.model}
                        </p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {selectedPhoto.camera.settings.aperture && (
                          <div>
                            <span className="text-gray-500">Aperture:</span>
                            <br />
                            <span className="font-medium">{selectedPhoto.camera.settings.aperture}</span>
                          </div>
                        )}
                        {selectedPhoto.camera.settings.shutter && (
                          <div>
                            <span className="text-gray-500">Shutter:</span>
                            <br />
                            <span className="font-medium">{selectedPhoto.camera.settings.shutter}</span>
                          </div>
                        )}
                        {selectedPhoto.camera.settings.iso && (
                          <div>
                            <span className="text-gray-500">ISO:</span>
                            <br />
                            <span className="font-medium">{selectedPhoto.camera.settings.iso}</span>
                          </div>
                        )}
                        {selectedPhoto.camera.settings.focalLength && (
                          <div>
                            <span className="text-gray-500">Focal Length:</span>
                            <br />
                            <span className="font-medium">{selectedPhoto.camera.settings.focalLength}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-6 text-gray-600">
                    <button
                      onClick={() => handleLike(selectedPhoto._id)}
                      className={`flex items-center gap-2 hover:text-red-500 transition-colors ${selectedPhoto.isLiked ? 'text-red-500' : ''}`}
                    >
                      <Heart className={`w-5 h-5 ${selectedPhoto.isLiked ? 'fill-current' : ''}`} />
                      {selectedPhoto.likes} likes
                    </button>
                    
                    <button
                      onClick={() => handleDownload(selectedPhoto._id)}
                      className="flex items-center gap-2 hover:text-blue-500 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      {selectedPhoto.downloads} downloads
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {formatDate(selectedPhoto.createdAt)}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
