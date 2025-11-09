"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const destinationController_1 = require("../controllers/destinationController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/', destinationController_1.getAllDestinations);
router.get('/featured', destinationController_1.getFeaturedDestinations);
router.get('/popular', destinationController_1.getPopularDestinations);
router.get('/:slug', destinationController_1.getDestinationBySlug);
// Protected routes (admin only)
router.use(auth_1.protect);
router.use((0, auth_1.restrictTo)('admin'));
router.get('/admin/:id', destinationController_1.getDestinationById);
router.post('/', destinationController_1.createDestination);
router.put('/:id', destinationController_1.updateDestination);
router.delete('/:id', destinationController_1.deleteDestination);
router.post('/upload-image', destinationController_1.upload.single('image'), destinationController_1.uploadDestinationImage);
exports.default = router;
