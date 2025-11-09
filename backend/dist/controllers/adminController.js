"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = exports.getGuide = exports.updateGuide = exports.createGuide = exports.deleteGuide = exports.getAllGuidesAdmin = exports.getDestination = exports.updateDestination = exports.createDestination = exports.deleteDestination = exports.getAllDestinationsAdmin = exports.submitPostForReview = exports.moderatePost = exports.getPendingPosts = exports.approvePost = exports.getPost = exports.updatePost = exports.createPost = exports.deletePost = exports.updatePostStatus = exports.getAllPostsAdmin = exports.deleteUser = exports.updateUser = exports.createUser = exports.getAllUsers = exports.getDashboardStats = void 0;
const User_1 = __importDefault(require("../models/User"));
const Post_1 = __importDefault(require("../models/Post"));
const Destination_1 = __importDefault(require("../models/Destination"));
const Guide_1 = __importDefault(require("../models/Guide"));
const Newsletter_1 = __importDefault(require("../models/Newsletter"));
const SiteSettings_1 = __importDefault(require("../models/SiteSettings"));
// Admin Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalPosts, totalDestinations, totalGuides, totalSubscribers, pendingPosts, recentUsers, recentPosts] = await Promise.all([
            User_1.default.countDocuments(),
            Post_1.default.countDocuments(),
            Destination_1.default.countDocuments(),
            Guide_1.default.countDocuments(),
            Newsletter_1.default.countDocuments(),
            Post_1.default.countDocuments({ status: 'draft' }),
            User_1.default.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
            Post_1.default.find().sort({ createdAt: -1 }).limit(5).populate('author', 'name').select('title author status createdAt')
        ]);
        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalPosts,
                    totalDestinations,
                    totalGuides,
                    totalSubscribers,
                    pendingPosts
                },
                recentActivity: {
                    recentUsers,
                    recentPosts
                }
            }
        });
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats'
        });
    }
};
exports.getDashboardStats = getDashboardStats;
// Users Management
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const role = req.query.role;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role && role !== 'all') {
            query.role = role;
        }
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User_1.default.find(query)
                .select('name email role isEmailVerified isPremium createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User_1.default.countDocuments(query)
        ]);
        res.json({
            success: true,
            data: users,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};
exports.getAllUsers = getAllUsers;
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        const user = new User_1.default({
            name,
            email,
            password,
            role: role || 'reader',
            isEmailVerified: true
        });
        await user.save();
        const userResponse = await User_1.default.findById(user._id).select('-password');
        res.status(201).json({
            success: true,
            data: userResponse,
            message: 'User created successfully'
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create user'
        });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, isPremium, isEmailVerified } = req.body;
        const user = await User_1.default.findByIdAndUpdate(id, { name, email, role, isPremium, isEmailVerified }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            data: user,
            message: 'User updated successfully'
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.default.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};
exports.deleteUser = deleteUser;
// Posts Management
const getAllPostsAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const status = req.query.status;
        const category = req.query.category;
        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } }
            ];
        }
        if (status && status !== 'all') {
            query.status = status;
        }
        if (category && category !== 'all') {
            query.categories = category;
        }
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            Post_1.default.find(query)
                .populate('author', 'name email')
                .populate('categories', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Post_1.default.countDocuments(query)
        ]);
        res.json({
            success: true,
            data: posts,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        });
    }
    catch (error) {
        console.error('Get posts admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch posts'
        });
    }
};
exports.getAllPostsAdmin = getAllPostsAdmin;
const updatePostStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const post = await Post_1.default.findByIdAndUpdate(id, {
            status,
            publishedAt: status === 'published' ? new Date() : undefined
        }, { new: true }).populate('author', 'name email');
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        res.json({
            success: true,
            data: post,
            message: 'Post status updated successfully'
        });
    }
    catch (error) {
        console.error('Update post status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update post status'
        });
    }
};
exports.updatePostStatus = updatePostStatus;
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post_1.default.findByIdAndDelete(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete post'
        });
    }
};
exports.deletePost = deletePost;
// Create new post
const createPost = async (req, res) => {
    try {
        const postData = {
            ...req.body,
            author: req.body.author || '64b1234567890abcdef123456' // Default author ID
        };
        const post = new Post_1.default(postData);
        await post.save();
        await post.populate('author', 'name email');
        res.status(201).json({
            success: true,
            data: post,
            message: 'Post created successfully'
        });
    }
    catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create post'
        });
    }
};
exports.createPost = createPost;
// Update post
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Update post request body:', req.body);
        console.log('isFeatured value:', req.body.isFeatured);
        console.log('isFeatured type:', typeof req.body.isFeatured);
        // Prepare update data
        const updateData = { ...req.body };
        // Ensure isFeatured is boolean
        if (updateData.isFeatured !== undefined) {
            updateData.isFeatured = Boolean(updateData.isFeatured);
        }
        console.log('Update data:', updateData);
        const post = await Post_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: false } // Disable validators for now to avoid issues
        ).populate('author', 'name email')
            .populate('categories', 'name slug');
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        console.log('Updated post isFeatured:', post.isFeatured);
        res.json({
            success: true,
            data: post,
            message: 'Post updated successfully'
        });
    }
    catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update post'
        });
    }
}; // Get single post
exports.updatePost = updatePost;
const getPost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post_1.default.findById(id)
            .populate('author', 'name email')
            .populate('categories', 'name slug');
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        res.json({
            success: true,
            data: post
        });
    }
    catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get post'
        });
    }
};
exports.getPost = getPost;
// Approve post
const approvePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post_1.default.findByIdAndUpdate(id, {
            status: 'published',
            publishedAt: new Date()
        }, { new: true }).populate('author', 'name email');
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        res.json({
            success: true,
            data: post,
            message: 'Post approved and published successfully'
        });
    }
    catch (error) {
        console.error('Approve post error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve post'
        });
    }
};
exports.approvePost = approvePost;
// Get pending posts for moderation
const getPendingPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            Post_1.default.find({ status: 'pending' })
                .populate('author', 'name email')
                .populate('categories', 'name slug')
                .populate('moderatedBy', 'name email')
                .sort({ submittedAt: -1 })
                .skip(skip)
                .limit(limit),
            Post_1.default.countDocuments({ status: 'pending' })
        ]);
        res.json({
            success: true,
            data: posts,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        });
    }
    catch (error) {
        console.error('Get pending posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending posts'
        });
    }
};
exports.getPendingPosts = getPendingPosts;
// Moderate post (approve/reject)
const moderatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, moderationNotes } = req.body;
        const adminId = req.user?.id;
        if (!['published', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either published or rejected'
            });
        }
        const updateData = {
            status,
            moderationNotes,
            moderatedBy: adminId,
            moderatedAt: new Date()
        };
        if (status === 'published') {
            updateData.publishedAt = new Date();
        }
        const post = await Post_1.default.findByIdAndUpdate(id, updateData, { new: true }).populate('author', 'name email')
            .populate('moderatedBy', 'name email');
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        res.json({
            success: true,
            data: post,
            message: `Post ${status === 'published' ? 'approved' : 'rejected'} successfully`
        });
    }
    catch (error) {
        console.error('Moderate post error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to moderate post'
        });
    }
};
exports.moderatePost = moderatePost;
// Submit post for review (change status from draft to pending)
const submitPostForReview = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post_1.default.findByIdAndUpdate(id, {
            status: 'pending',
            submittedAt: new Date()
        }, { new: true }).populate('author', 'name email');
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        res.json({
            success: true,
            data: post,
            message: 'Post submitted for review successfully'
        });
    }
    catch (error) {
        console.error('Submit post for review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit post for review'
        });
    }
};
exports.submitPostForReview = submitPostForReview;
// Destinations Management
const getAllDestinationsAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { country: { $regex: search, $options: 'i' } },
                { region: { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (page - 1) * limit;
        const [destinations, total] = await Promise.all([
            Destination_1.default.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Destination_1.default.countDocuments(query)
        ]);
        res.json({
            success: true,
            data: destinations,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        });
    }
    catch (error) {
        console.error('Get destinations admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch destinations'
        });
    }
};
exports.getAllDestinationsAdmin = getAllDestinationsAdmin;
const deleteDestination = async (req, res) => {
    try {
        const { id } = req.params;
        const destination = await Destination_1.default.findByIdAndDelete(id);
        if (!destination) {
            return res.status(404).json({
                success: false,
                message: 'Destination not found'
            });
        }
        res.json({
            success: true,
            message: 'Destination deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete destination error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete destination'
        });
    }
};
exports.deleteDestination = deleteDestination;
// Create new destination
const createDestination = async (req, res) => {
    try {
        const destination = new Destination_1.default(req.body);
        await destination.save();
        res.status(201).json({
            success: true,
            data: destination,
            message: 'Destination created successfully'
        });
    }
    catch (error) {
        console.error('Create destination error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create destination'
        });
    }
};
exports.createDestination = createDestination;
// Update destination
const updateDestination = async (req, res) => {
    try {
        const { id } = req.params;
        const destination = await Destination_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!destination) {
            return res.status(404).json({
                success: false,
                message: 'Destination not found'
            });
        }
        res.json({
            success: true,
            data: destination,
            message: 'Destination updated successfully'
        });
    }
    catch (error) {
        console.error('Update destination error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update destination'
        });
    }
};
exports.updateDestination = updateDestination;
// Get single destination
const getDestination = async (req, res) => {
    try {
        const { id } = req.params;
        const destination = await Destination_1.default.findById(id);
        if (!destination) {
            return res.status(404).json({
                success: false,
                message: 'Destination not found'
            });
        }
        res.json({
            success: true,
            data: destination
        });
    }
    catch (error) {
        console.error('Get destination error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get destination'
        });
    }
};
exports.getDestination = getDestination;
// Guides Management
const getAllGuidesAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (page - 1) * limit;
        const [guides, total] = await Promise.all([
            Guide_1.default.find(query)
                .populate('author', 'name email')
                .populate('destination', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Guide_1.default.countDocuments(query)
        ]);
        res.json({
            success: true,
            data: guides,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        });
    }
    catch (error) {
        console.error('Get guides admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch guides'
        });
    }
};
exports.getAllGuidesAdmin = getAllGuidesAdmin;
const deleteGuide = async (req, res) => {
    try {
        const { id } = req.params;
        const guide = await Guide_1.default.findByIdAndDelete(id);
        if (!guide) {
            return res.status(404).json({
                success: false,
                message: 'Guide not found'
            });
        }
        res.json({
            success: true,
            message: 'Guide deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete guide error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete guide'
        });
    }
};
exports.deleteGuide = deleteGuide;
// Create new guide
const createGuide = async (req, res) => {
    try {
        const guide = new Guide_1.default(req.body);
        await guide.save();
        res.status(201).json({
            success: true,
            data: guide,
            message: 'Guide created successfully'
        });
    }
    catch (error) {
        console.error('Create guide error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create guide'
        });
    }
};
exports.createGuide = createGuide;
// Update guide
const updateGuide = async (req, res) => {
    try {
        const { id } = req.params;
        const guide = await Guide_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!guide) {
            return res.status(404).json({
                success: false,
                message: 'Guide not found'
            });
        }
        res.json({
            success: true,
            data: guide,
            message: 'Guide updated successfully'
        });
    }
    catch (error) {
        console.error('Update guide error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update guide'
        });
    }
};
exports.updateGuide = updateGuide;
// Get single guide
const getGuide = async (req, res) => {
    try {
        const { id } = req.params;
        const guide = await Guide_1.default.findById(id);
        if (!guide) {
            return res.status(404).json({
                success: false,
                message: 'Guide not found'
            });
        }
        res.json({
            success: true,
            data: guide
        });
    }
    catch (error) {
        console.error('Get guide error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get guide'
        });
    }
};
exports.getGuide = getGuide;
// Settings Management
const getSettings = async (req, res) => {
    try {
        let settings = await SiteSettings_1.default.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = new SiteSettings_1.default({
                siteName: 'Travel Blog',
                siteDescription: 'Discover amazing travel destinations and guides',
                siteUrl: 'https://yourdomain.com',
                contactEmail: 'contact@example.com',
                supportEmail: 'support@example.com',
                contactPhone: '+1 (555) 123-4567',
                contactAddress: {
                    street: '123 Travel Street',
                    city: 'San Francisco',
                    state: 'CA',
                    zipCode: '94105',
                    country: 'USA'
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
                    facebook: '',
                    twitter: '',
                    instagram: '',
                    youtube: '',
                    linkedin: ''
                },
                seoSettings: {
                    metaTitle: 'Travel Blog - Discover Amazing Destinations',
                    metaDescription: 'Discover amazing travel destinations, guides, and tips from experienced travelers around the world.',
                    metaKeywords: []
                },
                emailSettings: {
                    fromEmail: 'noreply@example.com',
                    fromName: 'Travel Blog'
                },
                generalSettings: {
                    postsPerPage: 12,
                    commentsEnabled: true,
                    registrationEnabled: true,
                    maintenanceMode: false
                },
                theme: {
                    primaryColor: '#3B82F6',
                    secondaryColor: '#8B5CF6'
                }
            });
            await settings.save();
        }
        res.json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings'
        });
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        let settings = await SiteSettings_1.default.findOne();
        if (!settings) {
            // Create new settings with complete structure if none exist
            const defaultSettings = {
                siteName: 'Travel Blog',
                siteDescription: 'Discover amazing travel destinations and guides',
                siteUrl: 'https://yourdomain.com',
                contactEmail: 'contact@example.com',
                supportEmail: 'support@example.com',
                contactPhone: '+1 (555) 123-4567',
                contactAddress: {
                    street: '123 Travel Street',
                    city: 'San Francisco',
                    state: 'CA',
                    zipCode: '94105',
                    country: 'USA'
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
                    facebook: '',
                    twitter: '',
                    instagram: '',
                    youtube: '',
                    linkedin: ''
                },
                seoSettings: {
                    metaTitle: 'Travel Blog - Discover Amazing Destinations',
                    metaDescription: 'Discover amazing travel destinations, guides, and tips from experienced travelers around the world.',
                    metaKeywords: []
                },
                emailSettings: {
                    fromEmail: 'noreply@example.com',
                    fromName: 'Travel Blog'
                },
                generalSettings: {
                    postsPerPage: 12,
                    commentsEnabled: true,
                    registrationEnabled: true,
                    maintenanceMode: false
                },
                theme: {
                    primaryColor: '#3B82F6',
                    secondaryColor: '#8B5CF6'
                },
                ...req.body
            };
            settings = new SiteSettings_1.default(defaultSettings);
        }
        else {
            // Update existing settings
            Object.assign(settings, req.body);
        }
        await settings.save();
        res.json({
            success: true,
            data: settings,
            message: 'Settings updated successfully'
        });
    }
    catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update settings'
        });
    }
};
exports.updateSettings = updateSettings;
