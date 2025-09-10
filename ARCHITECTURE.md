# Travel Blog Application Architecture

## Overview
The Travel Blog is a full-stack web application built with modern technologies, featuring a React/Next.js frontend, Express.js backend, and MongoDB database. The application provides travel content management with advanced filtering capabilities across multiple content types.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Context API
- **Animation**: Framer Motion
- **UI Components**: Custom components with Lucide React icons
- **Maps**: Mapbox GL, React Simple Maps
- **Image Handling**: Cloudinary integration
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **File Storage**: Cloudinary, AWS S3, Google Drive
- **Email**: Nodemailer
- **Payment**: Stripe integration
- **Security**: Helmet, CORS, Rate Limiting, Mongo Sanitize

### DevOps & Tools
- **Containerization**: Docker
- **Process Management**: PM2 (implied)
- **Linting**: ESLint
- **Testing**: Jest
- **Build Tools**: TypeScript Compiler
- **API Documentation**: (Not specified in code)

## Architecture Diagram

```mermaid
graph TB
    %% User Layer
    subgraph "User Interface"
        U[Users] --> FE[Next.js Frontend]
    end

    %% Frontend Layer
    subgraph "Frontend Layer"
        FE --> |HTTP/HTTPS| LB[Load Balancer/Reverse Proxy]
        FE --> |WebSocket| RT[Real-time Updates]
    end

    %% API Gateway Layer
    subgraph "API Gateway"
        LB --> API[Express.js API Server]
    end

    %% Backend Services Layer
    subgraph "Backend Services"
        API --> AUTH[Authentication Service]
        API --> CMS[Content Management Service]
        API --> MEDIA[Media Management Service]
        API --> PAY[Payment Service]
        API --> NOTIF[Notification Service]
    end

    %% Data Layer
    subgraph "Data Layer"
        AUTH --> DB[(MongoDB)]
        CMS --> DB
        MEDIA --> DB
        PAY --> DB
        NOTIF --> DB
    end

    %% External Services
    subgraph "External Services"
        MEDIA --> CDN[Cloudinary CDN]
        MEDIA --> S3[AWS S3]
        MEDIA --> GDRIVE[Google Drive]
        PAY --> STRIPE[Stripe]
        NOTIF --> EMAIL[Email Service]
        FE --> MAPS[Mapbox API]
    end

    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef data fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#e65100,stroke-width:2px

    class FE,RT frontend
    class API,AUTH,CMS,MEDIA,PAY,NOTIF backend
    class DB data
    class CDN,S3,GDRIVE,STRIPE,EMAIL,MAPS external
```

## Component Architecture

```mermaid
graph TD
    subgraph "Page Components"
        BP[Blog Page] --> CF[CountryFilter]
        DP[Destinations Page] --> CF
        GP[Guides Page] --> CF
        GLP[Gallery Page] --> CF
    end

    subgraph "Common Components"
        CF --> |props| CFS[Country Filter State]
        CF --> |events| CFE[Country Filter Events]
    end

    subgraph "Layout Components"
        LC[ConditionalLayout] --> HP[Header]
        LC --> FT[Footer]
        LC --> NV[Navigation]
    end

    subgraph "UI Components"
        UI[UI Library] --> BTN[Buttons]
        UI --> INP[Inputs]
        UI --> MOD[Modals]
        UI --> CRD[Cards]
    end

    subgraph "Context Providers"
        CP[Providers] --> AUTHC[Auth Context]
        CP --> THEME[Theme Context]
        CP --> NOTIFC[Notification Context]
    end

    %% Styling
    classDef pages fill:#bbdefb,stroke:#1976d2,stroke-width:2px
    classDef common fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    classDef layout fill:#ffcdd2,stroke:#d32f2f,stroke-width:2px
    classDef ui fill:#f8bbd9,stroke:#c2185b,stroke-width:2px
    classDef context fill:#d1c4e9,stroke:#7b1fa2,stroke-width:2px

    class BP,DP,GP,GLP pages
    class CF,CFS,CFE common
    class LC,HP,FT,NV layout
    class UI,BTN,INP,MOD,CRD ui
    class CP,AUTHC,THEME,NOTIFC context
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as API Server
    participant DB as MongoDB
    participant EXT as External Services

    U->>FE: Interact with UI (filter, search)
    FE->>FE: Update local state
    FE->>API: HTTP Request with filters
    API->>API: Validate & process request
    API->>DB: Query with filters
    DB-->>API: Return filtered data
    API-->>FE: JSON Response
    FE-->>U: Render filtered content

    Note over FE,DB: Real-time filtering without page reload
```

## Database Schema

```mermaid
erDiagram
    User ||--o{ Post : authors
    User ||--o{ Comment : writes
    User ||--o{ Photo : uploads
    User ||--o{ Guide : creates
    User ||--o{ Destination : manages

    Post ||--o{ Comment : has
    Post ||--o{ Category : belongs_to
    Post ||--o{ Destination : references

    Guide ||--o{ Destination : covers
    Guide ||--o{ Category : categorized

    Photo ||--o{ Destination : tagged
    Photo ||--o{ Category : belongs_to

    Destination ||--o{ Photo : contains
    Destination ||--o{ Guide : featured_in

    Category ||--o{ Post : groups
    Category ||--o{ Guide : groups
    Category ||--o{ Photo : groups

    Newsletter ||--o{ User : subscribers
    Contact ||--o{ User : from
    Partner ||--o{ User : manages

    SiteSettings ||--o{ User : configured_by
```

## API Architecture

```mermaid
graph LR
    subgraph "API Routes"
        subgraph "Public Routes"
            PR1[/health] --> HC[Health Check]
            PR2[/api/auth/login] --> AL[Auth Login]
            PR3[/api/auth/register] --> AR[Auth Register]
        end

        subgraph "Protected Routes"
            subgraph "Content Routes"
                CR1[/api/posts] --> PL[Posts CRUD]
                CR2[/api/destinations] --> DL[Destinations CRUD]
                CR3[/api/guides] --> GL[Guides CRUD]
                CR4[/api/photos] --> PH[Photos CRUD]
            end

            subgraph "User Routes"
                UR1[/api/users] --> UL[User Management]
                UR2[/api/comments] --> CL[Comments CRUD]
                UR3[/api/categories] --> CAL[Categories CRUD]
            end

            subgraph "Admin Routes"
                AR1[/api/admin] --> ADM[Admin Panel]
                AR2[/api/newsletter] --> NL[Newsletter Management]
                AR3[/api/partners] --> PT[Partner Management]
            end
        end
    end

    subgraph "Middleware Stack"
        MW1[CORS] --> MW2[Rate Limiting]
        MW2 --> MW3[Helmet Security]
        MW3 --> MW4[Mongo Sanitize]
        MW4 --> MW5[Auth Middleware]
        MW5 --> RT[Route Handlers]
    end

    %% Styling
    classDef public fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef protected fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef middleware fill:#e3f2fd,stroke:#1976d2,stroke-width:2px

    class PR1,PR2,PR3 public
    class CR1,CR2,CR3,CR4,UR1,UR2,UR3,AR1,AR2,AR3 protected
    class MW1,MW2,MW3,MW4,MW5 middleware
```

## Filter System Architecture

```mermaid
graph TD
    subgraph "Filter Components"
        CF[CountryFilter] --> |props| SP[selectedCountry, countries, onChange]
        CF --> |state| IS[isOpen]
        CF --> |render| DD[Dropdown Menu]
    end

    subgraph "Page Integration"
        BP[Blog Page] --> |uses| CF
        DP[Destinations Page] --> |uses| CF
        GP[Guides Page] --> |uses| CF
        GLP[Gallery Page] --> |uses| CF
    end

    subgraph "Data Processing"
        DP2[Data Processing] --> |extract| CE[Country Extractor]
        CE --> |filter| FD[Filtered Data]
        FD --> |render| UI[UI Components]
    end

    subgraph "State Management"
        SM[State Management] --> |local| LS[Local State]
        SM --> |global| GS[Global State]
        LS --> |sync| UI
        GS --> |sync| UI
    end

    %% Connections
    BP --> DP2
    DP --> DP2
    GP --> DP2
    GLP --> DP2

    DP2 --> SM
    SM --> UI

    %% Styling
    classDef components fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef pages fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef data fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef state fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class CF,SP,IS,DD components
    class BP,DP,GP,GLP pages
    class DP2,CE,FD,UI data
    class SM,LS,GS state
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Load Balancer"
            LB[NGINX/HAProxy]
        end

        subgraph "Application Servers"
            AS1[App Server 1]
            AS2[App Server 2]
            AS3[App Server 3]
        end

        subgraph "Database Cluster"
            MDB[Primary MongoDB]
            SDB1[(Secondary 1)]
            SDB2[(Secondary 2)]
        end

        subgraph "Cache Layer"
            REDIS[(Redis Cache)]
        end

        subgraph "File Storage"
            CDN[Cloudinary CDN]
            S3[AWS S3 Bucket]
        end
    end

    subgraph "Monitoring & Logging"
        MON[Monitoring Stack]
        LOG[Logging System]
    end

    %% Connections
    LB --> AS1
    LB --> AS2
    LB --> AS3

    AS1 --> MDB
    AS2 --> MDB
    AS3 --> MDB

    MDB --> SDB1
    MDB --> SDB2

    AS1 --> REDIS
    AS2 --> REDIS
    AS3 --> REDIS

    AS1 --> CDN
    AS2 --> CDN
    AS3 --> CDN

    AS1 --> S3
    AS2 --> S3
    AS3 --> S3

    AS1 --> MON
    AS2 --> MON
    AS3 --> MON

    AS1 --> LOG
    AS2 --> LOG
    AS3 --> LOG

    %% Styling
    classDef infra fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef app fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef data fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef cache fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef storage fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef monitoring fill:#f1f8e9,stroke:#689f38,stroke-width:2px

    class LB infra
    class AS1,AS2,AS3 app
    class MDB,SDB1,SDB2 data
    class REDIS cache
    class CDN,S3 storage
    class MON,LOG monitoring
```

## Key Features

### Content Management
- **Blog Posts**: Rich text content with categories and destinations
- **Destinations**: Location-based content with maps and photos
- **Travel Guides**: Comprehensive guides with itineraries
- **Photo Gallery**: Image collections with metadata
- **Categories**: Content organization and filtering

### Advanced Filtering
- **Country-wise Filtering**: Available across all content types
- **Category Filtering**: Blog posts, guides, and photos
- **Search Functionality**: Full-text search capabilities
- **Real-time Updates**: Instant filter application

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Progressive Web App**: Fast loading and offline capabilities
- **SEO Optimized**: Server-side rendering with Next.js
- **Accessibility**: WCAG compliant components

### Security & Performance
- **Rate Limiting**: Protection against abuse
- **Data Sanitization**: XSS and injection prevention
- **Image Optimization**: Automatic resizing and compression
- **Caching Strategy**: Redis for session and data caching

## Development Workflow

```mermaid
graph LR
    subgraph "Development"
        DEV[Local Development] --> |Docker| DC[Docker Compose]
        DC --> |Hot Reload| FE[Frontend Dev Server]
        DC --> |API Server| BE[Backend Dev Server]
        DC --> |Database| DB[(MongoDB Local)]
    end

    subgraph "Testing"
        TST[Unit Tests] --> |Jest| FE
        TST --> |Jest| BE
        INT[Integration Tests] --> API[API Endpoints]
        E2E[End-to-End Tests] --> UI[UI Components]
    end

    subgraph "Deployment"
        CI[CI/CD Pipeline] --> |Build| IMG[Docker Images]
        IMG --> |Deploy| STG[Staging Environment]
        STG --> |Test| PROD[Production Environment]
    end

    %% Styling
    classDef dev fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef test fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef deploy fill:#fff3e0,stroke:#f57c00,stroke-width:2px

    class DEV,DC,FE,BE,DB dev
    class TST,INT,E2E test
    class CI,IMG,STG,PROD deploy
```

## File Structure

```
TravelBlogWeb/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Cloudinary config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── utils/           # Helper functions
│   │   └── server.ts        # Main server file
│   ├── Dockerfile.dev
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── context/         # React context
│   │   ├── lib/             # API clients, utilities
│   │   ├── styles/          # Global styles
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Helper functions
│   ├── Dockerfile.dev
│   └── package.json
├── docker-compose.yml
├── documentation/           # Setup guides
└── README.md
```

This architecture provides a scalable, maintainable, and feature-rich travel blog platform with modern development practices and robust filtering capabilities.</content>
<parameter name="filePath">/Users/pranabpaul/Desktop/Blog/TravelBlogWeb/ARCHITECTURE.md
