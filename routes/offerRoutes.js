const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { protect, admin } = require('../middleware/auth');

// Public route: active offers only
router.get('/', offerController.getActiveOffers);

// Admin routes
router.get('/all', protect, admin, offerController.getAllOffers);
router.post('/', protect, admin, offerController.createOffer);
router.put('/:id', protect, admin, offerController.updateOffer);
router.delete('/:id', protect, admin, offerController.deleteOffer);
router.patch('/:id/toggle', protect, admin, offerController.toggleOfferActive);

module.exports = router;
