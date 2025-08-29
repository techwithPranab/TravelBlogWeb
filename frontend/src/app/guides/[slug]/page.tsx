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

interface Guide {
  id: string
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
  duration: string
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  budget: {
    range: string
    details: string
  }
  bestTime: string
  rating: number
  totalReviews: number
  publishedAt: string
  lastUpdated: string
  isPremium: boolean
  downloadCount: number
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

export default function GuideDetailsPage() {
  const params = useParams()
  const [guide, setGuide] = useState<Guide | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setGuide({
        id: '1',
        title: 'Complete 7-Day Santorini Travel Guide',
        description: 'A comprehensive guide to exploring Santorini in 7 days, including hidden gems, local experiences, and budget-friendly tips for the perfect Greek island adventure.',
        type: 'itinerary',
        destination: {
          name: 'Santorini',
          country: 'Greece',
          slug: 'santorini'
        },
        author: {
          name: 'Elena Papadopoulos',
          avatar: '/images/author-elena.jpg',
          bio: 'Local travel expert and Santorini native with 15+ years of experience guiding travelers'
        },
        featuredImage: {
          url: '/images/santorini-guide.jpg',
          alt: 'Santorini travel guide'
        },
        duration: '7 days',
        difficulty: 'Easy',
        budget: {
          range: '$800-1500 per person',
          details: 'Includes accommodation, meals, activities, and local transportation'
        },
        bestTime: 'April to October',
        rating: 4.9,
        totalReviews: 2847,
        publishedAt: '2024-01-15',
        lastUpdated: '2024-03-01',
        isPremium: false,
        downloadCount: 15420,
        sections: [
          {
            title: 'Getting There & Around',
            content: 'Santorini is accessible by ferry from Athens (5-8 hours) or by flight (45 minutes). The island has a good bus network, but renting a car or ATV gives you more flexibility to explore hidden spots.',
            tips: [
              'Book ferry tickets in advance during peak season',
              'Consider staying in different areas to experience variety',
              'Download offline maps before arriving'
            ],
            images: [
              {
                url: '/images/santorini-ferry.jpg',
                alt: 'Ferry to Santorini',
                caption: 'Ferry arriving at Santorini port'
              }
            ]
          },
          {
            title: 'Where to Stay',
            content: 'Choose your base wisely. Oia offers the best sunsets but is crowded. Fira has nightlife and central location. Imerovigli provides luxury with fewer crowds. Consider cave hotels for a unique experience.',
            tips: [
              'Book caldera-view rooms well in advance',
              'Consider staying in multiple locations',
              'Traditional villages offer authentic experiences'
            ]
          },
          {
            title: 'Must-See Attractions',
            content: 'Beyond the famous blue domes, visit Red Beach, Ancient Akrotiri, and local wineries. Take a sunset sailing trip and explore traditional villages like Pyrgos and Megalochori.',
            tips: [
              'Visit popular spots early morning or late afternoon',
              'Respect local customs and photography rules',
              'Try local wines - Santorini produces unique varieties'
            ]
          }
        ],
        itinerary: [
          {
            day: 1,
            title: 'Arrival & Fira Exploration',
            activities: [
              'Arrive in Santorini (morning flight recommended)',
              'Check into hotel in Fira',
              'Explore Fira town and caldera views',
              'Visit Archaeological Museum',
              'Sunset dinner at caldera-view restaurant'
            ],
            meals: ['Breakfast on flight', 'Lunch at local taverna', 'Dinner with sunset views'],
            accommodation: 'Hotel in Fira',
            budget: '$120-200'
          },
          {
            day: 2,
            title: 'Oia & Northern Villages',
            activities: [
              'Morning bus to Oia',
              'Explore Oia village and shops',
              'Visit Maritime Museum',
              'Lunch in Oia',
              'Famous Oia sunset viewing'
            ],
            meals: ['Hotel breakfast', 'Lunch in Oia', 'Dinner in Oia'],
            accommodation: 'Hotel in Fira',
            budget: '$100-150'
          },
          {
            day: 3,
            title: 'Beach Day & Wine Tasting',
            activities: [
              'Morning at Red Beach',
              'Visit Ancient Akrotiri',
              'Wine tasting at Santo Wines',
              'Relax at Kamari Beach',
              'Evening in Kamari village'
            ],
            meals: ['Hotel breakfast', 'Beach lunch', 'Dinner in Kamari'],
            accommodation: 'Hotel in Fira',
            budget: '$90-140'
          }
        ],
        packingList: [
          {
            category: 'Clothing',
            items: ['Comfortable walking shoes', 'Sundresses/light shirts', 'Light jacket', 'Swimwear', 'Sun hat']
          },
          {
            category: 'Electronics',
            items: ['Camera', 'Phone charger', 'Power bank', 'Waterproof phone case']
          },
          {
            category: 'Essentials',
            items: ['Sunscreen SPF 50+', 'Sunglasses', 'Water bottle', 'Travel documents', 'Cash and cards']
          }
        ],
        resources: [
          {
            title: 'Official Santorini Tourism Website',
            type: 'link',
            url: 'https://santorini.net'
          },
          {
            title: 'Offline Maps of Santorini',
            type: 'app',
            url: 'https://maps.me'
          },
          {
            title: 'Downloadable Itinerary PDF',
            type: 'document',
            url: '/downloads/santorini-itinerary.pdf'
          }
        ],
        relatedGuides: [
          {
            id: '2',
            title: 'Santorini Photography Guide',
            slug: 'santorini-photography-guide',
            image: '/images/guide-photography.jpg',
            type: 'photography'
          },
          {
            id: '3',
            title: 'Budget Travel in Greek Islands',
            slug: 'budget-greek-islands',
            image: '/images/guide-budget.jpg',
            type: 'budget'
          },
          {
            id: '4',
            title: 'Greek Island Hopping Itinerary',
            slug: 'greek-island-hopping',
            image: '/images/guide-islands.jpg',
            type: 'itinerary'
          }
        ]
      })
      setIsLoading(false)
    }, 1000)
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
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
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
                  href={`/destinations/${guide.destination.slug}`}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  {guide.destination.name}, {guide.destination.country}
                </Link>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {guide.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {guide.description}
              </p>
              
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-4">
                  <img 
                    src={guide.author.avatar} 
                    alt={guide.author.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{guide.author.name}</div>
                    <div className="text-sm text-gray-600">
                      Updated {new Date(guide.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{guide.rating}</span>
                  <span className="text-gray-600">({guide.totalReviews.toLocaleString()} reviews)</span>
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
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isBookmarked 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>Save</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden">
                <Image
                  src={guide.featuredImage.url}
                  alt={guide.featuredImage.alt}
                  fill
                  className="object-cover"
                />
              </div>
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
              <h3 className="text-lg font-bold text-gray-900 mb-4">Guide Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Duration</span>
                  </div>
                  <div className="font-medium">{guide.duration}</div>
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
                  <div className="font-medium">{guide.budget.range}</div>
                  <div className="text-sm text-gray-600">{guide.budget.details}</div>
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
            
            {/* Navigation */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Contents</h4>
              <nav className="space-y-2">
                <a href="#sections" className="block text-sm text-gray-600 hover:text-blue-600">Guide Sections</a>
                {guide.itinerary && (
                  <a href="#itinerary" className="block text-sm text-gray-600 hover:text-blue-600">Day-by-Day Itinerary</a>
                )}
                {guide.packingList && (
                  <a href="#packing" className="block text-sm text-gray-600 hover:text-blue-600">Packing List</a>
                )}
                <a href="#resources" className="block text-sm text-gray-600 hover:text-blue-600">Useful Resources</a>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Guide Sections */}
            <section id="sections" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Guide Overview</h2>
              <div className="space-y-8">
                {guide.sections.map((section, index) => (
                  <div key={section.title} className="bg-white border rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">{section.content}</p>
                    
                    {section.tips && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h4>
                        <ul className="space-y-1">
                          {section.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="text-blue-800 text-sm flex items-start">
                              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {section.images && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="relative h-48 rounded-lg overflow-hidden">
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
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Day-by-Day Itinerary</h2>
                <div className="space-y-6">
                  {guide.itinerary.map((day) => (
                    <div key={day.day} className="bg-white border rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {day.day}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{day.title}</h3>
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
                            {day.activities.map((activity, actIndex) => (
                              <li key={actIndex} className="text-gray-700 text-sm flex items-start">
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
                            {day.meals.map((meal, mealIndex) => (
                              <li key={mealIndex} className="text-gray-700 text-sm">{meal}</li>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Packing List</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {guide.packingList.map((category) => (
                    <div key={category.category} className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{category.category}</h3>
                      <ul className="space-y-2">
                        {category.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center text-gray-700">
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
                {guide.resources.map((resource, resourceIndex) => (
                  <a 
                    key={resourceIndex}
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
                  <img 
                    src={guide.author.avatar} 
                    alt={guide.author.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">About {guide.author.name}</h3>
                    <p className="text-gray-600">{guide.author.bio}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Related Guides */}
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Guides</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {guide.relatedGuides.map((relatedGuide) => (
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
