'use client'

import { ArrowRight, Clock, Heart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function FeaturedStories() {
  const featuredStories = [
    {
      id: 1,
      title: "3 Days in Tokyo: A Perfect Itinerary for First-Time Visitors",
      excerpt: "Discover the best of Japan's capital city with this carefully crafted 3-day itinerary that covers must-see attractions, hidden gems, and local experiences.",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
      author: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
      },
      category: "Destination Guide",
      readTime: 8,
      views: 15420,
      likes: 342,
      publishedAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Solo Female Travel: Safety Tips for Backpacking Through Southeast Asia",
      excerpt: "Essential safety advice and practical tips for women traveling alone through Thailand, Vietnam, Cambodia, and Laos.",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
      author: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
      },
      category: "Travel Tips",
      readTime: 12,
      views: 8930,
      likes: 256,
      publishedAt: "2024-01-10"
    },
    {
      id: 3,
      title: "Hidden Beaches of the Greek Islands: Beyond Santorini and Mykonos",
      excerpt: "Escape the crowds and discover pristine beaches on lesser-known Greek islands that offer crystal-clear waters and authentic experiences.",
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop",
      author: {
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
      },
      category: "Hidden Gems",
      readTime: 10,
      views: 12180,
      likes: 287,
      publishedAt: "2024-01-05"
    }
  ]

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
        {featuredStories.map((story, index) => (
          <article 
            key={story.id} 
            className={`card-hover overflow-hidden ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="relative">
              <img 
                src={story.image} 
                alt={story.title}
                className={`w-full object-cover ${index === 0 ? 'h-80 lg:h-96' : 'h-48'}`}
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                  {story.category}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className={`font-bold text-gray-900 dark:text-white mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer ${
                index === 0 ? 'text-xl lg:text-2xl' : 'text-lg'
              }`}>
                {story.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {story.excerpt}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={story.author.avatar} 
                    alt={story.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {story.author.name}
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
                    <span>{(story.views || 0).toLocaleString()}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{story.likes}</span>
                  </span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                className="group"
              >
                Read More 
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div className="text-center">
        <Button variant="primary" size="lg">
          View All Stories
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
