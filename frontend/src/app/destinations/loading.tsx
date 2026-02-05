import { Skeleton } from '@/components/ui/Skeleton'

export default function DestinationsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-80 mx-auto mb-4 animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-2xl mx-auto animate-pulse" />
        </div>

        {/* Search and filters */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-12 w-32 rounded-lg" />
              <Skeleton className="h-12 w-32 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Destinations grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
