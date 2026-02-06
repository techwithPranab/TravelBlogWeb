'use client';

import { useState, useEffect } from 'react';
import { publicApi } from '@/lib/api';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [contactInfo, setContactInfo] = useState<{
    email: string;
    phone: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    support: {
      email: string;
      responseTime: string;
    };
  } | null>(null);
  const [contactLoading, setContactLoading] = useState(true);

  // Generate SEO metadata for contact page
  const generateSEOMetadata = () => {
    const title = 'Contact BagPackStories - Travel Questions, Collaboration & Support'
    const description = 'Get in touch with BagPackStories for travel destination questions, expert advice, collaboration opportunities, photography inquiries, and personalized travel support. Connect with our travel community and plan your next adventure with confidence.'
    const keywords = [
      'contact travel blog',
      'travel questions',
      'travel support',
      'destination advice',
      'travel collaboration',
      'photography inquiries',
      'travel planning help',
      'travel blogger contact',
      'travel guide support',
      'adventure travel questions',
      'vacation planning assistance',
      'travel community contact',
      'destination recommendations',
      'travel itinerary help',
      'solo travel advice'
    ].join(', ')

    return { title, description, keywords };
  }

  const seoData = generateSEOMetadata()

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await publicApi.getContact();
        if (response.success) {
          setContactInfo(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch contact info:', error);
      } finally {
        setContactLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
        console.error('Contact form error:', data);
      }
    } catch (error) {
      console.error('Network error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen w-full overflow-x-hidden">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact BagPackStories - Travel Blog & Destination Guide Support",
            "description": "Get in touch with BagPackStories for travel questions, collaboration opportunities, travel guide requests, photography inquiries, and general support. We're here to help plan your next adventure.",
            "url": "https://bagpackstories.in/contact",
            "mainEntity": {
              "@type": "Organization",
              "name": "BagPackStories",
              "description": "Leading personal travel blog providing authentic stories and expert destination guides",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": contactInfo?.phone || "+91 9836027578",
                "contactType": "customer service",
                "email": contactInfo?.email || "support@bagpackstories.in",
                "availableLanguage": ["English"],
                "areaServed": "Worldwide",
                "hoursAvailable": {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "09:00",
                  "closes": "18:00"
                }
              },
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Barrackpore",
                "addressRegion": "West Bengal",
                "addressCountry": "India"
              },
              "sameAs": [
                "https://facebook.com/bagpackstories",
                "https://twitter.com/bagpackstories",
                "https://instagram.com/bagpackstories",
                "https://youtube.com/bagpackstories"
              ]
            },
            "publisher": {
              "@type": "Organization",
              "name": "BagPackStories",
              "logo": {
                "@type": "ImageObject",
                "url": "https://bagpackstories.in/images/logo.png"
              }
            },
            "potentialAction": {
              "@type": "CommunicateAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://bagpackstories.in/contact",
                "actionPlatform": [
                  "http://schema.org/DesktopWebPlatform",
                  "http://schema.org/MobileWebPlatform"
                ]
              }
            }
          })
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center hero-gradient text-white overflow-hidden">
        {/* Background with Ken Burns effect */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center animate-ken-burns opacity-20"></div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-indigo-900/50 to-purple-900/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-transparent"></div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Get In Touch
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Have travel questions? Need destination advice? Want to collaborate?
              We're here to help you plan your next unforgettable adventure.
            </p>

            {/* Contact highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-2xl mb-2">💬</div>
                <h3 className="text-lg font-semibold text-white mb-2">Travel Questions</h3>
                <p className="text-blue-200 text-sm">Get expert advice on destinations, itineraries, and travel tips</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-2xl mb-2">🤝</div>
                <h3 className="text-lg font-semibold text-white mb-2">Collaborations</h3>
                <p className="text-blue-200 text-sm">Partner with us for travel content and brand collaborations</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-2xl mb-2">📸</div>
                <h3 className="text-lg font-semibold text-white mb-2">Photography</h3>
                <p className="text-blue-200 text-sm">Discuss photography projects and visual storytelling</p>
              </div>
            </div>
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
            <span className="text-sm font-medium mb-2">Scroll to contact form</span>
            <div className="w-6 h-10 border-2 border-white/70 rounded-full flex justify-center">
              <div
                className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"
              ></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Contact Form and Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us Your Travel Questions</h2>
            <p className="text-gray-600 mb-8">We'd love to hear from you! Whether you have questions about destinations, need travel advice, or want to collaborate, we're here to help.</p>

            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">Thank you for your message! We'll get back to you soon.</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">Sorry, there was an error sending your message. Please try again.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">{contactLoading ? 'Loading...' : (contactInfo?.email || 'hello@bagpackstories.in')}</p>
                    {/* <p className="text-gray-600">{contactLoading ? 'Loading...' : (contactInfo?.support?.email || 'support@bagpackstories.in')}</p> */}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Phone</h3>
                    <p className="text-gray-600">
                      {contactLoading ? 'Loading...' : (contactInfo?.phone || '+1 (555) TRAVEL')}
                    </p>
                    {contactInfo?.support?.responseTime && (
                      <p className="text-gray-600">{contactInfo.support.responseTime}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Address</h3>
                    <p className="text-gray-600">
                      {contactLoading ? 'Loading...' : contactInfo?.address ? (
                        <>
                          {contactInfo.address.street}<br />
                          {contactInfo.address.city}, {contactInfo.address.state} {contactInfo.address.zipCode}
                          {contactInfo.address.country && `, ${contactInfo.address.country}`}
                        </>
                      ) : (
                        <>123 Travel Street<br />Adventure City, AC 12345</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">How can I submit my travel photos?</h3>
                  <p className="text-gray-600">Visit our gallery page and use the photo submission form. We'll review your photos and feature the best ones on our site.</p>
                </div>

                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">Do you accept guest posts?</h3>
                  <p className="text-gray-600">Yes! We love featuring travel stories from fellow adventurers. Send us your story idea and we'll get back to you.</p>
                </div>

                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">How can I collaborate with BagPackStories?</h3>
                  <p className="text-gray-600">We're always looking for partnerships. Reach out with your collaboration idea and let's create something amazing together.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
