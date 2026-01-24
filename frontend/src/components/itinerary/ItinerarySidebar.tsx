'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getSubscriptionStatus } from '@/lib/itineraryApi'

interface ItinerarySidebarProps {
  className?: string
}

interface SubscriptionStatus {
  subscriptionType: string
  itinerariesUsed: number
  itinerariesLimit: number
  remainingItineraries?: number
  subscriptionEndDate?: string
  isActive: boolean
}

interface ItinerarySidebarProps {
  className?: string
}

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/itinerary/dashboard',
    icon: '📊'
  },
  {
    title: 'New Itinerary',
    href: '/itinerary/new',
    icon: '✨'
  },
  {
    title: 'My Itineraries',
    href: '/itinerary/my-itineraries',
    icon: '📝'
  }
]

export default function ItinerarySidebar({ className }: ItinerarySidebarProps) {
  const pathname = usePathname()
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubscriptionStatus()
  }, [])

  const loadSubscriptionStatus = async () => {
    try {
      const response = await getSubscriptionStatus()
      if (response.success && response.data) {
        setSubscription(response.data)
      }
    } catch (error) {
      console.error('Failed to load subscription status:', error)
      // For demo purposes, show demo data
      setSubscription({
        subscriptionType: 'free',
        itinerariesUsed: 2,
        itinerariesLimit: 5,
        remainingItineraries: 3,
        isActive: true
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('w-64 bg-white border-r border-gray-200', className)}>
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">AI Itinerary</h2>
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Subscription Status */}
      <div className="px-6 pb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : subscription ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Plan</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  subscription.subscriptionType === 'premium' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {subscription.subscriptionType === 'premium' ? 'Premium' : 'Free'}
                </span>
              </div>
              <div className="text-xs text-gray-600">
                {subscription.subscriptionType === 'premium' ? (
                  <div>
                    {subscription.remainingItineraries || (subscription.itinerariesLimit - subscription.itinerariesUsed)} of {subscription.itinerariesLimit} itineraries remaining
                  </div>
                ) : (
                  <div>
                    {subscription.itinerariesLimit - subscription.itinerariesUsed} itineraries remaining
                  </div>
                )}
                {subscription.subscriptionEndDate && subscription.subscriptionType === 'premium' && (
                  <div className="mt-1">
                    Renews {new Date(subscription.subscriptionEndDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              {subscription.subscriptionType !== 'premium' && (
                <Link href="/subscription/upgrade" className="mt-3 w-full bg-blue-600 text-white text-xs px-3 py-2 rounded-md hover:bg-blue-700 transition-colors block text-center">
                  Upgrade to Premium
                </Link>
              )}
            </>
          ) : (
            <div className="text-xs text-gray-500 text-center">
              Unable to load subscription status
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
