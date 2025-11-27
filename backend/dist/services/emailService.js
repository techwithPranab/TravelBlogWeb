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
exports.emailService = void 0;
const EmailTemplate_1 = __importDefault(require("../models/EmailTemplate"));
const nodemailer = __importStar(require("nodemailer"));
class EmailService {
    constructor() {
        // Check if username/password are configured for SMTP
        const brevoUsername = process.env.BREVO_USERNAME;
        const brevoPassword = process.env.BREVO_PASSWORD;
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
            console.log('Email service configured with SMTP (username/password)');
        }
        else {
            this.smtpConfig = {};
            console.warn('BREVO_USERNAME/BREVO_PASSWORD is not configured. Email service will not work.');
        }
    }
    async sendEmail(emailData) {
        try {
            if (!this.transporter) {
                console.error('SMTP transporter is not configured');
                return false;
            }
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
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully via SMTP:', result.messageId);
            return true;
        }
        catch (error) {
            console.error('Error sending email via SMTP:', error);
            return false;
        }
    }
    async getTemplate(key) {
        try {
            const template = await EmailTemplate_1.default.findOne({ key, isActive: true });
            return template;
        }
        catch (error) {
            console.error(`Failed to fetch template ${key}:`, error);
            return null;
        }
    }
    getDefaultTemplates() {
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
    async sendContributorSubmissionNotification(post, contributor) {
        try {
            const template = await this.getTemplate('contributor_submission');
            if (!template) {
                console.error('Contributor submission email template not found');
                return false;
            }
            const adminEmails = process.env.ADMIN_EMAIL?.split(',').map(email => email.trim()) || [];
            if (adminEmails.length === 0) {
                console.error('No admin emails configured');
                return false;
            }
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
            const htmlContent = this.replaceTemplateVariables(template.htmlContent, variables);
            const textContent = this.replaceTemplateVariables(template.textContent || '', variables);
            const subject = this.replaceTemplateVariables(template.subject, variables);
            const emailData = {
                sender: {
                    email: process.env.FROM_EMAIL || 'noreply@bagpackstories.in',
                    name: process.env.FROM_NAME || 'BagPackStories'
                },
                to: adminEmails.map(email => ({ email, name: 'Admin' })),
                subject,
                htmlContent,
                textContent
            };
            const success = await this.sendEmail(emailData);
            if (success) {
                console.log(`Contributor submission notification sent to admin team for post: ${post.title}`);
            }
            return success;
        }
        catch (error) {
            console.error('Error sending contributor submission notification:', error);
            return false;
        }
    }
    /**
     * Send email to contributor when admin approves their post
     */
    async sendPostApprovedNotification(post, contributor) {
        try {
            const template = await this.getTemplate('post_approved');
            if (!template) {
                console.error('Post approval email template not found');
                return false;
            }
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
                supportEmail: process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL || 'support@bagpackstories.in'
            };
            const htmlContent = this.replaceTemplateVariables(template.htmlContent, variables);
            const textContent = this.replaceTemplateVariables(template.textContent || '', variables);
            const subject = this.replaceTemplateVariables(template.subject, variables);
            const emailData = {
                sender: {
                    email: process.env.FROM_EMAIL || 'noreply@bagpackstories.in',
                    name: process.env.FROM_NAME || 'BagPackStories'
                },
                to: [{ email: contributor.email, name: contributor.name }],
                subject,
                htmlContent,
                textContent
            };
            const success = await this.sendEmail(emailData);
            if (success) {
                console.log(`Post approved notification sent to contributor: ${contributor.email} for post: ${post.title}`);
            }
            return success;
        }
        catch (error) {
            console.error('Error sending post approved notification:', error);
            return false;
        }
    }
    /**
     * Send weekly newsletter to all subscribers
     */
    async sendWeeklyNewsletter(subscribers, newsletterData) {
        try {
            const template = await this.getTemplate('weekly_newsletter');
            if (!template) {
                console.error('Weekly newsletter email template not found');
                return false;
            }
            if (subscribers.length === 0) {
                console.log('No subscribers found for weekly newsletter');
                return true;
            }
            if (newsletterData.posts.length === 0) {
                console.log('No posts published this week, skipping newsletter');
                return true;
            }
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
            // Send to subscribers in batches
            const batchSize = 50;
            let successCount = 0;
            for (let i = 0; i < subscribers.length; i += batchSize) {
                const batch = subscribers.slice(i, i + batchSize);
                for (const subscriber of batch) {
                    try {
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
                        const emailData = {
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
                        if (successCount % 10 === 0) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }
                    catch (error) {
                        console.error(`Failed to send newsletter to ${subscriber.email}:`, error);
                    }
                }
            }
            console.log(`Weekly newsletter sent successfully to ${successCount}/${subscribers.length} subscribers`);
            return successCount > 0;
        }
        catch (error) {
            console.error('Error sending weekly newsletter:', error);
            return false;
        }
    }
    /**
     * Replace template variables with actual values
     */
    replaceTemplateVariables(template, variables) {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            if (typeof value === 'object' && value !== null) {
                // Handle nested objects like socialLinks
                for (const [nestedKey, nestedValue] of Object.entries(value)) {
                    const nestedRegex = new RegExp(`{{${key}\\.${nestedKey}}}`, 'g');
                    result = result.replace(nestedRegex, String(nestedValue));
                }
            }
            else {
                result = result.replace(regex, String(value || ''));
            }
        }
        return result;
    }
    /**
     * Send custom email
     */
    async sendCustomEmail(to, subject, htmlContent, textContent) {
        try {
            const recipients = Array.isArray(to) ? to : [to];
            const emailData = {
                sender: {
                    email: process.env.FROM_EMAIL || 'noreply@bagpackstories.in',
                    name: process.env.FROM_NAME || 'BagPackStories'
                },
                to: recipients.map(email => ({ email })),
                subject,
                htmlContent,
                textContent
            };
            const success = await this.sendEmail(emailData);
            if (success) {
                console.log(`Custom email sent successfully to: ${recipients.join(', ')}`);
            }
            return success;
        }
        catch (error) {
            console.error('Error sending custom email:', error);
            return false;
        }
    }
    /**
     * Get all available email templates
     */
    getEmailTemplates() {
        return Object.values(this.getDefaultTemplates());
    }
    /**
     * Test email configuration
     */
    async testEmailConfig() {
        try {
            const testEmail = process.env.ADMIN_EMAIL || 'test@bagpackstories.in';
            const emailData = {
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
            const success = await this.sendEmail(emailData);
            if (success) {
                console.log('Test email sent successfully using SMTP');
            }
            return success;
        }
        catch (error) {
            console.error('Email configuration test failed:', error);
            return false;
        }
    }
}
exports.emailService = new EmailService();
exports.default = EmailService;
