'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { categoriesApi, Category } from '@/lib/api'

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await categoriesApi.getAll()
        setCategories(response.data)
      } catch (error) {
        console.error('Error fetching categories:', error)
        setError('Failed to load categories')
        // Set fallback categories if API fails
        setCategories([
          { _id: '1', name: 'Destinations', slug: 'destinations', description: '', color: '#3B82F6', postCount: 45, createdAt: '', updatedAt: '' },
          { _id: '2', name: 'Travel Tips', slug: 'travel-tips', description: '', color: '#10B981', postCount: 32, createdAt: '', updatedAt: '' },
          { _id: '3', name: 'Photography', slug: 'photography', description: '', color: '#F59E0B', postCount: 28, createdAt: '', updatedAt: '' },
          { _id: '4', name: 'Food & Drink', slug: 'food-drink', description: '', color: '#EF4444', postCount: 24, createdAt: '', updatedAt: '' },
          { _id: '5', name: 'Budget Travel', slug: 'budget-travel', description: '', color: '#0D9488', postCount: 19, createdAt: '', updatedAt: '' },
          { _id: '6', name: 'Adventure', slug: 'adventure', description: '', color: '#06B6D4', postCount: 16, createdAt: '', updatedAt: '' },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Professional category data with colors and descriptions
  const getCategoryData = (slug: string) => {
    const categoryData: { [key: string]: { color: string, bgColor: string, description: string, icon: string } } = {
      'destinations': {
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
        description: 'Destination guides & reviews',
        icon: '🗺️'
      },
      'travel-tips': {
        color: 'from-green-500 to-emerald-500',
        bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
        description: 'Expert travel advice',
        icon: '💡'
      },
      'photography': {
        color: 'from-teal-500 to-cyan-500',
        bgColor: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
        description: 'Travel photography tips',
        icon: '📸'
      },
      'food-drink': {
        color: 'from-orange-500 to-red-500',
        bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
        description: 'Culinary adventures',
        icon: '�️'
      },
      'budget-travel': {
        color: 'from-yellow-500 to-orange-500',
        bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
        description: 'Smart travel on budget',
        icon: '💰'
      },
      'adventure': {
        color: 'from-indigo-500 to-purple-500',
        bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
        description: 'Thrilling experiences',
        icon: '�️'
      },
      'culture': {
        color: 'from-pink-500 to-rose-500',
        bgColor: 'from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
        description: 'Cultural discoveries',
        icon: '🏛️'
      },
      'nature': {
        color: 'from-green-500 to-teal-500',
        bgColor: 'from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20',
        description: 'Natural wonders',
        icon: '🌿'
      },
      'city-guides': {
        color: 'from-slate-500 to-gray-500',
        bgColor: 'from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20',
        description: 'Urban explorations',
        icon: '🏙️'
      },
      'solo-travel': {
        color: 'from-violet-500 to-purple-500',
        bgColor: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20',
        description: 'Solo traveler guides',
        icon: '✈️'
      },
      'family-travel': {
        color: 'from-rose-500 to-pink-500',
        bgColor: 'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20',
        description: 'Family adventures',
        icon: '👨‍👩‍👧‍👦'
      },
      'luxury-travel': {
        color: 'from-amber-500 to-yellow-500',
        bgColor: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
        description: 'Luxury experiences',
        icon: '💎'
      }
    }
    return categoryData[slug] || {
      color: 'from-gray-500 to-slate-500',
      bgColor: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
      description: 'Travel content',
      icon: '📝'
    }
  }

  if (isLoading) {
    return (
      <div className="animate-fade-up">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Browse Travel Content by Category
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover travel guides, tips, and stories organized by your interests
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-6 text-center animate-pulse">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Explore Travel Categories
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Discover destination guides, travel tips, photography advice, and adventure stories by category
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((category) => (
          <div key={category._id} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50">
            <Link href={`/blog?category=${category.slug}`} className="block p-8 h-full">
              {/* Background gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryData(category.slug).bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Content */}
              <div className="relative z-10 text-center">
                {/* Icon with gradient background */}
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${getCategoryData(category.slug).color} text-white text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {getCategoryData(category.slug).icon}
                </div>

                {/* Category name */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-300 transition-all duration-300">
                  {category.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">
                  {getCategoryData(category.slug).description}
                </p>

                {/* Post count */}
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {category.postCount || 0}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {category.postCount === 1 ? 'story' : 'stories'}
                  </span>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 rounded-2xl transition-all duration-300" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
