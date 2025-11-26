"use client"
import Link from 'next/link'
import { ArrowLeft, Building2, Camera, Users, Globe, TrendingUp, Star, Mail, Phone, MapPin, DollarSign, Target, Megaphone, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export default function PartnerWithUsPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    partnershipType: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')
    console.log('Submitting form data:', formData)
    try {
      const response = await fetch(`${API_BASE_URL}/partners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          company: '',
          partnershipType: '',
          message: ''
        })
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.error || 'Failed to submit partnership proposal')
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrorMessage('Network error. Please try again later.')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your partnership proposal has been submitted successfully. We'll review your application and get back to you within 2-3 business days.
          </p>
          <Link
            href="/"
            className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const partnershipTypes = [
    {
      icon: Building2,
      title: 'Hotels & Resorts',
      description: 'Showcase your property to our audience of travel enthusiasts',
      benefits: [
        'Featured property reviews and highlights',
        'Social media promotion across all platforms',
        'SEO-optimized content driving direct bookings',
        'Access to our newsletter with 45K+ subscribers'
      ],
      requirements: [
        'Exceptional guest experience and ratings',
        'Unique property features or location',
        'Professional photography and content sharing',
        'Competitive rates for our audience'
      ]
    },
    {
      icon: Camera,
      title: 'Tour Operators',
      description: 'Partner with us to promote your unique travel experiences',
      benefits: [
        'Detailed tour reviews and recommendations',
        'Video content and social media coverage',
        'Inclusion in destination guides and itineraries',
        'Cross-promotion with related content'
      ],
      requirements: [
        'Licensed and insured tour operations',
        'Exceptional safety records and reviews',
        'Unique or authentic local experiences',
        'Sustainable and responsible tourism practices'
      ]
    },
    {
      icon: Megaphone,
      title: 'Travel Brands',
      description: 'Collaborate with us for authentic brand partnerships',
      benefits: [
        'Product reviews and sponsored content',
        'Brand integration in destination content',
        'Social media campaigns and influencer partnerships',
        'Performance tracking and analytics'
      ],
      requirements: [
        'Products relevant to travel and adventure',
        'High-quality, durable travel gear or services',
        'Competitive pricing and value proposition',
        'Strong brand reputation and customer service'
      ]
    },
    {
      icon: Users,
      title: 'Content Creators',
      description: 'Join our network of travel content creators and influencers',
      benefits: [
        'Guest posting opportunities',
        'Collaborative content creation',
        'Cross-promotion and audience sharing',
        'Access to exclusive travel opportunities'
      ],
      requirements: [
        'High-quality content and photography',
        'Engaged social media following',
        'Authentic travel experiences and stories',
        'Professional communication and reliability'
      ]
    }
  ]

  const stats = [
    {
      icon: Users,
      number: '2.5M+',
      label: 'Monthly Visitors',
      description: 'Engaged travel enthusiasts from around the world'
    },
    {
      icon: Globe,
      number: '150+',
      label: 'Countries Covered',
      description: 'Comprehensive destination coverage'
    },
    {
      icon: TrendingUp,
      number: '89%',
      label: 'Audience Retention',
      description: 'Highly engaged and loyal readership'
    },
    {
      icon: Star,
      number: '4.9/5',
      label: 'Partner Satisfaction',
      description: 'Average rating from our partners'
    }
  ]

  const process = [
    {
      step: '1',
      title: 'Initial Contact',
      description: 'Reach out to us with your partnership proposal and relevant information about your business.'
    },
    {
      step: '2',
      title: 'Review & Assessment',
      description: 'Our team reviews your application and assesses alignment with our values and audience.'
    },
    {
      step: '3',
      title: 'Partnership Discussion',
      description: 'We schedule a call to discuss partnership details, expectations, and mutual benefits.'
    },
    {
      step: '4',
      title: 'Agreement & Launch',
      description: 'We finalize the partnership agreement and launch our collaboration.'
    }
  ]

  const testimonials = [
    {
      name: 'Maria Rodriguez',
      title: 'Marketing Manager, Sunset Resort Bali',
      content: 'Our partnership with BagPackStories resulted in a 40% increase in direct bookings. Their authentic reviews and beautiful content perfectly captured our resort\'s essence.',
      rating: 5
    },
    {
      name: 'James Chen',
      title: 'Founder, Adventure Tours Co.',
      content: 'The collaboration exceeded our expectations. The detailed tour reviews and social media coverage brought us travelers who truly appreciated our unique experiences.',
      rating: 5
    },
    {
      name: 'Sarah Thompson',
      title: 'Brand Manager, TravelGear Pro',
      content: 'BagPackStories\'s authentic product reviews and integration into their travel stories gave our brand incredible exposure to the right audience.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Users className="w-12 h-12 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold">Partner with Us</h1>
            </div>

            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Join forces with BagPackStories to reach millions of passionate travelers worldwide.
              Let's create authentic partnerships that inspire and enable amazing travel experiences.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-indigo-200" />
                  <div className="text-2xl font-bold">{stat.number}</div>
                  <div className="text-sm text-indigo-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Partnership Types */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Partnership Opportunities</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We offer various partnership models tailored to different types of travel businesses and content creators.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {partnershipTypes.map((type) => (
              <div key={type.title} className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-indigo-100 rounded-lg p-3 mr-4">
                    <type.icon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{type.title}</h3>
                    <p className="text-gray-600">{type.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-green-600" />
                      What You Get
                    </h4>
                    <ul className="space-y-2">
                      {type.benefits.map((benefit) => (
                        <li key={benefit} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Star className="w-4 h-4 mr-2 text-blue-600" />
                      Requirements
                    </h4>
                    <ul className="space-y-2">
                      {type.requirements.map((requirement) => (
                        <li key={requirement} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Partner with BagPackStories?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform connects you with engaged travel enthusiasts who trust our recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">{stat.label}</div>
                <p className="text-sm text-gray-600">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Process */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Partnership Process</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Here's how we work together to create successful partnerships.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {process.map((step, index) => (
                <div key={step.step} className="text-center">
                  <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>

                  {index < process.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-gray-300 transform translate-x-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Partner Success Stories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from our partners about their experience working with BagPackStories.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Partner?</h2>
              <p className="text-lg text-gray-600">
                Let's discuss how we can work together to create amazing travel experiences.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Mail className="w-6 h-6 text-indigo-600 mr-4 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">Email</div>
                      <div className="text-gray-600">partnerships@bagpackstories.in</div>
                      <div className="text-sm text-gray-500">For partnership inquiries</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="w-6 h-6 text-indigo-600 mr-4 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">Phone</div>
                      <div className="text-gray-600">+1 (555) 123-4567</div>
                      <div className="text-sm text-gray-500">Business hours: Mon-Fri 9am-5pm EST</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="w-6 h-6 text-indigo-600 mr-4 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">Address</div>
                      <div className="text-gray-600">
                        123 Travel Street<br />
                        Adventure City, AC 12345<br />
                        United States
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-indigo-600" />
                    Partnership Investment
                  </h4>
                  <p className="text-gray-700 text-sm">
                    We offer flexible partnership models including revenue sharing, fixed-fee arrangements,
                    and performance-based collaborations. Investment levels vary based on partnership scope
                    and expected outcomes.
                  </p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errorMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Organization
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="partnershipType" className="block text-sm font-medium text-gray-700 mb-2">
                      Partnership Type
                    </label>
                    <select
                      id="partnershipType"
                      name="partnershipType"
                      value={formData.partnershipType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select partnership type</option>
                      <option value="hotel">Hotels & Resorts</option>
                      <option value="tour">Tour Operators</option>
                      <option value="brand">Travel Brands</option>
                      <option value="creator">Content Creators</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Partnership Proposal
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Tell us about your business and how you'd like to partner with us..."
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Partnership Proposal'}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    By submitting this form, you agree to our <Link href="/privacy-policy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
                    We'll respond within 2-3 business days.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
