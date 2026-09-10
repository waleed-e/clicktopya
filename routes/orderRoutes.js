const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, optionalProtect, admin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.post('/', optionalProtect, orderController.create);
router.get('/my-orders', protect, orderController.myOrders);
router.get('/', protect, admin, adminController.listOrders);
router.put('/:id/status', protect, admin, adminController.updateOrderStatus);

module.exports = router;
