'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ItineraryLayout from '@/components/itinerary/ItineraryLayout'
import ItineraryDisplay from '@/components/itinerary/ItineraryDisplay'
import { getItineraryById, deleteItinerary, regenerateItinerary } from '@/lib/itineraryApi'
import { Itinerary } from '@/types/itinerary'
import GenerationModal from '@/components/common/GenerationModal'

export default function ViewItineraryPage() {
  const params = useParams()
  const router = useRouter()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadItinerary(params.id as string)
    }
  }, [params.id])

  const loadItinerary = async (id: string) => {
    try {
      setLoading(true)
      setError('')
      const response = await getItineraryById(id)
      
      if (response.success && response.data) {
        setItinerary(response.data)
      } else {
        setError(response.message || 'Failed to load itinerary')
      }
    } catch (error: any) {
      console.error('Failed to load itinerary:', error)
      setError(error.message || 'An error occurred while loading the itinerary')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!itinerary) return
    
    if (!confirm('Are you sure you want to delete this itinerary?')) return

    try {
      const response = await deleteItinerary(itinerary._id)
      if (response.success) {
        router.push('/itinerary/my-itineraries')
      } else {
        alert('Failed to delete itinerary')
      }
    } catch (error: any) {
      alert(error.message || 'An error occurred')
    }
  }

  const handleRegenerate = async () => {
    if (!itinerary) return
    
    if (!confirm('Regenerate this itinerary? This will replace the current content.')) return

    try {
      setIsRegenerating(true)
      const response = await regenerateItinerary(itinerary._id)

      if (response.success && response.data) {
        setItinerary(response.data)
      } else {
        alert(response.message || 'Failed to regenerate itinerary')
      }
    } catch (error: any) {
      alert(error.message || 'An error occurred')
    } finally {
      setIsRegenerating(false)
    }
  }

  if (loading) {
    return (
      <ItineraryLayout>
        <div className="p-4 sm:p-6 md:p-8">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/3 mb-4 sm:mb-6"></div>
            <div className="space-y-4">
              <div className="h-48 sm:h-56 md:h-64 bg-gray-200 rounded"></div>
              <div className="h-48 sm:h-56 md:h-64 bg-gray-200 rounded"></div>
              <div className="h-48 sm:h-56 md:h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </ItineraryLayout>
    )
  }

  if (error || !itinerary) {
    return (
      <ItineraryLayout>
        <div className="p-4 sm:p-6 md:p-8">
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">😞</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Itinerary Not Found
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
              {error || 'The itinerary you are looking for does not exist or has been deleted.'}
            </p>
            <button
              onClick={() => router.push('/itinerary/my-itineraries')}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm sm:text-base"
            >
              Back to My Itineraries
            </button>
          </div>
        </div>
      </ItineraryLayout>
    )
  }

  return (
    <ItineraryLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        <ItineraryDisplay
          itinerary={itinerary}
          onDelete={handleDelete}
          onRegenerate={handleRegenerate}
        />
      </div>

      {/* Regeneration modal */}
      <GenerationModal
        open={isRegenerating}
        title="Regenerating itinerary"
        messages={[
          'Re-optimizing your day plans for freshness ✨',
          'Searching for improved local tips and family-friendly stops 👨‍👩‍👧‍👦',
          'Refreshing restaurant picks and opening hours 🍽️',
          'Retuning travel times for less transit and more fun 🧭'
        ]}
      />
    </ItineraryLayout>
  )
}
