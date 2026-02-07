'use client'

import React, { useState } from 'react'
import { Check, Crown, Zap, Calendar, MapPin, Clock } from 'lucide-react'
import { upgradeSubscription } from '@/lib/itineraryApi'

interface SubscriptionCardProps {
  currentPlan: 'free' | 'premium'
  itinerariesUsed: number
  itinerariesLimit: number
  subscriptionEndDate?: string
  onUpgradeSuccess?: () => void
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  currentPlan,
  itinerariesUsed,
  itinerariesLimit,
  subscriptionEndDate,
  onUpgradeSuccess
}) => {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [error, setError] = useState<string>('')

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    setError('')

    try {
      // In production, integrate with actual payment gateway (Razorpay, Stripe, etc.)
      const mockPaymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const result = await upgradeSubscription({ paymentId: mockPaymentId })
      
      if (result.success) {
        alert('Successfully upgraded to Premium! 🎉')
        if (onUpgradeSuccess) {
          onUpgradeSuccess()
        }
      } else {
        setError(result.message || 'Upgrade failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upgrade subscription')
    } finally {
      setIsUpgrading(false)
    }
  }

  const freePlanFeatures = [
    'Up to 5 AI-generated itineraries per year',
    'Multi-destination support (up to 3 cities)',
    'Basic travel recommendations',
    'Accommodation suggestions',
    'Restaurant recommendations',
    'Transportation tips'
  ]

  const premiumPlanFeatures = [
    'Up to 40 AI-generated itineraries per year',
    'Multi-destination support (up to 5 cities)',
    'Advanced AI recommendations',
    'Priority support',
    'Detailed budget breakdowns',
    'Packing lists',
    'PDF download',
    'Email itineraries',
    'Edit and customize itineraries',
    'Save favorite places',
    'Offline access'
  ]

  const features = currentPlan === 'premium' ? premiumPlanFeatures : freePlanFeatures

  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 p-6">
      {/* Free Plan */}
      <div className={`bg-white rounded-xl shadow-lg p-8 border-2 ${currentPlan === 'free' ? 'border-blue-500' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold font-serif text-gray-900">Free Plan</h3>
          {currentPlan === 'free' && (
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
              Current Plan
            </span>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-gray-900">₹0</span>
            <span className="text-gray-500 ml-2">/year</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Itineraries Used</span>
            <span className="font-semibold text-gray-900">
              {currentPlan === 'free' ? itinerariesUsed : '-'} / 5
            </span>
          </div>
          {currentPlan === 'free' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(itinerariesUsed / 5) * 100}%` }}
              />
            </div>
          )}
        </div>

        <ul className="space-y-3 mb-8">
          {freePlanFeatures.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {currentPlan === 'free' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> You have {5 - itinerariesUsed} itineraries remaining this year.
            </p>
          </div>
        )}
      </div>

      {/* Premium Plan */}
      <div className={`bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-2xl p-8 border-2 ${currentPlan === 'premium' ? 'border-yellow-400' : 'border-transparent'} relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white opacity-10 rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-yellow-300 mr-2" />
              <h3 className="text-2xl font-bold font-serif text-white">Premium Plan</h3>
            </div>
            {currentPlan === 'premium' && (
              <span className="bg-yellow-400 text-purple-900 text-xs font-semibold px-3 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          
          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-white">₹1,000</span>
              <span className="text-purple-200 ml-2">/year</span>
            </div>
            <p className="text-purple-200 text-sm mt-1">Save ₹500 vs monthly billing</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-purple-100">Itineraries Used</span>
              <span className="font-semibold text-white">
                {currentPlan === 'premium' ? itinerariesUsed : '-'} / 40
              </span>
            </div>
            {currentPlan === 'premium' && (
              <div className="w-full bg-purple-800 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${(itinerariesUsed / 40) * 100}%` }}
                />
              </div>
            )}
          </div>

          {currentPlan === 'premium' && subscriptionEndDate && (
            <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-6">
              <div className="flex items-center text-white text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Valid until: {new Date(subscriptionEndDate).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          <ul className="space-y-3 mb-8">
            {premiumPlanFeatures.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Zap className="w-5 h-5 text-yellow-300 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-white text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-300 rounded-lg p-3 mb-4">
              <p className="text-sm text-white">{error}</p>
            </div>
          )}

          {currentPlan === 'free' ? (
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isUpgrading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-900 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Premium
                </>
              )}
            </button>
          ) : (
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <p className="text-white font-semibold">You're on Premium! 🎉</p>
              <p className="text-purple-200 text-sm mt-1">
                Enjoy all premium features until {subscriptionEndDate && new Date(subscriptionEndDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionCard
