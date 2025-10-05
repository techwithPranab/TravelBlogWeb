# Backend Flows

## 🔄 Authentication Flow

### User Registration
```typescript
// POST /api/auth/register
1. Validate input (email, password, name, role)
2. Check if user exists
3. Hash password with bcryptjs
4. Create user document
5. Generate JWT token
6. Return user data + token
```

### User Login
```typescript
// POST /api/auth/login
1. Validate input (email, password)
2. Find user by email
3. Compare password with bcrypt
4. Generate JWT token
5. Return user data + token
```

### Token Validation
```typescript
// Middleware: auth.ts
1. Extract token from Authorization header
2. Verify JWT signature
3. Check token expiration
4. Attach user to request object
5. Proceed to next middleware
```

## 📝 Content Management Flows

### Post Creation Flow
```typescript
// POST /api/posts
1. Authenticate user (Contributor/Admin only)
2. Validate post data (title, content, category, destination)
3. Process photo uploads if provided
4. Create post document
5. Associate with categories and destinations
6. Return created post
```

### Photo Upload & Approval Flow
```typescript
// POST /api/photos/upload
1. Authenticate user
2. Validate file type and size
3. Upload to Cloudinary
4. Create photo document (status: 'pending')
5. Notify admins for approval

// PUT /api/photos/:id/approve (Admin only)
1. Update photo status to 'approved'
2. Make photo publicly accessible
3. Associate with posts if specified
```

### Comment System Flow
```typescript
// POST /api/comments
1. Authenticate user
2. Validate comment data
3. Check post exists and is published
4. Create comment document
5. Update post comment count
6. Return comment data
```

## 👥 User Management Flows

### Profile Update Flow
```typescript
// PUT /api/users/profile
1. Authenticate user
2. Validate update data
3. Handle avatar upload if provided
4. Update user document
5. Return updated user data
```

### Admin User Management
```typescript
// GET /api/admin/users (Admin only)
1. Fetch all users with pagination
2. Include user stats (posts, comments)
3. Return user list

// PUT /api/admin/users/:id/role (Admin only)
1. Validate new role
2. Update user role
3. Log admin action
```

## 🖼️ Media Management Flows

### Cloudinary Integration
```typescript
// File upload process
1. Receive multipart form data
2. Validate file constraints
3. Generate unique filename
4. Upload to Cloudinary with transformations
5. Store Cloudinary URL in database
6. Return public URL
```

### AWS S3 Backup Flow
```typescript
// Automatic backup process
1. Monitor Cloudinary storage usage
2. Download high-usage files
3. Upload to S3 bucket
4. Update database with S3 URLs
5. Clean up local temp files
```

## 📧 Communication Flows

### Newsletter Subscription
```typescript
// POST /api/newsletter/subscribe
1. Validate email format
2. Check if already subscribed
3. Create/update subscription document
4. Send confirmation email via SendGrid
5. Return success message
```

### Contact Form Flow
```typescript
// POST /api/contact
1. Validate form data
2. Create contact document
3. Send email to admin via SendGrid
4. Send confirmation to user
5. Return success response
```

## 💳 Payment Integration Flow

### Stripe Payment Processing
```typescript
// POST /api/payments/create-session
1. Authenticate user
2. Validate payment data
3. Create Stripe checkout session
4. Store session ID in database
5. Return checkout URL

// Webhook: payment.success
1. Verify Stripe signature
2. Update payment status
3. Grant access/premium features
4. Send confirmation email
```

## 🗺️ Location & Mapping Flows

### Destination Management
```typescript
// POST /api/destinations
1. Authenticate admin
2. Validate destination data (name, coordinates, description)
3. Create destination document
4. Associate with posts/guides
5. Return destination data
```

### Interactive Map Data
```typescript
// GET /api/destinations/map-data
1. Fetch all published destinations
2. Include post counts per destination
3. Return GeoJSON format for Mapbox
4. Cache response for performance
```

## 📊 Analytics & Reporting Flows

### Admin Dashboard Data
```typescript
// GET /api/admin/stats
1. Aggregate user counts by role
2. Count posts by status/category
3. Calculate engagement metrics
4. Return dashboard statistics
```

### Content Moderation Flow
```typescript
// GET /api/admin/pending-content
1. Fetch pending photos/posts
2. Include metadata and user info
3. Return moderation queue

// PUT /api/admin/content/:id/moderate
1. Update content status
2. Send notification to content creator
3. Log moderation action
```

## 🔄 Database Seeding Flow

### Development Data Population
```typescript
// npm run seed
1. Connect to database
2. Clear existing data (optional)
3. Create sample users with different roles
4. Generate categories and destinations
5. Create sample posts with photos
6. Add comments and reviews
7. Verify data integrity
```

## 🚨 Error Handling Flow

### Global Error Handler
```typescript
// middleware/errorHandler.ts
1. Catch thrown errors
2. Log error details
3. Format error response
4. Send appropriate HTTP status
5. Include error ID for debugging
```

### Validation Error Flow
```typescript
// middleware/validate.ts
1. Run Joi validation on request
2. Collect validation errors
3. Format error messages
4. Return 400 Bad Request with details
```

## 🔐 Security Flows

### Rate Limiting
```typescript
// Applied to auth endpoints
1. Track requests per IP/time window
2. Block excessive requests
3. Return 429 Too Many Requests
4. Log suspicious activity
```

### Admin Action Logging
```typescript
// All admin operations
1. Log action type and user
2. Record before/after state
3. Store in audit log collection
4. Monitor for security incidents
```

These flows ensure consistent, secure, and maintainable backend operations across all features of the TravelBlog platform.</content>
<parameter name="filePath">/Users/pranabpaul/Desktop/Blog/TravelBlogWeb/docs/BACKEND_FLOWS.md
