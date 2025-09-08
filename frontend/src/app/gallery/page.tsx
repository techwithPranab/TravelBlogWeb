import { Metadata } from 'next';
import GalleryClient from './GalleryClient';

export const metadata: Metadata = {
  title: 'Photo Gallery | TravelBlog - Travel Photography Collection',
  description: 'Explore stunning travel photography from destinations around the world. Discover inspiring travel moments captured by adventurers and share your own travel photos.',
  keywords: [
    'travel photos',
    'travel photography',
    'photo gallery',
    'travel destinations',
    'travel inspiration',
    'travel community',
    'adventure photography',
    'landscape photography'
  ],
  openGraph: {
    title: 'Travel Photo Gallery | TravelBlog',
    description: 'Discover amazing travel moments captured by adventurers around the world',
    type: 'website',
    url: 'https://travelblog.com/gallery',
    siteName: 'TravelBlog',
    images: [
      {
        url: 'https://travelblog.com/images/gallery-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'TravelBlog Photo Gallery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Photo Gallery | TravelBlog',
    description: 'Discover amazing travel moments captured by adventurers around the world',
    images: ['https://travelblog.com/images/gallery-hero.jpg'],
  },
  alternates: {
    canonical: 'https://travelblog.com/gallery',
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
