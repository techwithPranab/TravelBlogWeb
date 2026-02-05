"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/:id', userController_1.getUser);
router.get('/:id/followers', userController_1.getUserFollowers);
router.get('/:id/following', userController_1.getUserFollowing);
router.get('/:id/stats', userController_1.getUserStats);
// Protected routes
router.put('/:id/avatar', auth_1.protect, userController_1.uploadAvatar);
router.put('/:id/follow', auth_1.protect, userController_1.followUser);
// Admin only routes
router.get('/', auth_1.protect, (0, auth_1.authorize)('admin'), userController_1.getUsers);
router.post('/', auth_1.protect, (0, auth_1.authorize)('admin'), userController_1.createUser);
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), userController_1.updateUser);
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), userController_1.deleteUser);
exports.default = router;
