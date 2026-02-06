'use client'

import { MapPin, Camera, Globe, Heart, Users, Award } from 'lucide-react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { publicApi } from '@/lib/api'

export default function AboutPage() {
  // State for metrics
  const [metrics, setMetrics] = useState({
    countriesVisited: 42,
    photosTaken: 10000,
    kmTravelled: 250000,
    travelersInspired: 50000
  })
  const [loading, setLoading] = useState(true)

  // Fetch metrics from backend
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await publicApi.getAboutMetrics()
        if (response.success) {
          setMetrics(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch about metrics:', error)
        // Keep default values if API fails
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  // Generate SEO metadata for about page
  const generateSEOMetadata = () => {
    const title = 'About BagPackStories - Authentic Travel Stories, Expert Guides & Photography Tips'
    const description = 'Discover BagPackStories, a premier travel blog founded by Pranab Paul. Read authentic travel experiences from work trips, family vacations, and solo adventures. Get expert destination guides, photography tips, budget travel advice, and insider insights from a passionate IT professional turned travel storyteller. Join 50,000+ inspired travelers worldwide.'
    const keywords = [
      'about travel blog',
      'travel blogger biography',
      'authentic travel stories',
      'travel photography tips',
      'destination guides writer',
      'IT professional traveler',
      'solo travel experiences',
      'family vacation blogger',
      'work trip adventures',
      'backpacking stories',
      'travel inspiration',
      'travel content creator',
      'adventure travel expert',
      'cultural travel experiences',
      'budget travel tips',
      'travel planning guide',
      'globetrotting stories',
      'wanderlust journey',
      'travel community leader',
      'destination expert reviews'
    ].join(', ')

    return { title, description, keywords }
  }

  const seoData = generateSEOMetadata()

  // Generate structured data for about page
  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About BagPackStories - Authentic Travel Stories & Expert Guides",
      "description": seoData.description,
      "url": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/about`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/about`
      },
      "publisher": {
        "@type": "Organization",
        "name": "BagPackStories",
        "alternateName": "BagPack Stories Travel Blog",
        "foundingDate": "2018",
        "description": "Premier travel blog sharing authentic experiences, expert destination guides, photography tips, and practical travel advice from real-world adventures across the globe.",
        "url": process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        "logo": {
          "@type": "ImageObject",
          "url": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`
        },
        "sameAs": [
          "https://facebook.com/bagpackstories",
          "https://twitter.com/bagpackstories",
          "https://instagram.com/bagpackstories",
          "https://youtube.com/bagpackstories"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "support@bagpackstories.in",
          "availableLanguage": ["English"]
        },
        "knowsAbout": [
          "Travel blogging",
          "Destination guides",
          "Travel photography",
          "Budget travel planning",
          "Solo travel experiences",
          "Family vacation planning",
          "Work trip adventures",
          "Adventure travel",
          "Cultural immersion",
          "Sustainable tourism"
        ]
      },
      "mainEntity": {
        "@type": "Person",
        "name": "Pranab Paul",
        "alternateName": "Pranab Paul - Travel Blogger",
        "jobTitle": "Founder, Travel Writer & IT Professional",
        "description": "IT professional and passionate traveler sharing authentic travel experiences from work trips, family vacations, and solo adventures worldwide. Expert in destination guides, travel photography, and budget travel planning.",
        "url": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/about`,
        "image": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/images/pranab-paul.jpg`,
        "sameAs": [
          "https://linkedin.com/in/pranabpaul",
          "https://instagram.com/pranabpaultravels"
        ],
        "knowsAbout": [
          "Travel blogging",
          "Destination guides",
          "Travel photography",
          "IT professional travel",
          "Solo travel",
          "Family vacations",
          "Work travel experiences",
          "Adventure travel",
          "Cultural travel",
          "Budget travel tips",
          "Travel planning",
          "Photography tips"
        ],
        "hasOccupation": [
          {
            "@type": "Occupation",
            "name": "Travel Blogger",
            "occupationLocation": {
              "@type": "Country",
              "name": "India"
            }
          },
          {
            "@type": "Occupation",
            "name": "IT Professional",
            "occupationLocation": {
              "@type": "Country",
              "name": "India"
            }
          }
        ]
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "About",
            "item": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/about`
          }
        ]
      }
    }

    return JSON.stringify(structuredData)
  }

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K+`
    }
    return num.toString()
  }

  const stats = [
    { icon: MapPin, label: 'Countries Visited', value: metrics.countriesVisited.toString() },
    { icon: Camera, label: 'Photos Taken', value: formatNumber(metrics.photosTaken) },
    { icon: Globe, label: 'KM Travelled', value: formatNumber(metrics.kmTravelled) },
    { icon: Users, label: 'Travelers Inspired', value: formatNumber(metrics.travelersInspired) }
  ]

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & Travel Writer',
      bio: 'Passionate traveler with 10+ years of exploring the world. Specializes in solo travel and cultural immersion.',
      image: '/images/team/sarah.jpg',
      countries: 35
    },
    {
      name: 'Michael Chen',
      role: 'Photography Director',
      bio: 'Award-winning travel photographer capturing the beauty of destinations around the globe.',
      image: '/images/team/michael.jpg',
      countries: 28
    },
    {
      name: 'Emma Rodriguez',
      role: 'Adventure Guide Writer',
      bio: 'Outdoor enthusiast and adventure travel expert. Loves hiking, climbing, and extreme sports.',
      image: '/images/team/emma.jpg',
      countries: 22
    }
  ]

  const values = [
    {
      icon: Heart,
      title: 'Authentic Experiences',
      description: 'I believe in genuine, immersive travel experiences that connect you with local culture and communities.'
    },
    {
      icon: Globe,
      title: 'Sustainable Travel',
      description: 'I promote responsible tourism that preserves destinations for future generations while supporting local economies.'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'I focus on building a supportive community of travelers who share knowledge, experiences, and inspire each other.'
    },
    {
      icon: Award,
      title: 'Quality Content',
      description: 'I provide thoroughly researched, practical, and inspiring content to help you plan amazing adventures.'
    }
  ]

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
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/about`} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/og-about.jpg`} />
        <meta property="og:site_name" content="BagPackStories" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/about`} />
        <meta property="twitter:title" content={seoData.title} />
        <meta property="twitter:description" content={seoData.description} />
        <meta property="twitter:image" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/og-about.jpg`} />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Pranab Paul - BagPackStories" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.country" content="India" />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/about`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateStructuredData(),
          }}
        />
      </Head>

      <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center hero-gradient text-white overflow-hidden">
        {/* Background with Ken Burns effect */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center animate-ken-burns opacity-20"></div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-indigo-900/70 to-slate-900/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                About BagPackStories
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
                Discover authentic travel experiences from work trips, family vacations, and solo adventures.
                Join thousands of travelers inspired by real stories from around the world.
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-2">
                      <stat.icon className="h-8 w-8 text-blue-300 mx-auto mb-4 group-hover:text-white transition-colors" />
                      <div className="text-xl md:text-2xl font-bold text-white mb-2">
                        {loading ? (
                          <div className="bg-white/20 animate-pulse rounded h-8 w-16 mx-auto"></div>
                        ) : (
                          stat.value
                        )}
                      </div>
                      <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center text-white/70 hover:text-white transition-colors cursor-pointer">
            <span className="text-sm font-medium mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/70 rounded-full flex justify-center">
              <div
                className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"
              ></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                My Travel Journey
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                From IT professional work trips to family adventures and solo explorations - discover how authentic travel experiences shape unforgettable stories
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Profile Image */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="order-2 lg:order-1"
              >
                <div className="relative">
                  <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                    <img
                      src="https://res.cloudinary.com/due8vcyim/image/upload/v1761492968/IMG-20241012-WA0023_2_zkgdmo.jpg"
                      alt="Pranab Paul - Travel Blogger & IT Professional"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-3 rounded-2xl shadow-xl">
                    <span className="text-lg font-bold">Pranab Paul</span>
                    <p className="text-sm opacity-90">Founder & Travel Writer</p>
                  </div>
                </div>
              </motion.div>

              {/* Story Content */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="order-1 lg:order-2"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  From Code to Compass: My Unique Travel Perspective
                </h3>
                <div className="space-y-6 text-gray-600 leading-relaxed">
                  <p className="text-base">
                    My journey as a travel blogger began in 2011 when I, Pranab Paul, combined my IT career with a passion for exploration. What started as documenting work assignments across different countries has evolved into a comprehensive travel resource that helps thousands of travelers every month.
                  </p>

                  <p className="text-base">
                    As an IT professional, I've had the unique opportunity to visit destinations for business conferences, client meetings, and project deployments. This professional travel experience provides authentic insights into both corporate and leisure travel, making my content uniquely relatable to diverse audiences.
                  </p>

                  <p className="text-base">
                    Beyond work trips, I cherish family vacations that create lasting memories and solo adventures that push personal boundaries. Each type of travel offers different lessons and perspectives, enriching my ability to provide comprehensive travel guidance.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Mission Statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-xl"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-base text-gray-600">
                  To inspire authentic travel experiences that connect people with diverse cultures, create meaningful memories, and promote responsible tourism worldwide.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Authentic Stories</h4>
                  <p className="text-gray-600">Real experiences from actual travels, not just tourist brochures</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Expert Photography</h4>
                  <p className="text-gray-600">Professional travel photography tips and stunning visual guides</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Practical Advice</h4>
                  <p className="text-gray-600">Budget-friendly tips, local insights, and honest recommendations</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These principles guide every travel story, destination guide, and piece of advice we share with our global community of travelers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-base">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section - Hidden */}
      {/* <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate travelers and storytellers dedicated to sharing authentic travel experiences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="h-64 bg-gray-200 flex items-center justify-center">
                  <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-purple-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 mb-4">{member.bio}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{member.countries} countries visited</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Call to Action - Hidden */}
      {/* <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Join Our Travel Community</h2>
            <p className="text-xl mb-6 text-purple-100">
              Connect with fellow travelers, share your experiences, and get inspired for your next adventure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/newsletter">
                <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Subscribe to Newsletter
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section> */}
    </div>
    </>
  )
}
