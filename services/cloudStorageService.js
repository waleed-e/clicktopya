const cloudinary = require('cloudinary').v2;

/**
 * Cloud Storage Service
 * Uses official Cloudinary SDK.
 * Reads environment variables:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

function getCloudinaryConfig() {
  const cloud_name = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
  const api_key = (process.env.CLOUDINARY_API_KEY || '').trim();
  const api_secret = (process.env.CLOUDINARY_API_SECRET || '').trim();

  return { cloud_name, api_key, api_secret };
}

function isCloudStorageConfigured() {
  const { cloud_name, api_key, api_secret } = getCloudinaryConfig();
  return Boolean(cloud_name && api_key && api_secret);
}

/**
 * Uploads an image (Data URI or Base64 or URL) to Cloudinary.
 * @param {string} fileData - e.g. "data:image/png;base64,..."
 * @param {string} folder - default "clicktopya"
 * @returns {Promise<{ url: string, public_id: string }>}
 */
async function uploadToCloud(fileData, folder = 'clicktopya') {
  const config = getCloudinaryConfig();
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new Error('Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing or incomplete.');
  }

  cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret,
    secure: true
  });

  try {
    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: 'image'
    });

    if (!result || !result.secure_url) {
      throw new Error('Cloudinary upload returned no secure_url');
    }

    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (err) {
    console.error('[Cloudinary SDK Error]', err);
    throw new Error(`Cloudinary upload failed: ${err.message || err}`);
  }
}

module.exports = {
  isCloudStorageConfigured,
  uploadToCloud
};
