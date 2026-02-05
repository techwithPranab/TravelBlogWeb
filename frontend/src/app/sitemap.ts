import { MetadataRoute } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function fetchPosts() {
  try {
    const response = await fetch(`${API_URL}/posts?status=published&limit=1000`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error)
    return []
  }
}

async function fetchDestinations() {
  try {
    const response = await fetch(`${API_URL}/destinations?limit=1000`, {
      next: { revalidate: 3600 }
    })
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching destinations for sitemap:', error)
    return []
  }
}

async function fetchGuides() {
  try {
    const response = await fetch(`${API_URL}/guides?limit=1000`, {
      next: { revalidate: 3600 }
    })
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching guides for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchPosts()
  const destinations = await fetchDestinations()
  const guides = await fetchGuides()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/destinations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]

  // Blog posts
  const blogPosts: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Destinations
  const destinationPages: MetadataRoute.Sitemap = destinations.map((dest: any) => ({
    url: `${SITE_URL}/destinations/${dest.slug}`,
    lastModified: new Date(dest.updatedAt || dest.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Guides
  const guidePages: MetadataRoute.Sitemap = guides.map((guide: any) => ({
    url: `${SITE_URL}/guides/${guide.slug}`,
    lastModified: new Date(guide.updatedAt || guide.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...blogPosts, ...destinationPages, ...guidePages]
}
