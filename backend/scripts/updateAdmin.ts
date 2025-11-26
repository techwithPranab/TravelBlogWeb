import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from '../src/models/User'

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('Database connection failed:', error)
    process.exit(1)
  }
}

async function updateAdminPassword() {
  try {
    await connectDB()
    
    // Find the admin user
    const admin = await User.findOne({ email: 'admin@bagpackstories.in' })
    
    if (!admin) {
      console.log('Admin user not found. Creating new admin user...')
      
      // Create new admin user
      const newAdmin = new User({
        name: 'Admin User',
        email: 'admin@bagpackstories.in',
        password: 'Admin@123456', // This will be hashed by the pre-save middleware
        role: 'admin',
        bio: 'Travel blog administrator and content curator.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isEmailVerified: true
      })
      
      await newAdmin.save()
      console.log('New admin user created successfully!')
    } else {
      console.log('Admin user found. Updating password...')
      
      // Update password - this will trigger the pre-save hook to hash it
      admin.password = 'Admin@123456'
      await admin.save()
      
      console.log('Admin password updated successfully!')
    }
    
    console.log('Email: admin@bagpackstories.in')
    console.log('Password: Admin@123456')
    
    // Test password comparison
    const testAdmin = await User.findOne({ email: 'admin@bagpackstories.in' }).select('+password')
    if (testAdmin) {
      const isMatch = await testAdmin.comparePassword('Admin@123456')
      console.log('Password verification test:', isMatch ? 'PASSED' : 'FAILED')
    }
    
  } catch (error) {
    console.error('Error updating admin user:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Database connection closed')
  }
}

updateAdminPassword()
