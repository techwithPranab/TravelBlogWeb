"use client"
import Link from 'next/link'
import { ArrowLeft, Mail, Gift, Users, Globe, Calendar, Star, CheckCircle, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function NewsletterPage() {
  const [email, setEmail] = useState('')
  const [preferences, setPreferences] = useState({
    weekly: true,
    deals: false,
    destinations: true,
    tips: true
  })
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [metrics, setMetrics] = useState({
    weeklyDigest: '1K+',
    dealAlerts: '1K+',
    destinations: '1K+',
    travelTips: '1K+'
  })

  // Fetch newsletter metrics on component mount
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/public/metrics`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setMetrics({
              weeklyDigest: data.data.weeklyDigest,
              dealAlerts: data.data.dealAlerts,
              destinations: data.data.destinations,
              travelTips: data.data.travelTips
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch newsletter metrics:', error)
      }
    }
    
    fetchMetrics()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const payload = {
        email,
        preferences,
        source: 'newsletter-page'
      }
      console.log('Sending newsletter subscription:', payload)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      
      if (response.ok) {
        setIsSubscribed(true)
      } else {
        // Show detailed validation errors if available
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((err: any) => err.msg).join(', ')
          alert(`Validation failed: ${errorMessages}`)
        } else {
          alert(data.error || 'Failed to subscribe. Please try again.')
        }
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      alert('Failed to subscribe. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
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
      subscribers: metrics.weeklyDigest
    },
    {
      title: 'Deal Alerts',
      description: 'Flash sales, limited-time offers, and exclusive discounts on travel deals',
      frequency: 'As needed',
      subscribers: metrics.dealAlerts
    },
    {
      title: 'Destination Deep Dives',
      description: 'Comprehensive guides to specific destinations with local insights and tips',
      frequency: 'Monthly',
      subscribers: metrics.destinations
    },
    {
      title: 'Travel Tips & Hacks',
      description: 'Practical advice for budget travel, packing, and making the most of your trips',
      frequency: 'Bi-weekly',
      subscribers: metrics.travelTips
    }
  ]

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
              <h1 className="text-2xl md:text-3xl font-bold">Travel Newsletter</h1>
            </div>
            
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Get the latest destination guides, travel tips, and exclusive deals delivered
              straight to your inbox. Join our community of travelers who never miss an adventure.
            </p>
            
            {/* <div className="flex items-center justify-center space-x-8 text-blue-100">
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
            </div> */}
          </div>
        </div>
      </div>

      {/* Newsletter Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Why Subscribe?</h2>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your Adventure</h2>
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
                
                <div className="flex items-center">
                  <span className="text-sm text-blue-600 font-medium">Join {feature.subscribers} subscribers</span>
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
                <h2 className="text-xl font-bold text-gray-900 mb-4">Start Your Journey</h2>
                <p className="text-gray-600">
                  Subscribe now and get a free travel planning checklist as a welcome gift!
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className={`space-y-6 ${isSubscribed ? 'opacity-50 pointer-events-none' : ''}`}>
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
                  disabled={loading || isSubscribed}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isSubscribed ? 'Successfully Subscribed!' : loading ? 'Subscribing...' : 'Subscribe Now - It\'s Free!'}
                </button>
                
                <p className="text-xs text-gray-500 text-center">
                  By subscribing, you agree to our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>. 
                  You can unsubscribe at any time.
                </p>
              </form>

              {isSubscribed && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <p className="text-green-800 font-medium">
                      Thank you for subscribing to our newsletter. You'll receive your first email within the next 24 hours.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}
