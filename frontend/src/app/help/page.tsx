'use client'

import { useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { 
  Search, 
  HelpCircle, 
  Mail, 
  Phone, 
  ChevronDown,
  ChevronRight,
  Book,
  MapPin,
  Globe
} from 'lucide-react'
import { motion } from 'framer-motion'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

interface HelpCategory {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  articleCount: number
  href: string
}

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const categories: HelpCategory[] = [
    {
      id: 'blog',
      name: 'Travel Blog & Stories Navigation',
      icon: <Book className="w-6 h-6" />,
      description: 'Learn how to navigate our authentic travel blog posts, leave comments, share stories, interact with content, and make the most of our travel storytelling platform for inspiration and community engagement.',
      articleCount: 8,
      href: '/help/blog'
    },
    {
      id: 'destinations',
      name: 'Destination Guides & Travel Planning',
      icon: <MapPin className="w-6 h-6" />,
      description: 'Access comprehensive destination information including travel requirements, best times to visit, cultural insights, accommodation recommendations, transportation options, and expert tips for planning successful trips to any location worldwide.',
      articleCount: 25,
      href: '/help/destinations'
    },
    {
      id: 'gallery',
      name: 'Travel Photography Gallery & Visual Stories',
      icon: <Globe className="w-6 h-6" />,
      description: 'Explore our curated collection of professional travel photography, learn about photographic techniques, discover visual storytelling methods, and find inspiration for capturing your own travel memories and adventures.',
      articleCount: 12,
      href: '/help/gallery'
    },
    {
      id: 'guides',
      name: 'Expert Travel Guides & Itineraries',
      icon: <Book className="w-6 h-6" />,
      description: 'Access detailed travel guides covering budget planning, packing strategies, safety tips, cultural etiquette, transportation options, accommodation choices, and comprehensive itineraries designed by experienced travelers for various budgets and travel styles.',
      articleCount: 18,
      href: '/help/guides'
    }
  ]

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I navigate and read travel blog posts on BagPackStories?',
      answer: 'Navigate our travel blog by browsing categories, using the search function, or exploring featured posts. Each blog post includes detailed travel stories, high-quality photos, practical tips, and reader comments. You can bookmark posts, share them on social media, and subscribe to our newsletter for new content notifications.',
      category: 'blog'
    },
    {
      id: '2',
      question: 'How often do you publish new travel content and stories?',
      answer: 'We publish fresh travel content regularly, typically 2-3 new blog posts per week featuring authentic travel experiences, destination guides, and photography showcases. Subscribe to our free newsletter to receive instant notifications about new content and never miss important travel updates or exclusive destination insights.',
      category: 'blog'
    },
    {
      id: '3',
      question: 'Are your travel guides and destination information free to access?',
      answer: 'Yes, absolutely! All our travel guides, destination information, photography tips, and expert advice are completely free. We believe in sharing authentic travel knowledge and experiences to help fellow travelers plan better adventures and create unforgettable memories without any subscription fees or paywalls.',
      category: 'guides'
    },
    {
      id: '4',
      question: 'How can I find detailed information about specific travel destinations?',
      answer: 'Find destination information through our dedicated destinations section, search functionality, or newsletter. Each destination guide includes comprehensive details about visa requirements, best travel seasons, cultural insights, accommodation options, transportation methods, local cuisine, safety tips, and authentic experiences from real travelers.',
      category: 'destinations'
    },
    {
      id: '5',
      question: 'Can I download or use photos from your travel photography gallery?',
      answer: 'Our travel photography gallery is designed for inspiration and visual storytelling. While you cannot download photos directly, you can use them as inspiration for your own travel photography. For commercial use or high-resolution versions, please contact us directly to discuss licensing and permissions for specific images.',
      category: 'gallery'
    },
    {
      id: '6',
      question: 'How can I contribute travel stories or suggest new destinations for your guides?',
      answer: 'We welcome contributions from our travel community! Share your authentic travel experiences through our contact form, suggest new destinations for comprehensive guides, or submit your travel photography for potential features. We review all submissions and feature the best content that provides genuine value to fellow travelers.',
      category: 'destinations'
    },
    {
      id: '7',
      question: 'Are the travel experiences and stories on BagPackStories authentic and real?',
      answer: 'Every travel story, destination guide, and photography feature on BagPackStories is based on authentic, real-world travel experiences. We share genuine adventures including both the highlights and challenges of traveling, providing honest insights that help fellow travelers make informed decisions and plan more realistic trips.',
      category: 'blog'
    },
    {
      id: '8',
      question: 'How do I navigate and explore your travel photography gallery effectively?',
      answer: 'Navigate our photography gallery by browsing destinations, travel themes, or using the search function. Each photo includes detailed information about location, camera settings, and storytelling context. You can explore by geographical regions, photography techniques, or specific travel experiences to find inspiration for your own adventures.',
      category: 'gallery'
    },
    {
      id: '9',
      question: 'What types of travel advice and tips do you provide in your guides?',
      answer: 'Our travel guides cover comprehensive advice including budget planning, packing strategies, safety tips, cultural etiquette, transportation options, accommodation selection, photography techniques, local cuisine recommendations, and authentic experiences. We focus on practical, actionable advice that helps travelers of all experience levels.',
      category: 'guides'
    },
    {
      id: '10',
      question: 'How can I get personalized travel planning assistance or custom itinerary help?',
      answer: 'For personalized travel planning assistance, contact our support team through the contact form or email. We can help with custom itinerary planning, destination recommendations based on your interests and budget, travel timeline optimization, and specific travel requirements or restrictions you may have.',
      category: 'guides'
    },
    {
      id: '11',
      question: 'Do you provide travel insurance information or safety advice for destinations?',
      answer: 'While we don\'t sell travel insurance directly, our destination guides include comprehensive safety information, health precautions, emergency contact details, and local regulations. We recommend consulting professional travel insurance providers and government travel advisories for your specific needs and destinations.',
      category: 'destinations'
    },
    {
      id: '12',
      question: 'How can I learn travel photography techniques from your content?',
      answer: 'Learn photography through our detailed technique guides, photo essays with camera settings, composition tutorials, and behind-the-scenes explanations. Each gallery features includes technical information, equipment used, and storytelling approaches that help both beginner and experienced photographers improve their travel photography skills.',
      category: 'gallery'
    }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would perform a more comprehensive search
  }

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Travel Help Center - BagPackStories | Complete Travel FAQ, Guides & Support for Travelers</title>
        <meta
          name="description"
          content="Get comprehensive help with BagPackStories travel blog. Find detailed answers to travel FAQs, destination guides, photography tips, blog navigation, expert travel advice, and customer support. Your complete travel assistance center for planning adventures worldwide."
        />
        <meta
          name="keywords"
          content="travel help center, travel FAQ, travel support, destination guides, travel photography help, blog navigation, travel advice, customer support, travel planning help, travel questions, traveler assistance, travel resources, travel guides help, photography gallery help, travel blog support, travel tips and advice"
        />
        <meta name="author" content="BagPackStories" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta property="og:title" content="Travel Help Center - Complete Travel FAQ & Support | BagPackStories" />
        <meta property="og:description" content="Get comprehensive travel help, detailed FAQs, destination guides, photography tips, and expert travel advice. Your complete travel assistance center for planning better adventures." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/help`} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/images/help-center-og.jpg`} />
        <meta property="og:site_name" content="BagPackStories" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Travel Help Center - Complete Travel FAQ & Support" />
        <meta name="twitter:description" content="Get comprehensive travel help, detailed FAQs, destination guides, photography tips, and expert travel advice." />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/images/help-center-og.jpg`} />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/help`} />
      </Head>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "name": "Travel Help Center - BagPackStories",
            "description": "Comprehensive travel help center with FAQs, guides, and support for travelers",
            "url": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/help`,
            "publisher": {
              "@type": "Organization",
              "name": "BagPackStories",
              "url": process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
              "logo": {
                "@type": "ImageObject",
                "url": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/images/logo.svg`
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-555-123-4567",
                "contactType": "customer service",
                "availableLanguage": "English"
              }
            },
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HelpCircle className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-6 leading-tight tracking-tight">
              Travel Help Center - Your Complete Travel Support Hub
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-blue-100 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
              Get comprehensive assistance with travel planning, destination research, photography techniques,
              blog navigation, and expert travel advice from experienced adventurers worldwide.
            </p>
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-blue-100 max-w-2xl mx-auto font-light">
              Browse detailed FAQs, access comprehensive travel guides, explore destination information,
              learn photography tips, and connect with our travel support team for personalized assistance.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for help articles, guides, or FAQs..."
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-xl bg-white text-gray-900 focus:ring-4 focus:ring-white/50 focus:outline-none shadow-lg"
                />
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Help</h2>
            <p className="text-xl text-gray-600">Get immediate assistance</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg p-6 shadow-lg text-center"
            >
              <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Email Support</h3>
              <p className="text-gray-600 mb-4">
                Send us a detailed message and we'll get back to you within 24 hours.
              </p>
              <Link 
                href="/contact"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Send Email
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-lg p-6 shadow-lg text-center"
            >
              <Phone className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Phone Support</h3>
              <p className="text-gray-600 mb-4">
                Call our support hotline for urgent issues and technical problems.
              </p>
              <a 
                href="tel:+1-555-123-4567"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Call Now
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Help Categories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dive deep into specific areas of travel assistance. Our comprehensive help categories cover everything
              from blog navigation and destination planning to photography techniques and expert travel guidance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {category.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{category.articleCount} articles available</span>
                      <Link
                        href={category.href}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Browse Articles →
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to common questions</p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length > 0 ? (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search or browse our categories above.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Travel Resources</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore more ways to enhance your travel experience with our comprehensive collection of travel resources,
              tools, and expert guidance designed to make every journey memorable and stress-free.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6 text-center"
            >
              <Book className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Travel Blog</h3>
              <p className="text-gray-600 mb-4">
                Discover authentic travel stories, destination insights, and practical advice from experienced travelers worldwide.
              </p>
              <Link
                href="/blog"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Read Stories
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6 text-center"
            >
              <Globe className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Destinations</h3>
              <p className="text-gray-600 mb-4">
                Explore comprehensive destination guides with local insights, travel tips, and authentic experiences.
              </p>
              <Link
                href="/destinations"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Explore Destinations
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6 text-center"
            >
              <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Newsletter</h3>
              <p className="text-gray-600 mb-4">
                Get weekly travel inspiration, exclusive deals, and expert tips delivered directly to your inbox.
              </p>
              <Link
                href="/newsletter"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Subscribe Now
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h3>
              <p className="text-gray-600 mb-6">
                Can't find what you're looking for? Our travel experts are here to help with personalized assistance
                for your specific travel needs and questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Contact Support
                </Link>
                <a
                  href="tel:+1-555-123-4567"
                  className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Call Us: +1-555-123-4567
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
