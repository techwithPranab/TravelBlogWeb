# BagPackStories Chat Mode Configuration

## 🤖 AI Assistant Context Configuration

This file configures the contextual information available to AI assistants working on the BagPackStories project. The AI assistant should use the documentation in the `docs/` folder to understand the project structure, implement new features consistently, and maintain code quality standards.

## 📁 Documentation References

### Core Project Documentation
- **[docs/README.md](docs/README.md)** - Main documentation overview and update guidelines
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture, data flow, and technical design
- **[docs/BACKEND_FLOWS.md](docs/BACKEND_FLOWS.md)** - Backend business logic, controllers, and data processing flows
- **[docs/FRONTEND_FLOWS.md](docs/FRONTEND_FLOWS.md)** - Frontend user flows, components, and state management
- **[docs/API_INTEGRATION.md](docs/API_INTEGRATION.md)** - Complete API reference with endpoints, request/response patterns
- **[docs/UI_PAGES.md](docs/UI_PAGES.md)** - All UI components, pages, and their implementations
- **[docs/THIRD_PARTY_INTEGRATIONS.md](docs/THIRD_PARTY_INTEGRATIONS.md)** - External services, configurations, and integration patterns
- **[docs/IMPLEMENTATION_PATTERNS.md](docs/IMPLEMENTATION_PATTERNS.md)** - Code patterns, best practices, and development guidelines

## 🎯 Implementation Guidelines

### Before Implementing New Features
1. **Review Architecture** - Check `ARCHITECTURE.md` for system design patterns
2. **Understand Flows** - Review `BACKEND_FLOWS.md` and `FRONTEND_FLOWS.md` for existing patterns
3. **Check API Patterns** - Reference `API_INTEGRATION.md` for consistent API design
4. **Follow UI Patterns** - Use `UI_PAGES.md` for component structure and naming
5. **Apply Code Standards** - Follow patterns in `IMPLEMENTATION_PATTERNS.md`

### When Adding New Features
1. **API First** - Design API endpoints following the patterns in `API_INTEGRATION.md`
2. **Component Structure** - Create components using patterns from `UI_PAGES.md`
3. **State Management** - Use context patterns from `FRONTEND_FLOWS.md`
4. **Backend Logic** - Implement following `BACKEND_FLOWS.md` patterns
5. **Update Documentation** - Add new features to relevant documentation files

### Code Quality Standards
- **TypeScript** - Strict typing, interfaces in `types/` folder
- **Component Naming** - PascalCase for components, kebab-case for files
- **API Responses** - Consistent format: `{ success: boolean, data: T, error?: string }`
- **Error Handling** - Use error boundaries and proper error responses
- **Testing** - Unit tests for components, integration tests for APIs

## 🔧 Current Project State

### Implemented Features
### ✅ Implemented Features
- **User Authentication**: JWT-based auth with role management (Admin, Contributor, Reader)
- **Content Management**: Posts, Photos, Categories, Destinations with CRUD operations
- **Photo Gallery**: Upload system with admin approval workflow
- **Interactive Maps**: Mapbox integration for travel destinations
- **Newsletter System**: Email subscriptions with SendGrid
- **Contact Forms**: Contact form handling with email notifications
- **Admin Dashboard**: User management, content moderation, analytics
- **Reader Dashboard**: Personal dashboard with stats, activity, and recommendations
- **Contributor Workflow**: Complete post submission, management, and approval system
  - Contributors can create, view, edit, and delete their posts
  - Posts submitted for admin approval with status tracking
  - Role-aware dashboard showing different content for contributors vs readers
  - Image upload and management for contributor posts
- **Responsive Design**: Mobile-first approach with TailwindCSS

### Mock Data Sources (To Be Replaced)
- Homepage testimonials (hardcoded in `components/home/Testimonials.tsx`)
- Hero section statistics (API call needed)
- Featured stories (mock data in `components/home/FeaturedStories.tsx`)
- Categories display (mock data in `components/home/Categories.tsx`)
- Interactive map destinations (API integration needed)

### Integration Points Needed
- Replace all mock data with actual API calls
- Implement photo approval workflow
- Add real-time notifications
- Enhance search functionality
- Add payment processing for premium features

## 🚀 Development Workflow

### Adding New Components
1. Check `UI_PAGES.md` for similar component patterns
2. Follow naming conventions from `IMPLEMENTATION_PATTERNS.md`
3. Add to appropriate feature folder
4. Include TypeScript interfaces
5. Add unit tests

### Adding New API Endpoints
1. Review `API_INTEGRATION.md` for URL patterns and response formats
2. Add to appropriate controller in `backend/src/controllers/`
3. Update routes in `backend/src/routes/`
4. Add validation middleware
5. Update API documentation

### Database Changes
1. Update Mongoose models in `backend/src/models/`
2. Create migration scripts if needed
3. Update seed data in `backend/src/seedDatabase.ts`
4. Test with existing data

## 📋 Quality Assurance

### Pre-Implementation Checklist
- [ ] Reviewed relevant documentation files
- [ ] Checked existing similar implementations
- [ ] Planned API endpoints (if needed)
- [ ] Considered error handling
- [ ] Planned testing approach

### Post-Implementation Checklist
- [ ] Updated relevant documentation files
- [ ] Added unit tests
- [ ] Tested across different user roles
- [ ] Verified responsive design
- [ ] Checked accessibility
- [ ] Updated this chat mode file if needed

## 🔄 Documentation Maintenance

After implementing new features:
1. Update the relevant `.md` files in `docs/` folder
2. Add new API endpoints to `API_INTEGRATION.md`
3. Document new components in `UI_PAGES.md`
4. Update flows in `BACKEND_FLOWS.md` or `FRONTEND_FLOWS.md`
5. Add implementation notes to `IMPLEMENTATION_PATTERNS.md`

This ensures the AI assistant has the most current context for future implementations and maintains consistency across the codebase.

## 🏷️ Quick Reference Tags

Use these tags in conversations to reference specific documentation:

- `#architecture` - System design and data flow
- `#backend` - Server-side logic and APIs
- `#frontend` - Client-side components and flows
- `#api` - API endpoints and integration
- `#ui` - Components and pages
- `#integrations` - Third-party services
- `#patterns` - Code standards and patterns
- `#mock-data` - Current mock data sources to replace
- `#testing` - Testing patterns and guidelines

## 📞 Support

When implementing features, reference the documentation first. If patterns are unclear, check existing implementations in the codebase before asking for clarification.</content>
<parameter name="filePath">/Users/pranabpaul/Desktop/Blog/TravelBlogWeb/customchat.chatmode.md
