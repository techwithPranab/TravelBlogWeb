# TravelBlog Documentation

This documentation provides comprehensive context for the TravelBlog project, including architecture, flows, APIs, and implementation details. This documentation is used by AI assistants to understand the project structure and implement new features consistently.

## 📁 Documentation Structure

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture, data flow, and technical design
- **[BACKEND_FLOWS.md](BACKEND_FLOWS.md)** - Backend business logic, controllers, and data processing
- **[FRONTEND_FLOWS.md](FRONTEND_FLOWS.md)** - Frontend user flows, components, and state management
- **[API_INTEGRATION.md](API_INTEGRATION.md)** - API endpoints, request/response patterns, and integration points
- **[UI_PAGES.md](UI_PAGES.md)** - Page components, layouts, and user interface details
- **[THIRD_PARTY_INTEGRATIONS.md](THIRD_PARTY_INTEGRATIONS.md)** - External services, configurations, and integrations
- **[IMPLEMENTATION_PATTERNS.md](IMPLEMENTATION_PATTERNS.md)** - Code patterns, best practices, and development guidelines

## 🚀 Quick Reference

### Key Technologies
- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose
- **Authentication**: JWT with role-based access
- **File Storage**: Cloudinary, AWS S3
- **Payments**: Stripe
- **Maps**: Mapbox GL JS
- **Email**: SendGrid

### Core Features
- User authentication with roles (Admin, Contributor, Reader)
- Content management (Posts, Photos, Guides, Destinations)
- Admin moderation workflows
- Photo gallery with approval system
- Interactive travel maps
- Newsletter subscriptions
- E-commerce capabilities

### Development Commands
```bash
# Start development servers
npm run dev

# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev

# Seed database
cd backend && npm run seed
```

## 📋 Implementation Guidelines

When implementing new features:

1. **Check existing patterns** in the relevant documentation files
2. **Follow established conventions** for API endpoints, component structure, and data models
3. **Update documentation** after implementation to maintain accuracy
4. **Test thoroughly** across different user roles and scenarios
5. **Consider security** implications for new features

## 🔄 Update Process

After implementing new features:

1. Update the relevant documentation files
2. Add new API endpoints to `API_INTEGRATION.md`
3. Document new UI components in `UI_PAGES.md`
4. Update architecture diagrams if needed
5. Add implementation notes to `IMPLEMENTATION_PATTERNS.md`

This ensures the AI assistant has the most current context for future implementations.</content>
<parameter name="filePath">/Users/pranabpaul/Desktop/Blog/TravelBlogWeb/docs/README.md
