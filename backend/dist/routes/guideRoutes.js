"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const guideController_1 = require("../controllers/guideController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/', guideController_1.getAllGuides);
router.get('/featured', guideController_1.getFeaturedGuides);
router.get('/destination/:destinationId', guideController_1.getGuidesByDestination);
router.get('/type/:type', guideController_1.getGuidesByType);
router.get('/:slug', guideController_1.getGuideBySlug);
// Protected routes
router.use(auth_1.protect);
router.post('/', (0, auth_1.restrictTo)('admin', 'contributor'), guideController_1.createGuide);
router.put('/:id', (0, auth_1.restrictTo)('admin', 'contributor'), guideController_1.updateGuide);
router.delete('/:id', (0, auth_1.restrictTo)('admin'), guideController_1.deleteGuide);
// Image upload route
router.post('/upload-image', auth_1.protect, (0, auth_1.restrictTo)('admin', 'contributor'), guideController_1.upload.single('image'), guideController_1.uploadGuideImage);
exports.default = router;
