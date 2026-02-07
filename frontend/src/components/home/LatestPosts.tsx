export function LatestPosts() {
  return (
    <div className="animate-fade-up">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-4">
          Latest Travel Posts
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Fresh stories and tips from recent adventures
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card-hover p-6">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
            <h3 className="text-xl font-bold mb-2">Sample Post Title {i}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sample excerpt for the blog post...
            </p>
            <div className="text-sm text-gray-500">January 15, 2024</div>
          </div>
        ))}
      </div>
    </div>
  )
}
