# 🚀 Google Drive Setup Guide

## Current Status
❌ **Google Drive folder not found** - You need to complete the setup

## Step-by-Step Setup

### 1. Create Google Drive Folder
1. Go to [Google Drive](https://drive.google.com/)
2. Click **"New"** → **"Folder"**
3. Name it: `TravelBlogUploads`
4. Click **"Create"**

### 2. Share the Folder
1. Right-click on `TravelBlogUploads` folder
2. Click **"Share"**
3. Enter this email: `travelblog@technicalblog-469308.iam.gserviceaccount.com`
4. Set role to **"Editor"**
5. Click **"Send"**

### 3. Get Folder ID
1. Open the `TravelBlogUploads` folder
2. Copy the folder ID from the URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```
   The `FOLDER_ID_HERE` part is your folder ID

### 4. Update Environment
Update your `.env` file:
```env
GOOGLE_DRIVE_FOLDER_ID=YOUR_ACTUAL_FOLDER_ID_HERE
```

### 5. Test Connection
Restart your server and test:
```bash
curl -X GET "http://localhost:5000/api/v1/reader/test-drive"
```

## 🔧 Alternative: Use Local Storage (Temporary)

If you can't set up Google Drive right now, you can temporarily use local storage:

### Option A: Local File Storage
```bash
# In your .env file, temporarily disable Google Drive
GOOGLE_DRIVE_FOLDER_ID=local-storage
```

### Option B: Use a Simple Upload Solution
You can also use services like:
- **ImgBB** (free image hosting)
- **Cloudinary** (free tier available)
- **Imgur API**

## 📋 Quick Checklist

- [ ] Created `TravelBlogUploads` folder in Google Drive
- [ ] Shared folder with `travelblog@technicalblog-469308.iam.gserviceaccount.com`
- [ ] Set permission to "Editor"
- [ ] Copied folder ID from URL
- [ ] Updated `.env` file with correct folder ID
- [ ] Restarted server
- [ ] Tested connection

## 🆘 Still Having Issues?

If you continue having problems:

1. **Verify Service Account**: Make sure the service account email is correct
2. **Check Permissions**: Ensure the folder is shared with "Editor" access
3. **Test with New Folder**: Try creating a brand new folder and sharing it
4. **Check Console Logs**: Look for detailed error messages in server logs

## 💡 Pro Tips

- **Folder Structure**: Google Drive will automatically create subfolders for `photos/`, `avatars/`, etc.
- **File Permissions**: All uploaded files are set to public access automatically
- **Error Handling**: The system includes comprehensive error logging for debugging

Once you complete the setup, your avatar uploads and photo management will work seamlessly! 🎉
