const fs = require('fs');
const path = require('path');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const uploadImageToCloud = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    if (isCloudinaryConfigured) {
      // Upload to Cloudinary with compression & optimization
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: 'rentalhouse_properties',
        transformation: [{ width: 1000, height: 750, crop: "limit", quality: "auto" }]
      });

      // Remove local file
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }

      return result.secure_url;
    } else {
      // Cloudinary not configured: keep file locally
      // Return a path that the client can prepend the API base URL to (e.g. /uploads/filename.jpg)
      const filename = path.basename(localFilePath);
      return `/uploads/${filename}`;
    }
  } catch (error) {
    console.error('Image upload service error:', error);
    // Cleanup local file on error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};

module.exports = { uploadImageToCloud };
