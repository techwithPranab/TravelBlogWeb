import { SkeletonCard, SkeletonText } from '@/components/ui/Skeleton'

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-80 mx-auto mb-4 animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse" />
        </div>

        {/* Featured post skeleton */}
        <div className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className="h-64 md:h-80 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4 animate-pulse" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4 animate-pulse" />
                <SkeletonText lines={3} className="mb-6" />
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
