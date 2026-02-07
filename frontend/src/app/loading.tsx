import { SkeletonGrid } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse" />
        </div>

        {/* Content skeleton */}
        <SkeletonGrid count={6} />
      </div>
    </div>
  )
}
