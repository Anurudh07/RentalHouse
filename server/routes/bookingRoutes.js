const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect); // All booking routes require authentication

router.route('/')
  .post(authorizeRoles('tenant'), createBooking)
  .get(getBookings);

router.route('/:id')
  .put(updateBookingStatus);

module.exports = router;
