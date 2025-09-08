import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Travel Photo Gallery | TravelBlog - Amazing Travel Photos',
  description: 'Explore our curated collection of amazing travel photos from destinations around the world. Search by location, tags, and discover incredible travel moments shared by fellow adventurers.',
  keywords: 'travel photos, travel gallery, travel photography, destinations, travel moments, photo collection, travel images',
  openGraph: {
    title: 'Travel Photo Gallery | TravelBlog',
    description: 'Explore our curated collection of amazing travel photos from destinations around the world. Search by location, tags, and discover incredible travel moments.',
    type: 'website',
    url: 'https://travelblog.com/gallery',
    siteName: 'TravelBlog',
    images: [
      {
        url: '/images/gallery-og.jpg',
        width: 1200,
        height: 630,
        alt: 'TravelBlog Photo Gallery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Photo Gallery | TravelBlog',
    description: 'Explore our curated collection of amazing travel photos from destinations around the world.',
    images: ['/images/gallery-twitter.jpg'],
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
    canonical: 'https://travelblog.com/gallery',
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
