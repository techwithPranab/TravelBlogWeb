import Link from 'next/link'
import { useState, useEffect } from 'react'
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import { publicApi } from '@/lib/api'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const [contactInfo, setContactInfo] = useState<{
    email: string
    phone: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    socialLinks: {
      facebook: string
      twitter: string
      instagram: string
      youtube: string
    }
  } | null>(null)
  const [contactLoading, setContactLoading] = useState(true)

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await publicApi.getContact()
        if (response.success) {
          setContactInfo(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch contact info:', error)
      } finally {
        setContactLoading(false)
      }
    }

    fetchContactInfo()
  }, [])

  const footerLinks = {
    explore: [
      { name: 'Destinations', href: '/destinations' },
      { name: 'Travel Guides', href: '/guides' },
      { name: 'Travel Tips', href: '/blog?category=travel-tips' },
      { name: 'Photography', href: '/blog?category=photography' },
    ],
    resources: [
      { name: 'Travel Resources', href: '/resources' },
      { name: 'Photo Gallery', href: '/gallery' },
      // { name: 'Trip Planning', href: '/planning' },
      { name: 'Gear Reviews', href: '/blog?category=gear' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms-of-service' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      // { name: 'Community', href: '/communities' },
      { name: 'Newsletter', href: '/newsletter' },
      { name: 'Partner with Us', href: '/partner-with-us' },
    ],
  }

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: contactInfo?.socialLinks?.facebook || 'https://facebook.com/bagpackstories' },
    { name: 'Twitter', icon: Twitter, href: contactInfo?.socialLinks?.twitter || 'https://twitter.com/bagpackstories' },
    { name: 'Instagram', icon: Instagram, href: contactInfo?.socialLinks?.instagram || 'https://instagram.com/bagpackstories' },
    { name: 'YouTube', icon: Youtube, href: contactInfo?.socialLinks?.youtube || 'https://youtube.com/bagpackstories' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">BagPackStories</span>
            </div>
            
            <p className="text-gray-300 mb-6 max-w-md">
              Discover amazing destinations, get practical travel tips, and find inspiration 
              for your next adventure. Join thousands of travelers exploring the world one story at a time.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300">
                  {contactLoading ? 'Loading...' : (contactInfo?.email || 'hello@bagpackstories.in')}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300">
                  {contactLoading ? 'Loading...' : (contactInfo?.phone || '+1 (555) 123-4567')}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300">
                  {contactLoading ? 'Loading...' : (
                    contactInfo?.address 
                      ? `${contactInfo.address.city}, ${contactInfo.address.state}` 
                      : 'San Francisco, CA'
                  )}
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Explore</h3>
              <ul className="space-y-3">
                {footerLinks.explore.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Resources</h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-2xl">
            <h3 className="font-semibold text-lg mb-2">Stay in the Loop</h3>
            <p className="text-gray-300 mb-4">
              Get travel tips, destination guides, and exclusive content delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} BagPackStories. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-400 hover:text-primary-400 text-sm transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
