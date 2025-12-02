"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Import models
const User_1 = __importDefault(require("./models/User"));
const Category_1 = __importDefault(require("./models/Category"));
const Resource_1 = __importDefault(require("./models/Resource"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};
// Helper function to create slug from text
const createSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
};
// Sample data
const sampleUsers = [
    {
        name: 'Admin User',
        email: 'admin@bagpackstories.in',
        password: 'Admin@123456',
        role: 'admin',
        bio: 'Travel blog administrator and content curator.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isEmailVerified: true
    }
];
const sampleCategories = [
    {
        name: 'Adventure Travel',
        slug: 'adventure-travel',
        description: 'Thrilling adventures and outdoor activities around the world',
        color: '#FF6B35',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop'
    },
    {
        name: 'Cultural Experiences',
        slug: 'cultural-experiences',
        description: 'Immersive cultural experiences and local traditions',
        color: '#1E88E5',
        image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73299?w=400&h=200&fit=crop'
    },
    {
        name: 'Food & Cuisine',
        slug: 'food-cuisine',
        description: 'Culinary adventures and local food experiences',
        color: '#FFC107',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=200&fit=crop'
    },
    {
        name: 'Budget Travel',
        slug: 'budget-travel',
        description: 'Affordable travel tips and budget-friendly destinations',
        color: '#4CAF50',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop'
    },
    {
        name: 'Luxury Travel',
        slug: 'luxury-travel',
        description: 'High-end travel experiences and luxury accommodations',
        color: '#9C27B0',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=200&fit=crop'
    },
    {
        name: 'Solo Travel',
        slug: 'solo-travel',
        description: 'Tips and guides for independent travelers',
        color: '#FF9800',
        image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop'
    }
];
const sampleResources = [
    {
        title: 'Travel Insurance Comparison Guide',
        slug: 'travel-insurance-comparison-guide',
        description: 'Comprehensive guide to compare top travel insurance providers and find the best coverage for your trip. Learn about different types of coverage, exclusions, and how to choose the right policy.',
        category: 'Insurance',
        type: 'Guide',
        url: 'https://example.com/travel-insurance-guide',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=200&fit=crop',
                alt: 'Travel insurance documents and passport',
                caption: 'Essential travel insurance documentation'
            }
        ],
        features: [
            'Compare 20+ insurance providers',
            'Coverage calculator tool',
            'Country-specific recommendations',
            'Claims process guide',
            'Emergency contact information'
        ],
        pros: [
            'Comprehensive comparison charts',
            'Regular updates with new providers',
            'Real user reviews and ratings',
            'Easy-to-understand explanations',
            'Mobile-friendly interface'
        ],
        cons: [
            'Limited to English-speaking countries',
            'Some providers require direct contact',
            'Price changes frequently'
        ],
        pricing: {
            type: 'Free',
            amount: 0,
            currency: 'USD',
            description: 'Free access to all comparison tools and guides'
        },
        rating: {
            overall: 4.8,
            usability: 4.7,
            value: 4.9,
            support: 4.6,
            features: 4.8
        },
        tags: ['insurance', 'travel safety', 'comparison', 'guide'],
        destinations: [], // Will be populated with actual destination IDs
        isAffiliate: true,
        affiliateLink: 'https://partner.example.com/travel-insurance',
        isRecommended: true,
        isFeatured: true,
        isActive: true,
        reviews: [],
        totalReviews: 156,
        averageRating: 4.8,
        clickCount: 2340,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: 'Budget Travel Planner Spreadsheet',
        slug: 'budget-travel-planner-spreadsheet',
        description: 'Professional Excel/Google Sheets template to plan and track your travel budget. Includes expense categories, currency converters, and visual spending analysis.',
        category: 'Apps',
        type: 'Template',
        url: 'https://docs.google.com/spreadsheets/budget-planner',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop',
                alt: 'Budget planning spreadsheet on laptop',
                caption: 'Travel budget planning made easy'
            }
        ],
        features: [
            'Pre-built expense categories',
            'Multi-currency support',
            'Automatic calculations',
            'Visual charts and graphs',
            'Trip comparison tools',
            'Emergency fund calculator'
        ],
        pros: [
            'Works with Excel and Google Sheets',
            'Customizable categories',
            'Real-time budget tracking',
            'Professional design',
            'Lifetime updates included'
        ],
        cons: [
            'Requires basic spreadsheet knowledge',
            'Manual data entry needed',
            'Limited mobile functionality'
        ],
        pricing: {
            type: 'Paid',
            amount: 15.99,
            currency: 'USD',
            description: 'One-time purchase with lifetime updates'
        },
        rating: {
            overall: 4.6,
            usability: 4.4,
            value: 4.8,
            support: 4.5,
            features: 4.7
        },
        tags: ['budget', 'planning', 'spreadsheet', 'finance', 'template'],
        destinations: [],
        isAffiliate: false,
        affiliateLink: '',
        isRecommended: true,
        isFeatured: false,
        isActive: true,
        reviews: [],
        totalReviews: 89,
        averageRating: 4.6,
        clickCount: 1240,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: 'Ultimate Packing Checklist',
        slug: 'ultimate-packing-checklist',
        description: 'Never forget anything again with our comprehensive packing checklist. Customizable for different trip types, seasons, and destinations with smart recommendations.',
        category: 'Other',
        type: 'Guide',
        url: 'https://example.com/packing-checklist',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=200&fit=crop',
                alt: 'Organized travel packing',
                caption: 'Smart packing strategies'
            }
        ],
        features: [
            'Trip-type specific lists',
            'Weather-based recommendations',
            'Printable PDF versions',
            'Interactive web checklist',
            'Packing tips and tricks',
            'Space-saving techniques'
        ],
        pros: [
            'Comprehensive and detailed',
            'Customizable for any trip',
            'Regularly updated',
            'Mobile-friendly design',
            'Expert packing tips included'
        ],
        cons: [
            'Can be overwhelming for beginners',
            'Some items region-specific',
            'Requires account for customization'
        ],
        pricing: {
            type: 'Freemium',
            amount: 0,
            currency: 'USD',
            description: 'Free basic version, Premium features for $9.99'
        },
        rating: {
            overall: 4.7,
            usability: 4.8,
            value: 4.6,
            support: 4.5,
            features: 4.7
        },
        tags: ['packing', 'checklist', 'travel tips', 'organization'],
        destinations: [],
        isAffiliate: false,
        affiliateLink: '',
        isRecommended: true,
        isFeatured: true,
        isActive: true,
        reviews: [],
        totalReviews: 203,
        averageRating: 4.7,
        clickCount: 3210,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: 'TravelApps Pro Directory',
        slug: 'travelapps-pro-directory',
        description: 'Curated collection of the best travel apps for navigation, translation, booking, and travel planning. Updated monthly with new app discoveries and reviews.',
        category: 'Apps',
        type: 'App',
        url: 'https://travelapps.pro',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop',
                alt: 'Travel apps on smartphone',
                caption: 'Essential travel apps collection'
            }
        ],
        features: [
            '200+ curated travel apps',
            'Category-wise organization',
            'User reviews and ratings',
            'Platform compatibility info',
            'Regular monthly updates',
            'Offline functionality guide'
        ],
        pros: [
            'Expertly curated selection',
            'Detailed app descriptions',
            'Regular content updates',
            'User-friendly interface',
            'Covers all travel needs'
        ],
        cons: [
            'Subscription-based model',
            'Limited free content',
            'iOS-focused recommendations'
        ],
        pricing: {
            type: 'Subscription',
            amount: 4.99,
            currency: 'USD',
            description: '$4.99/month or $39.99/year'
        },
        rating: {
            overall: 4.5,
            usability: 4.6,
            value: 4.3,
            support: 4.7,
            features: 4.5
        },
        tags: ['apps', 'mobile', 'directory', 'technology', 'tools'],
        destinations: [],
        isAffiliate: true,
        affiliateLink: 'https://partner.travelapps.pro/signup',
        isRecommended: false,
        isFeatured: false,
        isActive: true,
        reviews: [],
        totalReviews: 67,
        averageRating: 4.5,
        clickCount: 890,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: 'Visa Requirements Database',
        slug: 'visa-requirements-database',
        description: 'Comprehensive database of visa requirements for travelers from different countries. Real-time updates with embassy information and application processes.',
        category: 'Services',
        type: 'Website',
        url: 'https://visarequirements.info',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop',
                alt: 'Passport and visa documents',
                caption: 'Visa information and requirements'
            }
        ],
        features: [
            '195+ countries covered',
            'Real-time requirement updates',
            'Embassy contact information',
            'Application process guides',
            'Processing time estimates',
            'Required documents lists'
        ],
        pros: [
            'Comprehensive coverage',
            'Regularly updated information',
            'User-friendly search',
            'Mobile-optimized',
            'Free basic information'
        ],
        cons: [
            'Premium features cost extra',
            'Some countries incomplete',
            'Complex requirements simplified'
        ],
        pricing: {
            type: 'Freemium',
            amount: 0,
            currency: 'USD',
            description: 'Free basic info, Premium for $12.99/year'
        },
        rating: {
            overall: 4.4,
            usability: 4.3,
            value: 4.5,
            support: 4.2,
            features: 4.6
        },
        tags: ['visa', 'travel documents', 'requirements', 'embassy', 'database'],
        destinations: [],
        isAffiliate: false,
        affiliateLink: '',
        isRecommended: true,
        isFeatured: false,
        isActive: true,
        reviews: [],
        totalReviews: 124,
        averageRating: 4.4,
        clickCount: 1560,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: 'Currency Exchange Calculator',
        slug: 'currency-exchange-calculator',
        description: 'Real-time currency converter with historical rates, travel money tips, and best exchange rate finder. Includes offline functionality and rate alerts.',
        category: 'Apps',
        type: 'Tool',
        url: 'https://currencyexchange.tools',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=200&fit=crop',
                alt: 'Currency exchange rates on phone',
                caption: 'Real-time currency conversion'
            }
        ],
        features: [
            '170+ currencies supported',
            'Real-time exchange rates',
            'Historical rate charts',
            'Rate change alerts',
            'Offline calculator',
            'Travel money tips'
        ],
        pros: [
            'Accurate real-time rates',
            'Works offline',
            'Clean, intuitive design',
            'Helpful travel tips',
            'No ads in premium version'
        ],
        cons: [
            'Basic features only in free version',
            'Requires internet for updates',
            'Limited historical data in free tier'
        ],
        pricing: {
            type: 'Freemium',
            amount: 0,
            currency: 'USD',
            description: 'Free with ads, Pro version $2.99'
        },
        rating: {
            overall: 4.3,
            usability: 4.5,
            value: 4.2,
            support: 4.1,
            features: 4.4
        },
        tags: ['currency', 'exchange rates', 'calculator', 'finance', 'travel money'],
        destinations: [],
        isAffiliate: false,
        affiliateLink: '',
        isRecommended: false,
        isFeatured: false,
        isActive: true,
        reviews: [],
        totalReviews: 45,
        averageRating: 4.3,
        clickCount: 720,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: 'Booking.com Travel Assistant',
        slug: 'booking-com-travel-assistant',
        description: 'Official Booking.com mobile app for finding and booking accommodations worldwide. Features exclusive mobile deals and instant confirmation.',
        category: 'Booking',
        type: 'App',
        url: 'https://booking.com/app',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=200&fit=crop',
                alt: 'Hotel booking app interface',
                caption: 'Book accommodations on the go'
            }
        ],
        features: [
            '28+ million listings',
            'Instant booking confirmation',
            'Mobile-exclusive deals',
            'Map-based search',
            'Offline access to bookings',
            '24/7 customer support'
        ],
        pros: [
            'Huge selection of properties',
            'Reliable booking platform',
            'Great mobile deals',
            'User-friendly interface',
            'Excellent customer service'
        ],
        cons: [
            'Can be overwhelming with choices',
            'Prices may not include all fees',
            'Limited loyalty program benefits'
        ],
        pricing: {
            type: 'Free',
            amount: 0,
            currency: 'USD',
            description: 'Free app, commission from bookings'
        },
        rating: {
            overall: 4.7,
            usability: 4.8,
            value: 4.6,
            support: 4.7,
            features: 4.7
        },
        tags: ['booking', 'hotels', 'accommodations', 'mobile app', 'travel planning'],
        destinations: [],
        isAffiliate: true,
        affiliateLink: 'https://booking.com/app?aid=travel-blog',
        isRecommended: true,
        isFeatured: true,
        isActive: true,
        reviews: [],
        totalReviews: 312,
        averageRating: 4.7,
        clickCount: 4560,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        title: 'Osprey Travel Backpack Guide',
        slug: 'osprey-travel-backpack-guide',
        description: 'Comprehensive guide to Osprey travel backpacks with detailed reviews, size comparisons, and recommendations for different travel styles.',
        category: 'Gear',
        type: 'Product',
        url: 'https://osprey.com/travel-backpacks',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=200&fit=crop',
                alt: 'Travel backpack and gear',
                caption: 'Quality travel backpacks for every journey'
            }
        ],
        features: [
            '15+ backpack models reviewed',
            'Size and capacity guides',
            'Travel style recommendations',
            'Durability testing results',
            'Price comparison charts',
            'User experience stories'
        ],
        pros: [
            'Detailed product analysis',
            'Real user reviews',
            'Expert recommendations',
            'Regular content updates',
            'Helpful buying guides'
        ],
        cons: [
            'Brand-specific focus',
            'Higher price point products',
            'Limited budget options'
        ],
        pricing: {
            type: 'Free',
            amount: 0,
            currency: 'USD',
            description: 'Free guide with affiliate links'
        },
        rating: {
            overall: 4.6,
            usability: 4.5,
            value: 4.7,
            support: 4.4,
            features: 4.6
        },
        tags: ['backpacks', 'gear', 'osprey', 'travel equipment', 'reviews'],
        destinations: [],
        isAffiliate: true,
        affiliateLink: 'https://osprey.com/travel?ref=travel-blog',
        isRecommended: true,
        isFeatured: false,
        isActive: true,
        reviews: [],
        totalReviews: 78,
        averageRating: 4.6,
        clickCount: 1120,
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
    }
];
const sampleDestinations = [
    {
        name: 'Bali, Indonesia',
        description: 'A tropical paradise known for its stunning beaches, ancient temples, vibrant culture, and lush rice terraces. Experience the perfect blend of relaxation and adventure in this Indonesian gem.',
        country: 'Indonesia',
        continent: 'Asia',
        featuredImage: {
            url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
            alt: 'Bali rice terraces'
        },
        gallery: [
            {
                url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
                alt: 'Bali rice terraces'
            },
            {
                url: 'https://images.unsplash.com/photo-1555400113-28f3e0c56e1b?w=800&h=400&fit=crop',
                alt: 'Tanah Lot Temple at sunset'
            }
        ],
        coordinates: {
            lat: -8.4095,
            lng: 115.1889
        },
        bestTimeToVisit: 'April to September (dry season)',
        averageTemperature: {
            summer: '25-32°C (77-90°F)',
            winter: '22-28°C (72-82°F)'
        },
        currency: 'IDR (Indonesian Rupiah)',
        language: 'Indonesian, Balinese',
        timezone: 'UTC+8 (Central Indonesian Time)',
        rating: 4.8,
        totalReviews: 1250,
        highlights: ['Ubud Rice Terraces', 'Uluwatu Temple', 'Seminyak Beach', 'Mount Batur Sunrise Trek'],
        activities: [
            {
                name: 'Surfing',
                icon: '🏄‍♂️',
                description: 'World-class surfing spots from beginner to advanced levels'
            },
            {
                name: 'Temple Hopping',
                icon: '🏛️',
                description: 'Explore ancient Hindu temples and learn about Balinese culture'
            },
            {
                name: 'Yoga Retreats',
                icon: '🧘‍♀️',
                description: 'Find peace and wellness in Bali\'s spiritual atmosphere'
            },
            {
                name: 'Hiking',
                icon: '🥾',
                description: 'Trek through rice terraces and volcanic landscapes'
            },
            {
                name: 'Snorkeling',
                icon: '🤿',
                description: 'Discover vibrant coral reefs and marine life'
            }
        ],
        accommodation: [
            {
                type: 'budget',
                name: 'Bali Budget Hostels',
                description: 'Clean hostels and guesthouses with basic amenities, perfect for backpackers',
                priceRange: '$20-50 per night',
                rating: 3.8,
                amenities: ['Free WiFi', 'Air conditioning', 'Shared bathroom', 'Common area'],
                bookingUrl: 'https://booking.com/budget-bali'
            },
            {
                type: 'mid-range',
                name: 'Boutique Hotels & Villas',
                description: 'Charming boutique hotels and private villas with local character',
                priceRange: '$50-150 per night',
                rating: 4.3,
                amenities: ['Pool', 'Private bathroom', 'Breakfast included', 'Garden view', 'Spa services'],
                bookingUrl: 'https://booking.com/midrange-bali'
            },
            {
                type: 'luxury',
                name: 'Premium Resorts & Private Villas',
                description: 'World-class resorts and exclusive private villas with premium amenities',
                priceRange: '$150+ per night',
                rating: 4.8,
                amenities: ['Private pool', 'Butler service', 'Fine dining', 'Spa', 'Ocean view', 'Private beach access'],
                bookingUrl: 'https://booking.com/luxury-bali'
            }
        ],
        transportation: ['Airport transfer', 'Scooter rental', 'Private driver', 'Local buses', 'Boat transfers'],
        localCuisine: ['Nasi Goreng', 'Babi Guling', 'Sate', 'Ayam Betutu', 'Pisang Goreng'],
        travelTips: [
            'Respect local customs and dress modestly at temples',
            'Bargain politely at markets',
            'Stay hydrated and use sunscreen',
            'Learn basic Indonesian phrases',
            'Book popular activities in advance during peak season'
        ],
        isPopular: true,
        isFeatured: true,
        isActive: true,
        seoTitle: 'Bali Travel Guide: Beaches, Temples & Culture',
        seoDescription: 'Discover Bali\'s stunning beaches, ancient temples, and vibrant culture. Complete guide for your Indonesian adventure.'
    },
    {
        name: 'Kyoto, Japan',
        description: 'Former imperial capital renowned for its classical Buddhist temples, gardens, imperial palaces, Shinto shrines and traditional wooden houses.',
        country: 'Japan',
        continent: 'Asia',
        featuredImage: {
            url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
            alt: 'Kyoto bamboo forest'
        },
        gallery: [
            {
                url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
                alt: 'Kyoto bamboo forest'
            },
            {
                url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=600&fit=crop',
                alt: 'Fushimi Inari Shrine'
            }
        ],
        coordinates: {
            lat: 35.0116,
            lng: 135.7681
        },
        bestTimeToVisit: 'March-May (cherry blossoms) or September-November (autumn leaves)',
        averageTemperature: {
            summer: '20-30°C (68-86°F)',
            winter: '0-10°C (32-50°F)'
        },
        currency: 'JPY (Japanese Yen)',
        language: 'Japanese',
        timezone: 'UTC+9 (Japan Standard Time)',
        rating: 4.9,
        totalReviews: 980,
        highlights: ['Fushimi Inari Shrine', 'Kinkaku-ji Temple', 'Arashiyama Bamboo Grove', 'Gion District'],
        activities: [
            {
                name: 'Temple Visits',
                icon: '🏛️',
                description: 'Explore Kyoto\'s 2,000+ temples and shrines'
            },
            {
                name: 'Tea Ceremony',
                icon: '🍵',
                description: 'Experience traditional Japanese tea ceremony'
            },
            {
                name: 'Cherry Blossom Viewing',
                icon: '🌸',
                description: 'Witness the famous sakura season in spring'
            },
            {
                name: 'Traditional Crafts',
                icon: '🎨',
                description: 'Learn about Kyoto\'s traditional crafts and artisans'
            }
        ],
        accommodation: [
            {
                type: 'budget',
                name: 'Kyoto Budget Hostels & Ryokan',
                description: 'Traditional hostels and budget ryokan offering authentic Japanese experience',
                priceRange: '$30-80 per night',
                rating: 4.0,
                amenities: ['Tatami rooms', 'Shared bathroom', 'Free WiFi', 'Traditional breakfast', 'Common area'],
                bookingUrl: 'https://booking.com/budget-kyoto'
            },
            {
                type: 'mid-range',
                name: 'Business Hotels & Traditional Inns',
                description: 'Comfortable business hotels and traditional Japanese inns with modern amenities',
                priceRange: '$80-200 per night',
                rating: 4.4,
                amenities: ['Private bathroom', 'Free WiFi', 'Air conditioning', 'Traditional breakfast', 'Onsen access'],
                bookingUrl: 'https://booking.com/midrange-kyoto'
            },
            {
                type: 'luxury',
                name: 'Luxury Ryokan & High-end Hotels',
                description: 'Premium traditional ryokan and luxury hotels with exceptional service',
                priceRange: '$200+ per night',
                rating: 4.9,
                amenities: ['Private onsen', 'Kaiseki dining', 'Garden view', 'Butler service', 'Traditional tea ceremony', 'Premium location'],
                bookingUrl: 'https://booking.com/luxury-kyoto'
            }
        ],
        transportation: ['JR Pass', 'Subway', 'Bus', 'Bicycle rental', 'Taxi'],
        localCuisine: ['Kaiseki', 'Yudofu', 'Obanzai', 'Matcha desserts', 'Street food'],
        travelTips: [
            'Get a Japan Rail Pass for extensive travel',
            'Visit temples early to avoid crowds',
            'Try onsen (hot springs) for relaxation',
            'Learn basic bowing etiquette',
            'Book accommodation well in advance during peak seasons'
        ],
        isPopular: true,
        isFeatured: true,
        isActive: true,
        seoTitle: 'Kyoto Travel Guide: Temples, Gardens & Culture',
        seoDescription: 'Explore Kyoto\'s ancient temples, beautiful gardens, and traditional culture. Your complete guide to Japan\'s cultural capital.'
    },
    {
        name: 'Patagonia, Argentina & Chile',
        description: 'Vast wilderness region at the southern tip of South America, known for dramatic landscapes including glaciers, mountains, and steppes.',
        country: 'Argentina',
        continent: 'South America',
        featuredImage: {
            url: 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=800&h=600&fit=crop',
            alt: 'Patagonia mountains'
        },
        gallery: [
            {
                url: 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=800&h=600&fit=crop',
                alt: 'Patagonia mountains'
            },
            {
                url: 'https://images.unsplash.com/photo-1544737151-6e4b9b1c1b68?w=800&h=400&fit=crop',
                alt: 'Torres del Paine towers'
            }
        ],
        coordinates: {
            lat: -50.5,
            lng: -73.0
        },
        bestTimeToVisit: 'December to March (Southern Hemisphere summer)',
        averageTemperature: {
            summer: '5-15°C (41-59°F)',
            winter: '-5-5°C (23-41°F)'
        },
        currency: 'ARS (Argentine Peso) / CLP (Chilean Peso)',
        language: 'Spanish',
        timezone: 'UTC-3 (Argentina) / UTC-4 (Chile)',
        rating: 4.7,
        totalReviews: 650,
        highlights: ['Torres del Paine', 'Perito Moreno Glacier', 'Mount Fitz Roy', 'Ushuaia'],
        activities: [
            {
                name: 'Trekking',
                icon: '🥾',
                description: 'Hike the famous W Circuit and O Circuit trails'
            },
            {
                name: 'Glacier Viewing',
                icon: '🧊',
                description: 'Witness massive glaciers and ice formations'
            },
            {
                name: 'Wildlife Watching',
                icon: '🦌',
                description: 'Spot guanacos, condors, and marine life'
            },
            {
                name: 'Photography',
                icon: '📷',
                description: 'Capture stunning landscapes and wildlife'
            }
        ],
        accommodation: [
            {
                type: 'budget',
                name: 'Hostels & Camping',
                description: 'Basic hostels and camping sites for adventurous travelers',
                priceRange: '$25-60 per night',
                rating: 3.5,
                amenities: ['Shared facilities', 'Camping gear rental', 'Kitchen access', 'WiFi', 'Tour booking'],
                bookingUrl: 'https://booking.com/budget-patagonia'
            },
            {
                type: 'mid-range',
                name: 'Mountain Lodges & Cabins',
                description: 'Comfortable lodges and cabins with stunning mountain views',
                priceRange: '$60-150 per night',
                rating: 4.2,
                amenities: ['Mountain views', 'Heating', 'Private bathroom', 'Restaurant', 'Hiking gear storage', 'Transfer service'],
                bookingUrl: 'https://booking.com/midrange-patagonia'
            },
            {
                type: 'luxury',
                name: 'Luxury Eco-lodges & Resorts',
                description: 'Premium eco-lodges and luxury resorts with exceptional wilderness access',
                priceRange: '$150+ per night',
                rating: 4.7,
                amenities: ['All-inclusive', 'Private guides', 'Gourmet dining', 'Spa services', 'Helicopter transfers', 'Premium location'],
                bookingUrl: 'https://booking.com/luxury-patagonia'
            }
        ],
        transportation: ['Internal flights', 'Bus tours', 'Private transfers', 'Rental cars', 'Ferries'],
        localCuisine: ['Lamb dishes', 'Seafood', 'Empanadas', 'Wine', 'Mate tea'],
        travelTips: [
            'Prepare for unpredictable weather',
            'Book tours and accommodation in advance',
            'Pack layers for variable temperatures',
            'Respect wildlife and maintain distance',
            'Consider travel insurance for remote areas'
        ],
        isPopular: true,
        isFeatured: true,
        isActive: true,
        seoTitle: 'Patagonia Travel Guide: Glaciers, Mountains & Adventure',
        seoDescription: 'Explore Patagonia\'s dramatic landscapes, glaciers, and mountains. Complete guide for Argentina and Chile\'s wilderness region.'
    },
    {
        name: 'Varanasi, India',
        description: 'One of the world\'s oldest continuously inhabited cities and the spiritual capital of India. Experience ancient traditions, sacred ghats along the Ganges, and profound spiritual awakening in this timeless holy city.',
        country: 'India',
        continent: 'Asia',
        featuredImage: {
            url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop',
            alt: 'Varanasi ghats at sunrise'
        },
        gallery: [
            {
                url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop',
                alt: 'Varanasi ghats at sunrise'
            },
            {
                url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=400&fit=crop',
                alt: 'Ganga Aarti ceremony at Dashashwamedh Ghat'
            },
            {
                url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
                alt: 'Kashi Vishwanath Temple'
            }
        ],
        coordinates: {
            lat: 25.3176,
            lng: 82.9739
        },
        bestTimeToVisit: 'October to March (winter season)',
        averageTemperature: {
            summer: '32-45°C (90-113°F)',
            winter: '5-20°C (41-68°F)'
        },
        currency: 'INR (Indian Rupee)',
        language: 'Hindi, Bhojpuri, English',
        timezone: 'UTC+5:30 (India Standard Time)',
        rating: 4.6,
        totalReviews: 2847,
        highlights: [
            'Dashashwamedh Ghat Aarti',
            'Kashi Vishwanath Temple',
            'Sarnath Buddhist Site',
            'Sunrise Boat Ride on Ganges',
            'Ramnagar Fort'
        ],
        activities: [
            {
                name: 'Ganga Aarti',
                icon: '🕯️',
                description: 'Witness the mesmerizing evening prayer ceremony at the ghats'
            },
            {
                name: 'Boat Rides',
                icon: '⛵',
                description: 'Explore the ghats from the sacred Ganges River at sunrise'
            },
            {
                name: 'Temple Visits',
                icon: '🛕',
                description: 'Visit ancient temples including the famous Kashi Vishwanath'
            },
            {
                name: 'Meditation',
                icon: '🧘‍♂️',
                description: 'Find inner peace through meditation and yoga practices'
            },
            {
                name: 'Heritage Walks',
                icon: '🚶‍♂️',
                description: 'Explore narrow ancient lanes and traditional architecture'
            },
            {
                name: 'Silk Shopping',
                icon: '🧵',
                description: 'Shop for world-famous Banarasi silk sarees and textiles'
            }
        ],
        transportation: [
            'Airport transfer',
            'Auto-rickshaw',
            'Cycle-rickshaw',
            'Local buses',
            'Walking',
            'Boat transport'
        ],
        localCuisine: [
            'Banarasi Paan',
            'Kachori Sabzi',
            'Lassi',
            'Malaiyo',
            'Tamatar Chaat',
            'Aloo Tikki',
            'Rabri'
        ],
        travelTips: [
            'Dress modestly and remove shoes before entering temples',
            'Respect local customs and photography restrictions at ghats',
            'Stay hydrated and carry water bottles',
            'Be prepared for crowds, especially during festivals',
            'Book accommodation near ghats for easy access',
            'Learn basic Hindi phrases for better interaction',
            'Carry cash as many places don\'t accept cards'
        ],
        relatedPosts: [
            {
                id: 'varanasi-spiritual-guide',
                title: 'Spiritual Journey Through Varanasi: A Complete Guide',
                slug: 'spiritual-journey-through-varanasi-complete-guide',
                image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=400&fit=crop'
            },
            {
                id: 'varanasi-food-culture',
                title: 'Street Food Culture of Varanasi: A Culinary Adventure',
                slug: 'street-food-culture-varanasi-culinary-adventure',
                image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&h=400&fit=crop'
            }
        ],
        isPopular: true,
        isFeatured: true,
        isActive: true,
        seoTitle: 'Varanasi Travel Guide: Sacred Ghats & Ancient Temples',
        seoDescription: 'Discover Varanasi\'s sacred ghats, ancient temples, and spiritual heritage. Complete guide to India\'s holiest city on the Ganges.'
    }
];
const seedDatabase = async () => {
    try {
        // Clear existing data
        console.log('Clearing existing data...');
        //await User.deleteMany({})
        await Category_1.default.deleteMany({});
        //await SiteSettings.deleteMany({})
        // Create users
        // console.log('Creating users...')
        // const users = []
        // for (const userData of sampleUsers) {
        //   const salt = await bcrypt.genSalt(12)
        //   const hashedPassword = await bcrypt.hash(userData.password, salt)
        //   const user = new User({
        //     ...userData,
        //     password: hashedPassword
        //   })
        //   users.push(await user.save())
        // }
        // Create categories
        console.log('Creating categories...');
        const categories = [];
        for (const categoryData of sampleCategories) {
            const category = new Category_1.default(categoryData);
            categories.push(await category.save());
        }
        // Create a sample admin user for resources (if not exists)
        let adminUser = await User_1.default.findOne({ email: 'admin@travelblog.com' });
        if (!adminUser) {
            console.log('Creating admin user for resources...');
            const salt = await bcryptjs_1.default.genSalt(12);
            const hashedPassword = await bcryptjs_1.default.hash('admin123', salt);
            adminUser = new User_1.default({
                name: 'Travel Blog Admin',
                email: 'admin@travelblog.com',
                password: hashedPassword,
                role: 'admin',
                isActive: true,
                isEmailVerified: true,
                profile: {
                    bio: 'Travel blog administrator',
                    location: 'Worldwide',
                    website: 'https://travelblog.com'
                },
                preferences: {
                    emailNotifications: true,
                    newsletter: true,
                    twoFactorAuth: false
                }
            });
            await adminUser.save();
        }
        // Create resources
        console.log('Creating resources...');
        await Resource_1.default.deleteMany({}); // Clear existing resources
        const resources = [];
        for (const resourceData of sampleResources) {
            const resource = new Resource_1.default({
                ...resourceData,
                author: adminUser._id
            });
            resources.push(await resource.save());
        }
        console.log('Database seeded successfully!');
        console.log(`Created:`);
        //console.log(`- ${users.length} users`)
        console.log(`- ${categories.length} categories`);
        console.log(`- ${resources.length} resources`);
    }
    catch (error) {
        console.error('Error seeding database:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Database connection closed');
    }
};
// Run the seed script
const runSeed = async () => {
    await connectDB();
    await seedDatabase();
};
if (require.main === module) {
    runSeed();
}
exports.default = seedDatabase;
