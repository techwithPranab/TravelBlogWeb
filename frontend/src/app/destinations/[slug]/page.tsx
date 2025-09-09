'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MapPin, 
  Calendar, 
  Thermometer, 
  Plane, 
  Camera, 
  Star,
  ArrowLeft,
  Clock,
  Users,
  DollarSign,
  Wifi,
  Car,
  Mountain,
  Utensils,
  Heart,
  Share2,
  BookOpen
} from 'lucide-react'
import { destinationsApi } from '@/lib/api'
import { motion } from 'framer-motion'

interface Destination {
  _id: string
  name: string
  country: string
  continent: string
  description: string
  featuredImage: {
    url: string
    alt: string
  }
  gallery: Array<{
    url: string
    alt: string
  }>
  coordinates: {
    lat: number
    lng: number
  }
  bestTimeToVisit: string
  averageTemperature: {
    summer: string
    winter: string
  }
  currency: string
  language: string
  timezone: string
  rating: number
  totalReviews: number
  highlights: string[]
  activities: Array<{
    name: string
    icon: string
    description: string
  }>
  accommodation: {
    budget: string
    midRange: string
    luxury: string
  }
  transportation: string[]
  localCuisine: string[]
  travelTips: string[]
  relatedPosts: Array<{
    id: string
    title: string
    slug: string
    image: string
  }>
}

export default function DestinationDetailsPage() {
  const params = useParams()
  const [destination, setDestination] = useState<Destination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setError(null)
        const slug = params.slug as string
        const response = await destinationsApi.getBySlug(slug)
        setDestination(response.data)
      } catch (error) {
        console.error('Error fetching destination:', error)
        setError('Destination not found')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.slug) {
      fetchDestination()
    }
  }, [params.slug])

  const handleShare = async () => {
    if (navigator.share && destination) {
      try {
        await navigator.share({
          title: `${destination.name}, ${destination.country}`,
          text: destination.description,
          url: window.location.href,
        })
      } catch (err) {
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Destination not found'}
          </h1>
          <Link href="/destinations" className="text-blue-600 hover:text-blue-800">
            ← Back to Destinations
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen">
        <Image
          src={destination.featuredImage.url}
          alt={destination.featuredImage.alt}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <Link 
              href="/destinations" 
              className="inline-flex items-center text-white/80 hover:text-white mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Destinations
            </Link>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold mb-4"
            >
              {destination.name}
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center space-x-2 text-xl mb-6"
            >
              <MapPin className="w-6 h-6" />
              <span>{destination.country}, {destination.continent}</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center space-x-6 mb-8"
            >
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span>{destination.rating}</span>
                <span className="text-white/80">({destination.totalReviews.toLocaleString()} reviews)</span>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center space-x-4"
            >
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                  isLiked 
                    ? 'bg-red-600 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{isLiked ? 'Saved' : 'Save'}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About {destination.name}</h2>
              <p className="text-lg text-gray-700 leading-relaxed">{destination.description}</p>
            </section>

            {/* Gallery */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {destination.gallery.map((image, index) => (
                  <div 
                    key={index}
                    className="relative h-48 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Highlights */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destination.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Activities */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Things to Do</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {destination.activities.map((activity, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{activity.icon}</span>
                      <h3 className="text-xl font-semibold text-gray-900">{activity.name}</h3>
                    </div>
                    <p className="text-gray-700">{activity.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Travel Tips */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Travel Tips</h2>
              <div className="bg-blue-50 rounded-lg p-6">
                <ul className="space-y-3">
                  {destination.travelTips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Facts */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Facts</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Best Time</div>
                    <div className="text-sm text-gray-600">{destination.bestTimeToVisit}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Thermometer className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Temperature</div>
                    <div className="text-sm text-gray-600">
                      Summer: {destination.averageTemperature.summer}<br/>
                      Winter: {destination.averageTemperature.winter}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Currency</div>
                    <div className="text-sm text-gray-600">{destination.currency}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Language</div>
                    <div className="text-sm text-gray-600">{destination.language}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium">Timezone</div>
                    <div className="text-sm text-gray-600">{destination.timezone}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accommodation */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Accommodation</h3>
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-green-600">Budget</div>
                  <div className="text-sm text-gray-600">{destination.accommodation.budget}</div>
                </div>
                <div>
                  <div className="font-medium text-blue-600">Mid-Range</div>
                  <div className="text-sm text-gray-600">{destination.accommodation.midRange}</div>
                </div>
                <div>
                  <div className="font-medium text-purple-600">Luxury</div>
                  <div className="text-sm text-gray-600">{destination.accommodation.luxury}</div>
                </div>
              </div>
            </div>

            {/* Transportation */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Getting Around</h3>
              <ul className="space-y-2">
                {destination.transportation.map((transport, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{transport}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Local Cuisine */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Local Cuisine</h3>
              <ul className="space-y-2">
                {destination.localCuisine.map((dish, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Utensils className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{dish}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destination.relatedPosts.map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`}
                className="group"
              >
                <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
