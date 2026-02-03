#!/usr/bin/env node

/**
 * Quick script to seed sample advertisements
 * Run: node backend/src/seeders/quickSeed.js
 */

const mongoose = require('mongoose')

// Simple connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-blog'

// Use the actual Advertisement model
const Ad = require('../models/Advertisement').default

async function seedAds() {
  try {
    console.log('📦 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected!')

    console.log('🗑️  Clearing old ads...')
    await Ad.deleteMany({})

    console.log('🌱 Creating sample ads...')

    const adminId = new mongoose.Types.ObjectId()

    const ads = [
      {
        name: 'luxury-hotels-tokyo',
        title: 'Luxury Hotels in Tokyo',
        description: 'Book your dream stay in Tokyo',
        type: 'hotel',
        format: 'banner',
        creative: {
          imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=728&h=90',
          imageAlt: 'Luxury Tokyo Hotels',
          callToAction: 'Book Now',
          buttonText: 'Book Now'
        },
        destinationUrl: 'https://booking.com',
        utmParameters: {
          source: 'travelblog',
          medium: 'banner',
          campaign: 'tokyo-hotels'
        },
        targeting: {
          deviceTypes: ['desktop', 'mobile']
        },
        placements: [{
          position: 'after_featured_image',
          priority: 10
        }],
        schedule: {
          startDate: new Date()
        },
        budget: {
          type: 'none'
        },
        performance: {
          impressions: 0,
          clicks: 0,
          ctr: 0
        },
        status: 'active',
        isPremium: true,
        isSponsored: true,
        seo: {
          noFollow: true,
          sponsored: true,
          ugc: false
        },
        createdBy: adminId
      },
      {
        name: 'flights-asia',
        title: 'Cheap Flights to Asia',
        description: 'Best deals on flights to Asia',
        type: 'airline',
        format: 'banner',
        creative: {
          imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=728&h=90',
          imageAlt: 'Cheap Flights to Asia',
          callToAction: 'Search Flights',
          buttonText: 'Search Flights'
        },
        destinationUrl: 'https://skyscanner.com',
        utmParameters: {
          source: 'travelblog',
          medium: 'banner',
          campaign: 'asia-flights'
        },
        targeting: {
          deviceTypes: ['desktop', 'mobile']
        },
        placements: [{
          position: 'content_middle',
          priority: 9
        }],
        schedule: {
          startDate: new Date()
        },
        budget: {
          type: 'none'
        },
        performance: {
          impressions: 0,
          clicks: 0,
          ctr: 0
        },
        status: 'active',
        isPremium: false,
        isSponsored: true,
        seo: {
          noFollow: true,
          sponsored: true,
          ugc: false
        },
        createdBy: adminId
      },
      {
        name: 'travel-luggage',
        title: 'Essential Travel Gear',
        description: 'Premium luggage and travel accessories',
        type: 'travel_accessories',
        format: 'sidebar',
        creative: {
          imageUrl: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=300&h=250',
          imageAlt: 'Travel Luggage',
          callToAction: 'Shop Now',
          buttonText: 'Shop Now'
        },
        destinationUrl: 'https://amazon.com',
        utmParameters: {
          source: 'travelblog',
          medium: 'sidebar',
          campaign: 'travel-gear'
        },
        targeting: {
          deviceTypes: ['desktop']
        },
        placements: [{
          position: 'sidebar_sticky',
          priority: 8
        }],
        schedule: {
          startDate: new Date()
        },
        budget: {
          type: 'none'
        },
        performance: {
          impressions: 0,
          clicks: 0,
          ctr: 0
        },
        status: 'active',
        isPremium: false,
        isSponsored: true,
        seo: {
          noFollow: true,
          sponsored: true,
          ugc: false
        },
        createdBy: adminId
      },
      {
        name: 'travel-insurance',
        title: 'Travel Insurance',
        description: 'Protect your trip with comprehensive coverage',
        type: 'insurance',
        format: 'banner',
        creative: {
          imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=728&h=90',
          imageAlt: 'Travel Insurance',
          callToAction: 'Get Quote',
          buttonText: 'Get Quote'
        },
        destinationUrl: 'https://allianz.com',
        utmParameters: {
          source: 'travelblog',
          medium: 'banner',
          campaign: 'travel-insurance'
        },
        targeting: {
          deviceTypes: ['desktop', 'mobile']
        },
        placements: [{
          position: 'before_comments',
          priority: 7
        }],
        schedule: {
          startDate: new Date()
        },
        budget: {
          type: 'none'
        },
        performance: {
          impressions: 0,
          clicks: 0,
          ctr: 0
        },
        status: 'active',
        isPremium: false,
        isSponsored: true,
        seo: {
          noFollow: true,
          sponsored: true,
          ugc: false
        },
        createdBy: adminId
      },
      {
        name: 'travel-app',
        title: 'Download Travel App',
        description: 'Plan your trips with our mobile app',
        type: 'technology',
        format: 'sticky',
        creative: {
          imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=320&h=50',
          imageAlt: 'Travel App Download',
          callToAction: 'Download Now',
          buttonText: 'Download Now'
        },
        destinationUrl: 'https://apps.apple.com',
        utmParameters: {
          source: 'travelblog',
          medium: 'sticky',
          campaign: 'travel-app'
        },
        targeting: {
          deviceTypes: ['mobile']
        },
        placements: [{
          position: 'sticky_footer',
          priority: 6
        }],
        schedule: {
          startDate: new Date()
        },
        budget: {
          type: 'none'
        },
        performance: {
          impressions: 0,
          clicks: 0,
          ctr: 0
        },
        status: 'active',
        isPremium: false,
        isSponsored: true,
        seo: {
          noFollow: true,
          sponsored: true,
          ugc: false
        },
        createdBy: adminId
      }
    ]

    await Ad.insertMany(ads)

    console.log('✅ Created 5 advertisements!')

    console.log('📊 Summary:')
    ads.forEach((ad, index) => {
      const placement = ad.placements[0]
      console.log(`   ${index + 1}. ${ad.title} (${ad.type}) - ${placement.position}`)
    })

    console.log('\n👋 Disconnected from MongoDB')

  } catch (error) {
    console.error('❌ Error seeding ads:', error)
  } finally {
    await mongoose.disconnect()
  }
}

seedAds()
