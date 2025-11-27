"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestSubscriber = createTestSubscriber;
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("../config/database");
const Newsletter_1 = __importDefault(require("../models/Newsletter"));
// Load environment variables
dotenv_1.default.config();
async function createTestSubscriber() {
    try {
        console.log('📬 Creating test newsletter subscriber...');
        // Connect to database
        await (0, database_1.connectDB)();
        console.log('✅ Database connected');
        // Check if test subscriber already exists
        const testEmail = process.env.ADMIN_EMAIL || 'test@example.com';
        const existingSubscriber = await Newsletter_1.default.findOne({ email: testEmail });
        if (existingSubscriber) {
            console.log(`⚠️ Test subscriber already exists: ${testEmail}`);
            console.log('Is active:', existingSubscriber.isActive);
            console.log('Is verified:', existingSubscriber.isVerified);
            // Update to ensure it's active
            existingSubscriber.isActive = true;
            existingSubscriber.isVerified = true;
            await existingSubscriber.save();
            console.log('✅ Updated existing subscriber to active status');
            return;
        }
        // Create new test subscriber
        const newSubscriber = new Newsletter_1.default({
            email: testEmail,
            name: 'Test Admin User',
            isActive: true,
            isVerified: true,
            subscribedAt: new Date(),
            preferences: {
                destinations: true,
                travelTips: true,
                photography: true,
                weeklyDigest: true
            },
            source: 'manual'
        });
        await newSubscriber.save();
        console.log(`✅ Created test newsletter subscriber: ${testEmail}`);
        console.log('Subscriber details:', {
            email: newSubscriber.email,
            name: newSubscriber.name,
            isActive: newSubscriber.isActive,
            isVerified: newSubscriber.isVerified
        });
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error creating test subscriber:', error);
        process.exit(1);
    }
}
// Run if called directly
if (require.main === module) {
    createTestSubscriber();
}
