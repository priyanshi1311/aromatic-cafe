const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAvailableSlots, createBooking, getBookings, getBookingById,
  getBookingConfirmation, updateBooking, getDashboardStats, exportBookingsCSV,
} = require('../controllers/bookingController');

// Public routes
router.get('/slots', getAvailableSlots);
router.post('/', createBooking);
router.get('/confirm/:bookingId', getBookingConfirmation);

// Private routes
router.get('/dashboard', protect, getDashboardStats);
router.get('/export', protect, exportBookingsCSV);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, updateBooking);

module.exports = router;
