'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Clock, Heart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'

interface FeaturedPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  featuredImage: {
    url: string
    alt: string
    caption?: string
  }
  author: {
    name: string
    avatar?: string
  }
  categories: Array<{
    name: string
    slug: string
  }>
  readTime: number
  viewCount: number
  likeCount: number
  publishedAt: string
}

export function FeaturedStories() {
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/featured?limit=6`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured posts')
        }
        
        const data = await response.json()
        
        if (data.success) {
          setFeaturedPosts(data.data)
        } else {
          throw new Error(data.error || 'Failed to load featured posts')
        }
      } catch (err) {
        console.error('Error fetching featured posts:', err)
        setError(err instanceof Error ? err.message : 'Failed to load featured posts')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedPosts()
  }, [])

  if (loading) {
    return (
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container-max animate-fade-up">
          <div className="text-center mb-16">
            <span className="text-teal-600 dark:text-teal-400 font-semibold text-sm uppercase tracking-wider mb-4 block">
              Travel Inspiration
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-serif">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Stories</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Dive into our most captivating travel experiences and get inspired for your next adventure
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className={`animate-pulse ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                <div className={`bg-gray-200 dark:bg-gray-700 rounded-2xl ${index === 0 ? 'h-96 md:h-full' : 'h-80'} mb-4`}></div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container-max animate-fade-up text-center py-12">
          <div className="text-red-500 dark:text-red-400 text-xl mb-4">Failed to load featured stories</div>
          <button 
            onClick={() => window.location.reload()}
            className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-semibold underline"
          >
            Try Again
          </button>
        </div>
      </section>
    )
  }

  if (featuredPosts.length === 0) {
    return (
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container-max animate-fade-up text-center py-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-serif">
            Featured Travel Stories
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No featured stories available at the moment.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container-max animate-fade-up">
        {/* Professional Header Section */}
        <div className="text-center mb-16">
          <span className="text-teal-600 dark:text-teal-400 font-semibold text-sm uppercase tracking-wider mb-4 block">
            Travel Inspiration
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-serif">
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Stories</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Immerse yourself in captivating travel narratives and authentic stories from globetrotters
          </p>
        </div>

        {/* Featured Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPosts.map((story, index) => (
            <article
              key={story._id}
              className={`group relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:-translate-y-2 ${
                index === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Featured Badge for First Story */}
              {index === 0 && (
                <div className="absolute top-6 right-6 z-10">
                  <span className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-bold rounded-full shadow-xl backdrop-blur-sm">
                    ⭐ EDITOR'S PICK
                  </span>
                </div>
              )}

            <Link href={`/blog/${story.slug}`} className="block">
              <div className="relative overflow-hidden">
                <OptimizedImage
                  src={story.featuredImage?.url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop'}
                  alt={story.featuredImage?.alt || story.title}
                  width={index === 0 ? 800 : 400}
                  height={index === 0 ? 400 : 200}
                  aspectRatio={index === 0 ? 'landscape' : 'landscape'}
                  sizes={index === 0 ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 1024px) 100vw, 33vw'}
                  className="w-full group-hover:scale-105 transition-transform duration-700"
                  priority={index < 2}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-semibold rounded-full shadow-lg">
                    {story.categories?.[0]?.name || 'Travel'}
                  </span>
                </div>

                {/* Read Time Badge */}
                <div className="absolute bottom-4 right-4">
                  <span className="px-3 py-1 bg-black/70 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                    {story.readTime} min read
                  </span>
                </div>
              </div>
            </Link>

            <div className="p-6 lg:p-8">
              <Link href={`/blog/${story.slug}`}>
                <h3 className={`font-bold text-gray-900 dark:text-white mb-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer leading-tight ${
                  index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl lg:text-2xl'
                }`}>
                  {story.title}
                </h3>
              </Link>

              <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed">
                {story.excerpt}
              </p>

              {/* Author and Meta Information */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <OptimizedImage
                    src={story.author?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'}
                    alt={story.author?.name || 'Unknown Author'}
                    width={40}
                    height={40}
                    aspectRatio="square"
                    className="rounded-full ring-2 ring-gray-100 dark:ring-gray-700"
                    showLoader={false}
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white block">
                      {story.author?.name || 'Unknown Author'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(story.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{(story.viewCount || 0).toLocaleString()}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{story.likeCount || 0}</span>
                  </span>
                </div>
              </div>

              {/* Read More Button */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <Link href={`/blog/${story.slug}`}>
                  <button className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors group">
                    Read Full Story
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </article>
        ))}
        </div>

        {/* Professional CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12"></div>
              <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-white rounded-full translate-y-10"></div>
              <div className="absolute bottom-0 right-1/3 w-16 h-16 bg-white rounded-full translate-y-8"></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4 font-serif">
                Ready to Start Your Journey?
              </h3>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of travelers who discover their next adventure through our stories
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/blog">
                  <button className="inline-flex items-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Explore All Stories
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <Link href="/destinations">
                  <button className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-teal-600 transition-all duration-300">
                    Browse Destinations
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
