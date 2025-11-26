'use client'

import { MapPin, Camera, Globe, Heart, Users, Award } from 'lucide-react'
import { motion } from 'framer-motion'
import Head from 'next/head'

export default function AboutPage() {
  // Generate SEO metadata for about page
  const generateSEOMetadata = () => {
    const title = 'About Us - BagPackStories | Passionate Travelers Sharing Authentic Stories'
    const description = 'Learn about BagPackStories\'s journey, our team of experienced travelers, and our mission to inspire authentic travel experiences around the world. Discover our story and values.'
    const keywords = [
      'about travel blog',
      'travel team',
      'travel writers',
      'travel photographers',
      'travel company',
      'travel mission',
      'travel values',
      'travel story',
      'travel community',
      'travel experts'
    ].join(', ')

    return { title, description, keywords }
  }

  const seoData = generateSEOMetadata()

  // Generate structured data for about page
  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About BagPackStories",
      "description": seoData.description,
      "url": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/about`,
      "publisher": {
        "@type": "Organization",
        "name": "BagPackStories",
        "foundingDate": "2018",
        "description": "A travel blog dedicated to sharing authentic travel experiences and inspiring adventures around the world.",
        "sameAs": [
          "https://facebook.com/bagpackstories",
          "https://twitter.com/bagpackstories",
          "https://instagram.com/bagpackstories"
        ]
      },
      "mainEntity": {
        "@type": "Organization",
        "name": "BagPackStories",
        "description": "Passionate travelers sharing authentic stories, practical guides, and inspiring adventures from around the world.",
        "founder": {
          "@type": "Person",
          "name": "Sarah Johnson"
        },
        "employee": [
          {
            "@type": "Person",
            "name": "Sarah Johnson",
            "jobTitle": "Founder & Travel Writer"
          },
          {
            "@type": "Person",
            "name": "Michael Chen",
            "jobTitle": "Photography Director"
          },
          {
            "@type": "Person",
            "name": "Emma Rodriguez",
            "jobTitle": "Adventure Guide Writer"
          }
        ]
      }
    }

    return JSON.stringify(structuredData)
  }

  const stats = [
    { icon: MapPin, label: 'Countries Visited', value: '42' },
    { icon: Camera, label: 'Photos Taken', value: '10,000+' },
    { icon: Globe, label: 'Miles Traveled', value: '250,000+' },
    { icon: Users, label: 'Travelers Inspired', value: '50,000+' }
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
      description: 'We believe in genuine, immersive travel experiences that connect you with local culture and communities.'
    },
    {
      icon: Globe,
      title: 'Sustainable Travel',
      description: 'Promoting responsible tourism that preserves destinations for future generations while supporting local economies.'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Building a supportive community of travelers who share knowledge, experiences, and inspire each other.'
    },
    {
      icon: Award,
      title: 'Quality Content',
      description: 'Providing thoroughly researched, practical, and inspiring content to help you plan amazing adventures.'
    }
  ]

  return (
    <>
      <Head>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />

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
        <meta name="author" content="BagPackStories Team" />
        <meta name="language" content="English" />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/about`} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: generateStructuredData(),
          }}
        />
      </Head>

      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Our Journey
            </h1>
            <p className="text-xl mb-8 text-purple-100">
              We're passionate travelers sharing authentic stories, practical guides, and inspiring adventures from around the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <stat.icon className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-lg max-w-none text-gray-600"
            >
              <p className="text-xl leading-relaxed mb-6">
                Our journey began in 2018 when Sarah Johnson, a corporate lawyer turned travel writer, decided to leave her 9-to-5 
                job to explore the world. What started as a personal blog documenting her solo adventures has grown into a 
                comprehensive travel resource visited by thousands of travelers every month.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                We believe that travel is one of life's greatest teachers. Every destination has its own story, culture, and lessons 
                to offer. Through our detailed guides, authentic stories, and practical tips, we aim to inspire and empower others 
                to explore the world with confidence and respect for local communities.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                Our team of experienced travelers and local experts work together to create content that goes beyond the typical 
                tourist attractions. We focus on authentic experiences, hidden gems, and sustainable travel practices that benefit 
                both travelers and the destinations they visit.
              </p>
              
              <p className="text-lg leading-relaxed">
                Whether you're planning your first international trip or you're a seasoned globetrotter looking for new inspiration, 
                we're here to help you create unforgettable memories and meaningful connections around the world.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do and help us create meaningful travel experiences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <value.icon className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
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
                {/* Member Image */}
                <div className="h-64 bg-gray-200 flex items-center justify-center">
                  <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>

                {/* Member Info */}
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
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
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
              <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Subscribe to Newsletter
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-purple-600 transition-colors">
                Follow on Social
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  )
}
