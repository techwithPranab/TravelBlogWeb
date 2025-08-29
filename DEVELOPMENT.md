# Travel Blog Website - Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (running locally or MongoDB Atlas)
- Git

### 1. Setup Backend (API Server)

```bash
cd backend
npm install

# Create environment file
cp .env.example .env  # Or run ./setup.sh

# Start development server (with auto-compilation)
npm run dev
```

### 2. Setup Frontend (Next.js)

```bash
cd frontend
npm install

# Start development server
npm run dev
```

## 🔧 Environment Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/travelblog
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

## 📁 Project Structure

```
TravelBlogWeb/
├── frontend/          # Next.js 14 frontend
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/ # Reusable components
│   │   ├── lib/       # Utilities and configurations
│   │   └── types/     # TypeScript types
│   └── package.json
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── models/     # MongoDB models
│   │   ├── routes/     # API routes
│   │   ├── middleware/ # Custom middleware
│   │   ├── config/     # Configuration files
│   │   └── server.ts   # Main server file
│   └── package.json
└── README.md
```

## 🌟 Features Implemented

### ✅ Completed Features
- **Project Structure**: Complete folder organization
- **Backend Setup**: Express server with TypeScript
- **Database Models**: User and Post schemas
- **Authentication**: JWT-based auth system
- **API Routes**: Basic CRUD operations
- **Frontend Components**: Header, Footer, Hero section
- **Responsive Design**: TailwindCSS styling

### 🚧 In Progress
- TypeScript compilation fixes
- API controller implementations
- Frontend page components
- Database connection testing

### 📋 Todo Features
- File upload (Cloudinary integration)
- Payment processing (Stripe)
- Email notifications
- Search functionality
- Admin dashboard
- Interactive maps
- Comments system
- Social media integration

## 🐛 Current Status

The project has a comprehensive structure but requires some TypeScript fixes before compilation. The main components are:

1. **Backend**: Express server with authentication, user management, and blog post APIs
2. **Frontend**: Next.js app with modern UI components using TailwindCSS and Framer Motion
3. **Database**: MongoDB with Mongoose for data modeling

## 🔄 Development Workflow

1. **Start MongoDB**: Ensure MongoDB is running
2. **Backend**: `cd backend && npm run dev`
3. **Frontend**: `cd frontend && npm run dev`
4. **Access**: 
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api/v1

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update profile

### Posts
- `GET /api/v1/posts` - Get all posts
- `GET /api/v1/posts/:id` - Get single post
- `POST /api/v1/posts` - Create post (auth required)
- `PUT /api/v1/posts/:id` - Update post (auth required)
- `DELETE /api/v1/posts/:id` - Delete post (auth required)

### Users
- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/:id` - Get user profile
- `PUT /api/v1/users/:id/follow` - Follow/unfollow user

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running locally or check connection string
2. **Port Conflicts**: Change PORT in .env if 5000 is occupied
3. **TypeScript Errors**: Run `npm run build` to see compilation errors
4. **Missing Dependencies**: Run `npm install` in both frontend and backend

### Development Tips

- Use `npm run dev` for auto-recompilation
- Check browser console for frontend errors
- Monitor backend logs for API issues
- Use MongoDB Compass for database inspection

## 📖 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose
- **Authentication**: JWT, NextAuth.js
- **Styling**: TailwindCSS, Headless UI
- **Development**: ESLint, Prettier, Nodemon

---

**Next Steps**: 
1. Fix TypeScript compilation errors
2. Test API endpoints with Postman/Thunder Client
3. Complete frontend page implementations
4. Add advanced features (file upload, payments, etc.)
