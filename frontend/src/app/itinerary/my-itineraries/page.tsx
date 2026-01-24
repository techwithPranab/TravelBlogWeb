'use client'

import React, { useState, useEffect } from 'react'
import ItineraryLayout from '@/components/itinerary/ItineraryLayout'
import { getUserItineraries, deleteItinerary } from '@/lib/itineraryApi'
import { Itinerary } from '@/types/itinerary'
import Link from 'next/link'

export default function MyItinerariesPage() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'completed' | 'generating' | 'failed'>('all')

  useEffect(() => {
    loadItineraries()
  }, [])

  const loadItineraries = async () => {
    try {
      setLoading(true)
      const response = await getUserItineraries()
      if (response.success && response.data) {
        setItineraries(response.data)
      }
    } catch (error) {
      console.error('Failed to load itineraries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this itinerary?')) return

    try {
      setDeletingId(id)
      const response = await deleteItinerary(id)
      if (response.success) {
        setItineraries(prev => prev.filter(it => it._id !== id))
      }
    } catch (error) {
      console.error('Failed to delete itinerary:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredItineraries = itineraries.filter(itinerary => {
    if (filter === 'all') return true
    return itinerary.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'generating': return 'bg-orange-100 text-orange-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'edited': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <ItineraryLayout>
        <div className="p-4 sm:p-6 md:p-8">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-3/4 sm:w-1/4 mb-4 sm:mb-6"></div>
            <div className="space-y-3 sm:space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 sm:h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </ItineraryLayout>
    )
  }

  return (
    <ItineraryLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Itineraries</h1>
          <p className="text-sm sm:text-base text-gray-600">View and manage all your AI-generated travel itineraries</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              {[
                { key: 'all', label: 'All', count: itineraries.length },
                { key: 'completed', label: 'Completed', count: itineraries.filter(i => i.status === 'completed').length },
                { key: 'generating', label: 'Generating', count: itineraries.filter(i => i.status === 'generating').length },
                { key: 'failed', label: 'Failed', count: itineraries.filter(i => i.status === 'failed').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Itineraries List */}
        {filteredItineraries.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">
              {filter === 'all' ? '🗺️' : filter === 'completed' ? '✅' : filter === 'generating' ? '⚡' : '❌'}
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No itineraries yet' : `No ${filter} itineraries`}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
              {filter === 'all'
                ? 'Create your first AI-powered itinerary to get started'
                : `You don't have any ${filter} itineraries yet`
              }
            </p>
            {filter === 'all' && (
              <Link
                href="/itinerary/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Itinerary
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredItineraries.map((itinerary) => (
              <div key={itinerary._id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">{itinerary.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full self-start ${getStatusColor(itinerary.status)}`}>
                        {itinerary.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      <div>
                        <span className="font-medium">Route:</span> {itinerary.source} → {itinerary.destinations.join(' → ')}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {itinerary.duration} days
                      </div>
                      <div>
                        <span className="font-medium">Travelers:</span> {itinerary.adults} adults, {itinerary.children} children
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <span>Created {new Date(itinerary.createdAt).toLocaleDateString()}</span>
                      {itinerary.viewCount > 0 && (
                        <span>{itinerary.viewCount} views</span>
                      )}
                      {itinerary.shareCount > 0 && (
                        <span>{itinerary.shareCount} shares</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-row items-center gap-2 w-full sm:w-auto sm:ml-4">
                    {itinerary.status === 'completed' && (
                      <Link
                        href={`/itinerary/my-itineraries/${itinerary._id}`}
                        className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors text-center"
                      >
                        View Details
                      </Link>
                    )}

                    {itinerary.status === 'completed' && (
                      <button
                        onClick={() => {/* TODO: Implement regenerate */}}
                        className="flex-1 sm:flex-none px-3 py-2 bg-green-600 text-white text-xs sm:text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Regenerate
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(itinerary._id)}
                      disabled={deletingId === itinerary._id}
                      className="flex-1 sm:flex-none px-3 py-2 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deletingId === itinerary._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>

                {itinerary.status === 'generating' && (
                  <div className="mt-3 sm:mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-orange-800 text-xs sm:text-sm">AI is generating your itinerary. This may take a few minutes...</span>
                    </div>
                  </div>
                )}

                {itinerary.status === 'failed' && (
                  <div className="mt-3 sm:mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-800 text-xs sm:text-sm">Failed to generate itinerary. Please try again.</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ItineraryLayout>
  )
}
