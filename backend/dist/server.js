"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const hpp_1 = __importDefault(require("hpp"));
const path_1 = __importDefault(require("path"));
// Load environment variables FIRST
dotenv_1.default.config();
// Importing the database connection and middleware
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = __importDefault(require("./middleware/notFound"));
// Route imports
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const posts_1 = __importDefault(require("./routes/posts"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const destinationRoutes_1 = __importDefault(require("./routes/destinationRoutes"));
const guideRoutes_1 = __importDefault(require("./routes/guideRoutes"));
const resourceRoutes_1 = __importDefault(require("./routes/resourceRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const photoRoutes_1 = __importDefault(require("./routes/photoRoutes"));
const newsletterRoutes_1 = __importDefault(require("./routes/newsletterRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const readerRoutes_1 = __importDefault(require("./routes/readerRoutes"));
const contributorRoutes_1 = __importDefault(require("./routes/contributorRoutes"));
const partnerRoutes_1 = __importDefault(require("./routes/partnerRoutes"));
// Connect to database
(0, database_1.connectDB)();
// Create Express app
const app = (0, express_1.default)();
// Trust proxy
app.set('trust proxy', 1);
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: process.env.NODE_ENV === 'development' ? 60 * 60 * 1000 : 15 * 60 * 1000, // 1 hour for dev, 15 min for prod
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 1000 requests for dev, 100 for prod
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health checks, static files, and common development routes
    skip: (req) => {
        return req.path === '/health' ||
            req.path.startsWith('/uploads/') ||
            req.path.startsWith('/api/auth/login') ||
            req.path.startsWith('/api/auth/register');
    }
});
// Apply rate limiting to all requests
app.use(limiter);
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
            scriptSrc: ["'self'", 'https:'],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https:'],
            fontSrc: ["'self'", 'https:'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", 'https:'],
            frameSrc: ["'self'", 'https:'],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Data sanitization
app.use((0, express_mongo_sanitize_1.default)());
app.use((0, hpp_1.default)());
// Serve static files from uploads directory (for local storage fallback)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});
// Public stats endpoint for home page metrics
app.get('/api/public/stats', async (req, res) => {
    try {
        const [totalUsers, totalPosts, totalDestinations, totalGuides, totalSubscribers] = await Promise.all([
            require('./models/User').default.countDocuments(),
            require('./models/Post').default.countDocuments({ status: 'published' }),
            require('./models/Destination').default.countDocuments({ isActive: true }),
            require('./models/Guide').default.countDocuments({ isPublished: true }),
            require('./models/Newsletter').default.countDocuments()
        ]);
        res.json({
            success: true,
            data: {
                totalUsers,
                totalPosts,
                totalDestinations,
                totalGuides,
                totalSubscribers
            }
        });
    }
    catch (error) {
        console.error('Public stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch public stats'
        });
    }
});
// Public testimonials endpoint for home page
app.get('/api/public/testimonials', async (req, res) => {
    try {
        // For now, return curated testimonials
        // In a real application, this could fetch from a testimonials collection
        const testimonials = [
            {
                id: '1',
                name: 'Sarah Johnson',
                role: 'Adventure Traveler',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                rating: 5,
                text: 'TravelBlog has been my go-to resource for planning amazing adventures. The detailed guides and real traveler experiences are invaluable.',
                featured: true
            },
            {
                id: '2',
                name: 'Mike Chen',
                role: 'Photography Enthusiast',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                rating: 5,
                text: 'The photography tips and destination guides have helped me capture stunning travel photos. Highly recommend for any travel photographer.',
                featured: true
            },
            {
                id: '3',
                name: 'Emma Rodriguez',
                role: 'Solo Female Traveler',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                rating: 5,
                text: 'As a solo female traveler, I appreciate the safety tips and community support. TravelBlog makes solo travel feel safe and exciting.',
                featured: true
            }
        ];
        res.status(200).json({
            success: true,
            data: testimonials
        });
    }
    catch (error) {
        console.error('Public testimonials error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch testimonials'
        });
    }
});
// Public contact/site information endpoint
app.get('/api/public/contact', async (req, res) => {
    try {
        // Fetch contact information from site settings
        const SiteSettings = (await Promise.resolve().then(() => __importStar(require('./models/SiteSettings')))).default;
        let settings = await SiteSettings.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = new SiteSettings({
                siteName: 'Travel Blog',
                siteDescription: 'Discover amazing travel destinations and guides',
                siteUrl: 'https://yourdomain.com',
                contactEmail: 'hello@travelblog.com',
                supportEmail: 'support@travelblog.com',
                contactPhone: '+1 (555) 123-4567',
                contactAddress: {
                    street: '123 Travel Street',
                    city: 'San Francisco',
                    state: 'CA',
                    zipCode: '94105',
                    country: 'United States'
                },
                businessHours: {
                    monday: '9:00 AM - 6:00 PM',
                    tuesday: '9:00 AM - 6:00 PM',
                    wednesday: '9:00 AM - 6:00 PM',
                    thursday: '9:00 AM - 6:00 PM',
                    friday: '9:00 AM - 6:00 PM',
                    saturday: '10:00 AM - 4:00 PM',
                    sunday: 'Closed'
                },
                supportSettings: {
                    email: 'support@travelblog.com',
                    responseTime: 'Within 24 hours'
                },
                socialLinks: {
                    facebook: 'https://facebook.com/travelblog',
                    twitter: 'https://twitter.com/travelblog',
                    instagram: 'https://instagram.com/travelblog',
                    youtube: 'https://youtube.com/travelblog'
                }
            });
            await settings.save();
        }
        // Return contact information from settings
        const contactInfo = {
            email: settings.contactEmail,
            phone: settings.contactPhone || '+1 (555) 123-4567',
            address: settings.contactAddress || {
                street: '123 Travel Street',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94105',
                country: 'United States'
            },
            socialLinks: {
                facebook: settings.socialLinks?.facebook || 'https://facebook.com/travelblog',
                twitter: settings.socialLinks?.twitter || 'https://twitter.com/travelblog',
                instagram: settings.socialLinks?.instagram || 'https://instagram.com/travelblog',
                youtube: settings.socialLinks?.youtube || 'https://youtube.com/travelblog'
            },
            businessHours: settings.businessHours || {
                monday: '9:00 AM - 6:00 PM',
                tuesday: '9:00 AM - 6:00 PM',
                wednesday: '9:00 AM - 6:00 PM',
                thursday: '9:00 AM - 6:00 PM',
                friday: '9:00 AM - 6:00 PM',
                saturday: '10:00 AM - 4:00 PM',
                sunday: 'Closed'
            },
            support: settings.supportSettings || {
                email: 'support@travelblog.com',
                responseTime: 'Within 24 hours'
            }
        };
        res.status(200).json({
            success: true,
            data: contactInfo
        });
    }
    catch (error) {
        console.error('Public contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contact information'
        });
    }
});
// Debug endpoint to check environment variables
app.get('/debug/env', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Environment variables check',
        cloudinary: {
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
        },
        port: process.env.PORT,
        node_env: process.env.NODE_ENV
    });
});
// Rate limit status endpoint
app.get('/api/rate-limit-status', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Rate limit status',
        environment: process.env.NODE_ENV,
        limits: {
            windowMs: process.env.NODE_ENV === 'development' ? 60 * 60 * 1000 : 15 * 60 * 1000,
            max: process.env.NODE_ENV === 'development' ? 1000 : 100,
            window: process.env.NODE_ENV === 'development' ? '1 hour' : '15 minutes'
        }
    });
});
// API routes
const API_VERSION = '/api';
app.use(`${API_VERSION}/auth`, auth_1.default);
app.use(`${API_VERSION}/users`, users_1.default);
app.use(`${API_VERSION}/posts`, posts_1.default);
app.use(`${API_VERSION}/categories`, categoryRoutes_1.default);
app.use(`${API_VERSION}/destinations`, destinationRoutes_1.default);
app.use(`${API_VERSION}/guides`, guideRoutes_1.default);
app.use(`${API_VERSION}/resources`, resourceRoutes_1.default);
app.use(`${API_VERSION}/comments`, commentRoutes_1.default);
app.use(`${API_VERSION}/contact`, contactRoutes_1.default);
app.use(`${API_VERSION}/photos`, photoRoutes_1.default);
app.use(`${API_VERSION}/newsletter`, newsletterRoutes_1.default);
app.use(`${API_VERSION}/admin`, adminRoutes_1.default);
app.use(`${API_VERSION}/contributor`, contributorRoutes_1.default);
app.use(`${API_VERSION}/reader`, readerRoutes_1.default);
app.use(`${API_VERSION}/partners`, partnerRoutes_1.default);
// 404 handler
app.use(notFound_1.default);
// Error handler
app.use(errorHandler_1.errorHandler);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    console.log(`📱 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API base URL: http://localhost:${PORT}${API_VERSION}`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('❌ Unhandled Rejection:', err.message);
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('❌ Uncaught Exception:', err.message);
    process.exit(1);
});
exports.default = app;
