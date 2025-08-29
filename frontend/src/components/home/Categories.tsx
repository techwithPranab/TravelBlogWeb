import Link from 'next/link'

export function Categories() {
  const categories = [
    { name: 'Destinations', count: 45, icon: '🏝️', slug: 'destinations' },
    { name: 'Travel Tips', count: 32, icon: '💡', slug: 'travel-tips' },
    { name: 'Photography', count: 28, icon: '📸', slug: 'photography' },
    { name: 'Food & Drink', count: 24, icon: '🍜', slug: 'food-drink' },
    { name: 'Budget Travel', count: 19, icon: '💰', slug: 'budget-travel' },
    { name: 'Adventure', count: 16, icon: '🎒', slug: 'adventure' },
  ]

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
            key={category.name} 
            href={`/blog?category=${category.slug}`}
            className="card-hover p-6 text-center cursor-pointer block"
          >
            <div className="text-4xl mb-4">{category.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {category.count} posts
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
