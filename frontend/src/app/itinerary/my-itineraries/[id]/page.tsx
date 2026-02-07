'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ItineraryLayout from '@/components/itinerary/ItineraryLayout'
import ItineraryDisplay from '@/components/itinerary/ItineraryDisplay'
import EditItineraryModal from '@/components/itinerary/EditItineraryModal'
import { getItineraryById, deleteItinerary, regenerateItinerary, updateItineraryFormData } from '@/lib/itineraryApi'
import { Itinerary, ItineraryFormData } from '@/types/itinerary'
import GenerationModal from '@/components/common/GenerationModal'

export default function ViewItineraryPage() {
  const params = useParams()
  const router = useRouter()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

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

  const handleEditFormData = async (updates: Partial<ItineraryFormData>) => {
    if (!itinerary) return

    try {
      const response = await updateItineraryFormData(itinerary._id, updates)

      if (response.success && response.data) {
        setItinerary(response.data)
        
        // Trigger regeneration after form data update
        setIsRegenerating(true)
        try {
          const regenerateResponse = await regenerateItinerary(itinerary._id)
          if (regenerateResponse.success && regenerateResponse.data) {
            setItinerary(regenerateResponse.data)
            alert(`Itinerary updated and regenerated successfully! ${response.meta?.editsRemaining || 0} edits remaining.`)
          } else {
            alert(`Form data updated successfully, but regeneration failed: ${regenerateResponse.message || 'Unknown error'}. ${response.meta?.editsRemaining || 0} edits remaining.`)
          }
        } catch (regenerateError: any) {
          console.error('Regeneration failed:', regenerateError)
          alert(`Form data updated successfully, but regeneration failed: ${regenerateError.message || 'Unknown error'}. ${response.meta?.editsRemaining || 0} edits remaining.`)
        } finally {
          setIsRegenerating(false)
        }
      } else {
        throw new Error(response.message || 'Failed to update itinerary')
      }
    } catch (error: any) {
      throw error
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
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            disabled={itinerary.editCount >= itinerary.maxEdits}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              itinerary.editCount >= itinerary.maxEdits
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={
              itinerary.editCount >= itinerary.maxEdits
                ? 'Maximum edits reached'
                : `Edit itinerary details (${itinerary.maxEdits - itinerary.editCount} edits remaining)`
            }
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit Details</span>
          </button>
        </div>

        <ItineraryDisplay
          itinerary={itinerary}
          onDelete={handleDelete}
          onRegenerate={handleRegenerate}
        />
      </div>

      {/* Edit Form Modal */}
      <EditItineraryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        itinerary={itinerary}
        onSave={handleEditFormData}
      />

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
