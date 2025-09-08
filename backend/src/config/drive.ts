import { google } from 'googleapis'
import { Readable } from 'stream'
import multer from 'multer'
import { Request } from 'express'
import fs from 'fs/promises'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary'

// Google Drive configuration
const KEYFILE_PATH = process.env.GOOGLE_DRIVE_KEYFILE_PATH || './service-account-key.json'
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || 'your-folder-id-here'

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

// Configure Cloudinary
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  })
}

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILE_PATH,
  scopes: ['https://www.googleapis.com/auth/drive.file']
})

const drive = google.drive({ version: 'v3', auth })

// Multer configuration for file uploads
export const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req: Request, file: any, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// Convert buffer to readable stream
const bufferToStream = (buffer: Buffer) => {
  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)
  return stream
}

// Function to upload buffer to Google Drive
export const uploadBufferToDrive = async (buffer: Buffer, fileName: string, mimeType: string, folder: string = 'photos'): Promise<string> => {
  try {
    // Check if Google Drive is properly configured
    if (DRIVE_FOLDER_ID === 'your-folder-id-here') {
      throw new Error('Google Drive not configured. Please set GOOGLE_DRIVE_FOLDER_ID in your .env file.')
    }

    // First, verify the main folder exists and is accessible
    let parentFolderId = DRIVE_FOLDER_ID
    
    console.log('Checking main folder access:', DRIVE_FOLDER_ID)
    try {
      const mainFolderCheck = await drive.files.get({
        fileId: DRIVE_FOLDER_ID,
        fields: 'id,name'
      })
      console.log('Main folder found:', mainFolderCheck.data.name)
    } catch (folderError) {
      console.error('Main folder not accessible:', folderError)
      throw new Error(`Google Drive folder not found or not accessible. Please check your folder ID and sharing permissions.`)
    }

    if (folder !== 'photos') {
      const folderQuery = `name='${folder}' and mimeType='application/vnd.google-apps.folder' and '${DRIVE_FOLDER_ID}' in parents and trashed=false`
      console.log('Searching for subfolder:', folder)
      const folderSearch = await drive.files.list({
        q: folderQuery,
        fields: 'files(id, name)'
      })

      if (folderSearch.data.files && folderSearch.data.files.length > 0) {
        parentFolderId = folderSearch.data.files[0].id!
        console.log('Using existing subfolder:', folderSearch.data.files[0].name)
      } else {
        // Create folder if it doesn't exist
        console.log('Creating new subfolder:', folder)
        const folderMetadata = {
          name: folder,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [DRIVE_FOLDER_ID]
        }
        const folderResponse = await drive.files.create({
          requestBody: folderMetadata,
          fields: 'id'
        })
        parentFolderId = folderResponse.data.id!
        console.log('Created subfolder with ID:', parentFolderId)
      }
    }

    // Upload file
    console.log('Uploading file to folder:', parentFolderId)
    const fileMetadata = {
      name: fileName,
      parents: [parentFolderId]
    }

    const media = {
      mimeType: mimeType,
      body: bufferToStream(buffer)
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,webViewLink,webContentLink'
    })

    console.log('File uploaded successfully with ID:', response.data.id)

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    })

    // Return the direct download link for images
    const fileUrl = response.data.webContentLink || `https://drive.google.com/uc?id=${response.data.id}`
    console.log('File URL:', fileUrl)
    return fileUrl

  } catch (error) {
    console.error('Error uploading buffer to Google Drive:', error)
    throw error
  }
}

// Function to upload file to Google Drive (with local fallback)
export const uploadToDrive = async (file: any, folder: string = 'photos'): Promise<string> => {
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`
  console.log('Uploading file to Google Drive with name:', fileName)

  // Check if Google Drive is configured
  if (DRIVE_FOLDER_ID === 'your-folder-id-here' || DRIVE_FOLDER_ID === 'local-storage') {
    console.log('Google Drive not configured, using local storage fallback')
    return uploadToLocal(file, folder)
  }

  return await uploadBufferToDrive(file.buffer, fileName, file.mimetype, folder)
}

// Local storage fallback function
const uploadToLocal = async (file: any, folder: string): Promise<string> => {
  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(__dirname, '../../uploads', folder)
  await fs.mkdir(uploadDir, { recursive: true })

  const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`
  const filePath = path.join(uploadDir, fileName)

  // Write file to disk
  await fs.writeFile(filePath, file.buffer)

  // Return local file URL
  const localUrl = `http://localhost:5000/uploads/${folder}/${fileName}`
  console.log('File saved locally:', localUrl)
  return localUrl
}

// Function to delete file from Google Drive
export const deleteFromDrive = async (fileId: string): Promise<void> => {
  try {
    await drive.files.update({
      fileId: fileId,
      requestBody: {
        trashed: true
      }
    })
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error)
    throw error
  }
}

// Function to get file info from Google Drive URL
export const getFileIdFromUrl = (url: string): string | null => {
  const match = /\/file\/d\/([a-zA-Z0-9-_]+)/.exec(url)
  return match ? match[1] : null
}

// Function to convert Google Drive view URL to direct download URL
export const convertToDownloadUrl = (url: string | null | undefined): string | null => {
  if (!url) return null
  if (url.includes('drive.google.com/file/d/')) {
    const fileId = getFileIdFromUrl(url)
    if (fileId) {
      return `https://drive.google.com/uc?id=${fileId}`
    }
  }
  return url // Return original URL if it's not a Google Drive view URL
}

// Function to test Google Drive connection and folder access
export const testDriveConnection = async (): Promise<{ success: boolean; message: string; folderInfo?: any }> => {
  try {
    console.log('Testing Google Drive connection...')
    
    // Test service account authentication
    const authTest = await drive.about.get({ fields: 'user' })
    console.log('Service account authenticated:', authTest.data.user)
    
    // Test folder access
    const folderTest = await drive.files.get({
      fileId: DRIVE_FOLDER_ID,
      fields: 'id,name,mimeType,owners,permissions'
    })
    
    console.log('Folder access test successful:', folderTest.data)
    
    return {
      success: true,
      message: 'Google Drive connection successful',
      folderInfo: folderTest.data
    }
  } catch (error: any) {
    console.error('Google Drive connection test failed:', error)
    return {
      success: false,
      message: `Connection failed: ${error.message}`,
      folderInfo: null
    }
  }
}

// Function to upload buffer to Cloudinary
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  fileName: string,
  folder: string = 'photos'
): Promise<{ url: string; public_id: string }> => {
  try {
    console.log('Uploading buffer to Cloudinary with name:', fileName)
    console.log('Buffer size (bytes):', buffer.length)
    console.log('Target folder in Cloudinary:', folder)
    console.log('Cloudinary config:', {
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET
    });
    // Check if Cloudinary is properly configured
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.')
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: fileName.replace(/\.[^/.]+$/, ""), // Remove file extension for public_id
          resource_type: 'image',
          format: 'jpg',
          quality: 'auto',
          transformation: [
            { width: 1920, height: 1080, crop: 'limit' } // Resize to max 1920x1080
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(new Error(`Cloudinary upload failed: ${error.message}`))
          } else if (result) {
            console.log('File uploaded to Cloudinary:', result.secure_url)
            resolve({
              url: result.secure_url,
              public_id: result.public_id
            })
          } else {
            reject(new Error('Upload failed - no result returned'))
          }
        }
      )

      // Convert buffer to stream and pipe to Cloudinary
      const stream = new Readable()
      stream.push(buffer)
      stream.push(null)
      stream.pipe(uploadStream)
    })
  } catch (error) {
    console.error('Error uploading buffer to Cloudinary:', error)
    throw error
  }
}

// Function to upload thumbnail to Cloudinary
export const uploadThumbnailToCloudinary = async (
  buffer: Buffer,
  fileName: string,
  folder: string = 'photos/thumbnails'
): Promise<{ url: string; public_id: string }> => {
  try {
    // Check if Cloudinary is properly configured
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.')
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: fileName.replace(/\.[^/.]+$/, ""), // Remove file extension for public_id
          resource_type: 'image',
          format: 'jpg',
          quality: 'auto',
          transformation: [
            { width: 400, height: 300, crop: 'fill' } // Create thumbnail 400x300
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary thumbnail upload error:', error)
            reject(new Error(`Cloudinary thumbnail upload failed: ${error.message}`))
          } else if (result) {
            console.log('Thumbnail uploaded to Cloudinary:', result.secure_url)
            resolve({
              url: result.secure_url,
              public_id: result.public_id
            })
          } else {
            reject(new Error('Thumbnail upload failed - no result returned'))
          }
        }
      )

      // Convert buffer to stream and pipe to Cloudinary
      const stream = new Readable()
      stream.push(buffer)
      stream.push(null)
      stream.pipe(uploadStream)
    })
  } catch (error) {
    console.error('Error uploading thumbnail to Cloudinary:', error)
    throw error
  }
}

// Function to delete file from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary not configured.')
    }

    const result = await cloudinary.uploader.destroy(publicId)
    console.log('File deleted from Cloudinary:', publicId, result)
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error)
    throw error
  }
}

// Function to test Cloudinary connection
export const testCloudinaryConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return {
        success: false,
        message: 'Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.'
      }
    }

    // Test connection by getting account info
    const result = await cloudinary.api.ping()
    console.log('Cloudinary connection test successful:', result)

    return {
      success: true,
      message: 'Cloudinary connection successful'
    }
  } catch (error: any) {
    console.error('Cloudinary connection test failed:', error)
    return {
      success: false,
      message: `Connection failed: ${error.message}`
    }
  }
}

export default drive
