# Email Integration Setup Guide

## Overview
The Brevo email integration system is fully implemented and ready for use. This guide will help you complete the final setup steps.

## ✅ Completed Features

### 1. Email Service Architecture
- **Brevo API Integration**: Complete fetch-based implementation
- **Email Template System**: Database-backed templates with admin management
- **Three Email Types**: Contributor submission, post approval, weekly newsletter
- **Template Variables**: Dynamic content replacement system
- **Error Handling**: Graceful fallbacks and comprehensive logging

### 2. Workflow Integration
- **Post Submission**: Automatically sends notification to admin team when contributor submits post
- **Post Approval**: Automatically sends notification to contributor when admin approves post  
- **Admin Interface**: Full CRUD operations for managing email templates
- **Database Seeder**: Default templates automatically created

### 3. Newsletter System
- **Weekly Scheduler**: Cron job sends newsletters every Monday at 9 AM (configurable)
- **Subscriber Management**: Integration with existing newsletter subscriber system
- **Batch Processing**: Handles large subscriber lists with rate limiting
- **Development Mode**: Testing-friendly scheduling (every 30 minutes)

## 🔧 Setup Requirements

### 1. Brevo SMTP Configuration
To complete the email integration, you need to:

1. **Get Brevo SMTP Credentials**:
   - Sign up at [https://www.brevo.com](https://www.brevo.com)
   - Go to SMTP & API → SMTP
   - Generate SMTP credentials (username and password)
   - Note the SMTP server details

2. **Update Environment Variables**:
   ```bash
   # In backend/.env file, replace:
   BREVO_USERNAME=your_brevo_username_here
   BREVO_PASSWORD=your_brevo_password_here
   # With your actual SMTP credentials:
   BREVO_USERNAME=your-actual-username
   BREVO_PASSWORD=your-actual-password
   ```

3. **Configure SMTP Settings**:
   ```bash
   # Update these in .env:
   BREVO_SMTP_HOST=smtp-relay.brevo.com  # Default Brevo SMTP server
   BREVO_SMTP_PORT=587                   # Default port
   BREVO_SMTP_SECURE=false               # TLS encryption
   FROM_EMAIL=noreply@yourdomain.com     # Must be verified in Brevo
   FROM_NAME=YourBlogName
   ADMIN_EMAIL=admin@yourdomain.com      # Where admin notifications go
   SUPPORT_EMAIL=support@yourdomain.com
   ```

### 2. Domain Verification (Recommended)
1. In Brevo console, verify your sending domain
2. Update DNS records as instructed by Brevo
3. This improves deliverability rates

### 3. Template Customization
Access the admin interface at `/admin/email-templates` to:
- Customize email designs
- Update template variables
- Test email sending
- Create new templates

## 🧪 Testing

### Manual Testing
```bash
# Run comprehensive test suite:
cd backend
npx ts-node src/scripts/testEmailSystem.ts
```

### Test Individual Features
1. **Admin Interface**: Visit `/admin/email-templates`
2. **Template Management**: Edit and test templates
3. **Workflow Testing**: Create/approve posts to trigger emails
4. **Newsletter**: Use "Send Test Newsletter" feature

## 📁 File Architecture

### Backend Files Created/Modified:
- `src/models/EmailTemplate.ts` - Email template model
- `src/services/emailService.ts` - Core email service
- `src/services/emailScheduler.ts` - Newsletter scheduler
- `src/seeders/emailTemplateSeeder.ts` - Default template seeder
- `src/controllers/adminController.ts` - Email template management
- `src/routes/adminRoutes.ts` - Email template routes
- `src/controllers/postController.ts` - Post workflow integration
- `src/scripts/testEmailSystem.ts` - Comprehensive test suite

### Frontend Files Created:
- `src/app/admin/email-templates/page.tsx` - Template management interface
- `src/app/admin/layout.tsx` - Updated navigation

## 🚀 Production Deployment

### Environment Variables Checklist:
```bash
BREVO_USERNAME=your-smtp-username      # ✅ Required
BREVO_PASSWORD=your-smtp-password      # ✅ Required
BREVO_SMTP_HOST=smtp-relay.brevo.com   # ✅ Required
BREVO_SMTP_PORT=587                    # ✅ Required
BREVO_SMTP_SECURE=false                # ✅ Required
FROM_EMAIL=noreply@yourdomain.com      # ✅ Required (domain verified)
FROM_NAME=YourBlogName                 # ✅ Required
ADMIN_EMAIL=admin@yourdomain.com       # ✅ Required
SUPPORT_EMAIL=support@yourdomain.com   # Optional
FRONTEND_URL=https://yourdomain.com    # ✅ Required
TIMEZONE=America/New_York              # Optional (default: EST)
NODE_ENV=production                    # ✅ Required
```

### Scheduler Configuration:
- **Development**: Runs every 30 minutes for testing
- **Production**: Runs every Monday at 9:00 AM
- **Manual Control**: Use admin interface to start/stop scheduler

### Performance Optimization:
- Rate limiting: 50 emails per batch with 1-second delays
- Error resilience: Email failures don't break core functionality
- Database optimization: Template caching and efficient queries

## 🎯 Next Steps

1. **Complete Brevo SMTP Setup**:
   - Get SMTP credentials and update .env
   - Verify sending domain
   - Test with real email addresses

2. **Customize Templates**:
   - Access admin interface
   - Update branding and content
   - Test email rendering

3. **Monitor Performance**:
   - Check email delivery rates
   - Monitor subscriber engagement
   - Adjust scheduling if needed

## 📞 Support

- **Email Service Issues**: Check Brevo console for delivery logs
- **Template Problems**: Use admin interface test feature
- **Workflow Issues**: Check server logs for email errors
- **Scheduler Issues**: Verify cron expression and timezone settings

The system is production-ready and will work seamlessly once the Brevo SMTP credentials are configured!
