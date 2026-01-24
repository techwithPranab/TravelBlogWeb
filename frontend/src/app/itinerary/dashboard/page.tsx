'use client'

import React, { useState, useEffect } from 'react'
import ItineraryLayout from '@/components/itinerary/ItineraryLayout'
import { getUserItineraries } from '@/lib/itineraryApi'
import { Itinerary } from '@/types/itinerary'

export default function ItineraryDashboard() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    completed: 0,
    generating: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await getUserItineraries()
      if (response.success && response.data) {
        setItineraries(response.data)
        calculateStats(response.data)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (itineraryList: Itinerary[]) => {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const stats = itineraryList.reduce(
      (acc, itinerary) => {
        acc.total++
        if (new Date(itinerary.createdAt) >= thisMonth) {
          acc.thisMonth++
        }
        if (itinerary.status === 'completed') {
          acc.completed++
        } else if (itinerary.status === 'generating') {
          acc.generating++
        }
        return acc
      },
      { total: 0, thisMonth: 0, completed: 0, generating: 0 }
    )

    setStats(stats)
  }

  if (loading) {
    return (
      <ItineraryLayout>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </ItineraryLayout>
    )
  }

  return (
    <ItineraryLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">AI Itinerary Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your travel itineraries and track your usage</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Itineraries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-orange-600 text-xl">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Generating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.generating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Itineraries */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Itineraries</h2>
          </div>
          <div className="p-6">
            {itineraries.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No itineraries yet</h3>
                <p className="text-gray-600 mb-4">Create your first AI-powered itinerary to get started</p>
                <a
                  href="/itinerary/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create New Itinerary
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {itineraries.slice(0, 5).map((itinerary) => (
                  <div key={itinerary._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{itinerary.title}</h3>
                      <p className="text-sm text-gray-600">
                        {itinerary.destinations.join(' → ')} • {itinerary.duration} days
                      </p>
                      <p className="text-xs text-gray-500">
                        Created {new Date(itinerary.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        itinerary.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : itinerary.status === 'generating'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {itinerary.status}
                      </span>
                      <a
                        href={`/itinerary/my-itineraries/${itinerary._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ItineraryLayout>
  )
}
