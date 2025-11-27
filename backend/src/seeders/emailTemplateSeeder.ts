import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

import EmailTemplate from '../models/EmailTemplate'

const defaultTemplates = [
  {
    name: 'Contributor Submission Notification',
    key: 'contributor_submission',
    type: 'contributor_submission',
    subject: 'New Post Submitted for Review - {{postTitle}}',
    description: 'Email sent to admin team when a contributor submits a post for review',
    variables: ['postTitle', 'contributorName', 'contributorEmail', 'postCategory', 'submissionDate', 'adminPanelUrl'],
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">New Post Submitted for Review</h2>
  <p>Hello Admin Team,</p>
  <p>A new blog post has been submitted for review by <strong>{{contributorName}}</strong>.</p>
  
  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin: 0 0 10px 0; color: #333;">Post Details:</h3>
    <p><strong>Title:</strong> {{postTitle}}</p>
    <p><strong>Author:</strong> {{contributorName}} ({{contributorEmail}})</p>
    <p><strong>Category:</strong> {{postCategory}}</p>
    <p><strong>Submitted:</strong> {{submissionDate}}</p>
  </div>
  
  <p>Please review and take appropriate action in the admin panel.</p>
  
  <div style="margin: 30px 0;">
    <a href="{{adminPanelUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Review Post in Admin Panel
    </a>
  </div>
  
  <p>Best regards,<br>BagPackStories Team</p>
</div>`,
    textContent: `New Post Submitted for Review

Hello Admin Team,

A new blog post has been submitted for review by {{contributorName}}.

Post Details:
- Title: {{postTitle}}
- Author: {{contributorName}} ({{contributorEmail}})
- Category: {{postCategory}}
- Submitted: {{submissionDate}}

Please review and take appropriate action in the admin panel: {{adminPanelUrl}}

Best regards,
BagPackStories Team`
  },
  {
    name: 'Post Approval Notification',
    key: 'post_approved',
    type: 'post_approved',
    subject: 'Your Post "{{postTitle}}" Has Been Approved!',
    description: 'Email sent to contributor when their post is approved and published',
    variables: ['postTitle', 'contributorName', 'postCategory', 'publishedDate', 'postUrl', 'contributorPanelUrl'],
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #28a745;">🎉 Your Post Has Been Approved!</h2>
  <p>Hello {{contributorName}},</p>
  <p>Great news! Your blog post has been approved and is now published on BagPackStories.</p>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
    <h3 style="margin: 0 0 10px 0; color: #333;">Published Post:</h3>
    <p><strong>Title:</strong> {{postTitle}}</p>
    <p><strong>Category:</strong> {{postCategory}}</p>
    <p><strong>Published Date:</strong> {{publishedDate}}</p>
  </div>
  
  <p>Your story is now live and readers can discover your amazing content! Thank you for your valuable contribution to our travel community.</p>
  
  <div style="margin: 30px 0;">
    <a href="{{postUrl}}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
      View Your Published Post
    </a>
    <a href="{{contributorPanelUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Contributor Dashboard
    </a>
  </div>
  
  <p>Keep sharing your travel experiences with our community!</p>
  <p>Best regards,<br>BagPackStories Team</p>
</div>`,
    textContent: `🎉 Your Post Has Been Approved!

Hello {{contributorName}},

Great news! Your blog post has been approved and is now published on BagPackStories.

Published Post:
- Title: {{postTitle}}
- Category: {{postCategory}}
- Published Date: {{publishedDate}}

Your story is now live and readers can discover your amazing content! Thank you for your valuable contribution to our travel community.

View your published post: {{postUrl}}
Contributor Dashboard: {{contributorPanelUrl}}

Keep sharing your travel experiences with our community!

Best regards,
BagPackStories Team`
  },
  {
    name: 'Weekly Newsletter',
    key: 'weekly_newsletter',
    type: 'weekly_newsletter',
    subject: 'Weekly Travel Inspiration - New Posts from BagPackStories',
    description: 'Weekly newsletter sent to subscribers with latest blog posts',
    variables: ['subscriberName', 'weeklyPosts', 'weeklyPostsText', 'websiteUrl', 'unsubscribeUrl'],
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
    <h1 style="color: #333; margin: 0;">BagPackStories</h1>
    <p style="color: #666; margin: 5px 0 0 0;">Weekly Travel Inspiration</p>
  </div>
  
  <div style="padding: 30px 20px;">
    <h2 style="color: #333;">✈️ This Week's Travel Stories</h2>
    <p>Hello {{subscriberName}},</p>
    <p>Discover the amazing travel stories published this week on BagPackStories. Get inspired for your next adventure!</p>
    
    <div style="margin: 30px 0;">
      {{weeklyPosts}}
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{websiteUrl}}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Visit BagPackStories
      </a>
    </div>
    
    <p>Happy travels!</p>
    <p>Best regards,<br>The BagPackStories Team</p>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
    <p>You're receiving this email because you subscribed to BagPackStories newsletter.</p>
    <p><a href="{{unsubscribeUrl}}" style="color: #666;">Unsubscribe</a> | <a href="{{websiteUrl}}" style="color: #666;">Visit Website</a></p>
  </div>
</div>`,
    textContent: `BagPackStories - Weekly Travel Inspiration

Hello {{subscriberName}},

This week's travel stories are here! Discover amazing destinations and get inspired for your next adventure.

{{weeklyPostsText}}

Visit BagPackStories: {{websiteUrl}}

Happy travels!
The BagPackStories Team

You're receiving this email because you subscribed to BagPackStories newsletter.
Unsubscribe: {{unsubscribeUrl}}`
  }
]

export async function seedEmailTemplates() {
  try {
    console.log('🌱 Seeding email templates...')
    
    for (const template of defaultTemplates) {
      const existingTemplate = await EmailTemplate.findOne({ key: template.key })
      
      if (!existingTemplate) {
        await EmailTemplate.create(template)
        console.log(`✅ Created template: ${template.name}`)
      } else {
        console.log(`⏭️  Template already exists: ${template.name}`)
      }
    }
    
    console.log('🎉 Email templates seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding email templates:', error)
    throw error
  }
}

// Run seeder directly if called
if (require.main === module) {
  const mongoURI = process.env.MONGODB_URI
  
  if (!mongoURI) {
    console.error('❌ MONGODB_URI environment variable is not defined')
    process.exit(1)
  }
  
  mongoose.connect(mongoURI)
    .then(() => {
      console.log('📡 Connected to database')
      return seedEmailTemplates()
    })
    .then(() => {
      console.log('✅ Seeding completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}
