"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const resourceController_1 = require("../controllers/resourceController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/', resourceController_1.getAllResources);
router.get('/featured', resourceController_1.getFeaturedResources);
router.get('/category/:category', resourceController_1.getResourcesByCategory);
router.get('/:slug', resourceController_1.getResourceBySlug);
router.post('/:id/click', resourceController_1.trackResourceClick);
// Protected routes
router.use(auth_1.protect);
router.post('/', (0, auth_1.restrictTo)('admin', 'contributor'), resourceController_1.createResource);
router.put('/:id', (0, auth_1.restrictTo)('admin', 'contributor'), resourceController_1.updateResource);
router.delete('/:id', (0, auth_1.restrictTo)('admin'), resourceController_1.deleteResource);
exports.default = router;
