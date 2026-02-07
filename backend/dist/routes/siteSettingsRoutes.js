"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const siteSettingsController_1 = require("../controllers/siteSettingsController");
const router = (0, express_1.Router)();
// Public route to get site settings (for homepage feature toggles)
router.get('/', siteSettingsController_1.getSiteSettings);
exports.default = router;
