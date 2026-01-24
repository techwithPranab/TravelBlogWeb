'use client'

import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import ItinerarySidebar from './ItinerarySidebar'
import { getSubscriptionStatus } from '@/lib/itineraryApi'

interface ItineraryLayoutProps {
  children: React.ReactNode
}

const navigationTabs = [
  {
    title: 'Dashboard',
    href: '/itinerary/dashboard',
    icon: '🏠'
  },
  {
    title: 'New Itinerary',
    href: '/itinerary/new',
    icon: '➕'
  },
  {
    title: 'My Itineraries',
    href: '/itinerary/my-itineraries',
    icon: '�️'
  }
]

export default function ItineraryLayout({ children }: ItineraryLayoutProps) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Subscription state for mobile layout
  const [subscription, setSubscription] = React.useState<any>(null)
  const [subscriptionLoading, setSubscriptionLoading] = React.useState(true)

  // For development/demo purposes, allow access without authentication
  // In production, this should redirect to login
  const allowDemoAccess = true // Always allow demo access for development

  // Load subscription status for mobile layout
  React.useEffect(() => {
    const loadSubscriptionStatus = async () => {
      try {
        const response = await getSubscriptionStatus()
        if (response.success && response.data) {
          setSubscription(response.data)
        }
      } catch (error) {
        console.error('Failed to load subscription status:', error)
        // For demo purposes, show a mock free subscription
        if (allowDemoAccess) {
          setSubscription({
            subscriptionType: 'free',
            itinerariesUsed: 2,
            itinerariesLimit: 5,
            remainingItineraries: 3
          })
        }
      } finally {
        setSubscriptionLoading(false)
      }
    }

    if (isAuthenticated) {
      loadSubscriptionStatus()
    } else if (allowDemoAccess) {
      // For demo users, show mock subscription status
      setSubscription({
        subscriptionType: 'free',
        itinerariesUsed: 2,
        itinerariesLimit: 5,
        remainingItineraries: 3
      })
      setSubscriptionLoading(false)
    } else {
      setSubscriptionLoading(false)
    }
  }, [isAuthenticated, allowDemoAccess])

  // Redirect to login if not authenticated and not in demo mode
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated && !allowDemoAccess) {
      router.push('/login?redirect=/itinerary/dashboard')
    }
  }, [isAuthenticated, authLoading, router, allowDemoAccess])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated && !allowDemoAccess) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar Layout */}
      <div className="hidden lg:flex">
        <ItinerarySidebar />
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile/Tablet Tab Layout */}
      <div className="lg:hidden">
        {/* Top Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900">AI Itinerary</span>
              </div>
              <nav className="flex space-x-1 sm:space-x-4">
                {navigationTabs.map((tab) => {
                  const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/')
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={cn(
                        'flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <span className="mr-1 sm:mr-2 text-base sm:text-lg">{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.title}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile Subscription Status */}
        {!subscriptionLoading && subscription && (
          subscription.subscriptionType === 'premium' ? (
            // Premium Status Display
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 px-4 py-3 shadow-sm">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold text-purple-900">⭐ Premium Plan</span>
                    <span className="mx-2">•</span>
                    <span className="font-medium">{subscription.remainingItineraries}</span> 
                    <span className="ml-1">of {subscription.itinerariesLimit} itineraries remaining</span>
                  </div>
                  <div className="text-xs text-purple-700 font-medium">
                    Active
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Free Plan - Show Upgrade Option
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-3 shadow-sm">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold text-blue-900">Free Plan:</span> 
                    <span className="ml-1 font-medium">{subscription.remainingItineraries || (subscription.itinerariesLimit - subscription.itinerariesUsed)}</span> 
                    <span className="ml-1">itineraries remaining</span>
                  </div>
                  <Link
                    href="/subscription/upgrade"
                    className="bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    ⭐ Upgrade to Premium
                  </Link>
                </div>
              </div>
            </div>
          )
        )}

        {/* Main content for mobile/tablet */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
