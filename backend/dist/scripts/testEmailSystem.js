"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEmailSystem = testEmailSystem;
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("../config/database");
const emailService_1 = require("../services/emailService");
const emailScheduler_1 = require("../services/emailScheduler");
const EmailTemplate_1 = __importDefault(require("../models/EmailTemplate"));
// Load environment variables
dotenv_1.default.config();
async function testEmailSystem() {
    try {
        console.log('🧪 Starting comprehensive email system test...\n');
        // Connect to database
        await (0, database_1.connectDB)();
        console.log('✅ Database connected\n');
        // Test 1: Check if email templates exist
        console.log('📧 Test 1: Checking email templates...');
        const templates = await EmailTemplate_1.default.find();
        console.log(`Found ${templates.length} email templates:`);
        templates.forEach(template => {
            console.log(`  - ${template.name} (${template.key}) - Active: ${template.isActive}`);
        });
        console.log('');
        // Test 2: Test email configuration
        console.log('📧 Test 2: Testing email configuration...');
        const configTest = await emailService_1.emailService.testEmailConfig();
        console.log(`Email config test: ${configTest ? '✅ PASSED' : '❌ FAILED'}\n`);
        // Test 3: Test contributor submission notification
        console.log('📧 Test 3: Testing contributor submission notification...');
        const mockPost = {
            _id: 'test-post-id',
            title: 'Amazing Travel Adventure in Bali',
            excerpt: 'Discover the hidden gems of Bali through this incredible journey...',
            content: 'This is the full content of the post with many details about the amazing adventure...',
            slug: 'amazing-travel-adventure-bali',
            status: 'pending',
            categories: [{ name: 'Adventure Travel', slug: 'adventure' }],
            publishedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const mockContributor = {
            _id: 'test-user-id',
            name: 'John Traveler',
            email: process.env.ADMIN_EMAIL || 'test@example.com'
        };
        const submissionTest = await emailService_1.emailService.sendContributorSubmissionNotification(mockPost, mockContributor);
        console.log(`Contributor submission test: ${submissionTest ? '✅ PASSED' : '❌ FAILED'}\n`);
        // Test 4: Test post approval notification
        console.log('📧 Test 4: Testing post approval notification...');
        const approvalTest = await emailService_1.emailService.sendPostApprovedNotification(mockPost, mockContributor);
        console.log(`Post approval test: ${approvalTest ? '✅ PASSED' : '❌ FAILED'}\n`);
        // Test 5: Test newsletter functionality
        console.log('📧 Test 5: Testing newsletter system...');
        const newsletterStats = await emailScheduler_1.emailScheduler.getNewsletterStats();
        console.log('Newsletter statistics:');
        console.log(`  - Total subscribers: ${newsletterStats.totalSubscribers}`);
        console.log(`  - Active subscribers: ${newsletterStats.activeSubscribers}`);
        console.log(`  - Posts this week: ${newsletterStats.postsThisWeek}`);
        // Test newsletter send if there are posts and subscribers
        if (newsletterStats.postsThisWeek > 0 && newsletterStats.activeSubscribers > 0) {
            console.log('Testing newsletter send...');
            const newsletterTest = await emailScheduler_1.emailScheduler.sendTestNewsletter();
            console.log(`Newsletter test: ${newsletterTest ? '✅ PASSED' : '❌ FAILED'}`);
        }
        else {
            console.log('⚠️ Skipping newsletter test - no posts or subscribers available');
        }
        console.log('');
        // Test 6: Check scheduler status
        console.log('📧 Test 6: Checking email scheduler status...');
        const isRunning = emailScheduler_1.emailScheduler.isRunning();
        console.log(`Email scheduler running: ${isRunning ? '✅ YES' : '❌ NO'}\n`);
        // Environment check
        console.log('🔧 Environment Configuration Check:');
        console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
        console.log(`BREVO_USERNAME: ${process.env.BREVO_USERNAME ? '✅ SET' : '❌ NOT SET'}`);
        console.log(`BREVO_PASSWORD: ${process.env.BREVO_PASSWORD ? '✅ SET' : '❌ NOT SET'}`);
        console.log(`BREVO_SMTP_HOST: ${process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com (default)'}`);
        console.log(`BREVO_SMTP_PORT: ${process.env.BREVO_SMTP_PORT || '587 (default)'}`);
        console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL || 'Not set'}`);
        console.log(`FROM_NAME: ${process.env.FROM_NAME || 'Not set'}`);
        console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL ? '✅ SET' : '❌ NOT SET'}`);
        console.log(`SUPPORT_EMAIL: ${process.env.SUPPORT_EMAIL || 'Not set'}`);
        console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'Not set'}`);
        console.log('\n🎉 Email system test completed!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Email system test failed:', error);
        process.exit(1);
    }
}
// Run the test
if (require.main === module) {
    testEmailSystem();
}
