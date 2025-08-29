'use client'

import { useState } from 'react'
import { Search, Calendar, User, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      title: 'Hidden Gems of Southeast Asia',
      excerpt: 'Discover breathtaking destinations off the beaten path in Thailand, Vietnam, and Cambodia.',
      image: '/images/blog/southeast-asia.jpg',
      category: 'Destinations',
      author: 'Sarah Johnson',
      date: '2024-01-15',
      readTime: '8 min read',
      slug: 'hidden-gems-southeast-asia'
    },
    {
      id: 2,
      title: 'Solo Travel Safety Tips for Women',
      excerpt: 'Essential advice and precautions for women traveling alone around the world.',
      image: '/images/blog/solo-travel.jpg',
      category: 'Tips',
      author: 'Emma Rodriguez',
      date: '2024-01-12',
      readTime: '6 min read',
      slug: 'solo-travel-safety-tips'
    },
    {
      id: 3,
      title: 'Budget Backpacking Through Europe',
      excerpt: 'How to explore Europe on a shoestring budget without compromising on experiences.',
      image: '/images/blog/europe-backpacking.jpg',
      category: 'Budget Travel',
      author: 'Michael Chen',
      date: '2024-01-10',
      readTime: '10 min read',
      slug: 'budget-backpacking-europe'
    },
    {
      id: 4,
      title: 'Food Adventures in Japan',
      excerpt: 'A culinary journey through Tokyo, Osaka, and Kyoto - from street food to Michelin stars.',
      image: '/images/blog/japan-food.jpg',
      category: 'Food & Culture',
      author: 'David Kim',
      date: '2024-01-08',
      readTime: '7 min read',
      slug: 'food-adventures-japan'
    },
    {
      id: 5,
      title: 'Digital Nomad Guide to Bali',
      excerpt: 'Complete guide to working remotely from Bali - coworking spaces, wifi, and communities.',
      image: '/images/blog/bali-nomad.jpg',
      category: 'Digital Nomad',
      author: 'Lisa Thompson',
      date: '2024-01-05',
      readTime: '12 min read',
      slug: 'digital-nomad-bali'
    },
    {
      id: 6,
      title: 'Wildlife Photography in Africa',
      excerpt: 'Tips and techniques for capturing stunning wildlife photos during an African safari.',
      image: '/images/blog/africa-wildlife.jpg',
      category: 'Photography',
      author: 'James Wilson',
      date: '2024-01-03',
      readTime: '9 min read',
      slug: 'wildlife-photography-africa'
    }
  ]

  const categories = [
    'all',
    'Destinations',
    'Tips',
    'Budget Travel',
    'Food & Culture',
    'Digital Nomad',
    'Photography'
  ]

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Travel Stories & Guides
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Discover inspiring travel stories, practical guides, and insider tips from experienced travelers around the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {category === 'all' ? 'All Posts' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Post Image */}
                <div className="relative h-48 bg-gray-200">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Post Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  {/* Read More Link */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Never Miss a Story</h2>
            <p className="text-xl mb-6 text-blue-100">
              Subscribe to our newsletter for the latest travel guides and inspiration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
