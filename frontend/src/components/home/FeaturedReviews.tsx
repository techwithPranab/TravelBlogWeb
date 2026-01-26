'use client'

import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { getFeaturedReviews } from '@/lib/reviewsApi'
import { Star } from 'lucide-react'

export default function FeaturedReviews() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await getFeaturedReviews(10)
        if (res.success) {
          setReviews(res.data || [])
        } else {
          setReviews([])
        }
      } catch (err) {
        console.error('Error fetching featured reviews:', err)
        setError('Failed to load featured reviews')
        setReviews([])
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  if (!loading && reviews.length === 0) return null

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Traveler Reviews</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mt-2">Handpicked reviews from travelers featured on our homepage</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-6"></div>
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
      ) : (
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={24}
          slidesPerView={1}
          loop={reviews.length > 1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
        >
          {reviews.map((r) => (
            <SwiperSlide key={r._id}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 h-full flex flex-col justify-between">
                <blockquote className="text-gray-600 dark:text-gray-300 italic mb-4">"{r.comment}"</blockquote>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 font-medium">
                      {r.userId?.name ? r.userId.name.split(' ').map((n:string)=>n[0]).join('') : (r.userName || '').split(' ').map((n:string)=>n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{r.userId?.name || r.userName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{r.itineraryId?.title || `#${String(r.itineraryId?._id || r.itineraryId).slice(-6)}`}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {error && (
        <div className="text-center mt-4 text-red-600">{error}</div>
      )}
    </div>
  )
}
