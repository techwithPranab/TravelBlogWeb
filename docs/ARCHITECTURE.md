# TravelBlog Architecture

## 🏗️ System Overview

TravelBlog is a full-stack web application built with modern technologies for travel content management and community engagement.

### Technology Stack

#### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Maps**: Mapbox GL JS, React Simple Maps
- **State Management**: React Context API

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer
- **Security**: Helmet, CORS

#### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Development**: Nodemon for hot reloading

## 📊 Data Architecture

### Database Schema

#### Core Entities
- **User**: Authentication, roles (Admin, Contributor, Reader), profile data
- **Post**: Blog posts with categories, destinations, photos
- **Category**: Content categorization
- **Destination**: Travel locations with coordinates
- **Photo**: Image gallery with approval workflow
- **Guide**: Travel guides and resources
- **Comment**: User interactions on posts
- **Review**: Content ratings and feedback
- **Newsletter**: Email subscriptions
- **Contact**: Contact form submissions
- **Partner**: Business partnerships
- **Resource**: Additional travel resources

#### Relationships
```
User (1) ──── (M) Post
User (1) ──── (M) Comment
User (1) ──── (M) Photo
User (1) ──── (M) Review

Post (1) ──── (M) Comment
Post (1) ──── (M) Photo
Post (M) ──── (M) Category
Post (M) ──── (M) Destination

Photo (M) ──── (M) Post
Photo (1) ──── (1) User (uploader)
```

## 🔄 Application Flow

### User Authentication Flow
1. User registration/login → JWT token generation
2. Token validation on protected routes
3. Role-based access control (Admin/Contributor/Reader)
4. Session management and logout

### Content Creation Flow
1. User creates content (post, photo, guide)
2. Content validation and sanitization
3. Admin approval workflow (for photos)
4. Content publication and indexing

### Photo Management Flow
1. User uploads photo → Cloudinary storage
2. Photo metadata extraction
3. Admin review and approval
4. Photo association with posts/destinations
5. Public gallery display

## 🗂️ Project Structure

```
TravelBlogWeb/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/         # Data models
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── utils/          # Helper functions
│   │   └── config/         # Database, AWS, Cloudinary
│   └── scripts/            # Database seeding, admin creation
├── frontend/
│   └── src/
│       ├── app/            # Next.js app router pages
│       ├── components/     # Reusable UI components
│       ├── context/        # React context providers
│       ├── lib/            # Utility libraries
│       ├── types/          # TypeScript type definitions
│       └── utils/          # Helper functions
└── docs/                   # Project documentation
```

## 🔒 Security Architecture

### Authentication & Authorization
- JWT tokens with expiration
- Password hashing with bcryptjs
- Role-based access control
- Admin-only endpoints protection

### Data Protection
- Input validation and sanitization
- SQL injection prevention (MongoDB)
- XSS protection
- CORS configuration
- Helmet security headers

### File Security
- File type validation
- Size limits on uploads
- Secure storage with Cloudinary/AWS S3
- Access control on media files

## 📡 API Architecture

### RESTful Design
- Resource-based URLs
- HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response format
- Consistent error handling

### Response Patterns
```typescript
// Success response
{
  success: true,
  data: T,
  message?: string
}

// Error response
{
  success: false,
  error: string,
  details?: any
}
```

### Pagination
```typescript
{
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

## 🚀 Deployment Architecture

### Development Environment
- Docker containers for services
- Hot reloading for development
- Local MongoDB instance
- Environment-specific configurations

### Production Considerations
- Environment variable management
- Database connection pooling
- CDN for static assets
- Monitoring and logging
- Backup strategies

## 🔄 Data Flow Patterns

### Read Operations
1. Client request → API route
2. Controller validation → Service layer
3. Database query → Data transformation
4. Response formatting → Client

### Write Operations
1. Client request → Input validation
2. Business logic processing
3. Database transaction
4. Cache invalidation (if applicable)
5. Response with updated data

### File Upload Flow
1. Multipart form data → Multer processing
2. File validation → Cloudinary upload
3. Metadata extraction → Database storage
4. URL generation → Response

This architecture provides a scalable, maintainable foundation for the TravelBlog platform with clear separation of concerns and robust security measures.</content>
<parameter name="filePath">/Users/pranabpaul/Desktop/Blog/TravelBlogWeb/docs/ARCHITECTURE.md
