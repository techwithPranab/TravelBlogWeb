"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = exports.getUserFollowing = exports.getUserFollowers = exports.followUser = exports.uploadAvatar = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUser = exports.getUsers = void 0;
const User_1 = __importDefault(require("@/models/User"));
// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sort = req.query.sort || '-createdAt';
        const role = req.query.role;
        const search = req.query.search;
        // Build query
        const query = {};
        if (role) {
            query.role = role;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (page - 1) * limit;
        const users = await User_1.default.find(query)
            .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken')
            .sort(sort)
            .skip(skip)
            .limit(limit);
        const total = await User_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            count: users.length,
            total,
            pagination: {
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: users
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.getUsers = getUsers;
// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Public
const getUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id)
            .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken');
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.getUser = getUser;
// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
const createUser = async (req, res) => {
    try {
        const user = await User_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.createUser = createUser;
// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
            bio: req.body.bio,
            avatar: req.body.avatar,
            socialLinks: req.body.socialLinks,
            isPremium: req.body.isPremium,
            isEmailVerified: req.body.isEmailVerified,
        };
        const user = await User_1.default.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
            new: true,
            runValidators: true,
        }).select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken');
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.updateUser = updateUser;
// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        await user.deleteOne();
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
exports.deleteUser = deleteUser;
// @desc    Upload user avatar
// @route   PUT /api/v1/users/:id/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        // Check if user is updating their own avatar or is admin
        if (req.params.id !== req.user?._id?.toString() && req.user?.role !== 'admin') {
            res.status(401).json({
                success: false,
                error: 'Not authorized to update this avatar'
            });
            return;
        }
        // Here you would handle file upload (e.g., using multer and cloudinary)
        // For now, we'll just update the avatar URL from the request body
        user.avatar = req.body.avatar;
        await user.save();
        res.status(200).json({
            success: true,
            data: {
                avatar: user.avatar
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
exports.uploadAvatar = uploadAvatar;
// @desc    Follow/Unfollow user
// @route   PUT /api/v1/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
    try {
        const userToFollow = await User_1.default.findById(req.params.id);
        const currentUser = await User_1.default.findById(req.user?._id);
        if (!userToFollow || !currentUser) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        if (userToFollow._id.toString() === currentUser._id.toString()) {
            res.status(400).json({
                success: false,
                error: 'You cannot follow yourself'
            });
            return;
        }
        const isFollowing = currentUser.following.includes(userToFollow._id);
        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollow._id.toString());
            userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUser._id.toString());
        }
        else {
            // Follow
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
        }
        await Promise.all([currentUser.save(), userToFollow.save()]);
        res.status(200).json({
            success: true,
            data: {
                following: !isFollowing,
                followersCount: userToFollow.followers.length,
                followingCount: currentUser.following.length
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
exports.followUser = followUser;
// @desc    Get user's followers
// @route   GET /api/v1/users/:id/followers
// @access  Public
const getUserFollowers = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id)
            .populate('followers', 'name avatar bio');
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            count: user.followers.length,
            data: user.followers
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.getUserFollowers = getUserFollowers;
// @desc    Get user's following
// @route   GET /api/v1/users/:id/following
// @access  Public
const getUserFollowing = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id)
            .populate('following', 'name avatar bio');
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            count: user.following.length,
            data: user.following
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.getUserFollowing = getUserFollowing;
// @desc    Get user statistics
// @route   GET /api/v1/users/:id/stats
// @access  Public
const getUserStats = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        // You could add more sophisticated stats here
        // For now, we'll return basic counts
        const stats = {
            followers: user.followers.length,
            following: user.following.length,
            joinedAt: user.createdAt,
            isPremium: user.isPremium,
            role: user.role
        };
        res.status(200).json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
exports.getUserStats = getUserStats;
