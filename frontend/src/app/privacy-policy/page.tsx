'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { ArrowLeft, Shield, Eye, Lock, UserCheck, Globe, Mail } from 'lucide-react';
import { publicApi } from '@/lib/api';

export default function PrivacyPolicyPage() {
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
    supportEmail?: string;
  } | null>(null);
  const [contactLoading, setContactLoading] = useState(true);

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

  return (
    <>
      <Head>
        <title>Privacy Policy | BagPackStories</title>
        <meta
          name="description"
          content="Learn how BagPackStories collects, uses, and protects your personal information. Our commitment to your privacy and data security."
        />
        <meta
          name="keywords"
          content="privacy policy, data protection, personal information, GDPR, CCPA, data security"
        />
      </Head>
      <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 mr-3" />
            <h1 className="text-2xl md:text-3xl font-bold">Privacy Policy</h1>
          </div>
          
          <p className="text-lg text-blue-100 max-w-2xl">
            Your privacy matters to us. Learn how we collect, use, and protect your personal information.
          </p>
          
          <div className="mt-6 text-sm text-blue-200">
            Last updated: September 8, 2025
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Quick Overview */}
          <div className="bg-blue-50 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Eye className="w-6 h-6 mr-2 text-blue-600" />
              Quick Overview
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What We Collect</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Email address and name</li>
                  <li>• Usage data and preferences</li>
                  <li>• Travel content you submit</li>
                  <li>• Comments and interactions</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How We Use It</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Provide personalized content</li>
                  <li>• Send newsletters (with consent)</li>
                  <li>• Improve our services</li>
                  <li>• Communicate with you</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="prose prose-base max-w-none">
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <UserCheck className="w-7 h-7 mr-3 text-blue-600" />
                Information We Collect
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <p className="text-gray-700 mb-4">
                    When you create an account, subscribe to our newsletter, or interact with our platform, we may collect:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Name and email address</li>
                    <li>Profile information and preferences</li>
                    <li>Travel experiences and reviews you share</li>
                    <li>Communication preferences</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Usage Information</h3>
                  <p className="text-gray-700 mb-4">
                    We automatically collect certain information when you use our website:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Pages visited and time spent</li>
                    <li>Referring website information</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Globe className="w-7 h-7 mr-3 text-blue-600" />
                How We Use Your Information
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain our travel blog services</li>
                  <li>Send you newsletters and updates (with your consent)</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Personalize your experience and content recommendations</li>
                  <li>Analyze usage patterns to improve our website</li>
                  <li>Prevent fraud and ensure platform security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Lock className="w-7 h-7 mr-3 text-blue-600" />
                Information Sharing
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>We do not sell your personal information. We may share information in these limited circumstances:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> With trusted third parties who help us operate our website</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
                  <li><strong>With Consent:</strong> When you explicitly agree to share information</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Data Security</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure server infrastructure</li>
                  <li>Regular security assessments</li>
                  <li>Limited access to personal data</li>
                  <li>Staff training on data protection</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Rights</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your account and data</li>
                  <li>Object to processing</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at{' '}
                  {contactLoading ? (
                    <span className="text-gray-500">Loading...</span>
                  ) : (
                    <span className="text-blue-600 font-medium">
                      {contactInfo?.supportEmail || contactInfo?.email || 'privacy@bagpackstories.in'}
                    </span>
                  )}
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Cookies</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how you use our site</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p>
                  You can control cookies through your browser settings, though this may affect website functionality.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Children's Privacy</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Our website is not intended for children under 13. We do not knowingly collect personal information 
                  from children under 13. If we become aware that we have collected such information, we will take 
                  steps to delete it promptly.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Changes to This Policy</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any material changes 
                  by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Mail className="w-7 h-7 mr-3 text-blue-600" />
                Contact Us
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  If you have questions about this privacy policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Email:</strong>{' '}
                    {contactLoading ? (
                      <span className="text-gray-500">Loading...</span>
                    ) : (
                      <span>{contactInfo?.supportEmail || contactInfo?.email || 'privacy@bagpackstories.in'}</span>
                    )}
                  </p>
                  <p>
                    <strong>Address:</strong>{' '}
                    {contactLoading ? (
                      <span className="text-gray-500">Loading...</span>
                    ) : contactInfo?.address ? (
                      <span>
                        {contactInfo.address.street}, {contactInfo.address.city}, {contactInfo.address.state} {contactInfo.address.zipCode}, {contactInfo.address.country}
                      </span>
                    ) : (
                      <span>BagPackStories Privacy Team, 123 Travel Street, Adventure City, AC 12345</span>
                    )}
                  </p>
                  <p>
                    <strong>Phone:</strong>{' '}
                    {contactLoading ? (
                      <span className="text-gray-500">Loading...</span>
                    ) : (
                      <span>{contactInfo?.phone || '+1 (555) 123-4567'}</span>
                    )}
                  </p>
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
