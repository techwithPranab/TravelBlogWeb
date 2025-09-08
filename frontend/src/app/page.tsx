import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedStories } from '@/components/home/FeaturedStories'
import { LatestPosts } from '@/components/home/LatestPosts'
import { Categories } from '@/components/home/Categories'
import { Newsletter } from '@/components/home/Newsletter'
import { InteractiveTravelMap } from '@/components/home/InteractiveTravelMap'
import { Testimonials } from '@/components/home/Testimonials'
import Head from 'next/head'

export default function HomePage() {
  // Generate SEO metadata for homepage
  const generateSEOMetadata = () => {
    const title = 'TravelBlog - Discover Amazing Destinations & Travel Stories'
    const description = 'Explore breathtaking destinations, read inspiring travel stories, and get expert travel guides from experienced travelers around the world. Your ultimate travel companion.'
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
      'travel inspiration'
    ].join(', ')

    return { title, description, keywords }
  }

  const seoData = generateSEOMetadata()

  // Generate structured data for homepage
  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "TravelBlog",
      "description": seoData.description,
      "url": process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      "publisher": {
        "@type": "Organization",
        "name": "TravelBlog",
        "logo": {
          "@type": "ImageObject",
          "url": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`
        }
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
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

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/og-homepage.jpg`} />
        <meta property="og:site_name" content="TravelBlog" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} />
        <meta property="twitter:title" content={seoData.title} />
        <meta property="twitter:description" content={seoData.description} />
        <meta property="twitter:image" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/og-homepage.jpg`} />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="TravelBlog Team" />
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

      <div className="min-h-screen">
        {/* Hero Section with Search */}
        <HeroSection />

        {/* Featured Stories */}
        <section className="section-padding bg-gray-50 dark:bg-gray-800">
          <div className="container-max">
            <FeaturedStories />
          </div>
        </section>

        {/* Latest Blog Posts */}
        <section className="section-padding">
          <div className="container-max">
            <LatestPosts />
          </div>
        </section>

        {/* Interactive Travel Map */}
        <section className="section-padding bg-gray-50 dark:bg-gray-800">
          <div className="container-max">
            <InteractiveTravelMap />
          </div>
        </section>

        {/* Categories */}
        <section className="section-padding">
          <div className="container-max">
            <Categories />
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-padding bg-gray-50 dark:bg-gray-800">
          <div className="container-max">
            <Testimonials />
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="section-padding hero-gradient">
          <div className="container-max">
            <Newsletter />
          </div>
        </section>
      </div>
    </>
  )
}
