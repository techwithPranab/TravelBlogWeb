import '../styles/globals.css'
import type { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'

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
    default: 'Travel Blog - Discover Amazing Destinations',
    template: '%s | Travel Blog'
  },
  description: 'Discover amazing travel destinations, read inspiring stories, and get practical travel tips from experienced travelers around the world.',
  keywords: ['travel', 'blog', 'destinations', 'travel tips', 'travel guides', 'adventure', 'backpacking'],
  authors: [{ name: 'TechWithPranab' }],
  creator: 'TechWithPranab',
  publisher: 'Travel Blog',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Travel Blog',
    title: 'Travel Blog - Discover Amazing Destinations',
    description: 'Discover amazing travel destinations, read inspiring stories, and get practical travel tips from experienced travelers around the world.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Travel Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Blog - Discover Amazing Destinations',
    description: 'Discover amazing travel destinations, read inspiring stories, and get practical travel tips from experienced travelers around the world.',
    images: ['/images/og-image.jpg'],
    creator: '@techwithpranab',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="min-h-screen bg-white text-gray-900">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
             <main className="flex-grow pt-16">
              {children}
            </main>
            <Footer />
          </div>
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
