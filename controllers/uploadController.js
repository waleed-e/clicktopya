const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

// Ensure directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Magic bytes validator for security
function validateMagicBytes(buffer, ext) {
  if (buffer.length < 4) return false;
  const hex = buffer.slice(0, 4).toString('hex').toLowerCase();

  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return hex.startsWith('ffd8ff');
    case 'png':
      return hex.startsWith('89504e47');
    case 'gif':
      return hex.startsWith('47494638');
    case 'webp':
      // RIFF header
      return buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
             buffer.slice(8, 12).toString('ascii') === 'WEBP';
    default:
      return false;
  }
}

/**
 * POST /api/upload
 * Accepts { image: "data:image/jpeg;base64,...", filename: "optional" }
 * Saves file locally to /public/uploads/ and returns accessible URL.
 */
exports.uploadImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ message: 'يرجى تحديد ملف صورة صالح' });
    }

    // Parse Data URL: data:image/png;base64,iVBORw0KGgo...
    const matches = image.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i);

    if (!matches) {
      return res.status(400).json({
        message: 'صيغة الصورة غير مدعومة. الصيغ المدعومة: PNG, JPG, JPEG, WEBP, GIF'
      });
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    const base64Data = matches[2];

    const buffer = Buffer.from(base64Data, 'base64');

    // 5MB size limit
    const MAX_SIZE = 5 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return res.status(400).json({ message: 'حجم الصورة كبير جداً، الحد الأقصى 5 ميجابايت' });
    }

    // Verify magic bytes
    if (!validateMagicBytes(buffer, ext)) {
      return res.status(400).json({ message: 'محتوى الملف غير متطابق مع صيغة الصورة المحددة' });
    }

    // 1. If Cloud Storage (Cloudinary) is configured in environment, upload to Cloud
    const cloudStorage = require('../services/cloudStorageService');
    if (cloudStorage.isCloudStorageConfigured()) {
      try {
        const cloudResult = await cloudStorage.uploadToCloud(image, 'clicktopya');
        return res.status(201).json({
          success: true,
          url: cloudResult.url,
          storage: 'cloud',
          publicId: cloudResult.public_id
        });
      } catch (cloudErr) {
        console.warn('[Upload] Cloud upload attempt failed, falling back to local storage:', cloudErr.message);
      }
    }

    // 2. Local filesystem storage (Local / development or fallback)
    const randomHex = crypto.randomBytes(8).toString('hex');
    const fileName = `img-${Date.now()}-${randomHex}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    res.status(201).json({
      success: true,
      url: publicUrl,
      fileName,
      storage: 'local'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء رفع الصورة، يرجى المحاولة مرة أخرى' });
  }
};
