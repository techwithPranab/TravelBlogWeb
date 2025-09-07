# Google Drive Integration Setup

This project now uses Google Drive for file storage instead of AWS S3. Follow these steps to set up Google Drive integration:

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

## 2. Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `travel-blog-service`
   - Description: `Service account for Travel Blog file uploads`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## 3. Generate Service Account Key

1. In the "Credentials" page, find your service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create new key"
5. Select "JSON" format
6. Download the key file

## 4. Set up Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a main folder for your uploads (e.g., "TravelBlogUploads")
3. Share the folder with your service account email (from step 2)
4. Set the permission to "Editor"
5. Copy the folder ID from the URL (the part after `/folders/`)

## 5. Update Environment Variables

Update your `.env` file with the following variables:

```env
# Google Drive Configuration
GOOGLE_DRIVE_KEYFILE_PATH=./service-account-key.json
GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
```

Replace `your-folder-id-here` with the folder ID from step 4.

## 6. Place Service Account Key

1. Rename the downloaded JSON key file to `service-account-key.json`
2. Place it in the `backend/` directory
3. Make sure it's in your `.gitignore` file to avoid committing sensitive credentials

## 7. Test the Integration

1. Start your backend server: `npm start`
2. Try uploading an avatar or photo
3. Check your Google Drive folder to verify files are being uploaded

## File Structure

- Main uploads go to: `GOOGLE_DRIVE_FOLDER_ID/photos/`
- Thumbnails go to: `GOOGLE_DRIVE_FOLDER_ID/photos/thumbnails/`
- Avatars go to: `GOOGLE_DRIVE_FOLDER_ID/avatars/`

## Security Notes

- Never commit the `service-account-key.json` file to version control
- Regularly rotate service account keys
- Limit service account permissions to only necessary Google Drive operations
- Monitor your Google Cloud usage and costs

## Troubleshooting

- **403 Forbidden**: Check that the service account has Editor access to the folder
- **File not found**: Verify the folder ID is correct
- **Invalid credentials**: Ensure the service account key file is properly formatted and placed in the correct location
