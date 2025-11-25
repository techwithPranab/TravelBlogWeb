"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPostImage = exports.unifiedSearch = exports.getPopularPosts = exports.getFeaturedPosts = exports.getPostsByCategory = exports.addComment = exports.likePost = exports.deletePost = exports.updatePost = exports.createPost = exports.getPost = exports.getPosts = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const drive_1 = require("../config/drive");
const sharp_1 = __importDefault(require("sharp"));
const Destination_1 = __importDefault(require("../models/Destination"));
const Guide_1 = __importDefault(require("../models/Guide"));
const Photo_1 = __importDefault(require("../models/Photo"));
// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || '-createdAt';
        const category = req.query.category;
        const search = req.query.search;
        const tags = req.query.tags;
        const status = req.query.status || 'published';
        // Build query
        const query = { status };
        if (category) {
            query.category = category;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }
        if (tags) {
            const tagArray = tags.split(',');
            query.tags = { $in: tagArray };
        }
        const skip = (page - 1) * limit;
        const posts = await Post_1.default.find(query)
            .populate('author', 'name avatar email')
            .sort(sort)
            .skip(skip)
            .limit(limit);
        const total = await Post_1.default.countDocuments(query);
        // Ensure author object exists on each post
        const transformedPosts = posts.map((p) => {
            const obj = p.toObject ? p.toObject() : p;
            if (!obj.author) {
                obj.author = { name: 'Unknown Author', avatar: '/images/default-avatar.jpg' };
            }
            return obj;
        });
        console.log('Debug: transformedPosts[0].author=', transformedPosts[0]?.author);
        res.status(200).json({
            success: true,
            count: posts.length,
            total,
            pagination: {
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: transformedPosts
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.getPosts = getPosts;
// @desc    Get single post
// @route   GET /api/posts/:identifier
// @access  Public
const getPost = async (req, res) => {
    try {
        const { identifier } = req.params;
        // Check if identifier is a valid ObjectId
        const isValidObjectId = /^[a-f\d]{24}$/i.test(identifier);
        let query = { status: 'published' };
        if (isValidObjectId) {
            // If it's a valid ObjectId, search by _id
            query._id = identifier;
        }
        else {
            // If it's not a valid ObjectId, search by slug
            query.slug = identifier;
        }
        const post = await Post_1.default.findOne(query)
            .populate('author', 'name avatar email bio socialLinks')
            .populate('categories', 'name slug');
        if (!post) {
            res.status(404).json({
                success: false,
                error: 'Post not found'
            });
            return;
        }
        // Ensure author fallback
        const postObj = post.toObject ? post.toObject() : post;
        if (!postObj.author) {
            postObj.author = { name: 'Unknown Author', avatar: '/images/default-avatar.jpg' };
        }
        // Increment view count
        post.viewCount = (post.viewCount || 0) + 1;
        await post.save();
        res.status(200).json({
            success: true,
            data: postObj
        });
    }
    catch (error) {
        console.error('Error in getPost:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.getPost = getPost;
// @desc    Create new post
// @route   POST /api/posts
// @access  Private (Author/Admin)
const createPost = async (req, res) => {
    try {
        // Add author to req.body
        req.body.author = req.user?._id;
        const post = await Post_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: post
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.createPost = createPost;
// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (Author/Admin)
const updatePost = async (req, res) => {
    try {
        let post = await Post_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).json({
                success: false,
                error: 'Post not found'
            });
            return;
        }
        // Make sure user is post owner or admin
        if (post.author.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
            res.status(401).json({
                success: false,
                error: 'Not authorized to update this post'
            });
            return;
        }
        post = await Post_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            success: true,
            data: post
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.updatePost = updatePost;
// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (Author/Admin)
const deletePost = async (req, res) => {
    try {
        const post = await Post_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).json({
                success: false,
                error: 'Post not found'
            });
            return;
        }
        // Make sure user is post owner or admin
        if (post.author.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
            res.status(401).json({
                success: false,
                error: 'Not authorized to delete this post'
            });
            return;
        }
        await post.deleteOne();
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.deletePost = deletePost;
// @desc    Like/Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
    try {
        const post = await Post_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).json({
                success: false,
                error: 'Post not found'
            });
            return;
        }
        const userId = req.user?._id?.toString();
        const likeIndex = post.likes.findIndex(like => like.toString() === userId);
        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        }
        else {
            // Like
            post.likes.push(req.user?._id);
        }
        await post.save();
        res.status(200).json({
            success: true,
            data: {
                likes: post.likes.length,
                liked: likeIndex === -1
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.likePost = likePost;
// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
    try {
        const post = await Post_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).json({
                success: false,
                error: 'Post not found'
            });
            return;
        }
        const comment = {
            user: req.user?._id,
            content: req.body.content,
            createdAt: new Date()
        };
        post.comments.push(comment);
        await post.save();
        // Populate the new comment
        await post.populate('comments.user', 'name avatar');
        res.status(201).json({
            success: true,
            data: post.comments[post.comments.length - 1]
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.addComment = addComment;
// @desc    Get posts by category
// @route   GET /api/posts/category/:category
// @access  Public
const getPostsByCategory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const posts = await Post_1.default.find({
            category: req.params.category,
            status: 'published'
        })
            .populate('author', 'name avatar email')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);
        const total = await Post_1.default.countDocuments({
            category: req.params.category,
            status: 'published'
        });
        const transformedPosts = posts.map(p => {
            const obj = p.toObject ? p.toObject() : p;
            if (!obj.author)
                obj.author = { name: 'Unknown Author', avatar: '/images/default-avatar.jpg' };
            return obj;
        });
        res.status(200).json({
            success: true,
            count: posts.length,
            total,
            pagination: {
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: transformedPosts
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.getPostsByCategory = getPostsByCategory;
// @desc    Get featured posts
// @route   GET /api/posts/featured
// @access  Public
const getFeaturedPosts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const posts = await Post_1.default.find({
            isFeatured: true,
            status: 'published'
        })
            .populate('author', 'name avatar email')
            .populate('categories', 'name slug')
            .sort('-publishedAt -createdAt')
            .limit(limit);
        const transformedPosts = posts.map(p => {
            const obj = p.toObject ? p.toObject() : p;
            if (!obj.author)
                obj.author = { name: 'Unknown Author', avatar: '/images/default-avatar.jpg' };
            return obj;
        });
        res.status(200).json({
            success: true,
            count: posts.length,
            data: transformedPosts
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.getFeaturedPosts = getFeaturedPosts;
// @desc    Get popular posts
// @route   GET /api/posts/popular
// @access  Public
const getPopularPosts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const posts = await Post_1.default.find({
            status: 'published'
        })
            .populate('author', 'name avatar email')
            .sort('-views -likes')
            .limit(limit);
        const transformedPosts = posts.map(p => {
            const obj = p.toObject ? p.toObject() : p;
            if (!obj.author)
                obj.author = { name: 'Unknown Author', avatar: '/images/default-avatar.jpg' };
            return obj;
        });
        res.status(200).json({
            success: true,
            count: posts.length,
            data: transformedPosts
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.getPopularPosts = getPopularPosts;
// @desc    Unified search across posts, destinations, guides, and photos
// @route   GET /api/posts/unified-search
// @access  Public
const unifiedSearch = async (req, res) => {
    try {
        const { q: searchQuery, limit = 10 } = req.query;
        if (!searchQuery || typeof searchQuery !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
            return;
        }
        const searchLimit = Math.min(Number(limit), 50); // Cap at 50 results per type
        // Search posts
        const posts = await Post_1.default.find({
            status: 'published',
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { excerpt: { $regex: searchQuery, $options: 'i' } },
                { content: { $regex: searchQuery, $options: 'i' } },
                { tags: { $in: [new RegExp(searchQuery, 'i')] } }
            ]
        })
            .populate('author', 'name avatar')
            .populate('categories', 'name slug color')
            .sort('-createdAt')
            .limit(searchLimit)
            .select('title slug excerpt featuredImage author categories publishedAt readTime');
        // Search destinations
        const destinations = await Destination_1.default.find({
            isActive: true,
            status: 'published',
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { country: { $regex: searchQuery, $options: 'i' } },
                { continent: { $regex: searchQuery, $options: 'i' } },
                { highlights: { $in: [new RegExp(searchQuery, 'i')] } }
            ]
        })
            .sort('-createdAt')
            .limit(searchLimit)
            .select('name slug description country continent featuredImage rating totalReviews');
        // Search guides
        const guides = await Guide_1.default.find({
            isPublished: true,
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { content: { $regex: searchQuery, $options: 'i' } },
                { tags: { $in: [new RegExp(searchQuery, 'i')] } },
                { type: { $regex: searchQuery, $options: 'i' } },
                { difficulty: { $regex: searchQuery, $options: 'i' } }
            ]
        })
            .sort('-publishedAt')
            .limit(searchLimit)
            .select('title slug description type difficulty rating totalReviews featuredImage publishedAt');
        // Search photos
        const photos = await Photo_1.default.find({
            status: 'approved',
            isPublic: true,
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
                { tags: { $in: [new RegExp(searchQuery, 'i')] } },
                { category: { $regex: searchQuery, $options: 'i' } },
                { 'location.country': { $regex: searchQuery, $options: 'i' } },
                { 'location.city': { $regex: searchQuery, $options: 'i' } },
                { 'photographer.name': { $regex: searchQuery, $options: 'i' } }
            ]
        })
            .sort('-submittedAt')
            .limit(searchLimit)
            .select('title description imageUrl thumbnailUrl category location photographer tags submittedAt');
        const transformedPosts = posts.map(p => {
            const obj = p.toObject ? p.toObject() : p;
            if (!obj.author)
                obj.author = { name: 'Unknown Author', avatar: '/images/default-avatar.jpg' };
            return obj;
        });
        const results = {
            posts: {
                count: posts.length,
                data: transformedPosts
            },
            destinations: {
                count: destinations.length,
                data: destinations
            },
            guides: {
                count: guides.length,
                data: guides
            },
            photos: {
                count: photos.length,
                data: photos
            },
            total: posts.length + destinations.length + guides.length + photos.length
        };
        res.status(200).json({
            success: true,
            query: searchQuery,
            data: results
        });
    }
    catch (error) {
        console.error('Unified search error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Search failed'
        });
    }
};
exports.unifiedSearch = unifiedSearch;
// @desc    Upload image for blog post
// @route   POST /api/posts/upload-image
// @access  Private
const uploadPostImage = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                error: 'No image file provided'
            });
            return;
        }
        // Process image with sharp
        const processedImage = await (0, sharp_1.default)(req.file.buffer)
            .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
        // Generate unique filename
        const timestamp = Date.now();
        const originalName = req.file.originalname.replace(/\.[^/.]+$/, "");
        const fileName = `TravelBlog/posts/${timestamp}-${originalName}.jpg`;
        // Upload to Cloudinary
        const result = await (0, drive_1.uploadBufferToCloudinary)(processedImage, fileName, 'TravelBlog/posts');
        res.status(200).json({
            success: true,
            data: {
                url: result.url,
                publicId: result.public_id
            }
        });
    }
    catch (error) {
        console.error('Error uploading post image:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to upload image'
        });
    }
};
exports.uploadPostImage = uploadPostImage;
