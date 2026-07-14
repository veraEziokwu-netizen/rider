const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createDelivery, getMyDeliveries, trackDelivery,
  getAvailableDeliveries, getRiderDeliveries,
  acceptDelivery, updateStatus,
  getAllDeliveries, getStats
} = require('../controllers/deliveryController');

// Public
router.get('/track/:code', trackDelivery);

// Customer
router.post('/', protect, authorize('customer'), createDelivery);
router.get('/my', protect, authorize('customer'), getMyDeliveries);

// Rider
router.get('/available', protect, authorize('rider'), getAvailableDeliveries);
router.get('/rider', protect, authorize('rider'), getRiderDeliveries);
router.patch('/:id/accept', protect, authorize('rider'), acceptDelivery);
router.patch('/:id/status', protect, authorize('rider'), updateStatus);

// Admin
router.get('/', protect, authorize('admin'), getAllDeliveries);
router.get('/stats', protect, authorize('admin'), getStats);

module.exports = router;
