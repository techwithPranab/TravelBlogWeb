import { Router } from 'express';
import {
  getPhotos,
  getPhoto,
  submitPhoto,
  likePhoto,
  downloadPhoto,
  getPhotoCategories,
  getPhotoLocations,
  getFeaturedPhotos,
  getPendingPhotos,
  moderatePhoto,
  deletePhoto
} from '../controllers/photoController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getPhotos);
router.get('/featured', getFeaturedPhotos);
router.get('/categories', getPhotoCategories);
router.get('/locations', getPhotoLocations);
router.get('/:id', getPhoto);
router.post('/', submitPhoto);
router.put('/:id/like', likePhoto);
router.put('/:id/download', downloadPhoto);

// Admin routes
router.get('/admin/pending', protect, restrictTo('admin'), getPendingPhotos);
router.put('/admin/:id/moderate', protect, restrictTo('admin'), moderatePhoto);
router.delete('/admin/:id', protect, restrictTo('admin'), deletePhoto);

export default router;
