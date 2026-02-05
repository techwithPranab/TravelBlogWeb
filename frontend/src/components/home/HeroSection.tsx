'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Calendar, Users, Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { publicApi } from '@/lib/api'

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [stats, setStats] = useState<{
    totalUsers: number
    totalPosts: number
    totalDestinations: number
    totalGuides: number
    totalSubscribers: number
  } | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true)
        const response = await publicApi.getStats()
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Set fallback stats if API fails
        setStats({
          totalUsers: 1250,
          totalPosts: 89,
          totalDestinations: 45,
          totalGuides: 23,
          totalSubscribers: 567
        })
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      toast.error('Please enter a search term')
      return
    }

    setIsSearching(true)

    try {
      // Navigate to search results page with query
      const searchUrl = `/search?q=${encodeURIComponent(searchQuery.trim())}`
      router.push(searchUrl)
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Failed to perform search. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const heroStats = [
    { 
      icon: MapPin, 
      label: 'Travel Destinations Covered', 
      value: statsLoading ? '...' : (stats?.totalDestinations || 0).toLocaleString() 
    },
    { 
      icon: Compass, 
      label: 'Expert Travel Guides', 
      value: statsLoading ? '...' : (stats?.totalGuides || 0).toLocaleString() 
    },
    { 
      icon: Calendar, 
      label: 'Authentic Travel Stories', 
      value: statsLoading ? '...' : (stats?.totalPosts || 0).toLocaleString() 
    },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-violet-50 to-fuchsia-100 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-violet-50 to-fuchsia-100"></div>
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      
      {/* Floating Elements */}
      {/* <div className="absolute top-20 left-10 w-20 h-20 bg-blue-100 rounded-full animate-float"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-100 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-pink-100 rounded-full animate-float" style={{ animationDelay: '2s' }}></div> */}

      {/* Content */}
      <div className="relative z-10 container-max section-padding text-center">
        <div className="max-w-4xl mx-auto">
          {/* Hero Text */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-up">
            Explore the World
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600">
              Through Authentic Travel Stories
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Discover hidden gems and iconic destinations worldwide. Get expert travel guides, 
            insider tips, cultural insights, and stunning photography from experienced globetrotters 
            sharing their real adventures.
          </p>          {/* Search Bar */}
          <form 
            onSubmit={handleSearch} 
            className="max-w-2xl mx-auto mb-12 animate-fade-up" 
            style={{ animationDelay: '0.4s' }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations, countries, travel tips, guides, experiences..."
                className="w-full pl-12 pr-4 py-4 text-lg rounded-xl bg-white/95 backdrop-blur-sm border-0 focus:ring-4 focus:ring-white/50 focus:outline-none shadow-2xl text-black placeholder-gray-500"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6"
                variant="primary"
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>

          {/* Call to Action Buttons */}
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up" style={{ animationDelay: '0.6s' }}>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/80 backdrop-blur-sm border-gray-300 text-gray-700 hover:bg-white/90"
            >
              Explore Stories
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-700 hover:to-fuchsia-700"
            >
              Plan Your Trip
            </Button>
          </div> */}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: '0.8s' }}>
            {heroStats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-full shadow-lg">
                  <stat.icon className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div> */}
    </section>
  )
}
