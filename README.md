# Travel Blog Website

A modern, full-stack travel blog website built with Next.js, Node.js, Express, and MongoDB.

## 🌟 Features

### 🌐 Website Features
- **Homepage**: Hero section with search, featured stories, latest posts
- **Blog System**: Dynamic posts with SEO-friendly URLs, categories, tags
- **Interactive Map**: Mapbox integration with destination pins
- **Travel Guides**: Multi-day itineraries with embedded maps and videos
- **Resources Page**: Books, guides, tools with affiliate links
- **Photo & Video Gallery**: Masonry layout with lightbox
- **Search & Filters**: Full-text search with advanced filtering

### 👤 User & Admin Features
- **Authentication**: JWT-based with role management (Admin, Reader, Contributor)
- **Admin Dashboard**: Content management, media upload, analytics
- **Newsletter**: Mailchimp/SendGrid integration

### 💳 Monetization Features
- **E-commerce**: Digital products with Stripe integration
- **Affiliate Tracking**: Click/conversion analytics
- **Premium Memberships**: Paid exclusive content access
- **Support Options**: Patreon/Buy Me a Coffee integration

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Payment**: Stripe
- **Maps**: Mapbox GL JS
- **Media**: Cloudinary
- **Email**: SendGrid

## 📁 Project Structure

```
travel-blog-web/
├── frontend/           # Next.js frontend application
├── backend/           # Node.js Express API
├── shared/           # Shared types and utilities
└── docker-compose.yml # Docker setup for development
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd travel-blog-web
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# Copy environment files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

4. Start the development servers:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

## 📋 Environment Setup

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/travel-blog
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=your_cloudinary_url
STRIPE_SECRET_KEY=your_stripe_secret
SENDGRID_API_KEY=your_sendgrid_key
```

## 🔧 Development

### Frontend Commands
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend Commands
```bash
cd backend
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript
npm run start        # Start production server
npm run test         # Run tests
```

## 📊 Database Schema

### Collections
- **users**: User profiles, roles, authentication
- **posts**: Blog posts with content, SEO, media
- **categories**: Post categories and tags
- **resources**: Guides, books, affiliate links
- **transactions**: Purchases, memberships, clicks
- **newsletters**: Email subscriptions

## 🎨 UI Components

Built with modern design principles:
- Responsive design (mobile-first)
- Dark/light mode support
- Smooth animations with Framer Motion
- Accessible components
- SEO optimized

## 📈 Performance

- **SSR + SSG**: Next.js optimization
- **MongoDB Indexing**: Fast search capabilities
- **CDN**: Cloudinary for media delivery
- **Caching**: Redis for session management
- **Image Optimization**: Next.js Image component

## 🔒 Security

- JWT authentication
- Input validation
- Rate limiting
- CORS configuration
- Environment variable protection

## 📱 Mobile Responsive

Fully responsive design tested on:
- Desktop (1920px+)
- Laptop (1024px-1919px)
- Tablet (768px-1023px)
- Mobile (320px-767px)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the flexible database
- TailwindCSS for the utility-first CSS
- Framer Motion for smooth animations

---

Built with ❤️ by TechWithPranab
