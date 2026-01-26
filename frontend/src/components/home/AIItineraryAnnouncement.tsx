'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  Bell,
  Rocket
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function AIItineraryAnnouncement() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please provide a valid email address')
      return
    }

    try {
      setSubmitting(true)
      const res = await (await import('@/lib/api')).publicApi.subscribe({ email, source: 'homepage' })
      if (res && (res as any).success) {
        setSubscribed(true)
        setEmail('')
      } else {
        alert((res as any).message || 'Failed to subscribe')
      }
    } catch (err: any) {
      console.error('Subscribe error:', err)
      alert(err?.message || 'Failed to subscribe')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section-padding bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container-max w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full px-6 py-3 mb-6">
            <Bell className="w-5 h-5 text-blue-600 animate-pulse" />
            <span className="text-sm font-semibold text-blue-700">Coming Soon</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            AI-Powered Travel Itineraries
          </h2>

          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-4">
            Get ready for the future of travel planning! Our revolutionary AI itinerary generator is launching soon.
          </p>

          <p className="text-lg text-purple-600 font-semibold">
            🚀 Smart planning • 💰 Budget optimization • 🌍 Global destinations • ⚡ Instant results
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">AI Intelligence</h3>
            <p className="text-gray-600 text-sm">Powered by AI for personalized recommendations</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">Instant Results</h3>
            <p className="text-gray-600 text-sm">Complete itineraries in seconds, not hours</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">Day-by-Day Plans</h3>
            <p className="text-gray-600 text-sm">Detailed schedules with optimal timing</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Rocket className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">Smart Budgeting</h3>
            <p className="text-gray-600 text-sm">Local currency costs and money-saving tips</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-bounce">
              <Rocket className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-3xl font-bold mb-4 text-gray-900">
              Be the First to Know When We Launch!
            </h3>

            <p className="text-gray-700 mb-6 text-lg">
              Join our waitlist and get early access — plus a special discount on your first year subscription.
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="max-w-md mx-auto mb-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8z"
                          ></path>
                        </svg>
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 mr-2" />
                        Join Waitlist & Get Discount
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="max-w-md mx-auto mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">✅ You're on the waitlist!</p>
                  <p className="text-green-600 text-sm">You'll receive an early access invite and a special discount on your first year subscription when we launch.</p>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500">
              No spam, unsubscribe at any time. Launch expected in Mid of 2026.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
