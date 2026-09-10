const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, admin, uploadController.uploadImage);

module.exports = router;
