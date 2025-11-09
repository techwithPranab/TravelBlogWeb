"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCloudinaryConnection = exports.deleteFromCloudinary = exports.uploadThumbnailToCloudinary = exports.uploadBufferToCloudinary = exports.testDriveConnection = exports.convertToDownloadUrl = exports.getFileIdFromUrl = exports.deleteFromDrive = exports.uploadToDrive = exports.uploadBufferToDrive = exports.photoUpload = void 0;
const googleapis_1 = require("googleapis");
const stream_1 = require("stream");
const multer_1 = __importDefault(require("multer"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
// Google Drive configuration
const KEYFILE_PATH = process.env.GOOGLE_DRIVE_KEYFILE_PATH || './service-account-key.json';
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || 'your-folder-id-here';
// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
// Configure Cloudinary
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    cloudinary_1.v2.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET
    });
}
// Initialize Google Drive API
const auth = new googleapis_1.google.auth.GoogleAuth({
    keyFile: KEYFILE_PATH,
    scopes: ['https://www.googleapis.com/auth/drive.file']
});
const drive = googleapis_1.google.drive({ version: 'v3', auth });
// Multer configuration for file uploads
exports.photoUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
// Convert buffer to readable stream
const bufferToStream = (buffer) => {
    const stream = new stream_1.Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
};
// Function to upload buffer to Google Drive
const uploadBufferToDrive = async (buffer, fileName, mimeType, folder = 'photos') => {
    try {
        // Check if Google Drive is properly configured
        if (DRIVE_FOLDER_ID === 'your-folder-id-here') {
            throw new Error('Google Drive not configured. Please set GOOGLE_DRIVE_FOLDER_ID in your .env file.');
        }
        // First, verify the main folder exists and is accessible
        let parentFolderId = DRIVE_FOLDER_ID;
        console.log('Checking main folder access:', DRIVE_FOLDER_ID);
        try {
            const mainFolderCheck = await drive.files.get({
                fileId: DRIVE_FOLDER_ID,
                fields: 'id,name'
            });
            console.log('Main folder found:', mainFolderCheck.data.name);
        }
        catch (folderError) {
            console.error('Main folder not accessible:', folderError);
            throw new Error(`Google Drive folder not found or not accessible. Please check your folder ID and sharing permissions.`);
        }
        if (folder !== 'photos') {
            const folderQuery = `name='${folder}' and mimeType='application/vnd.google-apps.folder' and '${DRIVE_FOLDER_ID}' in parents and trashed=false`;
            console.log('Searching for subfolder:', folder);
            const folderSearch = await drive.files.list({
                q: folderQuery,
                fields: 'files(id, name)'
            });
            if (folderSearch.data.files && folderSearch.data.files.length > 0) {
                parentFolderId = folderSearch.data.files[0].id;
                console.log('Using existing subfolder:', folderSearch.data.files[0].name);
            }
            else {
                // Create folder if it doesn't exist
                console.log('Creating new subfolder:', folder);
                const folderMetadata = {
                    name: folder,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [DRIVE_FOLDER_ID]
                };
                const folderResponse = await drive.files.create({
                    requestBody: folderMetadata,
                    fields: 'id'
                });
                parentFolderId = folderResponse.data.id;
                console.log('Created subfolder with ID:', parentFolderId);
            }
        }
        // Upload file
        console.log('Uploading file to folder:', parentFolderId);
        const fileMetadata = {
            name: fileName,
            parents: [parentFolderId]
        };
        const media = {
            mimeType: mimeType,
            body: bufferToStream(buffer)
        };
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id,webViewLink,webContentLink'
        });
        console.log('File uploaded successfully with ID:', response.data.id);
        // Make file publicly accessible
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });
        // Return the direct download link for images
        const fileUrl = response.data.webContentLink || `https://drive.google.com/uc?id=${response.data.id}`;
        console.log('File URL:', fileUrl);
        return fileUrl;
    }
    catch (error) {
        console.error('Error uploading buffer to Google Drive:', error);
        throw error;
    }
};
exports.uploadBufferToDrive = uploadBufferToDrive;
// Function to upload file to Google Drive (with local fallback)
const uploadToDrive = async (file, folder = 'photos') => {
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
    console.log('Uploading file to Google Drive with name:', fileName);
    // Check if Google Drive is configured
    if (DRIVE_FOLDER_ID === 'your-folder-id-here' || DRIVE_FOLDER_ID === 'local-storage') {
        console.log('Google Drive not configured, using local storage fallback');
        return uploadToLocal(file, folder);
    }
    return await (0, exports.uploadBufferToDrive)(file.buffer, fileName, file.mimetype, folder);
};
exports.uploadToDrive = uploadToDrive;
// Local storage fallback function
const uploadToLocal = async (file, folder) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = path_1.default.join(__dirname, '../../uploads', folder);
    await promises_1.default.mkdir(uploadDir, { recursive: true });
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
    const filePath = path_1.default.join(uploadDir, fileName);
    // Write file to disk
    await promises_1.default.writeFile(filePath, file.buffer);
    // Return local file URL
    const localUrl = `http://localhost:5000/uploads/${folder}/${fileName}`;
    console.log('File saved locally:', localUrl);
    return localUrl;
};
// Function to delete file from Google Drive
const deleteFromDrive = async (fileId) => {
    try {
        await drive.files.update({
            fileId: fileId,
            requestBody: {
                trashed: true
            }
        });
    }
    catch (error) {
        console.error('Error deleting file from Google Drive:', error);
        throw error;
    }
};
exports.deleteFromDrive = deleteFromDrive;
// Function to get file info from Google Drive URL
const getFileIdFromUrl = (url) => {
    const match = /\/file\/d\/([a-zA-Z0-9-_]+)/.exec(url);
    return match ? match[1] : null;
};
exports.getFileIdFromUrl = getFileIdFromUrl;
// Function to convert Google Drive view URL to direct download URL
const convertToDownloadUrl = (url) => {
    if (!url)
        return null;
    if (url.includes('drive.google.com/file/d/')) {
        const fileId = (0, exports.getFileIdFromUrl)(url);
        if (fileId) {
            return `https://drive.google.com/uc?id=${fileId}`;
        }
    }
    return url; // Return original URL if it's not a Google Drive view URL
};
exports.convertToDownloadUrl = convertToDownloadUrl;
// Function to test Google Drive connection and folder access
const testDriveConnection = async () => {
    try {
        console.log('Testing Google Drive connection...');
        // Test service account authentication
        const authTest = await drive.about.get({ fields: 'user' });
        console.log('Service account authenticated:', authTest.data.user);
        // Test folder access
        const folderTest = await drive.files.get({
            fileId: DRIVE_FOLDER_ID,
            fields: 'id,name,mimeType,owners,permissions'
        });
        console.log('Folder access test successful:', folderTest.data);
        return {
            success: true,
            message: 'Google Drive connection successful',
            folderInfo: folderTest.data
        };
    }
    catch (error) {
        console.error('Google Drive connection test failed:', error);
        return {
            success: false,
            message: `Connection failed: ${error.message}`,
            folderInfo: null
        };
    }
};
exports.testDriveConnection = testDriveConnection;
// Function to upload buffer to Cloudinary
const uploadBufferToCloudinary = async (buffer, fileName, folder = 'photos') => {
    try {
        console.log('Uploading buffer to Cloudinary with name:', fileName);
        console.log('Buffer size (bytes):', buffer.length);
        console.log('Target folder in Cloudinary:', folder);
        console.log('Cloudinary config:', {
            CLOUDINARY_CLOUD_NAME,
            CLOUDINARY_API_KEY,
            CLOUDINARY_API_SECRET
        });
        // Check if Cloudinary is properly configured
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
            throw new Error('Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
        }
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: folder,
                public_id: fileName.replace(/\.[^/.]+$/, ""), // Remove file extension for public_id
                resource_type: 'image',
                format: 'jpg',
                quality: 'auto',
                transformation: [
                    { width: 1920, height: 1080, crop: 'limit' } // Resize to max 1920x1080
                ]
            }, (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(new Error(`Cloudinary upload failed: ${error.message}`));
                }
                else if (result) {
                    console.log('File uploaded to Cloudinary:', result.secure_url);
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id
                    });
                }
                else {
                    reject(new Error('Upload failed - no result returned'));
                }
            });
            // Convert buffer to stream and pipe to Cloudinary
            const stream = new stream_1.Readable();
            stream.push(buffer);
            stream.push(null);
            stream.pipe(uploadStream);
        });
    }
    catch (error) {
        console.error('Error uploading buffer to Cloudinary:', error);
        throw error;
    }
};
exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
// Function to upload thumbnail to Cloudinary
const uploadThumbnailToCloudinary = async (buffer, fileName, folder = 'photos/thumbnails') => {
    try {
        // Check if Cloudinary is properly configured
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
            throw new Error('Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
        }
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: folder,
                public_id: fileName.replace(/\.[^/.]+$/, ""), // Remove file extension for public_id
                resource_type: 'image',
                format: 'jpg',
                quality: 'auto',
                transformation: [
                    { width: 400, height: 300, crop: 'fill' } // Create thumbnail 400x300
                ]
            }, (error, result) => {
                if (error) {
                    console.error('Cloudinary thumbnail upload error:', error);
                    reject(new Error(`Cloudinary thumbnail upload failed: ${error.message}`));
                }
                else if (result) {
                    console.log('Thumbnail uploaded to Cloudinary:', result.secure_url);
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id
                    });
                }
                else {
                    reject(new Error('Thumbnail upload failed - no result returned'));
                }
            });
            // Convert buffer to stream and pipe to Cloudinary
            const stream = new stream_1.Readable();
            stream.push(buffer);
            stream.push(null);
            stream.pipe(uploadStream);
        });
    }
    catch (error) {
        console.error('Error uploading thumbnail to Cloudinary:', error);
        throw error;
    }
};
exports.uploadThumbnailToCloudinary = uploadThumbnailToCloudinary;
// Function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
            throw new Error('Cloudinary not configured.');
        }
        const result = await cloudinary_1.v2.uploader.destroy(publicId);
        console.log('File deleted from Cloudinary:', publicId, result);
    }
    catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        throw error;
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
// Function to test Cloudinary connection
const testCloudinaryConnection = async () => {
    try {
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
            return {
                success: false,
                message: 'Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.'
            };
        }
        // Test connection by getting account info
        const result = await cloudinary_1.v2.api.ping();
        console.log('Cloudinary connection test successful:', result);
        return {
            success: true,
            message: 'Cloudinary connection successful'
        };
    }
    catch (error) {
        console.error('Cloudinary connection test failed:', error);
        return {
            success: false,
            message: `Connection failed: ${error.message}`
        };
    }
};
exports.testCloudinaryConnection = testCloudinaryConnection;
exports.default = drive;
