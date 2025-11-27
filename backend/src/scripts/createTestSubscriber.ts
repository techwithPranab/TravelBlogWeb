import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import Newsletter from '../models/Newsletter';

// Load environment variables
dotenv.config();

async function createTestSubscriber() {
  try {
    console.log('📬 Creating test newsletter subscriber...');

    // Connect to database
    await connectDB();
    console.log('✅ Database connected');

    // Check if test subscriber already exists
    const testEmail = process.env.ADMIN_EMAIL || 'test@example.com';
    const existingSubscriber = await Newsletter.findOne({ email: testEmail });

    if (existingSubscriber) {
      console.log(`⚠️ Test subscriber already exists: ${testEmail}`);
      console.log('Is active:', existingSubscriber.isActive);
      console.log('Is verified:', existingSubscriber.isVerified);
      
      // Update to ensure it's active
      existingSubscriber.isActive = true;
      existingSubscriber.isVerified = true;
      await existingSubscriber.save();
      
      console.log('✅ Updated existing subscriber to active status');
      return;
    }

    // Create new test subscriber
    const newSubscriber = new Newsletter({
      email: testEmail,
      name: 'Test Admin User',
      isActive: true,
      isVerified: true,
      subscribedAt: new Date(),
      preferences: {
        destinations: true,
        travelTips: true,
        photography: true,
        weeklyDigest: true
      },
      source: 'manual'
    });

    await newSubscriber.save();
    console.log(`✅ Created test newsletter subscriber: ${testEmail}`);
    console.log('Subscriber details:', {
      email: newSubscriber.email,
      name: newSubscriber.name,
      isActive: newSubscriber.isActive,
      isVerified: newSubscriber.isVerified
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test subscriber:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createTestSubscriber();
}

export { createTestSubscriber };
