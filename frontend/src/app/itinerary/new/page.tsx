'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ItineraryLayout from '@/components/itinerary/ItineraryLayout'
import ItineraryForm from '@/components/itinerary/ItineraryForm'
import { generateItinerary } from '@/lib/itineraryApi'
import { ItineraryFormData, Itinerary } from '@/types/itinerary'
import GenerationModal from '@/components/common/GenerationModal'

export default function NewItineraryPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [rateLimitError, setRateLimitError] = useState<any>(null)

  const handleGenerateItinerary = async (formData: ItineraryFormData) => {
    try {
      setIsGenerating(true)
      setError('')
      setRateLimitError(null)

      const response = await generateItinerary(formData)

      if (response.success && response.data) {
        // Redirect to the itinerary view
        router.push(`/itinerary/my-itineraries/${response.data._id}`)
      } else if (response.error) {
        // Handle rate limit or subscription errors
        setRateLimitError(response.error)
      } else {
        setError(response.message || 'Failed to generate itinerary')
      }
    } catch (error: any) {
      console.error('Generate itinerary error:', error)
      setError(error.message || 'An unexpected error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <ItineraryLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create New Itinerary</h1>
          <p className="text-sm sm:text-base text-gray-600">Plan your perfect trip with AI-powered recommendations</p>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {rateLimitError && (
          <div className="mb-4 sm:mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-xs sm:text-sm font-medium text-yellow-800">
                  {rateLimitError.code === 'SUBSCRIPTION_LIMIT_EXCEEDED'
                    ? 'Subscription Limit Reached'
                    : 'Rate Limit Exceeded'}
                </h3>
                <div className="mt-2 text-xs sm:text-sm text-yellow-700">
                  <p>
                    {rateLimitError.code === 'SUBSCRIPTION_LIMIT_EXCEEDED'
                      ? `You have used ${rateLimitError.current} of ${rateLimitError.limit} itineraries for this period.`
                      : `You can generate ${rateLimitError.limit} itineraries per hour.`
                    }
                  </p>
                  <p className="mt-1">
                    {rateLimitError.code === 'SUBSCRIPTION_LIMIT_EXCEEDED'
                      ? `Resets on ${new Date(rateLimitError.resetTime).toLocaleDateString()}`
                      : `Try again in ${Math.ceil(rateLimitError.retryAfter / 60)} minutes.`
                    }
                  </p>
                </div>
                {rateLimitError.code === 'SUBSCRIPTION_LIMIT_EXCEEDED' && (
                  <div className="mt-3">
                    <Link href="/subscription/upgrade" className="inline-block bg-yellow-600 text-white px-3 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-yellow-700 transition-colors">
                      Upgrade to Premium
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <ItineraryForm
            onSubmit={handleGenerateItinerary}
            isLoading={isGenerating}
          />
        </div>
      </div>

      {/* Generation modal shown while itinerary is being created */}
      <GenerationModal open={isGenerating} title="Generating your AI itinerary" />

    </ItineraryLayout>
  )
}
