'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MapPin, 
  Calendar, 
  Thermometer, 
  ArrowLeft,
  Clock,
  Users,
  DollarSign,
  Car,
  Utensils,
  Heart,
  Share2,
  Plane,
  Train,
  Bus
} from 'lucide-react'
import { destinationsApi } from '@/lib/api'
import { motion } from 'framer-motion'
import { DestinationSchema } from '@/components/StructuredData'

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
  accommodation: Array<{
    type: string
    name: string
    description: string
    priceRange: string
    rating?: number
    amenities?: string[]
    bookingUrl?: string
  }>
  transportation: string[]
  localCuisine: string[]
  travelTips: string[]
  howToReach: {
    byAir: {
      nearestAirport: string
      distanceFromCity: string
      travelTime: string
      domesticFlights: string
      internationalFlights: string
      transportToCity: string
      estimatedCost: string
    }
    byRail: {
      nearestStation: string
      majorTrains: string
      connections: string
      travelTime: string
      transportToCity: string
      estimatedCost: string
      booking: string
    }
    byRoad: {
      majorHighways: string
      distances?: Array<{
        label: string
        value: string
      }>
      distanceFromDelhi?: string
      distanceFromLucknow?: string
      distanceFromMumbai?: string
      distanceFromBeijing?: string
      distanceFromShanghai?: string
      distanceFromTokyo?: string
      distanceFromOsaka?: string
      distanceFromBangkok?: string
      distanceFromChiangMai?: string
      distanceFromHanoi?: string
      distanceFromHoChiMinhCity?: string
      distanceFromJakarta?: string
      distanceFromBali?: string
      distanceFromKualaLumpur?: string
      distanceFromPenang?: string
      distanceFromSingapore?: string
      distanceFromJohorBahru?: string
      distanceFromLosAngeles?: string
      distanceFromSanFrancisco?: string
      distanceFromToronto?: string
      distanceFromVancouver?: string
      distanceFromMexicoCity?: string
      distanceFromCancun?: string
      distanceFromNewYork?: string
      distanceFromLondon?: string
      distanceFromManchester?: string
      distanceFromParis?: string
      distanceFromLyon?: string
      distanceFromBerlin?: string
      distanceFromMunich?: string
      distanceFromRome?: string
      distanceFromMilan?: string
      distanceFromMadrid?: string
      distanceFromBarcelona?: string
      distanceFromAmsterdam?: string
      distanceFromRotterdam?: string
      distanceFromCairo?: string
      distanceFromAlexandria?: string
      distanceFromCapeTown?: string
      distanceFromJohannesburg?: string
      distanceFromMarrakech?: string
      distanceFromCasablanca?: string
      distanceFromNairobi?: string
      distanceFromMombasa?: string
      distanceFromSaoPaulo?: string
      distanceFromRioDeJaneiro?: string
      distanceFromBuenosAires?: string
      distanceFromCordoba?: string
      distanceFromSantiago?: string
      distanceFromValparaiso?: string
      distanceFromLima?: string
      distanceFromCusco?: string
      distanceFromSydney?: string
      distanceFromMelbourne?: string
      distanceFromAuckland?: string
      distanceFromWellington?: string
      distanceFromKanpur?: string
      distanceFromPatna?: string
      travelTime: string
      busServices: string
      privateCar: string
      estimatedCost: string
    }
  }
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
        console.error('Web Share API failed:', err)
      }
    } else {
      console.log('Sharing not supported, URL:', window.location.href)
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
      {/* Structured Data for SEO */}
      {destination && (
        <DestinationSchema
          name={destination.name}
          description={destination.description}
          image={destination.featuredImage.url}
          url={`/destinations/${params.slug}`}
          latitude={destination.coordinates?.lat}
          longitude={destination.coordinates?.lng}
          addressCountry={destination.country}
          rating={destination.rating}
          ratingCount={destination.totalReviews}
          bestTimeToVisit={destination.bestTimeToVisit}
          popularActivities={destination.activities?.map(a => a.name)}
        />
      )}

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
              className="text-2xl md:text-3xl font-bold mb-4"
            >
              {destination.name}
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center space-x-2 text-lg mb-6"
            >
              <MapPin className="w-6 h-6" />
              <span>{destination.country}, {destination.continent}</span>
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">About {destination.name}</h2>
              <p className="text-base text-gray-700 leading-relaxed">{destination.description}</p>
            </section>

            {/* How to Reach */}
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">How to Reach {destination.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* By Air */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Plane className="w-8 h-8 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900">By Air</h3>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Nearest Airport:</span><br/>
                      {destination.howToReach.byAir.nearestAirport}
                    </div>
                    <div>
                      <span className="font-medium">Distance:</span><br/>
                      {destination.howToReach.byAir.distanceFromCity}
                    </div>
                    <div>
                      <span className="font-medium">Travel Time:</span><br/>
                      {destination.howToReach.byAir.travelTime}
                    </div>
                    <div>
                      <span className="font-medium">Major Connections:</span><br/>
                      {destination.howToReach.byAir.domesticFlights}
                    </div>
                    <div>
                      <span className="font-medium">Transport to City:</span><br/>
                      {destination.howToReach.byAir.transportToCity}
                    </div>
                    <div className="pt-2 border-t border-blue-200">
                      <span className="font-medium text-blue-600">Estimated Cost: {destination.howToReach.byAir.estimatedCost}</span>
                    </div>
                  </div>
                </div>

                {/* By Rail */}
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Train className="w-8 h-8 text-green-600" />
                    <h3 className="text-xl font-semibold text-gray-900">By Rail</h3>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Nearest Station:</span><br/>
                      {destination.howToReach.byRail.nearestStation}
                    </div>
                    <div>
                      <span className="font-medium">Major Trains:</span><br/>
                      {destination.howToReach.byRail.majorTrains}
                    </div>
                    <div>
                      <span className="font-medium">Connections:</span><br/>
                      {destination.howToReach.byRail.connections}
                    </div>
                    <div>
                      <span className="font-medium">Travel Time:</span><br/>
                      {destination.howToReach.byRail.travelTime}
                    </div>
                    <div>
                      <span className="font-medium">Transport to City:</span><br/>
                      {destination.howToReach.byRail.transportToCity}
                    </div>
                    <div className="pt-2 border-t border-green-200">
                      <span className="font-medium text-green-600">Estimated Cost: {destination.howToReach.byRail.estimatedCost}</span>
                    </div>
                  </div>
                </div>

                {/* By Road */}
                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Bus className="w-8 h-8 text-orange-600" />
                    <h3 className="text-xl font-semibold text-gray-900">By Road</h3>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Major Highways:</span><br/>
                      {destination.howToReach.byRoad.majorHighways}
                    </div>
                    {destination.howToReach.byRoad.distances && destination.howToReach.byRoad.distances.length > 0 ? (
                      <div>
                        <span className="font-medium">Distances:</span>
                        <div className="mt-2 space-y-1">
                          {destination.howToReach.byRoad.distances.map((distance, index) => (
                            <div key={`distance-${index}`} className="text-xs">
                              {distance.label}: {distance.value}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      (() => {
                        // Fallback to old structure - show relevant distances based on country
                        const distances = []
                        if (destination.country === 'India') {
                          if (destination.howToReach.byRoad.distanceFromDelhi) {
                            distances.push({ label: 'Distance from Delhi', value: destination.howToReach.byRoad.distanceFromDelhi })
                          }
                          if (destination.howToReach.byRoad.distanceFromLucknow) {
                            distances.push({ label: 'Distance from Lucknow', value: destination.howToReach.byRoad.distanceFromLucknow })
                          }
                          if (destination.howToReach.byRoad.distanceFromKanpur) {
                            distances.push({ label: 'Distance from Kanpur', value: destination.howToReach.byRoad.distanceFromKanpur })
                          }
                          if (destination.howToReach.byRoad.distanceFromPatna) {
                            distances.push({ label: 'Distance from Patna', value: destination.howToReach.byRoad.distanceFromPatna })
                          }
                        } else if (destination.country === 'USA') {
                          if (destination.howToReach.byRoad.distanceFromLosAngeles) {
                            distances.push({ label: 'Distance from Los Angeles', value: destination.howToReach.byRoad.distanceFromLosAngeles })
                          }
                          if (destination.howToReach.byRoad.distanceFromSanFrancisco) {
                            distances.push({ label: 'Distance from San Francisco', value: destination.howToReach.byRoad.distanceFromSanFrancisco })
                          }
                        }
                        
                        return distances.length > 0 ? (
                          <div>
                            <span className="font-medium">Distances:</span>
                            <div className="mt-2 space-y-1">
                              {distances.map((distance, index) => (
                                <div key={`fallback-distance-${index}`} className="text-xs">
                                  {distance.label}: {distance.value}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null
                      })()
                    )}
                    <div>
                      <span className="font-medium">Travel Time:</span><br/>
                      {destination.howToReach.byRoad.travelTime}
                    </div>
                    <div>
                      <span className="font-medium">Bus Services:</span><br/>
                      {destination.howToReach.byRoad.busServices}
                    </div>
                    <div className="pt-2 border-t border-orange-200">
                      <span className="font-medium text-orange-600">Estimated Cost: {destination.howToReach.byRoad.estimatedCost}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Gallery */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {destination.gallery.map((image, index) => (
                  <button
                    key={`gallery-${image.url}-${index}`}
                    className="relative h-48 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform border-0 bg-transparent p-0"
                    onClick={() => {
                      // For now, just log the image URL
                      console.log('View image:', image.url)
                    }}
                    aria-label={`View ${image.alt}`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </section>

            {/* Highlights */}
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destination.highlights.map((highlight) => (
                  <div key={highlight} className="flex items-start">
                    <span className="text-gray-700">• {highlight}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Activities */}
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Things to Do</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {destination.activities.map((activity) => (
                  <div key={`activity-${activity.name}`} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{activity.icon}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{activity.name}</h3>
                    </div>
                    <p className="text-base text-gray-700">{activity.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Travel Tips */}
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Travel Tips</h2>
              <div className="bg-blue-50 rounded-lg p-6">
                <ul className="space-y-3">
                  {destination.travelTips.map((tip) => (
                    <li key={`tip-${tip}`} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Accommodation */}
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Where to Stay</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destination.accommodation?.map((accommodation, index) => (
                  <div key={`accommodation-${accommodation.name}-${index}`} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{accommodation.name}</h3>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          accommodation.type === 'budget' ? 'bg-green-100 text-green-800' :
                          accommodation.type === 'mid-range' ? 'bg-blue-100 text-blue-800' :
                          accommodation.type === 'luxury' ? 'bg-purple-100 text-purple-800' :
                          accommodation.type === 'hostel' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {accommodation.type.charAt(0).toUpperCase() + accommodation.type.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 text-sm">{accommodation.description}</p>
                    
                    <div className="mb-4">
                      <span className="text-lg font-bold text-green-600">{accommodation.priceRange}</span>
                      <span className="text-sm text-gray-500 ml-1">per night</span>
                    </div>
                    
                    {accommodation.amenities && accommodation.amenities.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities:</h4>
                        <div className="flex flex-wrap gap-1">
                          {accommodation.amenities.slice(0, 4).map((amenity) => (
                            <span key={amenity} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              {amenity}
                            </span>
                          ))}
                          {accommodation.amenities.length > 4 && (
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              +{accommodation.amenities.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {accommodation.bookingUrl && (
                      <a
                        href={accommodation.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Book Now
                      </a>
                    )}
                  </div>
                ))}
              </div>
              
              {(!destination.accommodation || destination.accommodation.length === 0) && (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏨</span>
                    </div>
                    <p className="text-lg">Accommodation information coming soon</p>
                    <p className="text-sm">We're working on adding detailed accommodation options for this destination.</p>
                  </div>
                </div>
              )}
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

            {/* Transportation */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Getting Around</h3>
              <ul className="space-y-2">
                {destination.transportation.map((transport) => (
                  <li key={`transport-${transport}`} className="flex items-center space-x-2">
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
                {destination.localCuisine.map((dish) => (
                  <li key={`cuisine-${dish}`} className="flex items-center space-x-2">
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
