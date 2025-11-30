import mongoose from 'mongoose'
import Comment from './src/models/Comment'

async function createTestComments() {
  try {
    // Connect to MongoDB using the correct connection string
    await mongoose.connect('mongodb+srv://pranabpiitk2024:Kolkata%401984@cluster0.vhghaza.mongodb.net/travel-blog?retryWrites=true&w=majority&appName=Cluster0')
    console.log('✅ Connected to MongoDB')

    // Check existing comments
    const existingCount = await Comment.countDocuments()
    console.log(`📊 Existing comments: ${existingCount}`)

    if (existingCount === 0) {
      // Create test comments
      const testComments = [
        {
          content: 'This is a great travel destination! I love the detailed information provided.',
          author: {
            name: 'John Doe',
            email: 'john@example.com'
          },
          resourceType: 'blog',
          resourceId: new mongoose.Types.ObjectId(),
          status: 'approved',
          likes: 5,
          dislikes: 0,
          flagCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          content: 'Amazing photos and detailed guide! Very helpful for planning my trip.',
          author: {
            name: 'Jane Smith',
            email: 'jane@example.com'
          },
          resourceType: 'destination',
          resourceId: new mongoose.Types.ObjectId(),
          status: 'pending',
          likes: 2,
          dislikes: 0,
          flagCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          content: 'Very helpful information for travelers. Thanks for sharing!',
          author: {
            name: 'Mike Johnson',
            email: 'mike@example.com'
          },
          resourceType: 'guide',
          resourceId: new mongoose.Types.ObjectId(),
          status: 'approved',
          likes: 8,
          dislikes: 1,
          flagCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          content: 'Inappropriate comment that should be flagged',
          author: {
            name: 'Bad User',
            email: 'bad@example.com'
          },
          resourceType: 'blog',
          resourceId: new mongoose.Types.ObjectId(),
          status: 'flagged',
          likes: 0,
          dislikes: 5,
          flagCount: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          content: 'This comment is waiting for approval from moderators.',
          author: {
            name: 'New User',
            email: 'newuser@example.com'
          },
          resourceType: 'photo',
          resourceId: new mongoose.Types.ObjectId(),
          status: 'pending',
          likes: 0,
          dislikes: 0,
          flagCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      await Comment.insertMany(testComments)
      console.log('✅ Test comments created successfully!')
      
      const newCount = await Comment.countDocuments()
      console.log(`📈 Total comments after creation: ${newCount}`)
    } else {
      console.log('📝 Comments already exist, skipping creation')
    }

    // Show some sample comments
    const sampleComments = await Comment.find().limit(3).select('content author.name status')
    console.log('📋 Sample comments:', sampleComments)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
  }
}

createTestComments()
