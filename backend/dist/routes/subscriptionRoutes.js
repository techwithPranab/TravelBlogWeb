"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscriptionController_1 = require("../controllers/subscriptionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.protect);
// GET /api/subscriptions/status - Get current subscription status
router.get('/status', subscriptionController_1.getSubscriptionStatus);
// GET /api/subscriptions/usage - Get usage statistics
router.get('/usage', subscriptionController_1.getUsageStats);
// POST /api/subscriptions/upgrade - Upgrade to premium
router.post('/upgrade', subscriptionController_1.upgradeSubscription);
// POST /api/subscriptions/cancel - Cancel subscription
router.post('/cancel', subscriptionController_1.cancelSubscription);
exports.default = router;
