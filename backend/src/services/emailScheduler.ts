import * as cron from 'node-cron';
import { emailService, PopulatedPost } from './emailService';
import Post from '../models/Post';
import Newsletter from '../models/Newsletter';
import { INewsletter } from '../models/Newsletter';
import User from '../models/User';
import Category from '../models/Category';

interface SchedulerService {
  startNewsletterScheduler(): void;
  stopNewsletterScheduler(): void;
  sendWeeklyNewsletter(): Promise<void>;
  isRunning(): boolean;
}

class EmailSchedulerService implements SchedulerService {
  private newsletterTask: cron.ScheduledTask | null = null;
  private isSchedulerRunning = false;

  constructor() {
    // Auto-start scheduler if in production
    if (process.env.NODE_ENV === 'production') {
      this.startNewsletterScheduler();
    } else {
      console.log('Email scheduler not started in development mode. Use startNewsletterScheduler() to start manually.');
    }
  }

  /**
   * Start the weekly newsletter scheduler
   * Runs every Monday at 9:00 AM
   */
  startNewsletterScheduler(): void {
    if (this.newsletterTask) {
      console.log('Newsletter scheduler is already running');
      return;
    }

    // Schedule for Monday at 9:00 AM (0 9 * * 1)
    // In development, you can change this to run more frequently for testing
    const cronExpression = process.env.NODE_ENV === 'development' 
      ? '*/30 * * * *' // Every 30 minutes for testing
      : '0 9 * * 1';   // Every Monday at 9 AM

    this.newsletterTask = cron.schedule(cronExpression, async () => {
      console.log('🕘 Starting scheduled weekly newsletter send...');
      try {
        await this.sendWeeklyNewsletter();
        console.log('✅ Weekly newsletter scheduler completed successfully');
      } catch (error) {
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
  stopNewsletterScheduler(): void {
    if (this.newsletterTask) {
      this.newsletterTask.stop();
      this.newsletterTask = null;
      this.isSchedulerRunning = false;
      console.log('📅 Newsletter scheduler stopped');
    } else {
      console.log('Newsletter scheduler is not running');
    }
  }

  /**
   * Check if scheduler is running
   */
  isRunning(): boolean {
    return this.isSchedulerRunning;
  }

  /**
   * Manually send weekly newsletter (can be called from admin interface)
   */
  async sendWeeklyNewsletter(): Promise<void> {
    try {
      console.log('📧 Starting weekly newsletter generation...');

      // Get date range for the last week
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

      console.log(`📅 Fetching posts published between ${oneWeekAgo.toISOString()} and ${now.toISOString()}`);

      // Get posts published in the last week
      const weeklyPosts = await Post.find({
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
      const subscribers = await Newsletter.find({
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
          author: (post.author as any) || { _id: 'unknown', name: 'BagPackStories', email: '' },
          categories: (post.categories as any) || []
        };
      }) as unknown as PopulatedPost[];

      // Prepare newsletter data
      const newsletterData = {
        posts: transformedPosts,
        weekRange: {
          start: oneWeekAgo,
          end: now
        }
      };

      // Send newsletter
      console.log('� Email Scheduler: Sending weekly newsletter to subscribers');
      console.log('📧 Newsletter details:', {
        postsCount: weeklyPosts.length,
        subscribersCount: subscribers.length,
        weekRange: {
          start: oneWeekAgo.toISOString(),
          end: now.toISOString()
        }
      });
      const success = await emailService.sendWeeklyNewsletter(subscribers, newsletterData);

      if (success) {
        console.log('✅ Email Scheduler: Weekly newsletter sent successfully');
        
        // Log newsletter send in database (optional)
        await this.logNewsletterSend(weeklyPosts.length, subscribers.length);
      } else {
        console.error('❌ Email Scheduler: Failed to send weekly newsletter');
      }

    } catch (error) {
      console.error('❌ Error in sendWeeklyNewsletter:', error);
      throw error;
    }
  }

  /**
   * Log newsletter send for analytics (optional)
   */
  private async logNewsletterSend(postsCount: number, subscribersCount: number): Promise<void> {
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
    } catch (error) {
      console.error('Error logging newsletter send:', error);
      // Don't throw here as it's not critical
    }
  }

  /**
   * Get newsletter statistics
   */
  async getNewsletterStats(): Promise<{
    totalSubscribers: number;
    activeSubscribers: number;
    postsThisWeek: number;
    lastSent?: Date;
  }> {
    try {
      const totalSubscribers = await Newsletter.countDocuments();
      const activeSubscribers = await Newsletter.countDocuments({ 
        status: 'subscribed', 
        isActive: true 
      });

      const oneWeekAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
      const postsThisWeek = await Post.countDocuments({
        status: 'published',
        publishedAt: { $gte: oneWeekAgo }
      });

      return {
        totalSubscribers,
        activeSubscribers,
        postsThisWeek,
        // lastSent: // This would come from NewsletterLog if implemented
      };
    } catch (error) {
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
  async sendTestNewsletter(): Promise<boolean> {
    try {
      console.log('🧪 Email Scheduler: Starting test newsletter process');
      
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        console.error('❌ Email Scheduler: ADMIN_EMAIL not configured');
        return false;
      }

      console.log('🧪 Email Scheduler: Fetching recent posts for test newsletter');
      // Get recent posts for test
      const recentPosts = await Post.find({
        status: 'published'
      })
      .populate('author', 'name email')
      .populate('categories', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(3);

      if (recentPosts.length === 0) {
        console.log('🧪 Email Scheduler: No posts available for test newsletter');
        return false;
      }

      console.log('🧪 Email Scheduler: Creating test subscriber and newsletter data');
      // Create test subscriber
      const testSubscriber = {
        _id: 'test-id',
        email: adminEmail,
        name: 'Test Admin',
        status: 'subscribed' as const,
        isActive: true,
        isVerified: true,
        subscribedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      } as unknown as INewsletter;

      // Transform posts
      const transformedPosts = recentPosts.map(post => ({
        ...post.toObject(),
        author: (post.author as any) || { _id: 'unknown', name: 'BagPackStories', email: '' },
        categories: (post.categories as any) || []
      })) as unknown as PopulatedPost[];

      const newsletterData = {
        posts: transformedPosts,
        weekRange: {
          start: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)),
          end: new Date()
        }
      };

      console.log('📧 Email Scheduler: Sending test newsletter');
      console.log('📧 Test newsletter details:', {
        postsCount: recentPosts.length,
        testEmail: adminEmail,
        weekRange: newsletterData.weekRange
      });
      const success = await emailService.sendWeeklyNewsletter([testSubscriber], newsletterData);
      
      if (success) {
        console.log('✅ Email Scheduler: Test newsletter sent successfully');
      } else {
        console.error('❌ Email Scheduler: Failed to send test newsletter');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Email Scheduler: Error sending test newsletter:', error);
      return false;
    }
  }
}

// Create singleton instance
export const emailScheduler = new EmailSchedulerService();

// Export both the class and instance
export default EmailSchedulerService;
