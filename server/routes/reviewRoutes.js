const express = require('express');
const router = express.Router();
const {
  addReview,
  getPropertyReviews,
  deleteReview
} = require('../controllers/reviewController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorizeRoles('tenant'), addReview);

router.route('/:propertyId')
  .get(getPropertyReviews);

router.route('/:id')
  .delete(protect, deleteReview);

module.exports = router;
