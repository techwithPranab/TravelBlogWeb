import mongoose from 'mongoose'

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI

    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined')
    }

    const conn = await mongoose.connect(mongoURI, {
      // Remove deprecated options
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected')
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close()
        console.log('🔒 MongoDB connection closed through app termination')
        process.exit(0)
      } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error)
        process.exit(1)
      }
    })

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    process.exit(1)
  }
}
