const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bagpackstories')

// User schema (simplified)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@bagpackstories.in' })
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating password...')
      // Hash the new password
      const hashedPassword = await bcrypt.hash('Admin@123456', 12)
      
      // Update the existing admin user
      existingAdmin.password = hashedPassword
      await existingAdmin.save()
      
      console.log('Admin password updated successfully!')
      console.log('Email: admin@bagpackstories.in')
      console.log('Password: Admin@123456')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123456', 12)

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@bagpackstories.in',
      password: hashedPassword,
      role: 'admin'
    })

    await admin.save()
    console.log('Admin user created successfully!')
    console.log('Email: admin@bagpackstories.in')
    console.log('Password: Admin@123456')
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    mongoose.connection.close()
  }
}

createAdmin()
