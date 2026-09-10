const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, adminController.listUsers);
router.put('/:id/toggle-admin', protect, admin, adminController.toggleAdmin);

module.exports = router;
