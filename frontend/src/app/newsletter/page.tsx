"use client"
import Link from 'next/link'
import { ArrowLeft, Mail, Gift, Users, Globe, Calendar, Star, CheckCircle, Zap } from 'lucide-react'
import { useState } from 'react'

export default function NewsletterPage() {
  const [email, setEmail] = useState('')
  const [preferences, setPreferences] = useState({
    weekly: true,
    deals: false,
    destinations: true,
    tips: true
  })
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log('Newsletter subscription:', { email, preferences })
    setIsSubscribed(true)
  }

  const benefits = [
    {
      icon: Globe,
      title: 'Destination Spotlights',
      description: 'Discover hidden gems and trending destinations before they become crowded'
    },
    {
      icon: Gift,
      title: 'Exclusive Deals',
      description: 'Access special discounts on hotels, flights, and travel gear'
    },
    {
      icon: Star,
      title: 'Expert Tips',
      description: 'Get insider travel tips from experienced travelers and local experts'
    },
    {
      icon: Calendar,
      title: 'Travel Planning',
      description: 'Seasonal travel guides and planning checklists for your next adventure'
    }
  ]

  const features = [
    {
      title: 'Weekly Travel Digest',
      description: 'Our most popular stories, tips, and destination guides delivered every Monday',
      frequency: 'Weekly',
      subscribers: '45K+'
    },
    {
      title: 'Deal Alerts',
      description: 'Flash sales, limited-time offers, and exclusive discounts on travel deals',
      frequency: 'As needed',
      subscribers: '32K+'
    },
    {
      title: 'Destination Deep Dives',
      description: 'Comprehensive guides to specific destinations with local insights and tips',
      frequency: 'Monthly',
      subscribers: '38K+'
    },
    {
      title: 'Travel Tips & Hacks',
      description: 'Practical advice for budget travel, packing, and making the most of your trips',
      frequency: 'Bi-weekly',
      subscribers: '41K+'
    }
  ]

  if (isSubscribed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the Family!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for subscribing to our newsletter. You'll receive your first email within the next 24 hours.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Mail className="w-12 h-12 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold">Travel Newsletter</h1>
            </div>
            
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Get the latest destination guides, travel tips, and exclusive deals delivered 
              straight to your inbox. Join 45,000+ travelers who never miss an adventure.
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-blue-100">
              <div className="text-center">
                <div className="text-2xl font-bold">45K+</div>
                <div className="text-sm">Subscribers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">4.9</div>
                <div className="text-sm">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">200+</div>
                <div className="text-sm">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Subscribe?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our community of passionate travelers and get exclusive access to the best travel content.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <benefit.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Types */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Adventure</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the newsletters that match your travel interests and schedule.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-3">{feature.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{feature.frequency}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{feature.subscribers} subscribers</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">(4.9/5)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Form */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Your Journey</h2>
                <p className="text-gray-600">
                  Subscribe now and get a free travel planning checklist as a welcome gift!
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-4">
                    Newsletter Preferences
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.weekly}
                        onChange={(e) => setPreferences({...preferences, weekly: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700">Weekly Travel Digest</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.deals}
                        onChange={(e) => setPreferences({...preferences, deals: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700">Exclusive Deals & Offers</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.destinations}
                        onChange={(e) => setPreferences({...preferences, destinations: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700">Destination Deep Dives</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.tips}
                        onChange={(e) => setPreferences({...preferences, tips: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700">Travel Tips & Hacks</span>
                    </label>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Subscribe Now - It's Free!
                </button>
                
                <p className="text-xs text-gray-500 text-center">
                  By subscribing, you agree to our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>. 
                  You can unsubscribe at any time.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Subscribers Say</h2>
            <p className="text-lg text-gray-600">
              Join thousands of happy travelers who love our newsletter.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The weekly digest has become my Sunday morning ritual. I've discovered so many amazing 
                destinations through their recommendations!"
              </p>
              <div className="text-sm text-gray-600">
                <strong>Sarah M.</strong> - Digital Nomad
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The exclusive deals have saved me hundreds of dollars on flights and hotels. 
                The newsletter pays for itself!"
              </p>
              <div className="text-sm text-gray-600">
                <strong>Mike R.</strong> - Adventure Traveler
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Perfect balance of inspiration and practical advice. The travel tips have made 
                my trips so much smoother!"
              </p>
              <div className="text-sm text-gray-600">
                <strong>Emma K.</strong> - Family Traveler
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
