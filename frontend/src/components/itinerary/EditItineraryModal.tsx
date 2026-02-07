'use client'

import React, { useState, useEffect } from 'react'
import { Itinerary, ItineraryFormData, TravelMode, BudgetLevel, TravelStyle } from '@/types/itinerary'

interface EditItineraryModalProps {
  isOpen: boolean
  onClose: () => void
  itinerary: Itinerary
  onSave: (updates: Partial<ItineraryFormData>) => Promise<void>
}

const travelModeOptions: { value: TravelMode; label: string; icon: string }[] = [
  { value: 'air', label: 'Flight', icon: '✈️' },
  { value: 'rail', label: 'Train', icon: '�' },
  { value: 'car', label: 'Road Trip', icon: '🚗' },
  { value: 'bus', label: 'Bus', icon: '🚌' },
  { value: 'mixed', label: 'Mixed', icon: '�' }
]

const budgetOptions: { value: BudgetLevel; label: string }[] = [
  { value: 'budget', label: 'Budget ($50-100/day)' },
  { value: 'moderate', label: 'Moderate ($100-250/day)' },
  { value: 'luxury', label: 'Luxury ($250+/day)' }
]

const travelStyleOptions: { value: TravelStyle; label: string; icon: string }[] = [
  { value: 'solo', label: 'Solo', icon: '👤' },
  { value: 'couple', label: 'Couple', icon: '�' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'group', label: 'Group', icon: '👥' }
]

const interestOptions = [
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'culture', label: 'Culture', icon: '🏛️' },
  { value: 'food', label: 'Food', icon: '🍜' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
  { value: 'nightlife', label: 'Nightlife', icon: '🌃' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'photography', label: 'Photography', icon: '📸' },
  { value: 'relaxation', label: 'Relaxation', icon: '🧘' }
]

export default function EditItineraryModal({ isOpen, onClose, itinerary, onSave }: EditItineraryModalProps) {
  const [formData, setFormData] = useState<Partial<ItineraryFormData>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Calculate edits remaining
  const editsRemaining = itinerary.maxEdits - itinerary.editCount

  useEffect(() => {
    if (isOpen) {
      // Initialize form with current itinerary data
      setFormData({
        title: itinerary.title || '',
        travelMode: itinerary.travelMode,
        adults: itinerary.adults,
        children: itinerary.children,
        numberOfRooms: itinerary.numberOfRooms || 1,
        dietType: itinerary.dietType || 'both',
        startDate: itinerary.startDate ? itinerary.startDate.split('T')[0] : '',
        endDate: itinerary.endDate ? itinerary.endDate.split('T')[0] : '',
        budget: itinerary.budget,
        interests: itinerary.interests,
        travelStyle: itinerary.travelStyle,
        includeAccommodationReference: itinerary.includeAccommodationReference ?? true,
        includeRestaurantReference: itinerary.includeRestaurantReference ?? true,
        includeWeatherReference: itinerary.includeWeatherReference ?? true
      })
      setError('')
    }
  }, [isOpen, itinerary])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Calculate duration from dates
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate)
        const end = new Date(formData.endDate)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        formData.duration = diffDays
      }

      await onSave(formData)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update itinerary')
    } finally {
      setLoading(false)
    }
  }

  const handleInterestToggle = (interestValue: string) => {
    const currentInterests = formData.interests || []
    if (currentInterests.includes(interestValue)) {
      setFormData({
        ...formData,
        interests: currentInterests.filter(i => i !== interestValue)
      })
    } else {
      setFormData({
        ...formData,
        interests: [...currentInterests, interestValue]
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-serif text-gray-900">Edit Itinerary Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {editsRemaining > 0 ? (
                <span className="text-blue-600">
                  {editsRemaining} edit{editsRemaining !== 1 ? 's' : ''} remaining
                </span>
              ) : (
                <span className="text-red-600">Maximum edits reached</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Source and Destinations - READ ONLY */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Trip Route (Cannot be changed)</p>
            <div className="flex items-center gap-2 text-gray-900">
              <span className="font-semibold">{itinerary.source}</span>
              <span className="text-gray-400">→</span>
              <span className="font-semibold">{itinerary.destinations.join(' → ')}</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip Title
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="My Amazing Trip"
            />
          </div>

          {/* Travel Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travel Mode
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {travelModeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, travelMode: option.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.travelMode === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* People Count */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adults (1-20)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.adults || 1}
                onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Children (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.children || 0}
                onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rooms (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.numberOfRooms || 1}
                onChange={(e) => setFormData({ ...formData, numberOfRooms: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Diet Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Preference
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['veg', 'non-veg', 'both'].map((diet) => (
                <button
                  key={diet}
                  type="button"
                  onClick={() => setFormData({ ...formData, dietType: diet as any })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.dietType === diet
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium capitalize">{diet === 'veg' ? 'Vegetarian' : diet === 'non-veg' ? 'Non-Veg' : 'Both'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {budgetOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, budget: option.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.budget === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travel Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {travelStyleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, travelStyle: option.value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.travelStyle === option.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests (Select at least one)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest.value}
                  type="button"
                  onClick={() => handleInterestToggle(interest.value)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                    formData.interests?.includes(interest.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{interest.icon}</span>
                  {interest.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Toggles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Include in Itinerary
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeAccommodationReference ?? true}
                  onChange={(e) => setFormData({ ...formData, includeAccommodationReference: e.target.checked })}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">Accommodation Suggestions</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeRestaurantReference ?? true}
                  onChange={(e) => setFormData({ ...formData, includeRestaurantReference: e.target.checked })}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">Restaurant Recommendations</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeWeatherReference ?? true}
                  onChange={(e) => setFormData({ ...formData, includeWeatherReference: e.target.checked })}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">Weather Forecast</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || editsRemaining <= 0 || !formData.interests || formData.interests.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
