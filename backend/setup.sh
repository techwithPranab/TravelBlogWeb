#!/bin/bash

# Quick setup script for Travel Blog Backend

echo "🚀 Setting up Travel Blog Backend (Simple Version)..."

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bagpackstories
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
EOL
    echo "✅ Created .env file"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Setup complete!"
echo "🎯 To start the development server:"
echo "   npm run dev"
echo ""
echo "📌 Make sure MongoDB is running on your system"
echo "📌 Frontend will be available at http://localhost:3000"
echo "📌 Backend API will be available at http://localhost:5000"
