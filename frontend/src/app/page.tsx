import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedStories } from '@/components/home/FeaturedStories'
import { LatestPosts } from '@/components/home/LatestPosts'
import { Categories } from '@/components/home/Categories'
import { Newsletter } from '@/components/home/Newsletter'
import { InteractiveTravelMap } from '@/components/home/InteractiveTravelMap'
import { Testimonials } from '@/components/home/Testimonials'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <HeroSection />
      
      {/* Featured Stories */}
      <section className="section-padding bg-gray-50 dark:bg-gray-800">
        <div className="container-max">
          <FeaturedStories />
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="section-padding">
        <div className="container-max">
          <LatestPosts />
        </div>
      </section>

      {/* Interactive Travel Map */}
      <section className="section-padding bg-gray-50 dark:bg-gray-800">
        <div className="container-max">
          <InteractiveTravelMap />
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding">
        <div className="container-max">
          <Categories />
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-gray-50 dark:bg-gray-800">
        <div className="container-max">
          <Testimonials />
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="section-padding hero-gradient">
        <div className="container-max">
          <Newsletter />
        </div>
      </section>
    </div>
  )
}
