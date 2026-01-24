'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import SubscriptionCard from '@/components/subscription/SubscriptionCard'
import { getSubscriptionStatus } from '@/lib/itineraryApi'

export default function UpgradeToPremiumPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/subscription/upgrade')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadSubscription()
    }
  }, [isAuthenticated])

  const loadSubscription = async () => {
    try {
      setLoading(true)
      const response = await getSubscriptionStatus()
      if (response.success && response.data) {
        setSubscription(response.data)
      }
    } catch (error) {
      console.error('Failed to load subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🚀 Upgrade to Premium
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock unlimited AI-powered itineraries and exclusive travel planning features
          </p>
        </div>

        {/* Features Comparison */}
        <div className="mb-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Compare Plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4">Feature</th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center">
                      <span className="text-gray-600 font-semibold">Free</span>
                      <span className="text-sm text-gray-500">$0/month</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4">
                    <div className="flex flex-col items-center">
                      <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">Premium</span>
                      <span className="text-sm font-semibold">$9.99/month</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-4">AI Itinerary Generations</td>
                  <td className="text-center py-4 px-4">5 per month</td>
                  <td className="text-center py-4 px-4 font-semibold text-purple-600">40 per month</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Days per Itinerary</td>
                  <td className="text-center py-4 px-4">Up to 7 days</td>
                  <td className="text-center py-4 px-4 font-semibold text-purple-600">Up to 30 days</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Export to PDF</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Email Itinerary</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Detailed Cost Breakdown</td>
                  <td className="text-center py-4 px-4">✅</td>
                  <td className="text-center py-4 px-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">AI-Powered Recommendations</td>
                  <td className="text-center py-4 px-4">✅</td>
                  <td className="text-center py-4 px-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Save & Edit Itineraries</td>
                  <td className="text-center py-4 px-4">✅</td>
                  <td className="text-center py-4 px-4">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-4">Priority Support</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Early Access to New Features</td>
                  <td className="text-center py-4 px-4">❌</td>
                  <td className="text-center py-4 px-4">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscription Cards */}
        <SubscriptionCard
          currentPlan={subscription?.subscriptionType || 'free'}
          itinerariesUsed={subscription?.itinerariesUsed || 0}
          itinerariesLimit={subscription?.itinerariesLimit || 5}
          subscriptionEndDate={subscription?.subscriptionEndDate}
        />

        {/* Testimonials */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What Our Premium Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  S
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Sarah M.</p>
                  <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p className="text-gray-600">
                "The premium plan is absolutely worth it! I've planned 3 trips in the last month and saved hours of research time."
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  J
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">John D.</p>
                  <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p className="text-gray-600">
                "Being able to export to PDF and email itineraries to my family has been a game changer. Highly recommend!"
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  E
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-900">Emily R.</p>
                  <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
              <p className="text-gray-600">
                "The AI recommendations are incredible. Premium is perfect for frequent travelers like me!"
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes! You can cancel your premium subscription at any time. You'll continue to have access to premium features until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What happens if I don't use all my itineraries?</h3>
              <p className="text-gray-600">
                Your unused itinerary generations reset at the start of each billing cycle. They don't roll over to the next month.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade to Premium anytime. If you decide to downgrade, the change will take effect at the end of your current billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a refund policy?</h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee. If you're not satisfied with Premium, contact our support team within 30 days of purchase for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
