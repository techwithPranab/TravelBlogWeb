"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const partnerController_1 = require("../controllers/partnerController");
const router = (0, express_1.Router)();
// Public routes
router.post('/', partnerController_1.createPartner);
// Admin routes (these would typically be protected with authentication middleware)
router.get('/', partnerController_1.getPartners);
router.get('/stats', partnerController_1.getPartnerStats);
router.get('/:id', partnerController_1.getPartnerById);
router.put('/:id/status', partnerController_1.updatePartnerStatus);
router.delete('/:id', partnerController_1.deletePartner);
exports.default = router;
