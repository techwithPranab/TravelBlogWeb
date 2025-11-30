const mongoose = require('mongoose');

// Define Post schema inline to avoid import issues
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  destination: {
    country: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: { type: String, default: 'draft' }
}, { strict: false }); // Allow additional fields

const Post = mongoose.model('Post', PostSchema);

// MongoDB connection
const mongoURI = 'mongodb+srv://pranabpiitk2024:Kolkata%401984@cluster0.vhghaza.mongodb.net/travel-blog?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('✅ MongoDB Connected');
    
    // Add destination data to existing posts
    const posts = await Post.find({ status: 'published' });
    console.log(`Found ${posts.length} published posts`);

    const destinationUpdates = [
      {
        title: 'Varanasi',
        destination: { 
          country: 'India', 
          city: 'Varanasi',
          coordinates: { lat: 25.3176, lng: 82.9739 }
        }
      },
      {
        title: 'Ayodhya', 
        destination: { 
          country: 'India', 
          city: 'Ayodhya',
          coordinates: { lat: 26.7922, lng: 82.1998 }
        }
      },
      {
        title: 'Prayagraj',
        destination: { 
          country: 'India', 
          city: 'Prayagraj',
          coordinates: { lat: 25.4358, lng: 81.8463 }
        }
      }
    ];

    for (const update of destinationUpdates) {
      const post = posts.find(p => p.title.includes(update.title));
      if (post) {
        post.destination = update.destination;
        await post.save();
        console.log(`✅ Updated ${post.title} with destination: ${update.destination.country}, ${update.destination.city}`);
      }
    }

    console.log('✅ All posts updated with destination data');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
