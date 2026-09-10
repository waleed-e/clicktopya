const https = require('https');
const crypto = require('crypto');

/**
 * Cloud Storage Service
 * Supports Cloudinary out of the box using pure HTTPS REST API (zero extra npm dependencies).
 * Required environment variables for Cloudinary:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 * 
 * If Cloudinary is not configured, returns null so the caller can fallback to local storage.
 */

function isCloudStorageConfigured() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return Boolean(cloudName && apiKey && apiSecret);
}

/**
 * Uploads a base64 or DataURL image to Cloudinary securely.
 * @param {string} dataUrl - e.g. "data:image/png;base64,..."
 * @param {string} folder - optional folder name, default "clicktopya"
 * @returns {Promise<{ url: string, public_id: string }>}
 */
async function uploadToCloud(dataUrl, folder = 'clicktopya') {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloud storage is not configured. Missing CLOUDINARY credentials.');
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // Generate SHA1 signature required by Cloudinary API
  // Parameter string sorted alphabetically: "folder={folder}&timestamp={timestamp}{api_secret}"
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');

  const postData = JSON.stringify({
    file: dataUrl,
    timestamp,
    api_key: apiKey,
    signature,
    folder
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${cloudName}/image/upload`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300 && parsed.secure_url) {
            resolve({
              url: parsed.secure_url,
              public_id: parsed.public_id
            });
          } else {
            const errMsg = parsed.error?.message || `Cloudinary upload failed with status ${res.statusCode}`;
            reject(new Error(errMsg));
          }
        } catch (err) {
          reject(new Error(`Failed to parse cloud response: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Network error uploading to cloud: ${err.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Upload to cloud timed out after 30 seconds'));
    });

    req.write(postData);
    req.end();
  });
}

module.exports = {
  isCloudStorageConfigured,
  uploadToCloud
};
