'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import { publicApi } from '@/lib/api'

interface Testimonial {
  id: string
  name: string
  role: string
  avatar?: string
  rating: number
  text: string
  featured?: boolean
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await publicApi.getTestimonials()
        setTestimonials(response.data)
      } catch (error) {
        console.error('Error fetching testimonials:', error)
        setError('Failed to load testimonials')
        setTestimonials([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  // Don't render anything if there are no testimonials
  if (!isLoading && testimonials.length === 0) {
    return null
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Quote className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Traveler Reviews & Testimonials
            </h2>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real experiences from our global community of travelers who use our guides 
            and stories to plan their adventures
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-pulse">
              <div className="flex justify-center mb-4">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
              <div className="space-y-2 mb-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <Quote className="h-10 w-10 text-blue-600" />
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
            Traveler Stories
          </h2>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Real experiences from our community of passionate travelers. Join thousands who've discovered their next adventure through our guides.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group relative"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-800/50 transform hover:-translate-y-2">
              {/* Quote icon */}
              <div className="absolute -top-4 left-8">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">"</span>
                </div>
              </div>

              {/* Testimonial content */}
              <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic text-lg pt-4">
                "{testimonial.text}"
              </blockquote>

              {/* Author info */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Verified Traveler
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={`star-${testimonial.id}-${i}`}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {testimonial.rating}/5
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center"
      >
        <div className="bg-gradient-to-r from-blue-600 via-teal-600 to-blue-800 rounded-3xl p-12 text-white shadow-2xl">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Share Your Story?
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join our community of travelers and share your experiences. Your next adventure awaits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Share Your Experience
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300">
              Explore More Stories
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
