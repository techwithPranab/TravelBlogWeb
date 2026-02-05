import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BagPackStories - Travel Blog & Guides',
    short_name: 'BagPackStories',
    description: 'Discover amazing travel destinations, read inspiring stories, and get practical travel tips from experienced travelers around the world.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en-US',
    dir: 'ltr',
    categories: ['travel', 'lifestyle', 'photography', 'blog'],
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    // Screenshots can be added when available
    // screenshots: [
    //   {
    //     src: '/screenshots/desktop-home.png',
    //     sizes: '1280x720',
    //     type: 'image/png',
    //   },
    //   {
    //     src: '/screenshots/mobile-home.png',
    //     sizes: '750x1334',
    //     type: 'image/png',
    //   },
    // ],
    shortcuts: [
      {
        name: 'Latest Posts',
        short_name: 'Blog',
        description: 'View latest travel blog posts',
        url: '/blog',
        icons: [{ src: '/icon-blog.png', sizes: '96x96' }],
      },
      {
        name: 'Destinations',
        short_name: 'Places',
        description: 'Explore travel destinations',
        url: '/destinations',
        icons: [{ src: '/icon-destinations.png', sizes: '96x96' }],
      },
      {
        name: 'Search',
        short_name: 'Search',
        description: 'Search travel content',
        url: '/search',
        icons: [{ src: '/icon-search.png', sizes: '96x96' }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  }
}
