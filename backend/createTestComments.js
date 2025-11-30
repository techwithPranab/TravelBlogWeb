// Simple script to create test comments
const Comment = require('./models/Comment');
const mongoose = require('mongoose');

async function createTestComments() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://pranabpaul43:PranabPaul2003@cluster0.vhghaza.mongodb.net/travel-blog?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');

    // Create test comments
    const testComments = [
      {
        content: 'This is a great travel destination!',
        author: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        resourceType: 'blog',
        resourceId: new mongoose.Types.ObjectId(),
        status: 'approved',
        likes: 5,
        dislikes: 0,
        flagCount: 0
      },
      {
        content: 'Amazing photos and detailed guide!',
        author: {
          name: 'Jane Smith',
          email: 'jane@example.com'
        },
        resourceType: 'destination',
        resourceId: new mongoose.Types.ObjectId(),
        status: 'pending',
        likes: 2,
        dislikes: 0,
        flagCount: 0
      },
      {
        content: 'Very helpful information for travelers.',
        author: {
          name: 'Mike Johnson',
          email: 'mike@example.com'
        },
        resourceType: 'guide',
        resourceId: new mongoose.Types.ObjectId(),
        status: 'approved',
        likes: 8,
        dislikes: 1,
        flagCount: 0
      }
    ];

    await Comment.insertMany(testComments);
    console.log('Test comments created successfully!');
    
    const count = await Comment.countDocuments();
    console.log(`Total comments in database: ${count}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestComments();
