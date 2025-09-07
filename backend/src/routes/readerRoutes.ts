import { Router } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

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

export default router;
