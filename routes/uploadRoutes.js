const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, admin, uploadController.uploadImage);
router.get('/status', protect, admin, uploadController.getUploadStatus);

module.exports = router;
