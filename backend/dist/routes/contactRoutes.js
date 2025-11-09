"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contactController_1 = require("../controllers/contactController");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
// Public route for creating contact messages
router.post('/', contactController_1.createContact);
// Admin routes for managing contact messages (protected)
router.get('/', adminAuth_1.requireAdmin, contactController_1.getContacts);
router.get('/:id', adminAuth_1.requireAdmin, contactController_1.getContactById);
router.put('/:id/status', adminAuth_1.requireAdmin, contactController_1.updateContactStatus);
router.delete('/:id', adminAuth_1.requireAdmin, contactController_1.deleteContact);
exports.default = router;
