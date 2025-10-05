# UI Pages & Components

## 📄 Page Structure

### App Router Structure
```
app/
├── page.tsx                    # Homepage
├── layout.tsx                  # Root layout
├── loading.tsx                 # Global loading
├── not-found.tsx               # 404 page
├── globals.css                 # Global styles
├── blog/
│   ├── page.tsx               # Blog listing
│   └── [slug]/
│       └── page.tsx           # Individual post
├── destinations/
│   ├── page.tsx               # Destinations listing
│   └── [id]/
│       └── page.tsx           # Destination detail
├── gallery/
│   └── page.tsx               # Photo gallery
├── auth/
│   ├── login/
│   │   └── page.tsx           # Login page
│   └── register/
│       └── page.tsx           # Registration page
├── profile/
│   └── page.tsx               # User profile
├── contribute/
│   └── post/
│       └── page.tsx           # Post creation
├── upload/
│   └── photo/
│       └── page.tsx           # Photo upload
├── admin/
│   ├── page.tsx               # Admin dashboard
│   ├── users/
│   │   └── page.tsx           # User management
│   ├── photos/
│   │   └── page.tsx           # Photo moderation
│   └── posts/
│       └── page.tsx           # Post management
├── contact/
│   └── page.tsx               # Contact page
└── services/
    └── page.tsx               # Services/products
```

## 🏠 Homepage Components

### HeroSection (`components/home/HeroSection.tsx`)
```typescript
interface HeroSectionProps {
  stats: {
    posts: number;
    destinations: number;
    photos: number;
    users: number;
  };
}

// Features:
// - Animated statistics counters
// - Call-to-action buttons
// - Background image/video
// - Responsive design
```

### FeaturedStories (`components/home/FeaturedStories.tsx`)
```typescript
interface FeaturedStoriesProps {
  stories: Post[];
}

// Features:
// - Carousel/slider layout
// - Story cards with images
// - Read more links
// - Loading states
```

### InteractiveTravelMap (`components/home/InteractiveTravelMap.tsx`)
```typescript
interface MapProps {
  destinations: Destination[];
  onDestinationClick: (destination: Destination) => void;
}

// Features:
// - Mapbox GL JS integration
// - Destination markers
// - Popup information
// - Zoom controls
// - Responsive sizing
```

### Categories (`components/home/Categories.tsx`)
```typescript
interface CategoriesProps {
  categories: Category[];
}

// Features:
// - Category grid layout
// - Category icons/images
// - Hover effects
// - Navigation links
```

### Testimonials (`components/home/Testimonials.tsx`)
```typescript
interface TestimonialsProps {
  testimonials: Testimonial[];
}

// Features:
// - Testimonial cards
// - User avatars
// - Star ratings
// - Carousel/slider
```

## 📖 Blog Components

### BlogLayout (`components/blog/BlogLayout.tsx`)
```typescript
interface BlogLayoutProps {
  children: React.ReactNode;
  categories: Category[];
  currentCategory?: string;
}

// Features:
// - Sidebar with categories
// - Search functionality
// - Breadcrumb navigation
// - Responsive layout
```

### PostCard (`components/blog/PostCard.tsx`)
```typescript
interface PostCardProps {
  post: Post;
  variant?: 'default' | 'featured' | 'compact';
}

// Features:
// - Post image/thumbnail
// - Title and excerpt
// - Author information
// - Reading time estimate
// - Category tags
```

### PostContent (`components/blog/PostContent.tsx`)
```typescript
interface PostContentProps {
  content: string;
  title: string;
  author: User;
  publishedAt: Date;
}

// Features:
// - Rich text rendering
// - Image galleries
// - Code syntax highlighting
// - Table of contents
// - Social sharing
```

### CommentSection (`components/blog/CommentSection.tsx`)
```typescript
interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onCommentSubmit: (content: string) => void;
}

// Features:
// - Comment list
// - Reply functionality
// - Like/dislike buttons
// - Comment form
// - Pagination
```

## 🖼️ Gallery Components

### PhotoGrid (`components/gallery/PhotoGrid.tsx`)
```typescript
interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  layout?: 'grid' | 'masonry';
}

// Features:
// - Responsive grid layout
// - Lazy loading
// - Infinite scroll
// - Filter options
```

### PhotoLightbox (`components/gallery/PhotoLightbox.tsx`)
```typescript
interface PhotoLightboxProps {
  photo: Photo;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Features:
// - Full-screen image display
// - Navigation controls
// - Photo metadata
// - Download functionality
// - Social sharing
```

### PhotoUpload (`components/gallery/PhotoUpload.tsx`)
```typescript
interface PhotoUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

// Features:
// - Drag and drop interface
// - File validation
// - Upload progress
// - Preview thumbnails
// - Error handling
```

## 🗺️ Destination Components

### DestinationCard (`components/destinations/DestinationCard.tsx`)
```typescript
interface DestinationCardProps {
  destination: Destination;
  postCount: number;
  photoCount: number;
}

// Features:
// - Destination image
// - Statistics display
// - Map marker integration
// - Hover effects
```

### DestinationMap (`components/destinations/DestinationMap.tsx`)
```typescript
interface DestinationMapProps {
  destination: Destination;
  nearbyDestinations: Destination[];
}

// Features:
// - Interactive map
// - Location markers
// - Route display
// - Info popups
```

## 👤 User Components

### AuthForm (`components/auth/AuthForm.tsx`)
```typescript
interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: AuthData) => void;
}

// Features:
// - Form validation
// - Password visibility toggle
// - Remember me option
// - Social login buttons
// - Error display
```

### UserProfile (`components/user/UserProfile.tsx`)
```typescript
interface UserProfileProps {
  user: User;
  isEditable?: boolean;
  onUpdate: (data: UpdateProfileData) => void;
}

// Features:
// - Profile picture upload
// - Bio editing
// - Social links
// - Statistics display
// - Settings toggle
```

### UserAvatar (`components/user/UserAvatar.tsx`)
```typescript
interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
}

// Features:
// - Avatar image display
// - Fallback initials
// - Online status indicator
// - Click to profile navigation
```

## ✍️ Content Creation Components

### RichTextEditor (`components/editor/RichTextEditor.tsx`)
```typescript
interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Features:
// - WYSIWYG editing
// - Image insertion
// - Link creation
// - Formatting toolbar
// - Auto-save functionality
```

### PostForm (`components/forms/PostForm.tsx`)
```typescript
interface PostFormProps {
  post?: Post; // for editing
  onSubmit: (data: PostFormData) => void;
  categories: Category[];
  destinations: Destination[];
}

// Features:
// - Title input
// - Content editor
// - Category selection
// - Destination tags
// - Featured image upload
// - Draft saving
```

## 🔧 Admin Components

### AdminDashboard (`components/admin/AdminDashboard.tsx`)
```typescript
interface DashboardProps {
  stats: AdminStats;
  recentActivity: Activity[];
}

// Features:
// - Statistics cards
// - Charts and graphs
// - Recent activity feed
// - Quick actions
```

### DataTable (`components/admin/DataTable.tsx`)
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  onRowClick?: (item: T) => void;
  pagination?: PaginationConfig;
}

// Features:
// - Sortable columns
// - Search functionality
// - Bulk actions
// - Export options
// - Responsive design
```

### ModerationQueue (`components/admin/ModerationQueue.tsx`)
```typescript
interface ModerationQueueProps {
  items: ModerationItem[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

// Features:
// - Item preview
// - Approval/rejection actions
// - Bulk operations
// - Filter by type/status
```

## 🎨 UI Components

### Button (`components/ui/Button.tsx`)
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

// Features:
// - Multiple variants
// - Loading states
// - Icon support
// - Accessibility
```

### Modal (`components/ui/Modal.tsx`)
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Features:
// - Overlay background
// - Close on escape
// - Focus management
// - Responsive sizing
```

### Input (`components/ui/Input.tsx`)
```typescript
interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

// Features:
// - Validation states
// - Error messages
// - Icon support
// - Accessibility
```

### LoadingSpinner (`components/ui/LoadingSpinner.tsx`)
```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

// Features:
// - Multiple sizes
// - Custom colors
// - Smooth animations
```

## 📱 Layout Components

### Header (`components/layout/Header.tsx`)
```typescript
interface HeaderProps {
  user?: User;
  onLogin: () => void;
  onLogout: () => void;
}

// Features:
// - Navigation menu
// - User dropdown
// - Search bar
// - Mobile responsive
```

### Footer (`components/layout/Footer.tsx`)
```typescript
interface FooterProps {
  newsletterSignup?: boolean;
}

// Features:
// - Site links
// - Social media links
// - Newsletter signup
// - Copyright information
```

### Sidebar (`components/layout/Sidebar.tsx`)
```typescript
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Features:
// - Slide-in animation
// - Overlay background
// - Touch gestures
// - Accessibility
```

## 🔍 Search Components

### SearchBar (`components/search/SearchBar.tsx`)
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
}

// Features:
// - Autocomplete
// - Search history
// - Keyboard shortcuts
// - Loading states
```

### SearchResults (`components/search/SearchResults.tsx`)
```typescript
interface SearchResultsProps {
  query: string;
  results: SearchResults;
  loading: boolean;
}

// Features:
// - Categorized results
// - Highlighted matches
// - Load more functionality
// - No results state
```

## 📊 Data Display Components

### Chart (`components/charts/Chart.tsx`)
```typescript
interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: ChartData;
  options?: ChartOptions;
}

// Features:
// - Multiple chart types
// - Responsive design
// - Animation options
// - Export functionality
```

### StatCard (`components/stats/StatCard.tsx`)
```typescript
interface StatCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon?: React.ComponentType;
}

// Features:
// - Value display
// - Change indicators
// - Icons
// - Hover effects
```

## 🎯 Interactive Components

### Carousel (`components/interactive/Carousel.tsx`)
```typescript
interface CarouselProps {
  items: React.ReactNode[];
  autoPlay?: boolean;
  showDots?: boolean;
  showArrows?: boolean;
}

// Features:
// - Touch/swipe support
// - Auto-play option
// - Navigation dots
// - Keyboard navigation
```

### Tabs (`components/interactive/Tabs.tsx`)
```typescript
interface TabsProps {
  tabs: TabConfig[];
  defaultActive?: string;
  onChange?: (activeTab: string) => void;
}

// Features:
// - Tab navigation
// - Content switching
// - URL state sync
// - Accessibility
```

### Accordion (`components/interactive/Accordion.tsx`)
```typescript
interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpanded?: string[];
}

// Features:
// - Expandable sections
// - Multiple expansion
// - Smooth animations
- Icon indicators
```

This comprehensive UI documentation covers all components and pages in the TravelBlog frontend application.</content>
<parameter name="filePath">/Users/pranabpaul/Desktop/Blog/TravelBlogWeb/docs/UI_PAGES.md
