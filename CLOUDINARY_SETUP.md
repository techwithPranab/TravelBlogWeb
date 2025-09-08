# Cloudinary Setup Guide

## 🚀 Cloudinary Image Upload Integration

This guide will help you set up Cloudinary for image uploads in your Travel Blog application.

## 📋 Prerequisites

1. A Cloudinary account (free tier available)
2. Node.js and npm installed
3. Your Travel Blog backend running

## 🔧 Step 1: Get Cloudinary Credentials

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Sign up or log in to your account
3. Navigate to your Dashboard
4. Copy the following credentials:
   - **Cloud Name**: Found in the top right corner
   - **API Key**: Found in the "Account Details" section
   - **API Secret**: Found in the "Account Details" section

## ⚙️ Step 2: Configure Environment Variables

Update your `.env` file in the backend directory:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

Replace the placeholder values with your actual Cloudinary credentials.

## 🧪 Step 3: Test Cloudinary Connection

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Test the connection:
   ```bash
   curl http://localhost:5000/api/reader/test-cloudinary
   ```

   Expected response:
   ```json
   {
     "success": true,
     "message": "Cloudinary connection successful"
   }
   ```

## 📁 Step 4: Understanding the Folder Structure

Cloudinary will automatically create the following folders:
- `photos/` - Main travel photos
- `photos/thumbnails/` - Photo thumbnails
- `avatars/` - User profile pictures

## 🔄 Step 5: Migration from Google Drive (Optional)

If you have existing images in Google Drive, you can:

1. **Keep both systems**: The code supports both Google Drive and Cloudinary
2. **Migrate gradually**: New uploads go to Cloudinary, old images remain accessible
3. **Full migration**: Update existing image URLs in your database

## 🎯 Features Included

### ✅ Photo Upload
- **Automatic resizing**: Photos resized to 1920x1080 max
- **Format optimization**: Converted to JPEG with 85% quality
- **Thumbnail generation**: 400x300 thumbnails created automatically
- **Folder organization**: Photos organized by type

### ✅ Avatar Upload
- **Square cropping**: Avatars cropped to 300x300 pixels
- **Quality optimization**: JPEG with 85% quality
- **Automatic replacement**: Old avatars deleted when new ones uploaded

### ✅ Error Handling
- **Fallback support**: Local storage fallback if Cloudinary fails
- **Graceful degradation**: System continues working even if Cloudinary is down
- **Detailed logging**: Comprehensive error logging for debugging

## 🔧 API Endpoints

### Photo Upload
```http
POST /api/photos
Content-Type: multipart/form-data

Form Data:
- photo: [image file]
- title: [string]
- description: [string]
- location: [JSON string]
- photographer: [JSON string]
- tags: [JSON string array]
- category: [string]
```

### Avatar Upload
```http
POST /api/reader/avatar
Content-Type: multipart/form-data
Authorization: Bearer [token]

Form Data:
- avatar: [image file]
```

## 📊 Usage Limits (Free Tier)

- **Storage**: 25GB
- **Monthly Transformations**: 25,000
- **Monthly Views**: 25,000

## 🚀 Production Deployment

1. **Environment Variables**: Set Cloudinary credentials in production
2. **CORS Configuration**: Update Cloudinary CORS settings if needed
3. **Monitoring**: Monitor usage in Cloudinary dashboard
4. **Backup Strategy**: Consider backup strategy for critical images

## 🐛 Troubleshooting

### Common Issues:

1. **"Cloudinary not configured"**
   - Check environment variables are set correctly
   - Restart the server after updating .env

2. **Upload fails**
   - Verify API credentials
   - Check file size limits (10MB default)
   - Ensure image format is supported

3. **Images not displaying**
   - Check browser console for CORS errors
   - Verify Cloudinary URLs are accessible

### Debug Commands:

```bash
# Test Cloudinary connection
curl http://localhost:5000/api/reader/test-cloudinary

# Check server logs
tail -f backend/logs/app.log
```

## 📈 Benefits of Cloudinary

- ✅ **Global CDN**: Fast image delivery worldwide
- ✅ **Automatic optimization**: Images optimized for web
- ✅ **Format conversion**: Automatic format selection
- ✅ **Responsive images**: Multiple sizes generated automatically
- ✅ **Analytics**: Detailed usage and performance metrics
- ✅ **Reliability**: 99.9% uptime SLA

## 🎉 You're All Set!

Your Travel Blog now has professional image upload capabilities with Cloudinary! 🚀