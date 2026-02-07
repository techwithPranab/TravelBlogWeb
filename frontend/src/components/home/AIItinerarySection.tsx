'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Sparkles, 
  Globe, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Zap,
  ArrowRight,
  Brain,
  Clock,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function AIItinerarySection() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: Brain,
      title: 'Smart AI Planning',
      description: 'Advanced AI analyzes millions of data points to create your perfect itinerary',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Clock,
      title: 'Instant Generation',
      description: 'Get a complete travel plan in seconds, not hours of manual research',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: DollarSign,
      title: 'Local Currency',
      description: 'Budget breakdowns in destination currency with real-time accuracy',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: MapPin,
      title: 'Day-by-Day Plans',
      description: 'Detailed morning, afternoon, and evening activities perfectly timed',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: TrendingUp,
      title: 'Seasonal Insights',
      description: 'Weather-aware recommendations and insider tips for your travel dates',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Zap,
      title: 'Multi-Modal Transport',
      description: 'Air, rail, car, or bus - optimized routes for your preferred travel style',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  const benefits = [
    '✨ Powered by AI Technology',
    '🌍 Support for global destinations',
    '📅 Customizable duration & preferences',
    '💰 Budget-friendly options included',
    '🎒 Smart packing recommendations',
    '📍 Hidden gems & local favorites'
  ]

  return (
    <section className="section-padding bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container-max w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-6 py-3 mb-6">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-sm font-semibold text-purple-200">Powered by AI</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            AI-Powered Travel Itinerary Planner
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-4">
            Transform your travel planning with our advanced AI technology. Create personalized, comprehensive itineraries in seconds with expert recommendations, budget breakdowns, and insider tips.
          </p>
          
          <p className="text-lg text-purple-200 font-semibold">
            Smart planning for solo travelers, families, and adventure seekers worldwide
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative group"
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className={`
                h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 
                transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-2xl
                ${hoveredFeature === index ? 'shadow-2xl' : ''}
              `}>
                <div className={`
                  w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} 
                  flex items-center justify-center mb-4 
                  transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110
                `}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-serif font-bold mb-2 text-white group-hover:text-purple-200 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Border */}
                <div className={`
                  absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 
                  transition-opacity duration-300 pointer-events-none
                `}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits & CTA Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Benefits List */}
          <div className="space-y-4">
            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-6 flex items-center">
              <Globe className="w-8 h-8 mr-3 text-purple-400" />
              Why Choose AI Itinerary?
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-3xl font-serif font-bold mb-4">
                Ready to Start Your Adventure?
              </h3>
              
              <p className="text-gray-300 mb-6 text-lg">
                Create your first AI-powered itinerary now. No credit card required.
              </p>
              
              <Link href="/itinerary">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 group"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Generate My Itinerary</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              
              <p className="text-sm text-gray-400 mt-4">
                Join thousands of travelers using AI to plan better trips
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
