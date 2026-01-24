import { IPost } from '../models/Post';
import { IUser } from '../models/User';
import { INewsletter } from '../models/Newsletter';
import EmailTemplate, { IEmailTemplate } from '../models/EmailTemplate';
import SiteSettings from '../models/SiteSettings';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  type: 'contributor_submission' | 'post_approved' | 'newsletter' | 'custom';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PopulatedPost extends Omit<IPost, 'author' | 'categories'> {
  author: { _id: string; name: string; email: string };
  categories: { _id: string; name: string; slug: string }[];
}

export interface NewsletterData {
  posts: PopulatedPost[];
  weekRange: {
    start: Date;
    end: Date;
  };
}

interface BrevoEmailRecipient {
  email: string;
  name?: string;
}

interface BrevoSender {
  email: string;
  name?: string;
}

interface BrevoEmailRequest {
  sender: BrevoSender;
  to: BrevoEmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

// Helper function to get email addresses from site settings
async function getEmailsFromSiteSettings(): Promise<{
  supportEmail: string;
  contactEmail: string;
  fromEmail: string;
}> {
  try {
    const siteSettings = await SiteSettings.findOne();
    return {
      supportEmail: siteSettings?.supportEmail || process.env.SUPPORT_EMAIL || 'support@bagpackstories.in',
      contactEmail: siteSettings?.contactEmail || process.env.CONTACT_EMAIL || 'hello@bagpackstories.in',
      fromEmail: siteSettings?.emailSettings?.fromEmail || process.env.FROM_EMAIL || 'noreply@bagpackstories.in'
    };
  } catch (error) {
    console.error('Error fetching site settings for emails:', error);
    return {
      supportEmail: process.env.SUPPORT_EMAIL || 'support@bagpackstories.in',
      contactEmail: process.env.CONTACT_EMAIL || 'hello@bagpackstories.in',
      fromEmail: process.env.FROM_EMAIL || 'noreply@bagpackstories.in'
    };
  }
}

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private readonly smtpConfig: SMTPConfig;
  private readonly transporter?: Transporter;
  
  constructor() {
    // Check if username/password are configured for SMTP
    const brevoUsername = process.env.BREVO_USERNAME;
    const brevoPassword = process.env.BREVO_PASSWORD;
    console.log('📧 [EMAIL SERVICE] Initializing email service...');
    console.log('📧 [EMAIL SERVICE] BREVO_USERNAME:', brevoUsername);
    if (brevoUsername && brevoPassword) {
      // Configure SMTP with username/password
      this.smtpConfig = {
        host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
        secure: process.env.BREVO_SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: brevoUsername,
          pass: brevoPassword
        }
      };
      
      // Create nodemailer transporter
      this.transporter = nodemailer.createTransport(this.smtpConfig);
      console.log('✅ [EMAIL SERVICE] Email service initialized with SMTP (username/password)');
      console.log('📧 [EMAIL SERVICE] SMTP Config:', {
        host: this.smtpConfig.host,
        port: this.smtpConfig.port,
        secure: this.smtpConfig.secure,
        hasAuth: !!this.smtpConfig.auth?.user
      });
    } else {
      this.smtpConfig = {} as SMTPConfig;
      console.warn('⚠️ [EMAIL SERVICE] BREVO_USERNAME/BREVO_PASSWORD is not configured. Email service will not work.');
    }
  }

  private async sendEmail(emailData: BrevoEmailRequest): Promise<boolean> {
    try {
      console.log('📧 [EMAIL SERVICE] Starting email send process...');
      
      if (!this.transporter) {
        console.error('❌ [EMAIL SERVICE] SMTP transporter is not configured');
        return false;
      }

      console.log('📧 [EMAIL SERVICE] Email details:', {
        from: emailData.sender.email,
        to: emailData.to.map(r => r.email),
        subject: emailData.subject,
        smtpHost: this.smtpConfig.host,
        smtpPort: this.smtpConfig.port
      });

      // Convert BrevoEmailRequest format to nodemailer format
      const mailOptions = {
        from: {
          name: emailData.sender.name || process.env.FROM_NAME || 'BagPackStories',
          address: emailData.sender.email
        },
        to: emailData.to.map(recipient => ({
          name: recipient.name || '',
          address: recipient.email
        })),
        subject: emailData.subject,
        html: emailData.htmlContent,
        text: emailData.textContent
      };

      console.log('📧 [EMAIL SERVICE] Sending email via SMTP...');
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ [EMAIL SERVICE] Email sent successfully via SMTP:', {
        messageId: result.messageId,
        envelope: result.envelope,
        accepted: result.accepted,
        rejected: result.rejected,
        pending: result.pending
      });
      
      return true;
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Error sending email via SMTP:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        emailData: {
          to: emailData.to.map(r => r.email),
          subject: emailData.subject
        }
      });
      return false;
    }
  }

  private async getTemplate(key: string): Promise<IEmailTemplate | null> {
    try {
      console.log(`📧 [TEMPLATE] Fetching email template: ${key}`);
      const template = await EmailTemplate.findOne({ key, isActive: true });
      
      if (template) {
        console.log(`✅ [TEMPLATE] Template '${key}' found and active`);
      } else {
        console.log(`❌ [TEMPLATE] Template '${key}' not found or inactive`);
      }
      
      return template;
    } catch (error) {
      console.error(`❌ [TEMPLATE] Failed to fetch template ${key}:`, error);
      return null;
    }
  }

  private getDefaultTemplates(): Record<string, EmailTemplate> {
    return {
      contributor_submission: {
        id: 'contributor_submission',
        name: 'New Post Submission for Review',
        subject: 'New Post Submitted: {{postTitle}} - BagPackStories',
        htmlContent: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📝 New Post Submission</h1>
              <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">A new post has been submitted for review</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="margin-bottom: 25px;">
                <h2 style="color: #2d3748; margin: 0 0 15px; font-size: 24px;">{{postTitle}}</h2>
                <p style="color: #4a5568; line-height: 1.6; margin: 0;">{{postExcerpt}}</p>
              </div>
              
              <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #2d3748; margin: 0 0 15px; font-size: 18px;">Submission Details</h3>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Author:</strong> {{contributorName}} ({{contributorEmail}})</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Category:</strong> {{postCategory}}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Submitted:</strong> {{submissionDate}}</p>
                <p style="margin: 5px 0; color: #4a5568;"><strong>Word Count:</strong> {{wordCount}} words</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{reviewUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px; transition: transform 0.2s;">
                  Review Post →
                </a>
              </div>
              
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                <p style="color: #718096; font-size: 14px; margin: 0; text-align: center;">
                  This is an automated notification from BagPackStories Admin System
                </p>
              </div>
            </div>
          </div>
        `,
        textContent: `
New Post Submission - BagPackStories

Title: {{postTitle}}
Author: {{contributorName}} ({{contributorEmail}})
Category: {{postCategory}}
Submitted: {{submissionDate}}
Word Count: {{wordCount}} words

Excerpt:
{{postExcerpt}}

Review the post at: {{reviewUrl}}

---
BagPackStories Admin System
        `,
        variables: ['postTitle', 'postExcerpt', 'contributorName', 'contributorEmail', 'postCategory', 'submissionDate', 'wordCount', 'reviewUrl'],
        type: 'contributor_submission',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      post_approved: {
        id: 'post_approved',
        name: 'Post Approved Notification',
        subject: '🎉 Your post "{{postTitle}}" has been approved! - BagPackStories',
        htmlContent: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f9ff;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 Congratulations!</h1>
              <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your post has been approved and published</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="margin-bottom: 25px;">
                <h2 style="color: #065f46; margin: 0 0 15px; font-size: 24px;">{{postTitle}}</h2>
                <p style="color: #047857; line-height: 1.6; margin: 0; font-size: 16px;">
                  Great news! Your post has been reviewed and approved by our editorial team. It's now live on BagPackStories and ready to inspire fellow travelers!
                </p>
              </div>
              
              <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #065f46; margin: 0 0 15px; font-size: 18px;">Publication Details</h3>
                <p style="margin: 5px 0; color: #047857;"><strong>Published:</strong> {{publishedDate}}</p>
                <p style="margin: 5px 0; color: #047857;"><strong>Category:</strong> {{postCategory}}</p>
                <p style="margin: 5px 0; color: #047857;"><strong>Views:</strong> {{viewCount}} views</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{postUrl}}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px; margin-right: 10px;">
                  View Your Post →
                </a>
                <a href="{{shareUrl}}" style="background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                  Share It →
                </a>
              </div>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #2d3748; margin: 0 0 10px; font-size: 16px;">What's Next?</h3>
                <ul style="color: #4a5568; margin: 10px 0; padding-left: 20px;">
                  <li>Share your post on social media to reach more readers</li>
                  <li>Engage with readers in the comments section</li>
                  <li>Start working on your next travel story</li>
                  <li>Join our contributor community for tips and networking</li>
                </ul>
              </div>
              
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center;">
                <p style="color: #718096; font-size: 14px; margin: 0;">
                  Thank you for contributing to BagPackStories!<br>
                  <a href="mailto:{{supportEmail}}" style="color: #3b82f6;">Contact us</a> if you have any questions.
                </p>
              </div>
            </div>
          </div>
        `,
        textContent: `
Congratulations! Your post has been approved - BagPackStories

Title: {{postTitle}}
Published: {{publishedDate}}
Category: {{postCategory}}

Your post has been reviewed and approved by our editorial team. It's now live on BagPackStories!

View your post: {{postUrl}}
Share it: {{shareUrl}}

What's Next?
- Share your post on social media
- Engage with readers in comments
- Start working on your next story
- Join our contributor community

Thank you for contributing to BagPackStories!
Contact us at {{supportEmail}} for any questions.
        `,
        variables: ['postTitle', 'publishedDate', 'postCategory', 'postUrl', 'shareUrl', 'viewCount', 'supportEmail'],
        type: 'post_approved',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      newsletter: {
        id: 'newsletter',
        name: 'Weekly Newsletter',
        subject: '🌟 This Week in Travel: {{weeklyPostCount}} New Stories from BagPackStories',
        htmlContent: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🌟 This Week in Travel</h1>
              <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">{{weekRange}} • {{weeklyPostCount}} New Stories</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                Hello {{subscriberName}}! 👋<br><br>
                Another amazing week of travel stories has passed, and we're excited to share the best content from our community of travelers. From hidden gems to practical tips, here's what caught our attention this week.
              </p>
              
              <div style="margin: 30px 0;">
                <h2 style="color: #2d3748; margin: 0 0 20px; font-size: 22px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                  ✨ Featured Stories
                </h2>
                {{featuredPosts}}
              </div>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                <h3 style="color: #1e40af; margin: 0 0 15px; font-size: 18px;">🎯 Trending This Week</h3>
                <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
                  <div style="margin: 5px;">
                    <span style="background: #dbeafe; color: #1e40af; padding: 5px 12px; border-radius: 15px; font-size: 14px;">
                      📍 {{trendingDestination}}
                    </span>
                  </div>
                  <div style="margin: 5px;">
                    <span style="background: #dcfce7; color: #166534; padding: 5px 12px; border-radius: 15px; font-size: 14px;">
                      💡 {{trendingTip}}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{blogUrl}}" style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                  Read All Stories →
                </a>
              </div>
              
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h3 style="color: #374151; margin: 0 0 15px; font-size: 16px;">Follow Us</h3>
                  <div style="display: inline-block;">
                    <a href="{{socialLinks.instagram}}" style="display: inline-block; margin: 0 10px; padding: 8px; background: #e1306c; color: white; border-radius: 50%; text-decoration: none;">📷</a>
                    <a href="{{socialLinks.facebook}}" style="display: inline-block; margin: 0 10px; padding: 8px; background: #1877f2; color: white; border-radius: 50%; text-decoration: none;">📘</a>
                    <a href="{{socialLinks.twitter}}" style="display: inline-block; margin: 0 10px; padding: 8px; background: #1da1f2; color: white; border-radius: 50%; text-decoration: none;">🐦</a>
                  </div>
                </div>
                
                <p style="color: #718096; font-size: 12px; margin: 0; text-align: center;">
                  You're receiving this because you subscribed to BagPackStories newsletter.<br>
                  <a href="{{unsubscribeUrl}}" style="color: #718096;">Unsubscribe</a> | 
                  <a href="{{managePreferencesUrl}}" style="color: #718096;">Manage Preferences</a>
                </p>
              </div>
            </div>
          </div>
        `,
        textContent: `
This Week in Travel - BagPackStories Newsletter
{{weekRange}}

Hello {{subscriberName}}!

This week we published {{weeklyPostCount}} new travel stories from our amazing community.

Featured Stories:
{{featuredPostsText}}

Trending This Week:
- Destination: {{trendingDestination}}
- Tip: {{trendingTip}}

Read all stories: {{blogUrl}}

Follow us on social media:
Instagram: {{socialLinks.instagram}}
Facebook: {{socialLinks.facebook}}
Twitter: {{socialLinks.twitter}}

---
You're receiving this newsletter because you subscribed to BagPackStories.
Unsubscribe: {{unsubscribeUrl}}
Manage preferences: {{managePreferencesUrl}}
        `,
        variables: ['subscriberName', 'weekRange', 'weeklyPostCount', 'featuredPosts', 'featuredPostsText', 'trendingDestination', 'trendingTip', 'blogUrl', 'socialLinks', 'unsubscribeUrl', 'managePreferencesUrl'],
        type: 'newsletter',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
  }

  /**
   * Send email to admin team when a contributor submits a post
   */
  async sendContributorSubmissionNotification(post: IPost, contributor: IUser): Promise<boolean> {
    try {
      console.log('📧 [CONTRIBUTOR SUBMISSION] Starting notification process for post:', post.title);
      
      const template = await this.getTemplate('contributor_submission');
      if (!template) {
        console.error('❌ [CONTRIBUTOR SUBMISSION] Contributor submission email template not found');
        return false;
      }
      
      const adminEmails = process.env.ADMIN_EMAIL?.split(',').map(email => email.trim()) || [];
      
      if (adminEmails.length === 0) {
        console.error('❌ [CONTRIBUTOR SUBMISSION] No admin emails configured');
        return false;
      }

      console.log('📧 [CONTRIBUTOR SUBMISSION] Admin emails configured:', adminEmails.length);

      // Get category name from categories array
      const categoryName = post.categories && post.categories.length > 0 ? 'Travel' : 'General';

      const variables = {
        postTitle: post.title,
        postExcerpt: post.excerpt || post.content.substring(0, 200) + '...',
        contributorName: contributor.name,
        contributorEmail: contributor.email,
        postCategory: categoryName,
        submissionDate: new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        wordCount: post.content.split(' ').length.toString(),
        reviewUrl: `${process.env.FRONTEND_URL}/admin/posts/${post._id}/review`
      };

      console.log('📧 [CONTRIBUTOR SUBMISSION] Template variables prepared:', {
        postTitle: variables.postTitle,
        contributorEmail: variables.contributorEmail,
        adminCount: adminEmails.length
      });

      const htmlContent = this.replaceTemplateVariables(template.htmlContent, variables);
      const textContent = this.replaceTemplateVariables(template.textContent || '', variables);
      const subject = this.replaceTemplateVariables(template.subject, variables);

      const emailData: BrevoEmailRequest = {
        sender: { 
          email: process.env.FROM_EMAIL || 'noreply@bagpackstories.in', 
          name: process.env.FROM_NAME || 'BagPackStories' 
        },
        to: adminEmails.map(email => ({ email, name: 'Admin' })),
        subject,
        htmlContent,
        textContent
      };

      console.log('📧 [CONTRIBUTOR SUBMISSION] Sending email to admin team...');
      const success = await this.sendEmail(emailData);
      if (success) {
        console.log(`✅ [CONTRIBUTOR SUBMISSION] Notification sent successfully to ${adminEmails.length} admin(s) for post: ${post.title}`);
      } else {
        console.log(`❌ [CONTRIBUTOR SUBMISSION] Failed to send notification for post: ${post.title}`);
      }
      return success;
    } catch (error) {
      console.error('❌ [CONTRIBUTOR SUBMISSION] Error sending contributor submission notification:', error);
      return false;
    }
  }

  /**
   * Send email to contributor when admin approves their post
   */
  async sendPostApprovedNotification(post: IPost, contributor: IUser): Promise<boolean> {
    try {
      console.log('📧 [POST APPROVAL] Starting approval notification for post:', post.title);
      
      const template = await this.getTemplate('post_approved');
      if (!template) {
        console.error('❌ [POST APPROVAL] Post approval email template not found');
        return false;
      }

      console.log('📧 [POST APPROVAL] Template found, preparing variables for contributor:', contributor.email);

      // Get category name from categories array
      const categoryName = post.categories && post.categories.length > 0 ? 'Travel' : 'General';

      const variables = {
        postTitle: post.title,
        publishedDate: new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        postCategory: categoryName,
        postUrl: `${process.env.FRONTEND_URL}/blog/${post.slug}`,
        shareUrl: `${process.env.FRONTEND_URL}/blog/${post.slug}?share=true`,
        viewCount: (post.viewCount || 0).toString(),
        supportEmail: (await getEmailsFromSiteSettings()).supportEmail
      };

      console.log('📧 [POST APPROVAL] Variables prepared:', {
        postTitle: variables.postTitle,
        postUrl: variables.postUrl,
        contributorEmail: contributor.email
      });

      const htmlContent = this.replaceTemplateVariables(template.htmlContent, variables);
      const textContent = this.replaceTemplateVariables(template.textContent || '', variables);
      const subject = this.replaceTemplateVariables(template.subject, variables);

      const emailData: BrevoEmailRequest = {
        sender: { 
          email: process.env.FROM_EMAIL || 'noreply@bagpackstories.in', 
          name: process.env.FROM_NAME || 'BagPackStories' 
        },
        to: [{ email: contributor.email, name: contributor.name }],
        subject,
        htmlContent,
        textContent
      };

      console.log('📧 [POST APPROVAL] Sending approval notification to contributor...');
      const success = await this.sendEmail(emailData);
      if (success) {
        console.log(`✅ [POST APPROVAL] Approval notification sent successfully to ${contributor.email} for post: ${post.title}`);
      } else {
        console.log(`❌ [POST APPROVAL] Failed to send approval notification to ${contributor.email} for post: ${post.title}`);
      }
      return success;
    } catch (error) {
      console.error('❌ [POST APPROVAL] Error sending post approved notification:', error);
      return false;
    }
  }

  /**
   * Send weekly newsletter to all subscribers
   */
  async sendWeeklyNewsletter(subscribers: INewsletter[], newsletterData: NewsletterData): Promise<boolean> {
    try {
      console.log('📧 [NEWSLETTER] Starting weekly newsletter process...');
      console.log('📧 [NEWSLETTER] Subscribers count:', subscribers.length);
      console.log('📧 [NEWSLETTER] Posts count:', newsletterData.posts.length);
      
      const template = await this.getTemplate('weekly_newsletter');
      if (!template) {
        console.error('❌ [NEWSLETTER] Weekly newsletter email template not found');
        return false;
      }
      
      if (subscribers.length === 0) {
        console.log('⚠️ [NEWSLETTER] No subscribers found for weekly newsletter');
        return true;
      }

      if (newsletterData.posts.length === 0) {
        console.log('⚠️ [NEWSLETTER] No posts published this week, skipping newsletter');
        return true;
      }

      console.log('📧 [NEWSLETTER] Preparing newsletter content...');

      // Prepare featured posts HTML
      const featuredPostsHtml = newsletterData.posts.slice(0, 3).map(post => `
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #2d3748; margin: 0 0 10px; font-size: 18px;">
            <a href="${process.env.FRONTEND_URL}/blog/${post.slug}" style="color: #3b82f6; text-decoration: none;">
              ${post.title}
            </a>
          </h3>
          <p style="color: #4a5568; line-height: 1.5; margin: 0 0 10px; font-size: 14px;">
            ${post.excerpt || post.content.substring(0, 120) + '...'}
          </p>
          <div style="font-size: 12px; color: #718096;">
            By ${post.author?.name || 'BagPackStories'} • 
            ${post.categories && post.categories.length > 0 ? post.categories[0].name : 'Travel'}
          </div>
        </div>
      `).join('');

      const featuredPostsText = newsletterData.posts.slice(0, 3).map(post => `
${post.title}
${post.excerpt || post.content.substring(0, 120) + '...'}
Read more: ${process.env.FRONTEND_URL}/blog/${post.slug}
      `).join('\n---\n');

      console.log('📧 [NEWSLETTER] Content prepared, starting batch sending...');

      // Send to subscribers in batches
      const batchSize = 50;
      let successCount = 0;
      let totalProcessed = 0;
      
      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);
        console.log(`📧 [NEWSLETTER] Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(subscribers.length/batchSize)} (${batch.length} subscribers)`);
        
        for (const subscriber of batch) {
          try {
            totalProcessed++;
            
            const variables = {
              subscriberName: subscriber.name || 'Fellow Traveler',
              weekRange: `${newsletterData.weekRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${newsletterData.weekRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
              weeklyPostCount: newsletterData.posts.length.toString(),
              featuredPosts: featuredPostsHtml,
              featuredPostsText,
              blogUrl: `${process.env.FRONTEND_URL}/blog`,
              unsubscribeUrl: `${process.env.FRONTEND_URL}/newsletter/unsubscribe?token=${subscriber._id}`
            };

            const htmlContent = this.replaceTemplateVariables(template.htmlContent, variables);
            const textContent = this.replaceTemplateVariables(template.textContent || '', variables);
            const subject = this.replaceTemplateVariables(template.subject, variables);

            const emailData: BrevoEmailRequest = {
              sender: { 
                email: process.env.FROM_EMAIL || 'noreply@bagpackstories.in', 
                name: process.env.FROM_NAME || 'BagPackStories' 
              },
              to: [{ email: subscriber.email, name: subscriber.name || 'Fellow Traveler' }],
              subject,
              htmlContent,
              textContent
            };

            const success = await this.sendEmail(emailData);
            if (success) {
              successCount++;
            }
            
            // Small delay to avoid rate limiting
            if (totalProcessed % 10 === 0) {
              console.log(`📧 [NEWSLETTER] Progress: ${totalProcessed}/${subscribers.length} processed, ${successCount} successful`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.error(`❌ [NEWSLETTER] Failed to send newsletter to ${subscriber.email}:`, error);
          }
        }
      }

      console.log(`✅ [NEWSLETTER] Weekly newsletter completed: ${successCount}/${subscribers.length} subscribers successfully received the newsletter`);
      return successCount > 0;
    } catch (error) {
      console.error('❌ [NEWSLETTER] Error sending weekly newsletter:', error);
      return false;
    }
  }

  /**
   * Replace template variables with actual values
   */
  private replaceTemplateVariables(template: string, variables: Record<string, any>): string {
    console.log('📧 [TEMPLATE] Replacing variables in template, variables count:', Object.keys(variables).length);
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      
      if (typeof value === 'object' && value !== null) {
        // Handle nested objects like socialLinks
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          const nestedRegex = new RegExp(`{{${key}\\.${nestedKey}}}`, 'g');
          result = result.replace(nestedRegex, String(nestedValue));
        }
      } else {
        result = result.replace(regex, String(value || ''));
      }
    }
    
    console.log('✅ [TEMPLATE] Template variables replaced successfully');
    return result;
  }

  /**
   * Send custom email
   */
  async sendCustomEmail(
    to: string | string[],
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<boolean> {
    try {
      console.log('📧 [CUSTOM EMAIL] Starting custom email send...');
      
      const recipients = Array.isArray(to) ? to : [to];
      console.log('📧 [CUSTOM EMAIL] Recipients:', recipients.length, 'Subject:', subject.substring(0, 50) + '...');

      const emailData: BrevoEmailRequest = {
        sender: { 
          email: process.env.FROM_EMAIL || 'noreply@bagpackstories.in', 
          name: process.env.FROM_NAME || 'BagPackStories' 
        },
        to: recipients.map(email => ({ email })),
        subject,
        htmlContent,
        textContent
      };

      console.log('📧 [CUSTOM EMAIL] Sending custom email...');
      const success = await this.sendEmail(emailData);
      if (success) {
        console.log(`✅ [CUSTOM EMAIL] Custom email sent successfully to: ${recipients.join(', ')}`);
      } else {
        console.log(`❌ [CUSTOM EMAIL] Failed to send custom email to: ${recipients.join(', ')}`);
      }
      return success;
    } catch (error) {
      console.error('❌ [CUSTOM EMAIL] Error sending custom email:', error);
      return false;
    }
  }

  /**
   * Get all available email templates
   */
  getEmailTemplates(): EmailTemplate[] {
    return Object.values(this.getDefaultTemplates());
  }

  /**
   * Test email configuration
   */
  async testEmailConfig(): Promise<boolean> {
    try {
      console.log('🧪 [EMAIL TEST] Starting email configuration test...');
      
      const testEmail = process.env.ADMIN_EMAIL || 'test@bagpackstories.in';
      console.log('🧪 [EMAIL TEST] Test email will be sent to:', testEmail);
      console.log('🧪 [EMAIL TEST] SMTP Configuration:', {
        host: this.smtpConfig.host,
        port: this.smtpConfig.port,
        secure: this.smtpConfig.secure,
        hasAuth: !!this.smtpConfig.auth?.user
      });

      const emailData: BrevoEmailRequest = {
        sender: { 
          email: process.env.FROM_EMAIL || 'noreply@bagpackstories.in', 
          name: process.env.FROM_NAME || 'BagPackStories' 
        },
        to: [{ email: testEmail, name: 'Test User' }],
        subject: 'BagPackStories Email Configuration Test',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #3b82f6;">Email Configuration Test</h1>
            <p>This is a test email to verify that your Brevo SMTP configuration is working correctly.</p>
            <p><strong>Configuration Method:</strong> SMTP (Username/Password)</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>SMTP Host:</strong> ${this.smtpConfig.host}:${this.smtpConfig.port}</p>
            <p><strong>Username:</strong> ${this.smtpConfig.auth?.user || 'Not configured'}</p>
            <p>If you received this email, your SMTP configuration is successful!</p>
          </div>
        `,
        textContent: `
Email Configuration Test

This is a test email to verify that your Brevo SMTP configuration is working correctly.
Configuration Method: SMTP (Username/Password)
Timestamp: ${new Date().toISOString()}
SMTP Host: ${this.smtpConfig.host}:${this.smtpConfig.port}
Username: ${this.smtpConfig.auth?.user || 'Not configured'}

If you received this email, your SMTP configuration is successful!
        `
      };

      console.log('🧪 [EMAIL TEST] Sending test email...');
      const success = await this.sendEmail(emailData);
      if (success) {
        console.log('✅ [EMAIL TEST] Test email sent successfully using SMTP');
      } else {
        console.log('❌ [EMAIL TEST] Test email failed to send');
      }
      return success;
    } catch (error) {
      console.error('❌ [EMAIL TEST] Email configuration test failed:', error);
      return false;
    }
  }

  /**
   * Send password reset email with reset link
   */
  async sendPasswordResetEmail(email: string, name: string, resetUrl: string, resetToken: string): Promise<boolean> {
    try {
      console.log('📧 [PASSWORD RESET] Sending password reset email to:', email);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Travel Blog</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .button:hover { background: #5a67d8; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              
              <p>We received a request to reset your password for your Travel Blog account. If you made this request, click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Your Password</a>
              </div>
              
              <div class="warning">
                <p><strong>⏰ Important:</strong> This link will expire in <strong>1 hour</strong> for security purposes.</p>
              </div>
              
              <p>If you can't click the button, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f4f4f4; padding: 10px; border-radius: 3px;">${resetUrl}</p>
              
              <p><strong>If you didn't request this password reset:</strong></p>
              <ul>
                <li>You can safely ignore this email</li>
                <li>Your password will remain unchanged</li>
                <li>Consider changing your password if you're concerned about account security</li>
              </ul>
              
              <p>For security reasons, we recommend:</p>
              <ul>
                <li>Using a strong, unique password</li>
                <li>Enabling two-factor authentication if available</li>
                <li>Not sharing your login credentials</li>
              </ul>
            </div>
            <div class="footer">
              <p>This is an automated message from Travel Blog. Please do not reply to this email.</p>
              <p>If you need help, contact our support team.</p>
              <p>&copy; ${new Date().getFullYear()} Travel Blog. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Password Reset Request - Travel Blog
        
        Hello ${name},
        
        We received a request to reset your password for your Travel Blog account.
        
        If you made this request, click the link below to reset your password:
        ${resetUrl}
        
        ⏰ Important: This link will expire in 1 hour for security purposes.
        
        If you didn't request this password reset, you can safely ignore this email.
        Your password will remain unchanged.
        
        For security, we recommend using a strong, unique password and enabling 
        two-factor authentication if available.
        
        ---
        This is an automated message from Travel Blog.
        © ${new Date().getFullYear()} Travel Blog. All rights reserved.
      `;

      const emailData = {
        sender: {
          email: process.env.FROM_EMAIL || 'noreply@bagpackstories.in',
          name: process.env.FROM_NAME || 'BagPackStories'
        },
        to: [{ email, name }],
        subject: '🔒 Password Reset Request - Travel Blog',
        htmlContent,
        textContent
      };

      const success = await this.sendEmail(emailData);
      
      if (success) {
        console.log('✅ [PASSWORD RESET] Password reset email sent successfully to:', email);
      } else {
        console.error('❌ [PASSWORD RESET] Failed to send password reset email to:', email);
      }
      
      return success;
    } catch (error) {
      console.error('❌ [PASSWORD RESET] Error sending password reset email:', error);
      return false;
    }
  }

  // Photo submission notification to admin
  async sendPhotoSubmissionNotificationToAdmin(photoData: {
    photoTitle: string;
    photoDescription: string;
    photographerName: string;
    photographerEmail: string;
    photoLocation: string;
    photoCategory: string;
    photoTags: string[];
    photoThumbnailUrl: string;
    submissionDate: string;
    adminDashboardUrl: string;
  }): Promise<boolean> {
    try {
      console.log('📧 [PHOTO SUBMISSION] Sending photo submission notification to admin...');

      const adminEmail = process.env.ADMIN_EMAIL || 'admin@bagpackstories.in';

      const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📸 New Photo Submission</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">A new photo has been submitted for review</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="margin-bottom: 25px; text-align: center;">
              <img src="${photoData.photoThumbnailUrl}" alt="${photoData.photoTitle}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            </div>
            
            <div style="margin-bottom: 25px;">
              <h2 style="color: #2d3748; margin: 0 0 10px; font-size: 22px;">${photoData.photoTitle}</h2>
              <p style="color: #4a5568; line-height: 1.6; margin: 0;">${photoData.photoDescription}</p>
            </div>
            
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px; font-size: 18px;">Photo Details</h3>
              <p style="margin: 5px 0; color: #4a5568;"><strong>Photographer:</strong> ${photoData.photographerName} (${photoData.photographerEmail})</p>
              <p style="margin: 5px 0; color: #4a5568;"><strong>Location:</strong> ${photoData.photoLocation}</p>
              <p style="margin: 5px 0; color: #4a5568;"><strong>Category:</strong> ${photoData.photoCategory}</p>
              <p style="margin: 5px 0; color: #4a5568;"><strong>Tags:</strong> ${photoData.photoTags.join(', ')}</p>
              <p style="margin: 5px 0; color: #4a5568;"><strong>Submitted:</strong> ${photoData.submissionDate}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${photoData.adminDashboardUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Review Photo in Admin Panel</a>
            </div>
            
            <div style="margin-top: 25px; padding: 15px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Action Required:</strong> Please review and approve/reject this photo submission.</p>
            </div>
          </div>
        </div>
      `;

      const textContent = `New Photo Submission - BagPackStories\n\nA new photo has been submitted for review:\n\nTitle: ${photoData.photoTitle}\nDescription: ${photoData.photoDescription}\nPhotographer: ${photoData.photographerName} (${photoData.photographerEmail})\nLocation: ${photoData.photoLocation}\nCategory: ${photoData.photoCategory}\nTags: ${photoData.photoTags.join(', ')}\nSubmitted: ${photoData.submissionDate}\n\nPlease review this photo submission in the admin panel: ${photoData.adminDashboardUrl}`;

      const emailData = {
        sender: {
          email: process.env.FROM_EMAIL || 'noreply@bagpackstories.in',
          name: process.env.FROM_NAME || 'BagPackStories'
        },
        to: [{ email: adminEmail, name: 'Admin' }],
        subject: `New Photo Submission: ${photoData.photoTitle} - BagPackStories`,
        htmlContent,
        textContent
      };

      const success = await this.sendEmail(emailData);
      
      if (success) {
        console.log('✅ [PHOTO SUBMISSION] Photo submission notification sent successfully to admin');
      } else {
        console.error('❌ [PHOTO SUBMISSION] Failed to send photo submission notification to admin');
      }
      
      return success;
    } catch (error) {
      console.error('❌ [PHOTO SUBMISSION] Error sending photo submission notification:', error);
      return false;
    }
  }

  // Photo approval notification to photographer
  async sendPhotoApprovalNotification(photoData: {
    photoTitle: string;
    photoDescription: string;
    photographerName: string;
    photographerEmail: string;
    photoLocation: string;
    photoCategory: string;
    approvalDate: string;
    isFeatured: boolean;
    photoUrl: string;
    galleryUrl: string;
    submitPhotoUrl: string;
    photoThumbnailUrl: string;
  }): Promise<boolean> {
    try {
      console.log('📧 [PHOTO APPROVAL] Sending photo approval notification to photographer...');

      const featuredText = photoData.isFeatured 
        ? '<p style="margin: 5px 0; color: #065f46;"><strong>Featured:</strong> ⭐ This photo has been featured!</p>'
        : '';

      const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 Photo Approved!</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your photo has been published to our gallery</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 25px;">
              <p style="color: #4a5568; font-size: 18px; margin: 0;">Congratulations ${photoData.photographerName}!</p>
            </div>
            
            <div style="margin-bottom: 25px; text-align: center;">
              <img src="${photoData.photoThumbnailUrl}" alt="${photoData.photoTitle}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            </div>
            
            <div style="margin-bottom: 25px;">
              <h2 style="color: #2d3748; margin: 0 0 10px; font-size: 22px; text-align: center;">${photoData.photoTitle}</h2>
              <p style="color: #4a5568; line-height: 1.6; margin: 0; text-align: center;">${photoData.photoDescription}</p>
            </div>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #065f46; margin: 0 0 15px; font-size: 18px;">Photo Details</h3>
              <p style="margin: 5px 0; color: #065f46;"><strong>Location:</strong> ${photoData.photoLocation}</p>
              <p style="margin: 5px 0; color: #065f46;"><strong>Category:</strong> ${photoData.photoCategory}</p>
              <p style="margin: 5px 0; color: #065f46;"><strong>Approved:</strong> ${photoData.approvalDate}</p>
              ${featuredText}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${photoData.photoUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-right: 10px;">View Your Photo</a>
              <a href="${photoData.galleryUrl}" style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Browse Gallery</a>
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #1e40af; margin: 0 0 10px; font-size: 16px;">Share Your Success!</h4>
              <p style="color: #1e40af; margin: 0; font-size: 14px;">Your photo is now live in our gallery! Feel free to share it with your friends and fellow travel enthusiasts. Thank you for contributing to the BagPackStories community!</p>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">Have more amazing photos? <a href="${photoData.submitPhotoUrl}" style="color: #3b82f6;">Submit another photo</a></p>
            </div>
          </div>
        </div>
      `;

      const featuredTextPlain = photoData.isFeatured ? 'Featured: ⭐ This photo has been featured!\n' : '';

      const textContent = `Great news! Your photo has been approved - BagPackStories\n\nCongratulations ${photoData.photographerName}!\n\nYour photo "${photoData.photoTitle}" has been approved and published to our gallery.\n\nPhoto Details:\nLocation: ${photoData.photoLocation}\nCategory: ${photoData.photoCategory}\nApproved: ${photoData.approvalDate}\n${featuredTextPlain}\nView your photo: ${photoData.photoUrl}\nBrowse gallery: ${photoData.galleryUrl}\n\nThank you for contributing to the BagPackStories community! Have more amazing photos? Submit another: ${photoData.submitPhotoUrl}`;

      const emailData = {
        sender: {
          email: process.env.FROM_EMAIL || 'noreply@bagpackstories.in',
          name: process.env.FROM_NAME || 'BagPackStories'
        },
        to: [{ email: photoData.photographerEmail, name: photoData.photographerName }],
        subject: `Great news! Your photo "${photoData.photoTitle}" has been approved - BagPackStories`,
        htmlContent,
        textContent
      };

      const success = await this.sendEmail(emailData);
      
      if (success) {
        console.log('✅ [PHOTO APPROVAL] Photo approval notification sent successfully to photographer');
      } else {
        console.error('❌ [PHOTO APPROVAL] Failed to send photo approval notification to photographer');
      }
      
      return success;
    } catch (error) {
      console.error('❌ [PHOTO APPROVAL] Error sending photo approval notification:', error);
      return false;
    }
  }

  /**
   * Send an email with attachments
   */
  public async sendEmailWithAttachment(
    to: string,
    subject: string,
    htmlContent: string,
    attachments: Array<{ filename: string; content: Buffer }>
  ): Promise<boolean> {
    try {
      console.log('📧 [EMAIL SERVICE] Sending email with attachment...')

      if (!this.transporter) {
        console.error('❌ [EMAIL SERVICE] SMTP transporter is not configured')
        return false
      }

      const { fromEmail, supportEmail } = await getEmailsFromSiteSettings()

      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'BagPackStories',
          address: fromEmail
        },
        to,
        subject,
        html: htmlContent,
        attachments
      }

      const result = await this.transporter.sendMail(mailOptions as any)
      console.log('✅ [EMAIL SERVICE] Email with attachment sent', { messageId: (result as any)?.messageId })
      return true
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Error sending email with attachment:', error)
      return false
    }
  }

  /**
   * Generate HTML template for itinerary email
   */
  private generateItineraryHTMLTemplate(itinerary: any): string {
    const currencySymbol = itinerary.currencySymbol || '$'
    const startDate = itinerary.startDate ? new Date(itinerary.startDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'Not specified'
    const endDate = itinerary.endDate ? new Date(itinerary.endDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'Not specified'

    // Generate day plans HTML
    let dayPlansHTML = ''
    if (itinerary.dayPlans && itinerary.dayPlans.length > 0) {
      dayPlansHTML = itinerary.dayPlans.map((day: any) => {
        const dayDate = day.date ? new Date(day.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        }) : ''

        const generateActivityHTML = (activities: any[], period: string) => {
          if (!activities || activities.length === 0) return ''
          return `
            <div style="margin-bottom: 15px;">
              <h4 style="color: #495057; font-size: 14px; font-weight: 600; margin: 10px 0 8px 0; text-transform: uppercase;">${period}</h4>
              ${activities.map((activity: any) => `
                <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #007bff;">
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                      <div style="font-weight: 600; color: #212529; margin-bottom: 4px;">${activity.time || ''} - ${activity.title}</div>
                      ${activity.location ? `<div style="color: #6c757d; font-size: 13px; margin-bottom: 4px;">📍 ${activity.location}</div>` : ''}
                      <div style="color: #495057; font-size: 13px;">${activity.description}</div>
                      ${activity.duration ? `<div style="color: #6c757d; font-size: 12px; margin-top: 4px;">⏱️ Duration: ${activity.duration}</div>` : ''}
                    </div>
                    ${activity.estimatedCost > 0 ? `<div style="background: #e7f3ff; color: #0056b3; padding: 4px 8px; border-radius: 4px; font-size: 13px; font-weight: 600; white-space: nowrap; margin-left: 10px;">${currencySymbol}${activity.estimatedCost.toFixed(2)}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `
        }

        return `
          <div style="background: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <div style="border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 15px;">
              <h3 style="color: #007bff; margin: 0; font-size: 18px;">Day ${day.day}${dayDate ? ` - ${dayDate}` : ''}</h3>
            </div>
            ${generateActivityHTML(day.morning, '🌅 Morning')}
            ${generateActivityHTML(day.afternoon, '☀️ Afternoon')}
            ${generateActivityHTML(day.evening, '🌆 Evening')}
            ${day.notes ? `<div style="background: #fff3cd; border-left: 3px solid #ffc107; padding: 12px; margin-top: 15px; border-radius: 4px;"><strong>📝 Notes:</strong> ${day.notes}</div>` : ''}
            <div style="text-align: right; margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
              <strong style="color: #28a745; font-size: 16px;">Day Total: ${currencySymbol}${(day.totalEstimatedCost || 0).toFixed(2)}</strong>
            </div>
          </div>
        `
      }).join('')
    }

    // Generate accommodation suggestions HTML
    let accommodationHTML = ''
    if (itinerary.accommodationSuggestions && itinerary.accommodationSuggestions.length > 0) {
      accommodationHTML = `
        <div style="background: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">🏨 Accommodation Suggestions</h3>
          ${itinerary.accommodationSuggestions.map((acc: any) => `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 12px;">
              <h4 style="color: #212529; margin: 0 0 8px 0; font-size: 16px;">${acc.name}</h4>
              <div style="color: #6c757d; font-size: 13px; margin-bottom: 6px;">
                <strong>Type:</strong> ${acc.type} | <strong>Price Range:</strong> ${acc.priceRange}
              </div>
              ${acc.location?.address ? `<div style="color: #6c757d; font-size: 13px; margin-bottom: 6px;">📍 ${acc.location.address}${acc.location.area ? `, ${acc.location.area}` : ''}</div>` : ''}
              ${acc.amenities && acc.amenities.length > 0 ? `<div style="margin: 8px 0;"><strong style="font-size: 13px;">Amenities:</strong> <span style="font-size: 13px;">${acc.amenities.join(', ')}</span></div>` : ''}
              ${acc.whyRecommended ? `<div style="background: #e7f3ff; padding: 10px; border-radius: 4px; margin-top: 8px; font-size: 13px;">💡 ${acc.whyRecommended}</div>` : ''}
              ${acc.bookingTip ? `<div style="color: #856404; background: #fff3cd; padding: 8px; border-radius: 4px; margin-top: 6px; font-size: 12px;">💬 ${acc.bookingTip}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `
    }

    // Generate restaurant recommendations HTML
    let restaurantHTML = ''
    if (itinerary.restaurantRecommendations && itinerary.restaurantRecommendations.length > 0) {
      restaurantHTML = `
        <div style="background: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">🍽️ Restaurant Recommendations</h3>
          ${itinerary.restaurantRecommendations.map((rest: any) => `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 12px;">
              <h4 style="color: #212529; margin: 0 0 8px 0; font-size: 16px;">${rest.name}${rest.localFavorite ? ' ⭐' : ''}</h4>
              <div style="color: #6c757d; font-size: 13px; margin-bottom: 6px;">
                <strong>Cuisine:</strong> ${rest.cuisine} | <strong>Price Range:</strong> ${rest.priceRange}
              </div>
              ${rest.mealType && rest.mealType.length > 0 ? `<div style="color: #6c757d; font-size: 13px; margin-bottom: 6px;"><strong>Meal Type:</strong> ${rest.mealType.join(', ')}</div>` : ''}
              ${rest.location?.address ? `<div style="color: #6c757d; font-size: 13px; margin-bottom: 6px;">📍 ${rest.location.address}${rest.location.area ? `, ${rest.location.area}` : ''}</div>` : ''}
              ${rest.mustTryDish ? `<div style="background: #d4edda; padding: 8px; border-radius: 4px; margin-top: 8px; font-size: 13px;">🌟 Must Try: ${rest.mustTryDish}</div>` : ''}
              ${rest.reservationNeeded ? `<div style="color: #721c24; background: #f8d7da; padding: 6px; border-radius: 4px; margin-top: 6px; font-size: 12px;">⚠️ Reservation recommended</div>` : ''}
            </div>
          `).join('')}
        </div>
      `
    }

    // Generate transportation tips HTML
    let transportationHTML = ''
    if (itinerary.transportationTips && itinerary.transportationTips.length > 0) {
      transportationHTML = `
        <div style="background: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">🚗 Transportation Tips</h3>
          ${itinerary.transportationTips.map((tip: any) => `
            <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #17a2b8;">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                  <strong style="color: #212529; font-size: 14px;">${tip.type}</strong>
                  <div style="color: #495057; font-size: 13px; margin-top: 4px;">${tip.description}</div>
                </div>
                ${tip.estimatedCost > 0 ? `<div style="background: #e7f3ff; color: #0056b3; padding: 4px 8px; border-radius: 4px; font-size: 13px; font-weight: 600; white-space: nowrap; margin-left: 10px;">${currencySymbol}${tip.estimatedCost.toFixed(2)}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `
    }

    // Generate budget breakdown HTML
    let budgetHTML = ''
    if (itinerary.budgetBreakdown || itinerary.totalEstimatedCost > 0) {
      budgetHTML = `
        <div style="background: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">💰 Budget Breakdown</h3>
          ${itinerary.budgetBreakdown ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
              ${itinerary.budgetBreakdown.totalFlightCost > 0 ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6;"><span>✈️ Flights</span><strong>${currencySymbol}${itinerary.budgetBreakdown.totalFlightCost.toFixed(2)}</strong></div>` : ''}
              ${itinerary.budgetBreakdown.totalAccommodationCost > 0 ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6;"><span>🏨 Accommodation</span><strong>${currencySymbol}${itinerary.budgetBreakdown.totalAccommodationCost.toFixed(2)}</strong></div>` : ''}
              ${itinerary.budgetBreakdown.totalFoodCost > 0 ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6;"><span>🍽️ Food & Dining</span><strong>${currencySymbol}${itinerary.budgetBreakdown.totalFoodCost.toFixed(2)}</strong></div>` : ''}
              ${itinerary.budgetBreakdown.totalSightseeingCost > 0 ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6;"><span>🎫 Sightseeing & Activities</span><strong>${currencySymbol}${itinerary.budgetBreakdown.totalSightseeingCost.toFixed(2)}</strong></div>` : ''}
              ${itinerary.budgetBreakdown.totalLocalTransportCost > 0 ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6;"><span>🚌 Local Transport</span><strong>${currencySymbol}${itinerary.budgetBreakdown.totalLocalTransportCost.toFixed(2)}</strong></div>` : ''}
              ${itinerary.budgetBreakdown.totalShoppingCost > 0 ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6;"><span>🛍️ Shopping</span><strong>${currencySymbol}${itinerary.budgetBreakdown.totalShoppingCost.toFixed(2)}</strong></div>` : ''}
              ${itinerary.budgetBreakdown.totalMiscellaneousCost > 0 ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6;"><span>💼 Miscellaneous</span><strong>${currencySymbol}${itinerary.budgetBreakdown.totalMiscellaneousCost.toFixed(2)}</strong></div>` : ''}
              <div style="display: flex; justify-content: space-between; padding: 12px 0; margin-top: 10px; background: #e7f3ff; padding: 12px; border-radius: 4px;"><span style="font-size: 16px; font-weight: 600;">Total Estimated Cost</span><strong style="font-size: 18px; color: #28a745;">${currencySymbol}${itinerary.totalEstimatedCost.toFixed(2)}</strong></div>
            </div>
          ` : `
            <div style="background: #e7f3ff; padding: 15px; border-radius: 6px; text-align: center;">
              <strong style="font-size: 18px; color: #28a745;">Total Estimated Cost: ${currencySymbol}${itinerary.totalEstimatedCost.toFixed(2)}</strong>
            </div>
          `}
        </div>
      `
    }

    // Generate general tips HTML
    let tipsHTML = ''
    if (itinerary.generalTips && itinerary.generalTips.length > 0) {
      tipsHTML = `
        <div style="background: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">💡 General Tips</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${itinerary.generalTips.map((tip: string) => `<li style="color: #495057; font-size: 14px; margin-bottom: 8px;">${tip}</li>`).join('')}
          </ul>
        </div>
      `
    }

    // Generate packing list HTML
    let packingHTML = ''
    if (itinerary.packingList && itinerary.packingList.length > 0) {
      packingHTML = `
        <div style="background: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">🎒 Packing List</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${itinerary.packingList.map((item: string) => `<li style="color: #495057; font-size: 14px; margin-bottom: 8px;">${item}</li>`).join('')}
          </ul>
        </div>
      `
    }

    // Main HTML template
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Travel Itinerary</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">✈️ Your Travel Itinerary</h1>
      <h2 style="margin: 0; font-size: 20px; font-weight: 300;">${itinerary.title || 'Your Amazing Journey'}</h2>
    </div>

    <!-- Content -->
    <div style="padding: 30px; background-color: #f8f9fa;">
      <!-- Trip Overview -->
      <div style="background: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #007bff; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">📋 Trip Overview</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <div style="color: #6c757d; font-size: 12px; margin-bottom: 4px;">FROM</div>
            <div style="color: #212529; font-weight: 600; font-size: 14px;">${itinerary.source || 'Not specified'}</div>
          </div>
          <div>
            <div style="color: #6c757d; font-size: 12px; margin-bottom: 4px;">TO</div>
            <div style="color: #212529; font-weight: 600; font-size: 14px;">${itinerary.destinations ? itinerary.destinations.join(', ') : itinerary.destination || 'Not specified'}</div>
          </div>
          <div>
            <div style="color: #6c757d; font-size: 12px; margin-bottom: 4px;">START DATE</div>
            <div style="color: #212529; font-weight: 600; font-size: 14px;">${startDate}</div>
          </div>
          <div>
            <div style="color: #6c757d; font-size: 12px; margin-bottom: 4px;">END DATE</div>
            <div style="color: #212529; font-weight: 600; font-size: 14px;">${endDate}</div>
          </div>
          <div>
            <div style="color: #6c757d; font-size: 12px; margin-bottom: 4px;">DURATION</div>
            <div style="color: #212529; font-weight: 600; font-size: 14px;">${itinerary.duration} days</div>
          </div>
          <div>
            <div style="color: #6c757d; font-size: 12px; margin-bottom: 4px;">TRAVELERS</div>
            <div style="color: #212529; font-weight: 600; font-size: 14px;">${itinerary.totalPeople || (itinerary.adults + itinerary.children)} (${itinerary.adults || 0} adults, ${itinerary.children || 0} children)</div>
          </div>
          <div>
            <div style="color: #6c757d; font-size: 12px; margin-bottom: 4px;">ROOMS</div>
            <div style="color: #212529; font-weight: 600; font-size: 14px;">${itinerary.numberOfRooms || 1} room${(itinerary.numberOfRooms || 1) > 1 ? 's' : ''}</div>
          </div>
          <div>
            <div style="color: #6c757d; font-size: 12px; margin-bottom: 4px;">DIET TYPE</div>
            <div style="color: #212529; font-weight: 600; font-size: 14px; text-transform: capitalize;">${itinerary.dietType || 'Not specified'}</div>
          </div>
          <div>
            <div style="color: #6c757d; font-size: 12px; margin-bottom: 4px;">TRAVEL MODE</div>
            <div style="color: #212529; font-weight: 600; font-size: 14px; text-transform: capitalize;">${itinerary.travelMode || 'Not specified'}</div>
          </div>
          <div>
            <div style="color: #6c757d; font-size: 12px; margin-bottom: 4px;">BUDGET</div>
            <div style="color: #212529; font-weight: 600; font-size: 14px; text-transform: capitalize;">${itinerary.budget || 'Not specified'}</div>
          </div>
        </div>
        ${itinerary.interests && itinerary.interests.length > 0 ? `
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
            <div style="color: #6c757d; font-size: 12px; margin-bottom: 6px;">INTERESTS</div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${itinerary.interests.map((interest: string) => `<span style="background: #e7f3ff; color: #0056b3; padding: 4px 12px; border-radius: 12px; font-size: 13px;">${interest}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Day Plans -->
      ${dayPlansHTML}

      <!-- Accommodation -->
      ${accommodationHTML}

      <!-- Restaurants -->
      ${restaurantHTML}

      <!-- Transportation -->
      ${transportationHTML}

      <!-- Budget Breakdown -->
      ${budgetHTML}

      <!-- General Tips -->
      ${tipsHTML}

      <!-- Packing List -->
      ${packingHTML}
    </div>

    <!-- Footer -->
    <div style="background: #343a40; color: #ffffff; padding: 20px; text-align: center;">
      <p style="margin: 0 0 10px 0; font-size: 14px;">Generated by <strong>BagPackStories</strong></p>
      <p style="margin: 0; font-size: 12px; color: #adb5bd;">Your AI-powered travel planning companion</p>
    </div>
  </div>
</body>
</html>
    `
  }

  /**
   * Send itinerary email with HTML template
   */
  public async sendItineraryEmail(to: string, itinerary: any): Promise<boolean> {
    try {
      console.log('📧 [EMAIL SERVICE] Sending itinerary email...')

      if (!this.transporter) {
        console.error('❌ [EMAIL SERVICE] SMTP transporter is not configured')
        return false
      }

      const { fromEmail } = await getEmailsFromSiteSettings()

      const subject = `Your Travel Itinerary: ${itinerary.title || 'Your Amazing Journey'}`
      const htmlContent = this.generateItineraryHTMLTemplate(itinerary)

      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'BagPackStories',
          address: fromEmail
        },
        to,
        subject,
        html: htmlContent
      }

      const result = await this.transporter.sendMail(mailOptions as any)
      console.log('✅ [EMAIL SERVICE] Itinerary email sent', { messageId: (result as any)?.messageId })
      return true
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Error sending itinerary email:', error)
      return false
    }
  }
}

export const emailService = new EmailService();
export default EmailService;
