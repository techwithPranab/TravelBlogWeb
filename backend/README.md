# Travel Blog Backend

A comprehensive backend API for a travel blog application built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Content Management**: Full CRUD operations for posts, guides, destinations, and resources
- **User Management**: User profiles with different roles (admin, contributor, reader)
- **Comments System**: Nested comments with moderation capabilities
- **File Upload**: Image upload and management
- **Search & Filtering**: Advanced search and filtering capabilities
- **Rate Limiting**: API rate limiting for security
- **Data Validation**: Comprehensive input validation and sanitization

## Models

- **User**: User accounts with profiles and roles
- **Post**: Blog posts with rich content
- **Category**: Content categories for organization
- **Destination**: Travel destinations with detailed information
- **Guide**: Travel guides and itineraries
- **Resource**: Travel resources and tools
- **Comment**: User comments with moderation

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Request password reset
- `PUT /api/v1/auth/reset-password/:token` - Reset password

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users` - Get all users (admin only)

### Posts
- `GET /api/v1/posts` - Get all posts
- `GET /api/v1/posts/:slug` - Get single post
- `POST /api/v1/posts` - Create post (authenticated)
- `PUT /api/v1/posts/:id` - Update post (author/admin)
- `DELETE /api/v1/posts/:id` - Delete post (author/admin)

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:slug` - Get single category
- `POST /api/v1/categories` - Create category (admin)
- `PUT /api/v1/categories/:id` - Update category (admin)
- `DELETE /api/v1/categories/:id` - Delete category (admin)

### Destinations
- `GET /api/v1/destinations` - Get all destinations
- `GET /api/v1/destinations/featured` - Get featured destinations
- `GET /api/v1/destinations/popular` - Get popular destinations
- `GET /api/v1/destinations/:slug` - Get single destination
- `POST /api/v1/destinations` - Create destination (admin)
- `PUT /api/v1/destinations/:id` - Update destination (admin)
- `DELETE /api/v1/destinations/:id` - Delete destination (admin)

### Guides
- `GET /api/v1/guides` - Get all guides
- `GET /api/v1/guides/featured` - Get featured guides
- `GET /api/v1/guides/destination/:destinationId` - Get guides by destination
- `GET /api/v1/guides/type/:type` - Get guides by type
- `GET /api/v1/guides/:slug` - Get single guide
- `POST /api/v1/guides` - Create guide (contributor/admin)
- `PUT /api/v1/guides/:id` - Update guide (author/admin)
- `DELETE /api/v1/guides/:id` - Delete guide (admin)

### Resources
- `GET /api/v1/resources` - Get all resources
- `GET /api/v1/resources/featured` - Get featured resources
- `GET /api/v1/resources/category/:category` - Get resources by category
- `GET /api/v1/resources/:slug` - Get single resource
- `POST /api/v1/resources/:id/click` - Track resource click
- `POST /api/v1/resources` - Create resource (contributor/admin)
- `PUT /api/v1/resources/:id` - Update resource (author/admin)
- `DELETE /api/v1/resources/:id` - Delete resource (admin)

### Comments
- `GET /api/v1/comments/post/:postId` - Get comments for post
- `POST /api/v1/comments` - Create comment (authenticated)
- `PUT /api/v1/comments/:id` - Update comment (author)
- `DELETE /api/v1/comments/:id` - Delete comment (author/admin)
- `POST /api/v1/comments/:id/like` - Like/unlike comment
- `PATCH /api/v1/comments/:id/approve` - Approve comment (admin)

## Setup Instructions

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/travelblog
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=30d
   FRONTEND_URL=http://localhost:3000
   
   # Email Configuration (Optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   
   # Cloudinary Configuration (Optional)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

5. **Seed the Database**
   ```bash
   npm run seed
   ```
   This will populate the database with sample data including users, categories, destinations, posts, guides, and resources.

6. **Start the Development Server**
   ```bash
   npm run dev
   ```

7. **Test the API**
   The server will be running at `http://localhost:5000`
   - Health check: `http://localhost:5000/health`
   - API base URL: `http://localhost:5000/api/v1`

## Sample Users (After Seeding)

- **Admin**: admin@travelblog.com / admin123
- **Contributor**: sarah@travelblog.com / sarah123
- **Contributor**: mike@travelblog.com / mike123
- **Reader**: emma@example.com / emma123

## Build and Deploy

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting
- **Morgan** - HTTP request logging

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── seedDatabase.ts  # Database seeding script
│   └── server.ts        # Main server file
├── dist/                # Compiled JavaScript (after build)
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```
