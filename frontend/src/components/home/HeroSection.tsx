'use client'

import { useState } from 'react'
import { Search, MapPin, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search logic
    console.log('Searching for:', searchQuery)
  }

  const stats = [
    { icon: MapPin, label: 'Countries Visited', value: '42' },
    { icon: Calendar, label: 'Years Traveling', value: '8' },
    { icon: Users, label: 'Travelers Inspired', value: '10K+' },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500"></div>
      <div className="absolute inset-0 bg-pattern opacity-10"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-100 rounded-full animate-float"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-100 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-pink-100 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Content */}
      <div className="relative z-10 container-max section-padding text-center">
        <div className="max-w-4xl mx-auto">
          {/* Hero Text */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-up">
            Discover the World
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              One Story at a Time
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Join me on epic adventures around the globe. From hidden gems to iconic destinations,
            discover travel tips, cultural insights, and breathtaking photography.
          </p>

          {/* Search Bar */}
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
                placeholder="Search destinations, travel tips, experiences..."
                className="w-full pl-12 pr-4 py-4 text-lg rounded-xl bg-white/95 backdrop-blur-sm border-0 focus:ring-4 focus:ring-white/50 focus:outline-none shadow-2xl text-black placeholder-gray-400"
              />
              <Button 
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6"
                variant="primary"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up" style={{ animationDelay: '0.6s' }}>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
            >
              Explore Stories
            </Button>
            <Button 
              variant="primary" 
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              Plan Your Trip
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: '0.8s' }}>
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-white/10 backdrop-blur-sm rounded-full">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/80 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
