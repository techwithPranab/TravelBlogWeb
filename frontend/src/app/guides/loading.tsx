import { SkeletonCard } from '@/components/ui/Skeleton'

export default function GuidesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-2xl mx-auto animate-pulse" />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          ))}
        </div>

        {/* Guides grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="p-6">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4 animate-pulse" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
