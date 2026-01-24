'use client'

import React, { useState } from 'react'
import { BudgetLevel, TravelStyle, TravelMode, ItineraryFormData } from '@/types/itinerary'

interface ItineraryFormProps {
  onSubmit: (data: ItineraryFormData) => void
  isLoading: boolean
  error?: string
}

const INTERESTS = [
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'culture', label: 'Culture', icon: '🏛️' },
  { value: 'food', label: 'Food', icon: '🍜' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
  { value: 'nightlife', label: 'Nightlife', icon: '🌃' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'photography', label: 'Photography', icon: '📸' },
  { value: 'relaxation', label: 'Relaxation', icon: '🧘' }
]

const BUDGET_LEVELS: { value: BudgetLevel; label: string; description: string }[] = [
  { value: 'budget', label: 'Budget', description: 'Focus on cost-saving options' },
  { value: 'moderate', label: 'Moderate', description: 'Balance between cost and comfort' },
  { value: 'luxury', label: 'Luxury', description: 'Premium experiences and comfort' }
]

const TRAVEL_STYLES: { value: TravelStyle; label: string; icon: string }[] = [
  { value: 'solo', label: 'Solo', icon: '👤' },
  { value: 'couple', label: 'Couple', icon: '👫' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'group', label: 'Group', icon: '👥' }
]

const TRAVEL_MODES: { value: TravelMode; label: string; icon: string; description: string }[] = [
  { value: 'air', label: 'Flight', icon: '✈️', description: 'Flying between locations' },
  { value: 'rail', label: 'Train', icon: '🚆', description: 'Scenic rail journeys' },
  { value: 'car', label: 'Road Trip', icon: '🚗', description: 'Self-drive adventure' },
  { value: 'bus', label: 'Bus', icon: '🚌', description: 'Budget-friendly bus travel' },
  { value: 'mixed', label: 'Mixed', icon: '🔄', description: 'Combination of transport modes' }
]

export default function ItineraryForm({ onSubmit, isLoading, error }: ItineraryFormProps) {
  const [formData, setFormData] = useState<ItineraryFormData>({
    source: '',
    destinations: [''],
    travelMode: 'air',
    startDate: '',
    endDate: '',
    budget: 'moderate',
    interests: [],
    travelStyle: 'solo',
    adults: 2,
    children: 0,
    numberOfRooms: 1,
    dietType: 'both',
    // New defaults: include reference sections for more comprehensive output
    includeAccommodationReference: true,
    includeRestaurantReference: true,
    includeWeatherReference: true
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleDestinationChange = (index: number, value: string) => {
    const newDestinations = [...formData.destinations]
    newDestinations[index] = value
    setFormData(prev => ({ ...prev, destinations: newDestinations }))
    setErrors(prev => ({ ...prev, destinations: '' }))
  }

  const addDestination = () => {
    if (formData.destinations.length < 5) {
      setFormData(prev => ({
        ...prev,
        destinations: [...prev.destinations, '']
      }))
    }
  }

  const removeDestination = (index: number) => {
    if (formData.destinations.length > 1) {
      const newDestinations = formData.destinations.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, destinations: newDestinations }))
    }
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
    setErrors(prev => ({ ...prev, interests: '' }))
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.source.trim()) {
      newErrors.source = 'Please enter your starting location'
    }

    const validDestinations = formData.destinations.filter(dest => dest.trim())
    if (validDestinations.length === 0) {
      newErrors.destinations = 'Please enter at least one destination'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Please select a start date'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Please select an end date'
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date'
      } else if (diffDays > 30) {
        newErrors.endDate = 'Trip duration cannot exceed 30 days'
      } else if (diffDays < 1) {
        newErrors.endDate = 'Trip must be at least 1 day'
      }
    }

    if (formData.adults < 1 || formData.adults > 20) {
      newErrors.adults = 'Number of adults must be between 1 and 20'
    }

    if (formData.children < 0 || formData.children > 10) {
      newErrors.children = 'Number of children must be between 0 and 10'
    }

    if (formData.interests.length === 0) {
      newErrors.interests = 'Please select at least one interest'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      // Calculate duration from dates
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // Filter out empty destinations
      const filteredData = {
        ...formData,
        duration,
        destinations: formData.destinations.filter(dest => dest.trim())
      }
      onSubmit(filteredData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {error && (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-xs sm:text-sm">{error}</p>
        </div>
      )}

      {/* Source Location */}
      <div>
        <label htmlFor="source" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Starting Location
        </label>
        <input
          type="text"
          id="source"
          value={formData.source}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, source: e.target.value }))
            setErrors(prev => ({ ...prev, source: '' }))
          }}
          placeholder="e.g., New York, London, Mumbai"
          className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.source ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.source && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.source}</p>}
      </div>

      {/* Destinations */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700">
            Destinations (1-5 locations)
          </label>
          {formData.destinations.length < 5 && (
            <button
              type="button"
              onClick={addDestination}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Add destination
            </button>
          )}
        </div>
        <div className="space-y-2">
          {formData.destinations.map((destination, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={destination}
                onChange={(e) => handleDestinationChange(index, e.target.value)}
                placeholder={`Destination ${index + 1}`}
                className={`flex-1 px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.destinations ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formData.destinations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDestination(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.destinations && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.destinations}</p>}
      </div>

      {/* Travel Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, startDate: e.target.value }))
              setErrors(prev => ({ ...prev, startDate: '' }))
            }}
            className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.startDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.startDate && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.startDate}</p>}
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={formData.endDate}
            min={formData.startDate || new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, endDate: e.target.value }))
              setErrors(prev => ({ ...prev, endDate: '' }))
            }}
            className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.endDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.endDate && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.endDate}</p>}
          {formData.startDate && formData.endDate && !errors.endDate && (
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Duration: {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          )}
        </div>
      </div>

      {/* Travel Mode */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Preferred Travel Mode
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {TRAVEL_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, travelMode: mode.value }))}
              className={`p-2 sm:p-3 border rounded-lg text-left transition-colors ${
                formData.travelMode === mode.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <span className="text-base sm:text-lg mr-2">{mode.icon}</span>
                <div>
                  <div className="font-medium text-xs sm:text-sm">{mode.label}</div>
                  <div className="text-xs text-gray-500 hidden sm:block">{mode.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Person Count */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Travelers
        </label>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="adults" className="block text-xs sm:text-sm text-gray-600 mb-1">
              Adults (18+)
            </label>
            <input
              type="number"
              id="adults"
              min="1"
              max="20"
              value={formData.adults}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))
                setErrors(prev => ({ ...prev, adults: '' }))
              }}
              className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.adults ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.adults && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.adults}</p>}
          </div>
          <div>
            <label htmlFor="children" className="block text-xs sm:text-sm text-gray-600 mb-1">
              Children (0-17)
            </label>
            <input
              type="number"
              id="children"
              min="0"
              max="10"
              value={formData.children}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))
                setErrors(prev => ({ ...prev, children: '' }))
              }}
              className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.children ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.children && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.children}</p>}
          </div>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-gray-500">
          Total travelers: {formData.adults + formData.children}
        </p>
      </div>

      {/* Number of Rooms */}
      <div>
        <label htmlFor="numberOfRooms" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Number of Rooms
        </label>
        <select
          id="numberOfRooms"
          value={formData.numberOfRooms}
          onChange={(e) => setFormData(prev => ({ ...prev, numberOfRooms: parseInt(e.target.value) || 1 }))}
          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'Room' : 'Rooms'}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          This will be used for accommodation cost calculation
        </p>
      </div>

      {/* Diet Type */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Dietary Preference
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, dietType: 'veg' }))}
            className={`p-3 sm:p-4 border rounded-lg text-center transition-colors ${
              formData.dietType === 'veg'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-xl sm:text-2xl mb-1">🥗</div>
            <div className="font-medium text-xs sm:text-sm">Vegetarian</div>
            <div className="text-xs text-gray-500 mt-1">Veg options only</div>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, dietType: 'non-veg' }))}
            className={`p-3 sm:p-4 border rounded-lg text-center transition-colors ${
              formData.dietType === 'non-veg'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-xl sm:text-2xl mb-1">🍖</div>
            <div className="font-medium text-xs sm:text-sm">Non-Vegetarian</div>
            <div className="text-xs text-gray-500 mt-1">Non-veg options only</div>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, dietType: 'both' }))}
            className={`p-3 sm:p-4 border rounded-lg text-center transition-colors ${
              formData.dietType === 'both'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-xl sm:text-2xl mb-1">🍽️</div>
            <div className="font-medium text-xs sm:text-sm">Both</div>
            <div className="text-xs text-gray-500 mt-1">Veg & Non-veg options</div>
          </button>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-gray-500">
          This will filter restaurant recommendations based on your preference
        </p>
      </div>

      {/* Budget Level */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Budget Level
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
          {BUDGET_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, budget: level.value }))}
              className={`p-3 sm:p-4 border rounded-lg text-left transition-colors ${
                formData.budget === level.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-xs sm:text-sm">{level.label}</div>
              <div className="text-xs text-gray-500 mt-1">{level.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Travel Style */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Travel Style
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {TRAVEL_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, travelStyle: style.value }))}
              className={`p-3 border rounded-lg text-center transition-colors ${
                formData.travelStyle === style.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xl sm:text-2xl mb-1">{style.icon}</div>
              <div className="font-medium text-xs sm:text-sm">{style.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Interests (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {INTERESTS.map((interest) => (
            <button
              key={interest.value}
              type="button"
              onClick={() => handleInterestToggle(interest.value)}
              className={`p-3 border rounded-lg text-center transition-colors ${
                formData.interests.includes(interest.value)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xl sm:text-2xl mb-1">{interest.icon}</div>
              <div className="font-medium text-xs sm:text-sm">{interest.label}</div>
            </button>
          ))}
        </div>
        {errors.interests && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.interests}</p>}
      </div>

      {/* Include Reference Preferences */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Include references (reduce tokens by unchecking)</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!formData.includeAccommodationReference}
              onChange={(e) => setFormData(prev => ({ ...prev, includeAccommodationReference: e.target.checked }))}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span className="text-xs sm:text-sm">Accommodation Reference</span>
          </label>

          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!formData.includeRestaurantReference}
              onChange={(e) => setFormData(prev => ({ ...prev, includeRestaurantReference: e.target.checked }))}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span className="text-xs sm:text-sm">Restaurant Reference</span>
          </label>

          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!formData.includeWeatherReference}
              onChange={(e) => setFormData(prev => ({ ...prev, includeWeatherReference: e.target.checked }))}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span className="text-xs sm:text-sm">Weather Reference</span>
          </label>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-gray-500">Uncheck any sections you do not want included in the AI output to save tokens.</p>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating your itinerary...
            </div>
          ) : (
            'Generate AI Itinerary'
          )}
        </button>
      </div>
    </form>
  )
}
