import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Newsletter | TravelBlog',
  description: 'Subscribe to our travel newsletter for the latest destination guides, travel tips, and exclusive offers delivered to your inbox.',
  keywords: 'travel newsletter, travel tips, destination guides, travel deals, travel updates, travel inspiration',
}

export default function NewsletterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
