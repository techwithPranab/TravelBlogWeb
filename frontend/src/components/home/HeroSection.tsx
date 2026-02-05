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
      label: 'Destinations Explored', 
      value: statsLoading ? '...' : (stats?.totalDestinations || 0).toLocaleString() 
    },
    { 
      icon: Compass, 
      label: 'Expert Travel Guides', 
      value: statsLoading ? '...' : (stats?.totalGuides || 0).toLocaleString() 
    },
    { 
      icon: Calendar, 
      label: 'Travel Stories Shared', 
      value: statsLoading ? '...' : (stats?.totalPosts || 0).toLocaleString() 
    },
  ]

  return (
    <section className="relative min-h-[60vh] md:min-h-[75vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 animate-ken-burns"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop&q=80')`,
        }}
      ></div>

      {/* Enhanced Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-blue-900/50 to-indigo-900/70"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-transparent to-purple-900/30"></div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Content */}
      <div className="relative z-10 container-max section-padding text-center">
        <div className="max-w-6xl mx-auto">
          {/* Hero Text - Enhanced Typography */}
          <div className="mb-8 animate-fade-up">
            <h1 className="font-serif text-5xl md:text-6xl lg:text-8xl font-bold text-white mb-6 leading-tight tracking-tight">
              Discover Your Next
              <span className="block mt-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 animate-gradient">
                Travel Adventure
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 max-w-4xl mx-auto leading-relaxed font-light">
              Explore authentic destinations, read real travel stories, and get expert photography tips from passionate travelers. Your comprehensive guide to meaningful travel experiences worldwide.
            </p>
          </div>

          {/* Search Bar - Professional Glassmorphism */}
          <form 
            onSubmit={handleSearch} 
            className="max-w-4xl mx-auto mb-16 md:mb-20 animate-fade-up" 
            style={{ animationDelay: '0.2s' }}
          >
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-300 w-6 h-6 transition-colors group-hover:text-teal-400 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search travel destinations, guides, photography tips, and authentic stories..."
                className="w-full pl-16 pr-40 py-5 md:py-6 text-base md:text-lg rounded-full bg-white/95 backdrop-blur-xl border-2 border-white/30 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/20 focus:outline-none shadow-2xl text-gray-900 placeholder-gray-500 transition-all duration-300 hover:shadow-3xl"
                style={{ minHeight: '64px' }}
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-8 md:px-10 py-3.5 md:py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 text-white border-0 font-semibold"
                variant="primary"
                disabled={isSearching}
              >
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching
                  </span>
                ) : (
                  'Explore'
                )}
              </Button>
            </div>
          </form>

          {/* Stats - Professional Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {heroStats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="group relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 border border-white/20 hover:border-teal-400/50 overflow-hidden"
              >
                {/* Background Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-blue-500/0 group-hover:from-teal-500/10 group-hover:to-blue-500/10 transition-all duration-500 rounded-3xl"></div>
                
                {/* Icon with Enhanced Gradient */}
                <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-400 rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <stat.icon className="w-10 h-10 text-white" strokeWidth={2} />
                </div>
                
                {/* Stat Value */}
                <div className="relative text-5xl md:text-6xl font-black bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent mb-3 tracking-tight">
                  {stat.value}
                </div>
                
                {/* Label */}
                <div className="relative text-white text-base md:text-lg font-medium leading-snug">
                  {stat.label}
                </div>
                
                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block">
        <div className="flex flex-col items-center gap-2">
          <span className="text-white/70 text-sm font-medium tracking-wide">Scroll Down</span>
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-3 bg-white/70 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
