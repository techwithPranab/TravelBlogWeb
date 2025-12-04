'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { ArrowLeft, Scale, FileText, Shield, AlertTriangle, CheckCircle, Gavel } from 'lucide-react'
import { publicApi } from '@/lib/api'

export default function TermsOfServicePage() {
  const [contactInfo, setContactInfo] = useState<{
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  return (
    <>
      <Head>
        <title>Terms of Service | BagPackStories</title>
        <meta
          name="description"
          content="Read our terms of service to understand your rights and responsibilities when using BagPackStories platform."
        />
        <meta
          name="keywords"
          content="terms of service, user agreement, legal terms, conditions, website rules"
        />
      </Head>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center mb-4">
            <Scale className="w-8 h-8 mr-3" />
            <h1 className="text-2xl md:text-3xl font-bold">Terms of Service</h1>
          </div>
          
          <p className="text-lg text-green-100 max-w-2xl">
            Please read these terms carefully before using our travel blog platform.
          </p>
          
          <div className="mt-6 text-sm text-green-200">
            Last updated: September 8, 2025
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Quick Summary */}
          <div className="bg-green-50 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
              Quick Summary
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Rights</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Free access to travel content</li>
                  <li>• Share your travel experiences</li>
                  <li>• Comment and engage with community</li>
                  <li>• Request account deletion</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Responsibilities</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Provide accurate information</li>
                  <li>• Respect other users</li>
                  <li>• Follow community guidelines</li>
                  <li>• Respect intellectual property</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Detailed Terms */}
          <div className="prose prose-base max-w-none">
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="w-7 h-7 mr-3 text-green-600" />
                Acceptance of Terms
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  By accessing and using BagPackStories ("the Service"), you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  These Terms of Service ("Terms") govern your use of our website located at bagpackstories.in 
                  (the "Service") operated by BagPackStories ("us", "we", or "our").
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Use License</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Permission is granted to temporarily download one copy of the materials on BagPackStories's website 
                  for personal, non-commercial transitory viewing only. This is the grant of a license, not a 
                  transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on the website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
                <p>
                  This license shall automatically terminate if you violate any of these restrictions and may be 
                  terminated by BagPackStories at any time.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">User Accounts</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  When you create an account with us, you must provide information that is accurate, complete, 
                  and current at all times. You are responsible for safeguarding the password and for all 
                  activities that occur under your account.
                </p>
                <p>
                  You agree not to disclose your password to any third party. You must notify us immediately 
                  upon becoming aware of any breach of security or unauthorized use of your account.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">User Content</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Our Service allows you to post, link, store, share and otherwise make available certain 
                  information, text, graphics, videos, or other material ("Content"). You are responsible 
                  for Content that you post to the Service, including its legality, reliability, and appropriateness.
                </p>
                <p>
                  By posting Content to the Service, You grant us the right and license to use, modify, publicly 
                  perform, publicly display, reproduce, and distribute such Content on and through the Service.
                </p>
                <p>You represent and warrant that:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Content is yours (you own it) or you have the right to use it</li>
                  <li>Content does not violate, infringe or misappropriate any third party rights</li>
                  <li>Content is accurate and not misleading</li>
                  <li>Content does not contain offensive or inappropriate material</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <AlertTriangle className="w-7 h-7 mr-3 text-yellow-600" />
                Prohibited Uses
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>You may not use our Service:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                  <li>To upload or transmit viruses or any other type of malicious code</li>
                  <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                  <li>For any obscene or immoral purpose</li>
                  <li>To interfere with or circumvent the security features of the Service</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Intellectual Property</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  The Service and its original content, features and functionality are and will remain the 
                  exclusive property of BagPackStories and its licensors. The Service is protected by copyright, 
                  trademark, and other laws. Our trademarks and trade dress may not be used in connection 
                  with any product or service without our prior written consent.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your 
                  use of the Service, to understand our practices.
                </p>
                <Link 
                  href="/privacy-policy" 
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                >
                  Read our Privacy Policy →
                </Link>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-7 h-7 mr-3 text-green-600" />
                Disclaimer
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  The information on this website is provided on an "as is" basis. To the fullest extent 
                  permitted by law, this Company:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>excludes all representations and warranties relating to this website and its contents</li>
                  <li>excludes all liability for damages arising out of or in connection with your use of this website</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Limitation of Liability</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  In no event shall BagPackStories, nor its directors, employees, partners, agents, suppliers, or 
                  affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, 
                  including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
                  resulting from your use of the Service.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Termination</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  We may terminate or suspend your account and bar access to the Service immediately, without 
                  prior notice or liability, under our sole discretion, for any reason whatsoever and without 
                  limitation, including but not limited to a breach of the Terms.
                </p>
                <p>
                  If you wish to terminate your account, you may simply discontinue using the Service or 
                  contact us to request account deletion.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Gavel className="w-7 h-7 mr-3 text-green-600" />
                Governing Law
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  These Terms shall be interpreted and governed by the laws of the State of California, without 
                  regard to its conflict of law provisions. Our failure to enforce any right or provision of 
                  these Terms will not be considered a waiver of those rights.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Changes to Terms</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                  If a revision is material, we will provide at least 30 days notice prior to any new terms 
                  taking effect.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> {loading ? 'Loading...' : (contactInfo?.email || 'legal@bagpackstories.in')}</p>
                  <p><strong>Address:</strong> {loading ? 'Loading...' : `${contactInfo?.address?.street || 'BagPackStories Legal Team'}, ${contactInfo?.address?.city || 'Adventure City'}, ${contactInfo?.address?.state || 'AC'} ${contactInfo?.address?.zipCode || '12345'}`}</p>
                  <p><strong>Phone:</strong> {loading ? 'Loading...' : (contactInfo?.phone || '+1 (555) 123-4567')}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
