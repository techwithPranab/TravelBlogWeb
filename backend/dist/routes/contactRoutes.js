"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const contactController_1 = require("../controllers/contactController");
const adminAuth_1 = require("../middleware/adminAuth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// Validation rules for contact form
const contactValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('subject')
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Subject must be between 5 and 100 characters'),
    (0, express_validator_1.body)('message')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters')
];
// Public route for creating contact messages
router.post('/', contactValidation, validate_1.validate, contactController_1.createContact);
// Admin routes for managing contact messages (protected)
router.get('/', adminAuth_1.requireAdmin, contactController_1.getContacts);
router.get('/:id', adminAuth_1.requireAdmin, contactController_1.getContactById);
router.put('/:id/status', adminAuth_1.requireAdmin, contactController_1.updateContactStatus);
router.delete('/:id', adminAuth_1.requireAdmin, contactController_1.deleteContact);
exports.default = router;
