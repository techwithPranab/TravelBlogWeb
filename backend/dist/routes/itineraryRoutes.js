"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const itineraryController_1 = require("../controllers/itineraryController");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = express_1.default.Router();
// Public route - view shared itinerary
router.get('/share/:token', itineraryController_1.getSharedItinerary);
// Protected routes - require authentication
router.use(auth_1.protect);
// Generate new itinerary (with rate limiting)
router.post('/', (0, rateLimiter_1.itineraryRateLimit)(), itineraryController_1.generateItinerary);
// Get user's itineraries
router.get('/', itineraryController_1.getUserItineraries);
// Get single itinerary
router.get('/:id', itineraryController_1.getItineraryById);
// Update itinerary form data (excluding source and destinations)
router.put('/:id/form-data', itineraryController_1.updateItineraryFormData);
// Update itinerary
router.put('/:id', itineraryController_1.updateItinerary);
// Delete itinerary
router.delete('/:id', itineraryController_1.deleteItinerary);
// Regenerate entire itinerary (with rate limiting)
router.post('/:id/regenerate', (0, rateLimiter_1.itineraryRateLimit)(), itineraryController_1.regenerateItinerary);
// Regenerate specific day
router.post('/:id/regenerate-day', itineraryController_1.regenerateDay);
// Download itinerary as PDF (premium feature)
router.get('/:id/download', itineraryController_1.downloadItineraryPDF);
// Email itinerary (premium feature)
router.post('/:id/email', itineraryController_1.emailItinerary);
exports.default = router;
