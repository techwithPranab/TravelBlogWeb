'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock,
  ChevronDown,
  ChevronRight,
  Book,
  Users,
  Settings,
  MapPin,
  CreditCard,
  Shield,
  Globe,
  Headphones
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
      id: 'getting-started',
      name: 'Getting Started',
      icon: <Book className="w-6 h-6" />,
      description: 'Learn the basics of using our platform',
      articleCount: 12,
      href: '/help/getting-started'
    },
    {
      id: 'account',
      name: 'Account & Profile',
      icon: <Users className="w-6 h-6" />,
      description: 'Manage your account settings and profile',
      articleCount: 8,
      href: '/help/account'
    },
    {
      id: 'bookings',
      name: 'Bookings & Payments',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Information about bookings and payment processing',
      articleCount: 15,
      href: '/help/bookings'
    },
    {
      id: 'destinations',
      name: 'Destinations & Guides',
      icon: <MapPin className="w-6 h-6" />,
      description: 'Find information about destinations and travel guides',
      articleCount: 25,
      href: '/help/destinations'
    },
    {
      id: 'safety',
      name: 'Safety & Security',
      icon: <Shield className="w-6 h-6" />,
      description: 'Travel safety tips and security information',
      articleCount: 10,
      href: '/help/safety'
    },
    {
      id: 'technical',
      name: 'Technical Support',
      icon: <Settings className="w-6 h-6" />,
      description: 'Technical issues and troubleshooting',
      articleCount: 7,
      href: '/help/technical'
    }
  ]

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I create an account?',
      answer: 'To create an account, click the "Sign Up" button in the top right corner of any page. Fill in your details including name, email, and password. You\'ll receive a confirmation email to verify your account.',
      category: 'getting-started'
    },
    {
      id: '2',
      question: 'How can I reset my password?',
      answer: 'On the login page, click "Forgot Password" and enter your email address. We\'ll send you a link to reset your password. Follow the instructions in the email to create a new password.',
      category: 'account'
    },
    {
      id: '3',
      question: 'Are the travel guides free?',
      answer: 'Most of our travel guides are completely free. Some premium guides with detailed itineraries and exclusive content may require a small fee, which is clearly marked.',
      category: 'destinations'
    },
    {
      id: '4',
      question: 'How do I book accommodation through your platform?',
      answer: 'Currently, we provide information and recommendations for accommodations, but bookings are made through our partner sites. We\'ll redirect you to trusted booking platforms where you can complete your reservation.',
      category: 'bookings'
    },
    {
      id: '5',
      question: 'Is it safe to travel to the destinations you recommend?',
      answer: 'We regularly update our destination information with current safety conditions. Always check the latest travel advisories from your government and consider travel insurance for your trips.',
      category: 'safety'
    },
    {
      id: '6',
      question: 'Can I submit my own travel stories?',
      answer: 'Yes! We welcome guest contributors. You can submit your travel stories through our contact form or by emailing us directly. Our editorial team will review and get back to you.',
      category: 'getting-started'
    },
    {
      id: '7',
      question: 'Why isn\'t the website loading properly?',
      answer: 'Try clearing your browser cache and cookies, or try using a different browser. If the problem persists, check your internet connection or contact our technical support team.',
      category: 'technical'
    },
    {
      id: '8',
      question: 'How can I update my profile information?',
      answer: 'Go to your account settings by clicking on your profile picture in the top right corner, then select "Profile Settings". You can update your personal information, preferences, and notification settings there.',
      category: 'account'
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
              How can we help you?
            </h1>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-lg p-6 shadow-lg text-center"
            >
              <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Live Chat</h3>
              <p className="text-gray-600 mb-4">
                Chat with our support team in real-time for immediate assistance.
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Start Chat
              </button>
            </motion.div>

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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600">Find specific information about different topics</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link 
                  href={category.href}
                  className="block bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow group"
                >
                  <div className="flex items-center mb-4">
                    <div className="text-blue-600 group-hover:text-blue-700 mr-3">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-3">{category.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{category.articleCount} articles</span>
                    <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
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

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white"
          >
            <Headphones className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Our support team is here to help you 24/7
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Response Time</h3>
                <p className="text-blue-200">Usually within 2 hours</p>
              </div>
              
              <div className="text-center">
                <Globe className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Languages</h3>
                <p className="text-blue-200">English, Spanish, French</p>
              </div>
              
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Expert Team</h3>
                <p className="text-blue-200">Travel specialists ready to help</p>
              </div>
            </div>
            
            <div className="mt-8">
              <Link 
                href="/contact"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
