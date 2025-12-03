'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Star,
  ArrowLeft,
  Download,
  Bookmark,
  Share2,
  CheckCircle,
  DollarSign,
  Camera,
  Utensils,
  Car,
  Users,
  Heart
} from 'lucide-react'
import { generateGuidePDF } from '@/lib/pdfGenerator'
import { guidesApi, Guide } from '@/lib/api'

export default function GuideDetailsPage() {
  const params = useParams()
  const [guide, setGuide] = useState<Guide | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setIsLoading(true)
        const response = await guidesApi.getBySlug(params.slug as string)
        setGuide(response.data)
      } catch (error) {
        console.error('Error fetching guide:', error)
        setGuide(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.slug) {
      fetchGuide()
    }
  }, [params.slug])

  const handleShare = async () => {
    if (navigator.share && guide) {
      try {
        await navigator.share({
          title: guide.title,
          text: guide.description,
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing:', err)
        try {
          await navigator.clipboard.writeText(window.location.href)
          alert('Link copied to clipboard!')
        } catch (clipboardErr) {
          console.error('Error copying to clipboard:', clipboardErr)
          alert('Unable to share. Please copy the URL manually.')
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleDownloadPDF = async () => {
    if (!guide || isDownloadingPDF) return

    try {
      setIsDownloadingPDF(true)
      await generateGuidePDF(guide)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'itinerary': return <Calendar className="w-5 h-5" />
      case 'budget': return <DollarSign className="w-5 h-5" />
      case 'photography': return <Camera className="w-5 h-5" />
      case 'food': return <Utensils className="w-5 h-5" />
      case 'adventure': return <Users className="w-5 h-5" />
      default: return <MapPin className="w-5 h-5" />
    }
  }

  const formatDuration = (duration: string | { days: number; description: string }) => {
    if (typeof duration === 'string') {
      return duration
    }
    if (typeof duration === 'object' && duration.days) {
      return duration.description || `${duration.days} days`
    }
    return 'Duration not specified'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100'
      case 'Moderate': return 'text-yellow-600 bg-yellow-100'
      case 'Challenging': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Guide not found</h1>
          <Link href="/guides" className="text-blue-600 hover:text-blue-800">
            ← Back to Guides
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Link 
            href="/guides" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Guides
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                {getTypeIcon(guide.type)}
                <span className="capitalize">{guide.type}</span>
                <span>•</span>
                <Link 
                  href={guide.destination ? `/destinations/${guide.destination.slug}` : '#'}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  {guide.destination ? `${guide.destination.name}, ${guide.destination.country}` : 'Unknown Destination'}
                </Link>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                {guide.title}
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {guide.description}
              </p>
              
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-4">
                  {guide.author ? (
                    <>
                      <img 
                        src={guide.author?.avatar || '/images/default-avatar.jpg'} 
                        alt={guide.author?.name || 'Unknown Author'}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{guide.author?.name || 'Unknown Author'}</div>
                        <div className="text-sm text-gray-600">
                          Updated {new Date(guide.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className="font-medium text-gray-900">Unknown Author</div>
                      <div className="text-sm text-gray-600">Updated {new Date(guide.lastUpdated).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>Like</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPDF}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className={`w-4 h-4 ${isDownloadingPDF ? 'animate-spin' : ''}`} />
                  <span>{isDownloadingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
                </button>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              {guide.featuredImage && (
                <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden">
                  <Image
                    src={guide.featuredImage.url}
                    alt={guide.featuredImage.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 mb-8 sticky top-8">
              <h3 className="text-base font-bold text-gray-900 mb-4">Guide Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Duration</span>
                  </div>
                  <div className="font-medium">{formatDuration(guide.duration)}</div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                    <Users className="w-4 h-4" />
                    <span>Difficulty</span>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}>
                    {guide.difficulty}
                  </span>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Budget</span>
                  </div>
                  {guide.budget && (
                    <>
                      <div className="font-medium">{guide.budget.range}</div>
                      <div className="text-sm text-gray-600">{guide.budget.details}</div>
                    </>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Best Time</span>
                  </div>
                  <div className="font-medium">{guide.bestTime}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Guide Sections */}
            <section id="sections" className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-8">Guide Overview</h2>
              <div className="space-y-8">
                {(guide.sections || []).map((section, index) => (
                  <div key={section.title} className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{section.title}</h3>
                    <p className="text-base text-gray-700 mb-4 leading-relaxed">{section.content}</p>
                    
                    {section.tips && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h4>
                        <ul className="space-y-1">
                          {(section.tips || []).map((tip, tipIndex) => (
                            <li key={`tip-${section.title}-${tipIndex}`} className="text-blue-800 text-sm flex items-start">
                              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {section.images && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(section.images || []).map((image, imgIndex) => (
                          <div key={`image-${section.title}-${imgIndex}`} className="relative h-48 rounded-lg overflow-hidden">
                            <Image
                              src={image.url}
                              alt={image.alt}
                              fill
                              className="object-cover"
                            />
                            {image.caption && (
                              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                                {image.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Itinerary */}
            {guide.itinerary && (
              <section id="itinerary" className="mb-12">
                <h2 className="text-xl font-bold text-gray-900 mb-8">Day-by-Day Itinerary</h2>
                <div className="space-y-6">
                  {(guide.itinerary || []).map((day) => (
                    <div key={day.day} className="bg-white border rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {day.day}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{day.title}</h3>
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          Budget: {day.budget}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Activities
                          </h4>
                          <ul className="space-y-1">
                            {(day.activities || []).map((activity, actIndex) => (
                              <li key={`activity-${day.day}-${actIndex}`} className="text-gray-700 text-sm flex items-start">
                                <CheckCircle className="w-3 h-3 mr-2 mt-1 flex-shrink-0 text-green-600" />
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <Utensils className="w-4 h-4 mr-2" />
                            Meals
                          </h4>
                          <ul className="space-y-1">
                            {(day.meals || []).map((meal, mealIndex) => (
                              <li key={`meal-${day.day}-${mealIndex}`} className="text-gray-700 text-sm">{meal}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <Car className="w-4 h-4 mr-2" />
                            Accommodation
                          </h4>
                          <p className="text-gray-700 text-sm">{day.accommodation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Packing List */}
            {guide.packingList && (
              <section id="packing" className="mb-12">
                <h2 className="text-xl font-bold text-gray-900 mb-8">Packing List</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(guide.packingList || []).map((category) => (
                    <div key={category.category} className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{category.category}</h3>
                      <ul className="space-y-2">
                        {(category.items || []).map((item, itemIndex) => (
                          <li key={`item-${category.category}-${itemIndex}`} className="flex items-center text-gray-700">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Resources */}
            <section id="resources" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Useful Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(guide.resources || []).map((resource, resourceIndex) => (
                  <a 
                    key={`resource-${resource.title}-${resourceIndex}`}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {resource.type === 'link' && <MapPin className="w-5 h-5 text-blue-600" />}
                    {resource.type === 'document' && <Download className="w-5 h-5 text-green-600" />}
                    {resource.type === 'app' && <User className="w-5 h-5 text-purple-600" />}
                    <span className="font-medium text-gray-900">{resource.title}</span>
                  </a>
                ))}
              </div>
            </section>

            {/* Author Bio */}
            <section className="mb-12">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  {guide.author ? (
                    <>
                      <img 
                        src={guide.author?.avatar || '/images/default-avatar.jpg'} 
                        alt={guide.author?.name || 'Unknown Author'}
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">About {guide.author?.name || 'Unknown Author'}</h3>
                        <p className="text-gray-600">{guide.author?.bio || 'Travel author and local expert'}</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">About Unknown Author</h3>
                      <p className="text-gray-600">Travel author and local expert</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Related Guides */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Guides</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(guide.relatedGuides || []).map((relatedGuide) => (
                  <Link 
                    key={relatedGuide.id} 
                    href={`/guides/${relatedGuide.slug}`}
                    className="group"
                  >
                    <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={relatedGuide.image}
                        alt={relatedGuide.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-black/70 text-white px-2 py-1 rounded text-xs capitalize">
                          {relatedGuide.type}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {relatedGuide.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
