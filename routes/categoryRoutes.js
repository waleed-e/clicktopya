const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');

router.get('/', categoryController.list);
router.post('/', protect, admin, categoryController.create);
router.put('/:id', protect, admin, categoryController.update);
router.delete('/:id', protect, admin, categoryController.remove);

module.exports = router;
