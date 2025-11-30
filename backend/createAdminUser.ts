import mongoose from 'mongoose'
import User from './src/models/User'
import bcrypt from 'bcryptjs'

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://pranabpiitk2024:Kolkata%401984@cluster0.vhghaza.mongodb.net/travel-blog?retryWrites=true&w=majority&appName=Cluster0')
    console.log('✅ Connected to MongoDB')

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@travelblog.com' })
    
    if (!existingAdmin) {
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      // Create admin user
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@travelblog.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      })

      await adminUser.save()
      console.log('✅ Admin user created successfully!')
      console.log('📧 Email: admin@travelblog.com')
      console.log('🔑 Password: admin123')
    } else {
      console.log('👤 Admin user already exists')
      console.log('📧 Email: admin@travelblog.com')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

createAdminUser()
