# API Integration

## 🔗 Base Configuration

### API Client Setup
```typescript
// lib/api/client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

## 👤 Authentication APIs

### POST /api/auth/register
**Register new user**
```typescript
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'Reader' | 'Contributor';
}

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}
```

### POST /api/auth/login
**User login**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}
```

### GET /api/auth/me
**Get current user profile**
```typescript
interface UserResponse {
  success: boolean;
  data: User;
}
```

## 📝 Posts APIs

### GET /api/posts
**Get posts with pagination and filters**
```typescript
interface PostsQuery {
  page?: number;
  limit?: number;
  category?: string;
  destination?: string;
  author?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'popular';
}

interface PostsResponse {
  success: boolean;
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

### GET /api/posts/:id
**Get single post by ID**
```typescript
interface PostResponse {
  success: boolean;
  data: Post & {
    author: User;
    comments: Comment[];
    relatedPosts: Post[];
  };
}
```

### POST /api/posts
**Create new post (Contributor/Admin)**
```typescript
interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  categoryIds: string[];
  destinationIds: string[];
  tags?: string[];
  featuredImage?: string;
  status: 'draft' | 'published';
}

interface PostResponse {
  success: boolean;
  data: Post;
}
```

### PUT /api/posts/:id
**Update post (Author/Admin)**
```typescript
interface UpdatePostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  categoryIds?: string[];
  destinationIds?: string[];
  tags?: string[];
  featuredImage?: string;
  status?: 'draft' | 'published';
}
```

### DELETE /api/posts/:id
**Delete post (Author/Admin)**

## 🖼️ Photos APIs

### POST /api/photos/upload
**Upload photo**
```typescript
// Multipart form data
interface PhotoUploadRequest {
  file: File; // image file
  title?: string;
  description?: string;
  destinationId?: string;
  tags?: string[];
}

interface PhotoResponse {
  success: boolean;
  data: Photo;
}
```

### GET /api/photos
**Get photos with filters**
```typescript
interface PhotosQuery {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
  destination?: string;
  approved?: boolean;
}

interface PhotosResponse {
  success: boolean;
  data: Photo[];
  pagination: Pagination;
}
```

### PUT /api/photos/:id/approve
**Approve photo (Admin only)**
```typescript
interface ApprovePhotoRequest {
  approved: boolean;
  rejectionReason?: string;
}
```

## 💬 Comments APIs

### GET /api/comments/:postId
**Get comments for post**
```typescript
interface CommentsResponse {
  success: boolean;
  data: Comment[];
}
```

### POST /api/comments
**Create comment**
```typescript
interface CreateCommentRequest {
  postId: string;
  content: string;
  parentId?: string; // for replies
}

interface CommentResponse {
  success: boolean;
  data: Comment;
}
```

### PUT /api/comments/:id
**Update comment (Author only)**

### DELETE /api/comments/:id
**Delete comment (Author/Admin)**

## 🗺️ Destinations APIs

### GET /api/destinations
**Get all destinations**
```typescript
interface DestinationsResponse {
  success: boolean;
  data: Destination[];
}
```

### GET /api/destinations/map-data
**Get destinations for map display**
```typescript
interface MapDataResponse {
  success: boolean;
  data: {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
  };
}
```

### POST /api/destinations
**Create destination (Admin)**
```typescript
interface CreateDestinationRequest {
  name: string;
  description: string;
  coordinates: [number, number]; // [lng, lat]
  country: string;
  continent: string;
  image?: string;
}
```

## 📧 Newsletter APIs

### POST /api/newsletter/subscribe
**Subscribe to newsletter**
```typescript
interface SubscribeRequest {
  email: string;
  name?: string;
}

interface SubscribeResponse {
  success: boolean;
  message: string;
}
```

### POST /api/newsletter/unsubscribe
**Unsubscribe from newsletter**

## 📞 Contact APIs

### POST /api/contact
**Send contact message**
```typescript
interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactResponse {
  success: boolean;
  message: string;
}
```

## 👥 User Management APIs

### GET /api/users/profile
**Get user profile**

### PUT /api/users/profile
**Update user profile**
```typescript
interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  avatar?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
  };
}
```

## 🛡️ Admin APIs

### GET /api/admin/stats
**Get admin statistics**
```typescript
interface AdminStatsResponse {
  success: boolean;
  data: {
    users: {
      total: number;
      byRole: Record<string, number>;
    };
    posts: {
      total: number;
      published: number;
      drafts: number;
    };
    photos: {
      total: number;
      pending: number;
      approved: number;
    };
    comments: number;
  };
}
```

### GET /api/admin/users
**Get all users (Admin)**
```typescript
interface AdminUsersResponse {
  success: boolean;
  data: User[];
  pagination: Pagination;
}
```

### PUT /api/admin/users/:id/role
**Update user role (Admin)**
```typescript
interface UpdateRoleRequest {
  role: 'Reader' | 'Contributor' | 'Admin';
}
```

### GET /api/admin/pending-content
**Get pending content for moderation**
```typescript
interface PendingContentResponse {
  success: boolean;
  data: {
    photos: Photo[];
    posts: Post[];
  };
}
```

## 🔍 Search APIs

### GET /api/search
**Global search**
```typescript
interface SearchQuery {
  q: string; // search term
  type?: 'posts' | 'users' | 'destinations' | 'photos';
  limit?: number;
}

interface SearchResponse {
  success: boolean;
  data: {
    posts: Post[];
    users: User[];
    destinations: Destination[];
    photos: Photo[];
  };
}
```

## 📊 Analytics APIs

### GET /api/analytics/posts/:id
**Get post analytics**
```typescript
interface PostAnalyticsResponse {
  success: boolean;
  data: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}
```

## 💳 Payment APIs

### POST /api/payments/create-session
**Create Stripe checkout session**
```typescript
interface CreatePaymentRequest {
  amount: number;
  currency: 'usd';
  productId: string;
  successUrl: string;
  cancelUrl: string;
}

interface PaymentSessionResponse {
  success: boolean;
  data: {
    sessionId: string;
    url: string;
  };
}
```

## 🚨 Error Response Format

All APIs return errors in this format:
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  code?: string;
}
```

## 🔐 Authentication Headers

Include JWT token in requests:
```
Authorization: Bearer <jwt_token>
```

## 📏 Rate Limiting

- Auth endpoints: 5 requests per 15 minutes per IP
- General APIs: 100 requests per 15 minutes per IP
- File uploads: 10 uploads per hour per user

## 🔄 WebSocket Integration

Real-time features use Socket.IO:
```typescript
// Connection
const socket = io(process.env.NEXT_PUBLIC_WS_URL);

// Events
socket.on('new-comment', (comment) => { ... });
socket.on('photo-approved', (photo) => { ... });
socket.on('notification', (notification) => { ... });
```

This API documentation provides the complete interface for frontend-backend communication in the TravelBlog platform.</content>
<parameter name="filePath">/Users/pranabpaul/Desktop/Blog/TravelBlogWeb/docs/API_INTEGRATION.md
