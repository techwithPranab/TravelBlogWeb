import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | TravelBlog - Get in Touch',
  description: 'Get in touch with TravelBlog. Contact us for travel tips, collaborations, or questions about our travel stories and destinations.',
  keywords: 'contact travel blog, travel inquiries, travel collaborations, travel questions',
  openGraph: {
    title: 'Contact Us | TravelBlog',
    description: 'Get in touch with TravelBlog. Contact us for travel tips, collaborations, or questions about our travel stories and destinations.',
    type: 'website',
    url: 'https://travelblog.com/contact',
    siteName: 'TravelBlog',
    images: [
      {
        url: '/images/contact-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact TravelBlog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | TravelBlog',
    description: 'Get in touch with TravelBlog. Contact us for travel tips, collaborations, or questions about our travel stories and destinations.',
    images: ['/images/contact-twitter.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://travelblog.com/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
