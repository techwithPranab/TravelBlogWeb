# Implementation Patterns

## 🏗️ Code Organization

### File Structure Conventions
```
components/
├── ui/           # Reusable UI components (Button, Input, Modal)
├── forms/        # Form components
├── layout/       # Layout components (Header, Footer, Sidebar)
├── [feature]/    # Feature-specific components
└── [feature]/
    ├── index.ts  # Barrel exports
    ├── Component.tsx
    └── Component.test.tsx

lib/
├── api/         # API client and utilities
├── utils/       # Helper functions
├── hooks/       # Custom React hooks
├── constants/   # Application constants
└── types/       # TypeScript type definitions
```

### Naming Conventions
```typescript
// Components: PascalCase
export const UserProfile = () => { ... };
export const PhotoGallery = () => { ... };

// Files: kebab-case for components, camelCase for utilities
// components/user-profile.tsx
// lib/apiClient.ts
// utils/formatDate.ts

// Functions: camelCase
const fetchUserData = async () => { ... };
const handleSubmit = () => { ... };

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:5000';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Types: PascalCase with descriptive names
interface UserProfileData { ... }
type UserRole = 'Admin' | 'Contributor' | 'Reader';
```

## 🔄 State Management Patterns

### Context API Usage
```typescript
// context/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth logic here

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### API State Management
```typescript
// hooks/useApi.ts
const useApi = <T>(apiCall: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return { data, loading, error, execute };
};
```

## 🌐 API Integration Patterns

### API Client Pattern
```typescript
// lib/api/client.ts
class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );
  }

  private handleError(error: AxiosError) {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }

  // API methods
  async getPosts(params?: PostQuery) {
    const response = await this.axiosInstance.get('/posts', { params });
    return response.data;
  }

  async createPost(data: CreatePostData) {
    const response = await this.axiosInstance.post('/posts', data);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

### React Query Integration
```typescript
// Recommended for future implementation
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query hook
export const usePosts = (params?: PostQuery) => {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => apiClient.getPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation hook
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => apiClient.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
```

## 🎨 Component Patterns

### Compound Component Pattern
```typescript
// components/ui/Tabs.tsx
interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface TabListProps {
  children: React.ReactNode;
}

interface TabProps {
  value: string;
  children: React.ReactNode;
}

interface TabContentProps {
  value: string;
  children: React.ReactNode;
}

// Usage
<Tabs defaultValue="tab1">
  <TabsList>
    <Tab value="tab1">Tab 1</Tab>
    <Tab value="tab2">Tab 2</Tab>
  </TabsList>
  <TabContent value="tab1">Content 1</TabContent>
  <TabContent value="tab2">Content 2</TabContent>
</Tabs>
```

### Render Props Pattern
```typescript
// components/DataFetcher.tsx
interface DataFetcherProps<T> {
  url: string;
  children: (data: { data: T | null; loading: boolean; error: string | null; refetch: () => void }) => React.ReactNode;
}

const DataFetcher = <T,>({ url, children }: DataFetcherProps<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    // Fetch logic
  };

  useEffect(() => { fetchData(); }, [url]);

  return <>{children({ data, loading, error, refetch: fetchData })}</>;
};

// Usage
<DataFetcher url="/api/posts">
  {({ data, loading, error, refetch }) => (
    // Render logic
  )}
</DataFetcher>
```

### Custom Hook Pattern
```typescript
// hooks/useLocalStorage.ts
const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
};
```

## 📝 Form Handling Patterns

### React Hook Form Integration
```typescript
// components/forms/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // Submit logic
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
};
```

### Form Validation Pattern
```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  role: z.enum(['Reader', 'Contributor', 'Admin']),
});

export const postSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(50),
  categoryIds: z.array(z.string()).min(1),
  status: z.enum(['draft', 'published']),
});
```

## 🔄 Data Fetching Patterns

### SWR Pattern (Recommended)
```typescript
// hooks/usePosts.ts
import useSWR from 'swr';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export const usePosts = (params?: PostQuery) => {
  const queryString = new URLSearchParams(params as any).toString();
  const url = `/posts${queryString ? `?${queryString}` : ''}`;

  const { data, error, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  return {
    posts: data?.data || [],
    pagination: data?.pagination,
    loading: !error && !data,
    error,
    mutate,
  };
};
```

### Optimistic Updates
```typescript
// Optimistic UI updates
const likePost = async (postId: string) => {
  // Optimistically update UI
  setPosts(prevPosts =>
    prevPosts.map(post =>
      post._id === postId
        ? { ...post, likes: post.likes + 1, likedByUser: true }
        : post
    )
  );

  try {
    await apiClient.likePost(postId);
  } catch (error) {
    // Revert on error
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId
          ? { ...post, likes: post.likes - 1, likedByUser: false }
          : post
      )
    );
  }
};
```

## 🚨 Error Handling Patterns

### Error Boundary
```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error!} />;
    }

    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// lib/api/errorHandler.ts
export const handleApiError = (error: AxiosError) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return 'Invalid request data';
      case 401:
        return 'Authentication required';
      case 403:
        return 'Access denied';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Server error';
      default:
        return data?.error || 'An error occurred';
    }
  } else if (error.request) {
    // Network error
    return 'Network error - please check your connection';
  } else {
    // Other error
    return 'An unexpected error occurred';
  }
};
```

## 🎯 Performance Patterns

### Code Splitting
```typescript
// Dynamic imports for routes
const BlogPage = lazy(() => import('../pages/BlogPage'));
const AdminPage = lazy(() => import('../pages/AdminPage'));

// Usage in router
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/blog" element={<BlogPage />} />
    <Route path="/admin" element={<AdminPage />} />
  </Routes>
</Suspense>
```

### Image Optimization
```typescript
// components/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

const OptimizedImage = ({ src, alt, width, height, priority }: OptimizedImageProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
};
```

### Memoization
```typescript
// Memoize expensive calculations
const useExpensiveCalculation = (data: ComplexData) => {
  return useMemo(() => {
    // Expensive calculation
    return processData(data);
  }, [data.id, data.version]); // Only recalculate when these change
};

// Memoize components
const PostCard = memo(({ post, onClick }: PostCardProps) => {
  return (
    <div onClick={() => onClick(post)}>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
    </div>
  );
});
```

## 🧪 Testing Patterns

### Component Testing
```typescript
// components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### API Testing
```typescript
// __tests__/api/posts.test.ts
import { apiClient } from '../../lib/api/client';

describe('Posts API', () => {
  it('fetches posts successfully', async () => {
    const mockPosts = [{ id: 1, title: 'Test Post' }];
    // Mock axios response
    jest.spyOn(apiClient.axiosInstance, 'get').mockResolvedValue({
      data: { success: true, data: mockPosts }
    });

    const result = await apiClient.getPosts();
    expect(result.data).toEqual(mockPosts);
  });
});
```

### Custom Hook Testing
```typescript
// hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('returns initial auth state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });
});
```

## 📱 Responsive Design Patterns

### Mobile-First CSS
```typescript
// styles/components/Button.module.css
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

@media (min-width: 640px) {
  .button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .button {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }
}
```

### Container Query Pattern
```typescript
// components/ContainerQuery.tsx
const ContainerQuery = ({ children, breakpoints }) => {
  const containerRef = useRef();
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const currentBreakpoint = Object.keys(breakpoints).find(
    bp => containerWidth >= breakpoints[bp]
  ) || 'default';

  return (
    <div ref={containerRef}>
      {children(currentBreakpoint)}
    </div>
  );
};
```

These implementation patterns ensure consistent, maintainable, and scalable code across the TravelBlog project.</content>
<parameter name="filePath">/Users/pranabpaul/Desktop/Blog/TravelBlogWeb/docs/IMPLEMENTATION_PATTERNS.md
