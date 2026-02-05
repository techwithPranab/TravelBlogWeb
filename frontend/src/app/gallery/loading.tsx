import { Skeleton } from '@/components/ui/Skeleton'

export default function GalleryLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-2xl mx-auto animate-pulse" />
        </div>

        {/* Filters skeleton */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="w-full lg:flex-1 lg:max-w-md">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Skeleton className="h-10 w-32 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        </div>

        {/* Gallery grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="px-1">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-1 mt-2">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
