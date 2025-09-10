import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Users, MessageCircle, Camera, MapPin, Heart, Star, Globe, Compass, Share2 } from 'lucide-react'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Communities | TravelBlog',
  description: 'Join our vibrant travel communities. Connect with fellow travelers, share experiences, and discover new destinations together.',
  keywords: 'travel community, travel groups, travel forum, travelers, travel social network, travel friends',
}

export default function CommunitiesPage() {
  const communities = [
    {
      id: 1,
      name: 'Solo Travelers',
      description: 'Connect with independent travelers and share solo travel tips, experiences, and safety advice.',
      members: 12500,
      posts: 8900,
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
      category: 'Travel Style',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Budget Backpackers',
      description: 'Share budget travel tips, cheap accommodations, and money-saving strategies for backpackers.',
      members: 18200,
      posts: 15600,
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
      category: 'Budget Travel',
      color: 'bg-green-500'
    },
    {
      id: 3,
      name: 'Digital Nomads',
      description: 'Community for remote workers who travel. Share workspaces, visa tips, and nomad-friendly destinations.',
      members: 9800,
      posts: 7200,
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
      category: 'Lifestyle',
      color: 'bg-purple-500'
    },
    {
      id: 4,
      name: 'Adventure Seekers',
      description: 'For thrill-seekers and adventure enthusiasts. Share extreme sports, hiking, and adrenaline activities.',
      members: 15400,
      posts: 12800,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      category: 'Adventure',
      color: 'bg-red-500'
    },
    {
      id: 5,
      name: 'Food & Culture',
      description: 'Explore local cuisines, cultural experiences, and authentic travel moments around the world.',
      members: 21700,
      posts: 18900,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
      category: 'Culture',
      color: 'bg-yellow-500'
    },
    {
      id: 6,
      name: 'Family Travel',
      description: 'Tips and advice for traveling with kids, family-friendly destinations, and travel planning.',
      members: 14300,
      posts: 11500,
      image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop',
      category: 'Family',
      color: 'bg-pink-500'
    },
    {
      id: 7,
      name: 'Photography',
      description: 'Share travel photography, tips for capturing amazing shots, and photo inspiration.',
      members: 19600,
      posts: 25400,
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
      category: 'Photography',
      color: 'bg-indigo-500'
    },
    {
      id: 8,
      name: 'Luxury Travel',
      description: 'High-end travel experiences, luxury accommodations, and premium travel services.',
      members: 8900,
      posts: 6700,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
      category: 'Luxury',
      color: 'bg-gold-500'
    }
  ]

  const features = [
    {
      icon: MessageCircle,
      title: 'Discussion Forums',
      description: 'Engage in meaningful conversations with fellow travelers'
    },
    {
      icon: Camera,
      title: 'Photo Sharing',
      description: 'Share your travel photos and get inspired by others'
    },
    {
      icon: MapPin,
      title: 'Destination Guides',
      description: 'Collaborate on community-driven destination guides'
    },
    {
      icon: Heart,
      title: 'Travel Buddies',
      description: 'Find travel companions for your next adventure'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="container mx-auto px-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center mb-4">
            <Users className="w-8 h-8 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold">Travel Communities</h1>
          </div>
          
          <p className="text-xl text-orange-100 max-w-2xl mb-8">
            Join vibrant communities of travelers from around the world. Share experiences, get advice, 
            and make lasting connections.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button className="bg-white text-orange-500 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
              Join a Community
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Create New Community
            </button>
          </div>
        </div>
      </div>

      {/* Community Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Join Our Communities?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with like-minded travelers and enhance your travel experiences through community engagement.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <feature.icon className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Communities Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Communities</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find your tribe and connect with travelers who share your interests and travel style.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {communities.map((community) => (
              <div key={community.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={community.image}
                    alt={community.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute top-4 left-4">
                    <span className={`${community.color} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                      {community.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{community.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{community.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{(community.members || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        <span>{(community.posts || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium">
                    Join Community
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Community Guidelines</h2>
              <p className="text-lg text-gray-600">
                Help us maintain a positive and welcoming environment for all travelers.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <Heart className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Be Respectful</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li>• Treat all members with kindness and respect</li>
                  <li>• Embrace different perspectives and experiences</li>
                  <li>• No discrimination or harassment of any kind</li>
                  <li>• Keep discussions constructive and helpful</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <Share2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Share Authentically</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li>• Share genuine travel experiences and tips</li>
                  <li>• Provide accurate and helpful information</li>
                  <li>• Credit sources and respect intellectual property</li>
                  <li>• No spam or excessive self-promotion</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <Compass className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Stay On Topic</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li>• Keep discussions travel-related</li>
                  <li>• Post in appropriate community categories</li>
                  <li>• Use clear and descriptive titles</li>
                  <li>• Search before posting duplicate content</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="bg-orange-100 rounded-full p-2 mr-3">
                    <Star className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Help Others</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li>• Answer questions when you can help</li>
                  <li>• Share useful resources and tips</li>
                  <li>• Welcome new community members</li>
                  <li>• Report inappropriate content</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-8 text-center text-white">
            <Globe className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Ready to Connect?</h2>
            <p className="text-xl mb-8 text-orange-100 max-w-2xl mx-auto">
              Join thousands of travelers sharing experiences, tips, and creating lasting friendships 
              through our vibrant communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
                Browse Communities
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Create Account
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
