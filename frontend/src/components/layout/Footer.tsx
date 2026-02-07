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
      { name: 'Travel Destinations', href: '/destinations' },
      { name: 'Expert Travel Guides', href: '/guides' },
      { name: 'Travel Blog & Stories', href: '/blog' },
      { name: 'Travel Photography', href: '/gallery' },
    ],
    resources: [
      // { name: 'Travel Resources', href: '/resources' },
      // { name: 'Photo Gallery', href: '/gallery' },
      // { name: 'Trip Planning', href: '/planning' },
      { name: '', href: '' }, // Keep empty item to maintain array type
    ].filter(item => item.name !== ''), // Filter out empty items
    company: [
      { name: 'About BagPackStories', href: '/about' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms-of-service' },
    ],
    support: [
      { name: 'Travel Help Center', href: '/help' },
      // { name: 'Community', href: '/communities' },
      { name: 'Travel Newsletter', href: '/newsletter' },
      // { name: 'Partner with Us', href: '/partner-with-us' },
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-serif font-bold">BagPackStories</span>
            </div>
            
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Your trusted travel companion for discovering breathtaking destinations worldwide. 
              Get expert travel guides, insider tips, destination reviews, and authentic travel stories 
              from experienced globetrotters. Plan your dream vacation with our comprehensive resources.
            </p>

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
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
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

            {footerLinks.resources.filter(item => item.name !== '').length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Resources</h3>
                <ul className="space-y-3">
                  {footerLinks.resources.filter(item => item.name !== '').map((link) => (
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
            )}

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

            <div className="min-w-0">
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm whitespace-nowrap">support@bagpackstories.in</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm whitespace-nowrap">+91 9836027578</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm whitespace-nowrap">Barrackpore, West Bengal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex justify-center items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} BagPackStories. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
