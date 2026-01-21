import { Router } from 'express';
import { protect } from '../middleware/auth';
import { 
  getReaderDashboard,
  getReaderProfile,
  updateReaderProfile,
  uploadReaderAvatar,
  getReadingHistory,
  getPersonalizedRecommendations
} from '../controllers/readerController';
import multer from 'multer';

const router = Router();

// Configure multer for avatar uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for avatars
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Test Cloudinary connection (no auth required for testing)
router.get('/test-cloudinary', async (req, res) => {
  try {
    const { testCloudinaryConnection } = await import('../config/drive');
    const result = await testCloudinaryConnection();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// All routes below require authentication
router.use(protect);

// Dashboard routes
router.get('/dashboard', getReaderDashboard);

// Profile routes
router.get('/profile', getReaderProfile);
router.put('/profile', updateReaderProfile);
router.post('/avatar', upload.single('avatar'), uploadReaderAvatar);

// Reading history and recommendations
router.get('/history', getReadingHistory);
router.get('/recommendations', getPersonalizedRecommendations);

export default router;
