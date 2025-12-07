#!/usr/bin/env node

/**
 * Load Mammoth Lakes Guide Script
 * Run this script to load the Mammoth Lakes guide into the database
 *
 * Usage: node load-mammoth-guide.js
 */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Import Guide model
const Guide = require('./src/models/Guide').default

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('Database connection failed:', error)
    process.exit(1)
  }
}

const loadGuide = async () => {
  try {
    // Read the guide JSON file
    const guidePath = path.join(__dirname, 'Data', 'mammoth-lakes-2day-itinerary-guide.json')
    const guideData = JSON.parse(fs.readFileSync(guidePath, 'utf8'))[0]

    // Check if guide already exists
    const existingGuide = await Guide.findOne({ id: guideData.id })
    if (existingGuide) {
      console.log('Guide already exists, updating...')
      await Guide.findOneAndUpdate({ id: guideData.id }, guideData, { upsert: true })
      console.log('Guide updated successfully!')
    } else {
      console.log('Creating new guide...')
      await Guide.create(guideData)
      console.log('Guide created successfully!')
    }

  } catch (error) {
    console.error('Error loading guide:', error)
    process.exit(1)
  }
}

const main = async () => {
  await connectDB()
  await loadGuide()
  console.log('✅ Guide loading completed!')
  process.exit(0)
}

main()
