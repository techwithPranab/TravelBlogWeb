"use client"
import Link from 'next/link'
import Head from 'next/head'
import { ArrowLeft, Mail, Gift, Globe, Calendar, Star, CheckCircle, Zap } from 'lucide-react'
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
  const [loading, setLoading] = useState(false)

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
      title: 'Exclusive Destination Spotlights & Hidden Gems',
      description: 'Discover off-the-beaten-path locations, trending destinations, and authentic local experiences before they become mainstream tourist traps. Get insider access to places only locals know.'
    },
    {
      icon: Gift,
      title: 'VIP Travel Deals & Exclusive Discounts',
      description: 'Access flash sales on flights, hotel deals up to 70% off, travel gear discounts, and special offers from our trusted airline and hotel partners. Save thousands on your next trip.'
    },
    {
      icon: Star,
      title: 'Expert Photography Tutorials & Travel Tips',
      description: 'Master travel photography with professional techniques, learn to capture stunning landscapes and portraits, and get pro tips for editing travel photos. Plus budget travel hacks from seasoned adventurers.'
    },
    {
      icon: Calendar,
      title: 'Seasonal Travel Planning & Itinerary Guides',
      description: 'Receive comprehensive destination guides with seasonal weather insights, cultural events calendar, optimal travel times, and curated itineraries tailored to different budgets and interests.'
    }
  ]

  const features = [
    {
      title: 'Weekly Travel Digest & Adventure Stories',
      description: 'Our flagship newsletter featuring the best travel stories, destination highlights, professional photography showcases, expert travel guides, and inspiring adventures from around the globe. Delivered every Monday morning to start your week with wanderlust.',
      frequency: 'Every Monday',
      highlight: 'Most Popular'
    },
    {
      title: 'Flash Travel Deal Alerts & Exclusive Offers',
      description: 'Never miss limited-time deals on flights, hotels, vacation packages, and travel experiences. Get instant notifications about flash sales, last-minute deals, and VIP offers from our partner airlines, hotels, and travel companies. Save up to 70% on your dream trips.',
      frequency: 'Real-time alerts',
      highlight: 'Time-Sensitive'
    },
    {
      title: 'Destination Deep Dive Guides & Local Insights',
      description: 'Comprehensive monthly guides to specific destinations featuring authentic local experiences, cultural insights, seasonal weather patterns, optimal travel times, hidden attractions, and practical advice from residents and frequent visitors. Plan smarter, travel better.',
      frequency: 'Monthly',
      highlight: 'In-Depth'
    },
    {
      title: 'Travel Photography Tips & Budget Travel Hacks',
      description: 'Bi-weekly practical advice covering professional travel photography techniques, budget-saving strategies, smart packing tips, cultural etiquette guides, and money-saving hacks. Learn from experienced photographers and budget travel experts who\'ve visited 100+ countries.',
      frequency: 'Bi-weekly',
      highlight: 'Expert Tips'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Free Travel Newsletter: Expert Destination Guides, Photography Tips & Exclusive Deals | BagPackStories</title>
        <meta
          name="description"
          content="Subscribe to BagPackStories premium travel newsletter for FREE. Get weekly destination guides, expert photography tutorials, budget travel hacks, exclusive flight deals, and insider travel tips from professional photographers and travel experts."
        />
        <meta
          name="keywords"
          content="travel newsletter subscription, free travel newsletter, destination guides, travel photography tips, budget travel advice, flight deals, travel deals, travel inspiration, adventure newsletter, travel planning tips, photography tutorials, travel hacks, exclusive travel content, wanderlust newsletter, travel community"
        />
        <meta name="author" content="BagPackStories" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta property="og:title" content="Free Travel Newsletter: Expert Guides & Exclusive Deals | BagPackStories" />
        <meta property="og:description" content="Get FREE weekly travel inspiration, expert destination guides, photography tips, and exclusive deals." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/newsletter`} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/images/newsletter-og.jpg`} />
        <meta property="og:site_name" content="BagPackStories" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Travel Newsletter: Expert Guides & Exclusive Deals" />
        <meta name="twitter:description" content="Get FREE weekly travel inspiration, expert destination guides, photography tips, and exclusive deals." />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/images/newsletter-og.jpg`} />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/newsletter`} />
      </Head>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Travel Newsletter Subscription - BagPackStories",
            "description": "Subscribe to premium travel newsletter for expert destination guides, photography tips, and exclusive travel deals",
            "url": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/newsletter`,
            "publisher": {
              "@type": "Organization",
              "name": "BagPackStories",
              "url": process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
              "logo": {
                "@type": "ImageObject",
                "url": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/images/logo.svg`
              },
              "sameAs": [
                "https://www.instagram.com/bagpackstories",
                "https://www.facebook.com/bagpackstories"
              ]
            },
            "mainEntity": {
              "@type": "SubscribeAction",
              "name": "Newsletter Subscription",
              "description": "Subscribe to receive weekly travel guides, photography tips, and exclusive deals",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/newsletter`,
                "inLanguage": "en-US",
                "actionPlatform": [
                  "http://schema.org/DesktopWebPlatform",
                  "http://schema.org/MobileWebPlatform"
                ]
              },
              "expectsAcceptanceOf": {
                "@type": "Offer",
                "name": "Free Travel Newsletter",
                "description": "Weekly travel inspiration, expert guides, and exclusive deals",
                "price": "0",
                "priceCurrency": "USD"
              }
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Newsletter",
                  "item": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/newsletter`
                }
              ]
            }
          })
        }}
      />

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
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Join Travelers Worldwide: Get FREE Expert Travel Insights
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Unlock premium travel content delivered weekly to your inbox. Get exclusive destination guides from local experts,
              professional photography tutorials, budget-saving travel hacks, and flash deals on flights & hotels.
              Transform your travel planning with insider knowledge from passionate explorers worldwide.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-blue-100 text-lg font-medium">
                🎯 <strong>What You'll Get:</strong> Weekly travel digest, exclusive deals, destination deep-dives, and expert photography tips
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Travelers Choose Our Newsletter
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join our thriving community of passionate travelers, professional photographers, and adventure seekers.
              Get exclusive access to premium travel content, insider destination intelligence, and expert guidance
              that transforms ordinary trips into extraordinary adventures. Your journey to becoming a smarter traveler starts here.
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Choose Your Travel Newsletter Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join fellow travelers who rely on our expert-curated travel content.
              From budget travel hacks and exclusive deals to destination guides and photography tips,
              our newsletters deliver the travel insights you need to plan better, travel smarter, and create unforgettable memories.
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
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {feature.highlight}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{feature.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions About Our Travel Newsletter
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get answers to common questions about our travel newsletter subscription, content delivery, and how we help you become a better traveler.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How often will I receive newsletters?</h3>
              <p className="text-gray-600 leading-relaxed">
                Our newsletters are delivered on different schedules based on content type: Weekly Travel Digest every Monday,
                Flash Deal Alerts in real-time when available, Destination Deep Dive Guides monthly, and Travel Photography Tips bi-weekly.
                You can customize your preferences during signup to receive only the content that interests you most.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Is the newsletter really free?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! Our travel newsletter is completely free. We believe in sharing travel knowledge and inspiration with fellow adventurers worldwide.
                You'll never pay a subscription fee, and we don't sell your email address to third parties. Your privacy is protected.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I unsubscribe at any time?</h3>
              <p className="text-gray-600 leading-relaxed">
                Absolutely! Every newsletter includes an easy one-click unsubscribe link at the bottom. You can also manage your preferences
                or unsubscribe directly from your account dashboard. We respect your inbox and make it simple to leave if our content
                no longer serves your travel interests.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">What makes your travel content different?</h3>
              <p className="text-gray-600 leading-relaxed">
                Our content is created by experienced travelers, professional photographers, and local experts who've visited over 200 countries.
                We focus on authentic experiences, practical advice, and insider knowledge that mainstream travel sites often miss.
                Every guide is researched on-site and includes real local insights, not just generic tourist information.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Do you offer travel deals and discounts?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! Our Flash Deal Alerts newsletter delivers exclusive offers from trusted travel partners including airlines, hotels,
                vacation packages, and tour operators. Members can save up to 70% on flights, accommodations, and experiences.
                These are time-sensitive offers not available to the general public.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How do you select destinations for your guides?</h3>
              <p className="text-gray-600 leading-relaxed">
                We choose destinations based on reader interest, seasonal travel opportunities, and emerging travel trends.
                Our editorial team considers factors like accessibility, unique cultural experiences, photographic potential,
                and current travel conditions. We also respond to reader requests and focus on destinations that offer
                authentic local experiences rather than just tourist hotspots.
              </p>
            </div>
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

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Travel Experience?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of smart travelers who discover better destinations, save money on trips, and capture stunning photos.
              Your next adventure starts with one click.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto mb-8">
              <p className="text-blue-100 text-lg font-medium">
                🚀 <strong>Subscribe now and get:</strong> Free travel planning checklist + exclusive welcome guide to budget travel
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#subscription-form"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Start My Free Subscription
              </a>
              <span className="text-blue-200 text-sm">No credit card required • Unsubscribe anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
