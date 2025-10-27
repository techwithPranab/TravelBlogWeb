'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
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
          { _id: '5', name: 'Budget Travel', slug: 'budget-travel', description: '', color: '#8B5CF6', postCount: 19, createdAt: '', updatedAt: '' },
          { _id: '6', name: 'Adventure', slug: 'adventure', description: '', color: '#06B6D4', postCount: 16, createdAt: '', updatedAt: '' },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Default icons for categories (fallback if no image)
  const getCategoryIcon = (slug: string) => {
    const iconMap: { [key: string]: string } = {
      'destinations': '🏝️',
      'travel-tips': '💡',
      'photography': '📸',
      'food-drink': '🍜',
      'budget-travel': '💰',
      'adventure': '🎒',
      'culture': '🏛️',
      'nature': '🌿',
      'city-guides': '🏙️',
      'solo-travel': '✈️',
      'family-travel': '👨‍👩‍👧‍👦',
      'luxury-travel': '💎'
    }
    return iconMap[slug] || '📝'
  }

  if (isLoading) {
    return (
      <div className="animate-fade-up">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore by Category
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find exactly what you're looking for
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
          Explore by Category
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Find exactly what you're looking for
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((category) => (
          <Link 
            key={category._id} 
            href={`/blog?category=${category.slug}`}
            className="card-hover p-6 text-center cursor-pointer block"
          >
            <div className="text-4xl mb-4">{getCategoryIcon(category.slug)}</div>
            <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
