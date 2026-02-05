'use client'

import { HeroSection } from '@/components/home/HeroSection'
import { MetricsSection } from '@/components/home/MetricsSection'
import { FeaturedStories } from '@/components/home/FeaturedStories'
import { LatestPosts } from '@/components/home/LatestPosts'
import { Categories } from '@/components/home/Categories'
import { Newsletter } from '@/components/home/Newsletter'
import { InteractiveTravelMap } from '@/components/home/InteractiveTravelMap'
import { Testimonials } from '@/components/home/Testimonials'
import { AIItinerarySection } from '@/components/home/AIItinerarySection'
import { AIItineraryAnnouncement } from '@/components/home/AIItineraryAnnouncement'
import { API_BASE_URL } from '@/lib/api'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import FeaturedReviews from '@/components/home/FeaturedReviews'

interface SiteSettings {
  featureToggles?: {
    aiItineraryEnabled?: boolean
    aiItineraryAnnouncementEnabled?: boolean
  }
}

export default function HomePage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)

  // Fetch site settings
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/site-settings`)
        console.log('Site settings response:', response);
        if (response.ok) {
          const data = await response.json()
          console.log('Site settings data:', data);
          setSiteSettings(data)
        }
      } catch (error) {
        console.error('Failed to fetch site settings:', error)
      } finally {
        setSettingsLoading(false)
      }
    }

    fetchSiteSettings()
  }, [])

  // Generate SEO metadata for homepage
  const generateSEOMetadata = () => {
    const title = 'BagPackStories - Travel Blog, Destination Guides & Authentic Travel Stories'
    const description = 'Explore the world with BagPackStories. Discover breathtaking travel destinations, read authentic travel stories, get expert guides, photography tips, budget travel advice, and insider tips from experienced travelers. Your ultimate resource for travel inspiration and planning.'
    const keywords = [
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
      'backpacking',
      'budget travel',
      'solo travel tips',
      'family vacation ideas',
      'destination reviews',
      'travel itineraries',
      'cultural travel',
      'wanderlust',
      'globetrotting',
      'travel experiences'
    ].join(', ')

    return { title, description, keywords }
  }

  const seoData = generateSEOMetadata()

  // Generate structured data for homepage
  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "BagPackStories",
      "alternateName": "BagPack Stories Travel Blog",
      "description": seoData.description,
      "url": process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      "publisher": {
        "@type": "Organization",
        "name": "BagPackStories",
        "description": "Leading travel blog featuring authentic destination guides and travel stories",
        "logo": {
          "@type": "ImageObject",
          "url": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`
        },
        "sameAs": [
          "https://facebook.com/bagpackstories",
          "https://twitter.com/bagpackstories",
          "https://instagram.com/bagpackstories",
          "https://youtube.com/bagpackstories"
        ]
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "Travel Enthusiasts, Adventure Seekers, Backpackers, Vacation Planners"
      }
    }

    return JSON.stringify(structuredData)
  }

  return (
    <>
      <Head>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />

        {/* Mobile Optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/og-homepage.jpg`} />
        <meta property="og:site_name" content="BagPackStories" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} />
        <meta property="twitter:title" content={seoData.title} />
        <meta property="twitter:description" content={seoData.description} />
        <meta property="twitter:image" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/og-homepage.jpg`} />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="BagPackStories Team" />
        <meta name="language" content="English" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateStructuredData(),
          }}
        />
      </Head>

      <div className="min-h-screen w-full overflow-x-hidden">
        {/* Hero Section with Search */}
        <HeroSection />

        {/* Metrics Section */}
        {/* <MetricsSection /> */}

        {/* AI Powered Itinerary Section */}
        {!settingsLoading && (
          siteSettings?.featureToggles?.aiItineraryEnabled ? (
            <AIItinerarySection />
          ) : siteSettings?.featureToggles?.aiItineraryAnnouncementEnabled ? (
            <AIItineraryAnnouncement />
          ) : null
        )}

        {/* Featured Stories */}
        <section className="section-padding bg-gray-50 dark:bg-gray-800">
          <div className="container-max w-full">
            <FeaturedStories />
          </div>
        </section>

        {/* Latest Blog Posts */}
        {/* <section className="section-padding">
          <div className="container-max w-full">
            <LatestPosts />
          </div>
        </section> */}

        {/* Interactive Travel Map */}
        <section className="section-padding bg-gray-50 dark:bg-gray-800">
          <div className="container-max w-full">
            <InteractiveTravelMap />
          </div>
        </section>

        {/* Categories */}
        <section className="section-padding">
          <div className="container-max w-full">
            <Categories />
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-padding bg-gray-50 dark:bg-gray-800">
          <div className="container-max w-full">
            <Testimonials />
          </div>
        </section>

        {/* Featured Reviews */}
        <section className="section-padding">
          <div className="container-max w-full">
            <FeaturedReviews />
          </div>
        </section>

        {/* Newsletter Signup */}
        {/* <section className="section-padding hero-gradient">
          <div className="container-max w-full">
            <Newsletter />
          </div>
        </section> */}
      </div>
    </>
  )
}
