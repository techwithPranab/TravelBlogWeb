"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailScheduler = void 0;
const cron = __importStar(require("node-cron"));
const emailService_1 = require("./emailService");
const Post_1 = __importDefault(require("../models/Post"));
const Newsletter_1 = __importDefault(require("../models/Newsletter"));
class EmailSchedulerService {
    constructor() {
        this.newsletterTask = null;
        this.isSchedulerRunning = false;
        // Auto-start scheduler if in production
        if (process.env.NODE_ENV === 'production') {
            this.startNewsletterScheduler();
        }
        else {
            console.log('Email scheduler not started in development mode. Use startNewsletterScheduler() to start manually.');
        }
    }
    /**
     * Start the weekly newsletter scheduler
     * Runs every Monday at 9:00 AM
     */
    startNewsletterScheduler() {
        if (this.newsletterTask) {
            console.log('Newsletter scheduler is already running');
            return;
        }
        // Schedule for Monday at 9:00 AM (0 9 * * 1)
        // In development, you can change this to run more frequently for testing
        const cronExpression = process.env.NODE_ENV === 'development'
            ? '*/30 * * * *' // Every 30 minutes for testing
            : '0 9 * * 1'; // Every Monday at 9 AM
        this.newsletterTask = cron.schedule(cronExpression, async () => {
            console.log('🕘 Starting scheduled weekly newsletter send...');
            try {
                await this.sendWeeklyNewsletter();
                console.log('✅ Weekly newsletter scheduler completed successfully');
            }
            catch (error) {
                console.error('❌ Weekly newsletter scheduler failed:', error);
            }
        }, {
            timezone: process.env.TIMEZONE || 'America/New_York'
        });
        this.isSchedulerRunning = true;
        console.log(`📅 Newsletter scheduler started - will run ${process.env.NODE_ENV === 'development' ? 'every 30 minutes' : 'every Monday at 9:00 AM'}`);
    }
    /**
     * Stop the newsletter scheduler
     */
    stopNewsletterScheduler() {
        if (this.newsletterTask) {
            this.newsletterTask.stop();
            this.newsletterTask = null;
            this.isSchedulerRunning = false;
            console.log('📅 Newsletter scheduler stopped');
        }
        else {
            console.log('Newsletter scheduler is not running');
        }
    }
    /**
     * Check if scheduler is running
     */
    isRunning() {
        return this.isSchedulerRunning;
    }
    /**
     * Manually send weekly newsletter (can be called from admin interface)
     */
    async sendWeeklyNewsletter() {
        try {
            console.log('📧 Starting weekly newsletter generation...');
            // Get date range for the last week
            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            console.log(`📅 Fetching posts published between ${oneWeekAgo.toISOString()} and ${now.toISOString()}`);
            // Get posts published in the last week
            const weeklyPosts = await Post_1.default.find({
                status: 'published',
                publishedAt: {
                    $gte: oneWeekAgo,
                    $lte: now
                }
            })
                .populate('author', 'name email')
                .populate('categories', 'name slug')
                .sort({ publishedAt: -1 })
                .limit(10); // Limit to top 10 posts
            console.log(`📝 Found ${weeklyPosts.length} posts published this week`);
            if (weeklyPosts.length === 0) {
                console.log('📭 No posts published this week, skipping newsletter');
                return;
            }
            // Get all active subscribers
            const subscribers = await Newsletter_1.default.find({
                status: 'subscribed',
                isActive: true
            });
            console.log(`📬 Found ${subscribers.length} active subscribers`);
            if (subscribers.length === 0) {
                console.log('📭 No active subscribers found, skipping newsletter');
                return;
            }
            // Transform posts for newsletter (cast to unknown first to avoid TS error)
            const transformedPosts = weeklyPosts.map(post => {
                const postObj = post.toObject();
                return {
                    ...postObj,
                    author: post.author || { _id: 'unknown', name: 'BagPackStories', email: '' },
                    categories: post.categories || []
                };
            });
            // Prepare newsletter data
            const newsletterData = {
                posts: transformedPosts,
                weekRange: {
                    start: oneWeekAgo,
                    end: now
                }
            };
            // Send newsletter
            console.log('📤 Sending weekly newsletter to subscribers...');
            const success = await emailService_1.emailService.sendWeeklyNewsletter(subscribers, newsletterData);
            if (success) {
                console.log('✅ Weekly newsletter sent successfully');
                // Log newsletter send in database (optional)
                await this.logNewsletterSend(weeklyPosts.length, subscribers.length);
            }
            else {
                console.error('❌ Failed to send weekly newsletter');
            }
        }
        catch (error) {
            console.error('❌ Error in sendWeeklyNewsletter:', error);
            throw error;
        }
    }
    /**
     * Log newsletter send for analytics (optional)
     */
    async logNewsletterSend(postsCount, subscribersCount) {
        try {
            // You can create a NewsletterLog model to track sends
            console.log(`📊 Newsletter sent: ${postsCount} posts to ${subscribersCount} subscribers at ${new Date().toISOString()}`);
            // Example log entry (implement NewsletterLog model if needed)
            /*
            await NewsletterLog.create({
              sentAt: new Date(),
              postsIncluded: postsCount,
              subscribersSent: subscribersCount,
              status: 'sent'
            });
            */
        }
        catch (error) {
            console.error('Error logging newsletter send:', error);
            // Don't throw here as it's not critical
        }
    }
    /**
     * Get newsletter statistics
     */
    async getNewsletterStats() {
        try {
            const totalSubscribers = await Newsletter_1.default.countDocuments();
            const activeSubscribers = await Newsletter_1.default.countDocuments({
                status: 'subscribed',
                isActive: true
            });
            const oneWeekAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
            const postsThisWeek = await Post_1.default.countDocuments({
                status: 'published',
                publishedAt: { $gte: oneWeekAgo }
            });
            return {
                totalSubscribers,
                activeSubscribers,
                postsThisWeek,
                // lastSent: // This would come from NewsletterLog if implemented
            };
        }
        catch (error) {
            console.error('Error getting newsletter stats:', error);
            return {
                totalSubscribers: 0,
                activeSubscribers: 0,
                postsThisWeek: 0
            };
        }
    }
    /**
     * Send test newsletter to admin (for testing)
     */
    async sendTestNewsletter() {
        try {
            console.log('🧪 Sending test newsletter...');
            const adminEmail = process.env.ADMIN_EMAIL;
            if (!adminEmail) {
                console.error('ADMIN_EMAIL not configured');
                return false;
            }
            // Get recent posts for test
            const recentPosts = await Post_1.default.find({
                status: 'published'
            })
                .populate('author', 'name email')
                .populate('categories', 'name slug')
                .sort({ publishedAt: -1 })
                .limit(3);
            if (recentPosts.length === 0) {
                console.log('No posts available for test newsletter');
                return false;
            }
            // Create test subscriber
            const testSubscriber = {
                _id: 'test-id',
                email: adminEmail,
                name: 'Test Admin',
                status: 'subscribed',
                isActive: true,
                isVerified: true,
                subscribedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            // Transform posts
            const transformedPosts = recentPosts.map(post => ({
                ...post.toObject(),
                author: post.author || { _id: 'unknown', name: 'BagPackStories', email: '' },
                categories: post.categories || []
            }));
            const newsletterData = {
                posts: transformedPosts,
                weekRange: {
                    start: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
                    end: new Date()
                }
            };
            const success = await emailService_1.emailService.sendWeeklyNewsletter([testSubscriber], newsletterData);
            if (success) {
                console.log('✅ Test newsletter sent successfully');
            }
            else {
                console.error('❌ Failed to send test newsletter');
            }
            return success;
        }
        catch (error) {
            console.error('Error sending test newsletter:', error);
            return false;
        }
    }
}
// Create singleton instance
exports.emailScheduler = new EmailSchedulerService();
// Export both the class and instance
exports.default = EmailSchedulerService;
