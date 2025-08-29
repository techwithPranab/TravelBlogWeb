#!/bin/bash

# Travel Blog Backend Development Setup Script

echo "🚀 Setting up Travel Blog Backend..."

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/travelblog

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (Optional - for production)
EMAIL_FROM=noreply@travelblog.com
SENDGRID_API_KEY=your-sendgrid-api-key

# Cloudinary Configuration (Optional - for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe Configuration (Optional - for payments)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Client URL (for CORS and redirects)
CLIENT_URL=http://localhost:3000
EOL
    echo "✅ Created .env file with default values"
    echo "📝 Please update the values in .env file as needed"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create dist directory if it doesn't exist
mkdir -p dist

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🎯 Starting development server..."
    npm run dev
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
