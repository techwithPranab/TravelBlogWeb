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
      name: 'Travel Blog & Stories',
      icon: <Book className="w-6 h-6" />,
      description: 'Learn how to read, comment on, and interact with our authentic travel blog posts and stories',
      articleCount: 8,
      href: '/help/blog'
    },
    {
      id: 'destinations',
      name: 'Destination Guides',
      icon: <MapPin className="w-6 h-6" />,
      description: 'Find comprehensive information about travel destinations, locations, and expert recommendations',
      articleCount: 25,
      href: '/help/destinations'
    },
    {
      id: 'gallery',
      name: 'Travel Photography Gallery',
      icon: <Globe className="w-6 h-6" />,
      description: 'Browse and explore our collection of travel photography and visual stories from around the world',
      articleCount: 12,
      href: '/help/gallery'
    },
    {
      id: 'guides',
      name: 'Expert Travel Guides',
      icon: <Book className="w-6 h-6" />,
      description: 'Access comprehensive travel guides, itineraries, and practical tips for your adventures',
      articleCount: 18,
      href: '/help/guides'
    }
  ]

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I comment on blog posts?',
      answer: 'You can leave comments at the bottom of each blog post. Simply scroll down to the comments section, enter your name, email, and your comment, then click "Post Comment".',
      category: 'blog'
    },
    {
      id: '2',
      question: 'How often are new blog posts published?',
      answer: 'We publish new travel stories and blog posts regularly. Subscribe to our newsletter to get notified whenever we publish new content.',
      category: 'blog'
    },
    {
      id: '3',
      question: 'Are the travel guides free?',
      answer: 'Yes, all our travel guides are completely free! We share authentic experiences and practical tips from real travels to help fellow travelers.',
      category: 'guides'
    },
    {
      id: '4',
      question: 'How do I find information about a specific destination?',
      answer: 'You can browse destinations by using the search function or visiting our destinations page. Each destination includes detailed information, photos, and travel tips.',
      category: 'destinations'
    },
    {
      id: '5',
      question: 'Can I download photos from the gallery?',
      answer: 'Photos in our gallery are for viewing and inspiration purposes. If you\'d like to use any photos, please contact us directly for permission and high-resolution versions.',
      category: 'gallery'
    },
    {
      id: '6',
      question: 'How can I suggest a new destination or guide?',
      answer: 'We love hearing from our community! You can suggest new destinations or request specific travel guides by contacting us through our contact form.',
      category: 'destinations'
    },
    {
      id: '7',
      question: 'Are the travel experiences authentic?',
      answer: 'Absolutely! All our content is based on real travel experiences. We share genuine stories, both the good and challenging aspects of traveling.',
      category: 'blog'
    },
    {
      id: '8',
      question: 'How do I navigate the photo gallery?',
      answer: 'Our photo gallery is organized by destinations and trips. You can browse by location or use the search feature to find specific places or experiences.',
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
        <title>Travel Help Center - BagPackStories | FAQs, Guides & Support for Travelers</title>
        <meta
          name="description"
          content="Get help with BagPackStories travel blog. Find answers to frequently asked questions about destinations, travel guides, photography gallery, blog navigation, and expert travel advice. Your comprehensive travel support center."
        />
        <meta
          name="keywords"
          content="travel help center, travel FAQ, travel support, destination help, travel guide assistance, blog help, travel questions, customer support, travel advice, how to travel, travel resources, traveler support"
        />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/help`} />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HelpCircle className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Travel Help Center - Find Answers to Your Questions
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Get help with travel blog navigation, destination guides, travel tips, photography gallery, 
              and expert advice for planning your adventures
            </p>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Find answers to your questions, browse our guides, or get in touch with our support team.
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
    </div>
  )
}
