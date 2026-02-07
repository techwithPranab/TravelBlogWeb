import '../styles/globals.css'
import type { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'
import { ConditionalLayout } from '@/components/layout/ConditionalLayout'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'BagPackStories - Travel Blog, Destinations & Expert Travel Guides',
    template: '%s | BagPackStories'
  },
  description: 'Explore the world with BagPackStories - your ultimate travel companion. Discover breathtaking destinations, read authentic travel stories, expert travel guides, photography tips, budget travel advice, and practical tips from experienced travelers worldwide.',
  keywords: [
    'travel blog',
    'travel destinations',
    'travel guides',
    'travel stories',
    'travel photography',
    'adventure travel',
    'vacation planning',
    'travel tips',
    'world destinations',
    'travel inspiration',
    'backpacking guides',
    'budget travel',
    'solo travel',
    'family travel',
    'luxury travel',
    'travel itineraries',
    'destination reviews',
    'travel experiences',
    'wanderlust',
    'globetrotting'
  ],
  authors: [{ name: 'BagPackStories Team', url: 'https://bagpackstories.in/about' }],
  creator: 'BagPackStories',
  publisher: 'BagPackStories',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'BagPackStories - Travel Blog & Destination Guides',
    title: 'BagPackStories - Discover Amazing Destinations & Travel Stories',
    description: 'Explore breathtaking travel destinations, read inspiring stories, and get expert travel guides from experienced travelers. Your ultimate resource for travel inspiration, tips, and comprehensive destination information.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BagPackStories - Travel the World',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BagPackStories - Travel Blog, Destinations & Expert Guides',
    description: 'Discover amazing travel destinations, read inspiring travel stories, and get practical expert advice from experienced travelers around the world.',
    images: ['/images/og-image.jpg'],
    creator: '@bagpackstories',
    site: '@bagpackstories',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'Travel',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="min-h-screen bg-white">
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
