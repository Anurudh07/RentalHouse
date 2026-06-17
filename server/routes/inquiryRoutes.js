const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  updateInquiryStatus
} = require('../controllers/inquiryController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Route for submitting inquiries (public)
router.post('/', createInquiry);

// Routes for viewing and updating inquiries (Owner & Admin only)
router.route('/')
  .get(protect, authorizeRoles('owner', 'admin'), getInquiries);

router.route('/:id')
  .put(protect, authorizeRoles('owner', 'admin'), updateInquiryStatus);

module.exports = router;
