const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  toggleAvailability, updateLocation,
  getAllRiders, getAllUsers, toggleUserStatus
} = require('../controllers/riderController');

// Rider
router.patch('/availability', protect, authorize('rider'), toggleAvailability);
router.patch('/location', protect, authorize('rider'), updateLocation);

// Admin
router.get('/', protect, authorize('admin'), getAllRiders);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.patch('/users/:id/toggle', protect, authorize('admin'), toggleUserStatus);

module.exports = router;
