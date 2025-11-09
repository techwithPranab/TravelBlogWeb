"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const photoController_1 = require("../controllers/photoController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', photoController_1.getPhotos);
router.get('/featured', photoController_1.getFeaturedPhotos);
router.get('/categories', photoController_1.getPhotoCategories);
router.get('/locations', photoController_1.getPhotoLocations);
router.get('/:id', photoController_1.getPhoto);
router.post('/', photoController_1.upload.single('photo'), photoController_1.submitPhoto);
router.put('/:id/like', photoController_1.likePhoto);
router.put('/:id/download', photoController_1.downloadPhoto);
// Admin routes
router.get('/admin/all', auth_1.protect, (0, auth_1.restrictTo)('admin'), photoController_1.getAllPhotosAdmin);
router.get('/admin/pending', auth_1.protect, (0, auth_1.restrictTo)('admin'), photoController_1.getPendingPhotos);
router.put('/admin/:id/moderate', auth_1.protect, (0, auth_1.restrictTo)('admin'), photoController_1.moderatePhoto);
router.delete('/admin/:id', auth_1.protect, (0, auth_1.restrictTo)('admin'), photoController_1.deletePhoto);
exports.default = router;
