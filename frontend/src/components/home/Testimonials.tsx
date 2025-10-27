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
        // Set fallback testimonials if API fails
        setTestimonials([
          {
            id: '1',
            name: 'Sarah Johnson',
            role: 'Travel Enthusiast',
            avatar: '/avatars/sarah.jpg',
            rating: 5,
            text: 'This travel blog has completely transformed how I plan my trips. The detailed guides and stunning photography inspire me to explore new destinations I never would have considered before.',
            featured: true
          },
          {
            id: '2',
            name: 'Michael Chen',
            role: 'Digital Nomad',
            avatar: '/avatars/michael.jpg',
            rating: 5,
            text: 'As someone who travels for work, I rely on authentic travel experiences. The stories here are genuine, practical, and beautifully written. It\'s become my go-to resource for travel inspiration.',
            featured: true
          },
          {
            id: '3',
            name: 'Emma Rodriguez',
            role: 'Adventure Seeker',
            avatar: '/avatars/emma.jpg',
            rating: 5,
            text: 'The quality of content and photography is exceptional. Every post makes me want to pack my bags immediately. The travel tips have saved me countless hours of planning.',
            featured: true
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Quote className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              What Our Readers Say
            </h2>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of travelers who trust our stories and guides for their adventures
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
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Quote className="h-8 w-8 text-blue-600" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            What Our Readers Say
          </h2>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Join thousands of travelers who trust our stories and guides for their adventures
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300"
          >
            {/* Quote Icon */}
            <div className="flex justify-center mb-4">
              <Quote className="h-8 w-8 text-blue-600" />
            </div>

            {/* Rating */}
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star
                  key={`star-${testimonial.id}-${i}`}
                  className="h-5 w-5 text-yellow-400 fill-current"
                />
              ))}
            </div>

            {/* Testimonial Text */}
            <blockquote className="text-gray-600 dark:text-gray-300 text-center mb-6 italic">
              "{testimonial.text}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {/* Placeholder avatar with initials */}
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {testimonial.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {testimonial.role}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center mt-12"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Join Our Community of Travelers
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and get exclusive travel tips, destination guides, 
            and early access to our latest stories.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
            Subscribe Now
          </button>
        </div>
      </motion.div>
    </div>
  )
}
