import { connectDB } from './config/database'
import User from './models/User'
import dotenv from 'dotenv'

dotenv.config()

const createAdminUser = async () => {
  try {
    await connectDB()
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' })
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email)
      process.exit(0)
    }
    
    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@bagpackstories.in',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true
    })
    
    await adminUser.save()
    
    console.log('✅ Admin user created successfully!')
    console.log('Email: admin@bagpackstories.in')
    console.log('Password: admin123')
    console.log('Role: admin')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

createAdminUser()
