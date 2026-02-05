'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Clock, Heart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

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
      <div className="animate-fade-up">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Travel Stories
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Dive into our most popular travel experiences and get inspired for your next adventure.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {[...Array(6)].map((_, index) => (
            <div key={index} className={`animate-pulse ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
              <div className={`bg-gray-300 rounded-lg ${index === 0 ? 'h-80 lg:h-96' : 'h-48'} mb-4`}></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fade-up text-center py-12">
        <div className="text-red-500 mb-4">Failed to load featured stories</div>
        <button 
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (featuredPosts.length === 0) {
    return (
      <div className="animate-fade-up text-center py-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Featured Travel Stories
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          No featured stories available at the moment.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Featured Travel Stories & Destination Guides
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore our handpicked travel experiences, destination reviews, and expert guides. 
          Get inspired by authentic stories from fellow travelers exploring the world.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {featuredPosts.map((story, index) => (
          <article 
            key={story._id} 
            className={`card-hover overflow-hidden ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Link href={`/blog/${story.slug}`}>
              <div className="relative">
                <img 
                  src={story.featuredImage?.url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop'} 
                  alt={story.featuredImage?.alt || story.title}
                  className={`w-full object-cover ${index === 0 ? 'h-80 lg:h-96' : 'h-48'}`}
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                    {story.categories?.[0]?.name || 'Travel'}
                  </span>
                </div>
              </div>
            </Link>
            
            <div className="p-6">
              <Link href={`/blog/${story.slug}`}>
                <h3 className={`font-bold text-gray-900 dark:text-white mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer ${
                  index === 0 ? 'text-xl lg:text-2xl' : 'text-lg'
                }`}>
                  {story.title}
                </h3>
              </Link>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {story.excerpt}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={story.author?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'} 
                    alt={story.author?.name || 'Unknown Author'}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {story.author?.name || 'Unknown Author'}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(story.publishedAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{story.readTime} min read</span>
                  </span>
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
              
              <Link href={`/blog/${story.slug}`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="group"
                >
                  Read More 
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="text-center">
        <Link href="/blog">
          <Button variant="primary" size="lg">
            View All Stories
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
