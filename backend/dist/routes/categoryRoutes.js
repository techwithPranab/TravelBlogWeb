"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/', categoryController_1.getAllCategories);
router.get('/:slug', categoryController_1.getCategoryBySlug);
// Protected routes (admin only)
router.use(auth_1.protect);
router.use((0, auth_1.restrictTo)('admin'));
router.post('/', categoryController_1.createCategory);
router.put('/:id', categoryController_1.updateCategory);
router.delete('/:id', categoryController_1.deleteCategory);
exports.default = router;
