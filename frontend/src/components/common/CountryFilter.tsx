'use client'

import { useState } from 'react'
import { ChevronDown, MapPin, X } from 'lucide-react'

interface CountryFilterProps {
  readonly selectedCountry: string
  readonly onCountryChange: (country: string) => void
  readonly countries: string[]
  readonly placeholder?: string
  readonly className?: string
  readonly allowClear?: boolean
  readonly disabled?: boolean
}

export function CountryFilter({ 
  selectedCountry, 
  onCountryChange, 
  countries, 
  placeholder = "All Countries",
  className = "",
  allowClear = true,
  disabled = false
}: CountryFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleCountrySelect = (country: string) => {
    onCountryChange(country)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCountryChange('all')
  }

  const uniqueCountries = ['all', ...Array.from(new Set(countries.filter(Boolean)))]
  const hasSelection = selectedCountry && selectedCountry !== 'all'

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg transition-colors min-w-[160px] justify-between ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            {selectedCountry === 'all' ? placeholder : selectedCountry}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {hasSelection && allowClear && (
            <button
              onClick={handleClear}
              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
              title="Clear selection"
            >
              <X className="h-3 w-3 text-gray-400" />
            </button>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

            {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <button 
            type="button"
            className="fixed inset-0 z-10 bg-transparent border-none outline-none cursor-default" 
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
            aria-label="Close dropdown"
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            <div className="py-1">
              {uniqueCountries.length === 1 ? (
                <div className="px-4 py-2 text-sm text-gray-500 italic">
                  No countries available
                </div>
              ) : (
                uniqueCountries.map((country) => (
                  <button
                    key={country}
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                      selectedCountry === country ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      {country === 'all' ? placeholder : country}
                    </span>
                    {selectedCountry === country && (
                      <span className="ml-auto text-blue-600">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Hook to extract countries from different data types
export function useCountryExtractor<T>(
  items: T[],
  extractCountry: (item: T) => string | undefined
): string[] {
  return Array.from(new Set(
    items
      .map(extractCountry)
      .filter((country): country is string => Boolean(country))
  ))
}

// Common country extractors for different data types
export const countryExtractors = {
  // For posts with destinations array
  fromPostDestinations: (post: { destinations?: Array<{ name?: string; country?: string }> }) => 
    post.destinations?.map(dest => dest.country || dest.name).filter(Boolean) || [],

  // For destinations with country property
  fromDestination: (destination: { country?: string }) => 
    destination.country,

  // For guides with destination object
  fromGuideDestination: (guide: { destination?: { name?: string; country?: string } }) => 
    guide.destination?.country || guide.destination?.name,

  // For photos with location object
  fromPhotoLocation: (photo: { location?: { country?: string } }) => 
    photo.location?.country,

  // Generic country extractor
  fromObject: (obj: any, path: string) => {
    const keys = path.split('.')
    let value = obj
    for (const key of keys) {
      value = value?.[key]
    }
    return typeof value === 'string' ? value : undefined
  }
}

// Utility to get unique countries from multiple sources
export function extractUniqueCountries(...sources: string[][]): string[] {
  const allCountries = sources.flat().filter(Boolean)
  return Array.from(new Set(allCountries)).sort((a, b) => a.localeCompare(b))
}
