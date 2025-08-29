#!/bin/bash

# Travel Blog Website Installation Script
echo "🚀 Starting Travel Blog Website Installation..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Create environment files
echo "📝 Creating environment files..."

# Frontend environment
if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.example frontend/.env.local
    echo "✅ Created frontend/.env.local"
else
    echo "⚠️  frontend/.env.local already exists"
fi

# Backend environment
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists"
fi

# Create gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOL
# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/

# Production builds
frontend/.next/
frontend/dist/
backend/dist/

# Environment variables
.env
.env.local
.env.production
frontend/.env.local
backend/.env

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# NYC test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# IDE files
.vscode/settings.json
.idea/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Uploads
uploads/
public/uploads/
EOL
    echo "✅ Created .gitignore"
fi

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your environment variables:"
echo "   - Edit frontend/.env.local"
echo "   - Edit backend/.env"
echo ""
echo "2. Set up MongoDB:"
echo "   - Install MongoDB locally or use MongoDB Atlas"
echo "   - Update MONGODB_URI in backend/.env"
echo ""
echo "3. Get API keys for:"
echo "   - Mapbox (for maps)"
echo "   - Cloudinary (for image uploads)"
echo "   - Stripe (for payments)"
echo "   - SendGrid (for emails)"
echo ""
echo "4. Start the development servers:"
echo "   npm run dev"
echo ""
echo "5. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 Documentation: Check README.md for detailed setup instructions"
