'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ItineraryForm from '@/components/itinerary/ItineraryForm'
import ItineraryDisplay from '@/components/itinerary/ItineraryDisplay'
import {
  generateItinerary,
  getUserItineraries,
  deleteItinerary,
  regenerateItinerary
} from '@/lib/itineraryApi'
import { Itinerary, ItineraryFormData } from '@/types/itinerary'

export default function ItineraryPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [view, setView] = useState<'form' | 'list' | 'display'>('list')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [rateLimitError, setRateLimitError] = useState<any>(null)
  
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null)
  const [loadingList, setLoadingList] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/itinerary')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadItineraries()
    }
  }, [isAuthenticated])

  const loadItineraries = async () => {
    try {
      setLoadingList(true)
      const response = await getUserItineraries()
      if (response.success && response.data) {
        setItineraries(response.data)
      }
    } catch (error: any) {
      console.error('Failed to load itineraries:', error)
    } finally {
      setLoadingList(false)
    }
  }

  const handleGenerateItinerary = async (data: ItineraryFormData) => {
    try {
      setIsLoading(true)
      setError('')
      setRateLimitError(null)

      const response = await generateItinerary(data)

      if (!response.success) {
        if (response.error?.code === 'RATE_LIMIT_EXCEEDED') {
          setRateLimitError(response.error)
          setError(response.message || 'Rate limit exceeded')
        } else {
          setError(response.message || 'Failed to generate itinerary')
        }
        return
      }

      if (response.data) {
        setSelectedItinerary(response.data)
        setItineraries([response.data, ...itineraries])
        setView('display')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItinerary) return
    
    if (!confirm('Are you sure you want to delete this itinerary?')) return

    try {
      await deleteItinerary(selectedItinerary._id)
      setItineraries(itineraries.filter(i => i._id !== selectedItinerary._id))
      setSelectedItinerary(null)
      setView('list')
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleRegenerate = async () => {
    if (!selectedItinerary) return
    
    if (!confirm('Regenerate this itinerary? This will replace the current content.')) return

    try {
      setIsLoading(true)
      const response = await regenerateItinerary(selectedItinerary._id)

      if (!response.success) {
        if (response.error?.code === 'RATE_LIMIT_EXCEEDED') {
          setRateLimitError(response.error)
          alert(response.message)
        } else {
          alert(response.message || 'Failed to regenerate')
        }
        return
      }

      if (response.data) {
        setSelectedItinerary(response.data)
        setItineraries(itineraries.map(i => 
          i._id === response.data!._id ? response.data! : i
        ))
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewItinerary = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary)
    setView('display')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-4">
            AI Travel Itinerary Generator ✨
          </h1>
          <p className="text-xl text-gray-600">
            Create personalized day-by-day travel plans powered by AI
          </p>
        </div>

        {/* Rate Limit Warning */}
        {rateLimitError && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">Rate Limit Reached</h3>
            <p className="text-sm text-orange-700">
              You've used all {rateLimitError.limit} itinerary generations for today.
            </p>
            <p className="text-sm text-orange-700 mt-1">
              Resets in{' '}
              {Math.ceil(rateLimitError.retryAfter / 3600)} hours at{' '}
              {new Date(rateLimitError.resetTime).toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setView('list')}
              className={`flex-1 px-6 py-4 font-semibold ${
                view === 'list'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 My Itineraries
            </button>
            <button
              onClick={() => {
                setView('form')
                setSelectedItinerary(null)
                setError('')
                setRateLimitError(null)
              }}
              className={`flex-1 px-6 py-4 font-semibold ${
                view === 'form'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ✨ Create New
            </button>
          </div>
        </div>

        {/* Content */}
        {view === 'form' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <ItineraryForm
              onSubmit={handleGenerateItinerary}
              isLoading={isLoading}
              error={error}
            />
          </div>
        )}

        {view === 'list' && (
          <div>
            {loadingList ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600" />
                <p className="mt-4 text-gray-600">Loading itineraries...</p>
              </div>
            ) : itineraries.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-2xl font-bold font-serif text-gray-900 mb-2">
                  No itineraries yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first AI-powered travel itinerary!
                </p>
                <button
                  onClick={() => setView('form')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Create Itinerary
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {itineraries.map(itinerary => (
                  <div
                    key={itinerary._id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => handleViewItinerary(itinerary)}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-center p-4">
                          <p className="text-xl font-bold">{itinerary.source}</p>
                          <p className="text-lg my-1">→</p>
                          <p className="text-xl font-bold">
                            {itinerary.destinations && itinerary.destinations.length > 0
                              ? itinerary.destinations.length === 1
                                ? itinerary.destinations[0]
                                : `${itinerary.destinations[0]} +${itinerary.destinations.length - 1}`
                              : 'Multiple Destinations'}
                          </p>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            itinerary.status === 'completed'
                              ? 'bg-green-500 text-white'
                              : itinerary.status === 'generating'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {itinerary.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold font-serif mb-2">{itinerary.title}</h3>
                      <p className="text-gray-600 mb-4">
                        {itinerary.source} → {itinerary.destinations && itinerary.destinations.length > 0
                          ? itinerary.destinations.length === 1
                            ? itinerary.destinations[0]
                            : `${itinerary.destinations[0]} +${itinerary.destinations.length - 1} more`
                          : 'Multiple Destinations'}
                      </p>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>📅 {itinerary.duration} days</span>
                        <span>💰 {itinerary.currencySymbol || '$'}{typeof itinerary.totalEstimatedCost === 'number' ? itinerary.totalEstimatedCost.toLocaleString() : itinerary.totalEstimatedCost}</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        {itinerary.interests.slice(0, 3).map(interest => (
                          <span
                            key={interest}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'display' && selectedItinerary && (
          <div>
            <button
              onClick={() => setView('list')}
              className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
            >
              ← Back to list
            </button>
            <ItineraryDisplay
              itinerary={selectedItinerary}
              onDelete={handleDelete}
              onRegenerate={handleRegenerate}
            />
          </div>
        )}
      </div>
    </div>
  )
}
