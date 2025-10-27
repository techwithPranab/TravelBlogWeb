#!/usr/bin/env node

/**
 * Database Seeding Script
 * Run this script to populate the database with sample data
 *
 * Usage: npm run seed
 */

const seedDatabase = require('./src/seedDatabase').default

async function main() {
  try {
    console.log('🌱 Starting database seeding...')
    await seedDatabase()
    console.log('✅ Database seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    process.exit(1)
  }
}

main()
