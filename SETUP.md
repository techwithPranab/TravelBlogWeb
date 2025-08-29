# Travel Blog Website - Setup Guide

## 🚀 Quick Start

The fastest way to get started is to run the automated setup script:

```bash
chmod +x install.sh
./install.sh
```

This will install all dependencies and create the necessary environment files.

## 📋 Manual Setup

If you prefer to set up manually, follow these steps:

### Prerequisites

- Node.js 18 or higher
- MongoDB (local installation or MongoDB Atlas)
- Git

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd travel-blog-web

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Environment Configuration

#### Frontend Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

#### Backend Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/travel-blog

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Travel Blog

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Mapbox
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=admin123456
```

### 3. Database Setup

#### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. The application will automatically connect to `mongodb://localhost:27017/travel-blog`

#### Option B: MongoDB Atlas (Recommended)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `backend/.env`

### 4. Third-Party Services Setup

#### Mapbox (for Interactive Maps)

1. Sign up at [Mapbox](https://www.mapbox.com/)
2. Get your access token
3. Add it to both frontend and backend `.env` files

#### Cloudinary (for Image Storage)

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Add them to backend `.env` file

#### Stripe (for Payments)

1. Sign up at [Stripe](https://stripe.com/)
2. Get your publishable and secret keys
3. Add them to frontend and backend `.env` files

#### SendGrid (for Emails)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Get your API key
3. Add it to backend `.env` file

## 🏃‍♂️ Running the Application

### Development Mode

```bash
# Start both frontend and backend
npm run dev

# Or start them separately
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:5000
```

### Using Docker (Alternative)

```bash
# Start all services including MongoDB
docker-compose up

# Or start in detached mode
docker-compose up -d
```

### Production Build

```bash
# Build frontend for production
cd frontend && npm run build

# Build backend for production
cd backend && npm run build

# Start production servers
npm run start
```

## 📂 Project Structure

```
travel-blog-web/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── lib/            # Utility functions
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   └── package.json
├── docker-compose.yml       # Docker configuration
├── install.sh              # Automated setup script
└── README.md
```

## 🔧 Development Commands

### Frontend Commands

```bash
cd frontend

npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Backend Commands

```bash
cd backend

npm run dev          # Start development server (with nodemon)
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
```

## 🌟 Features Overview

### ✅ Implemented Features

- **Modern Tech Stack**: Next.js 14, TypeScript, TailwindCSS, Node.js, Express, MongoDB
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Authentication System**: JWT-based with role management
- **Blog Management**: Rich content editor with categories and tags
- **Image Handling**: Cloudinary integration for optimized media
- **Payment Integration**: Stripe for digital products and memberships
- **Email System**: SendGrid for newsletters and notifications
- **SEO Optimization**: Meta tags, sitemaps, structured data
- **Dark Mode**: Theme switching with system preference detection
- **Performance**: SSR/SSG, image optimization, caching

### 🚧 Coming Soon

- Interactive Mapbox integration
- Advanced search with filters
- Comment system
- Photo gallery with lightbox
- Admin dashboard
- Analytics integration
- Social sharing
- PWA capabilities

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3000 or 5000
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5000 | xargs kill -9
   ```

2. **MongoDB connection failed**
   - Ensure MongoDB is running locally
   - Check your connection string in `.env`
   - Verify network access for MongoDB Atlas

3. **Environment variables not loading**
   - Ensure `.env` files are in the correct locations
   - Restart the development servers
   - Check for typos in variable names

4. **TypeScript errors**
   - Run `npm install` to ensure all dependencies are installed
   - The errors shown are expected during initial setup

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review the documentation
- Contact support at hello@travelblog.com

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Happy Coding! 🎉**

Need help? Check out our [documentation](README.md) or reach out to the community.
