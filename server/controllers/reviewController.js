const Review = require('../models/Review');
const Property = require('../models/Property');

// @desc    Add review for a property
// @route   POST /api/reviews
// @access  Private (Tenant only)
exports.addReview = async (req, res, next) => {
  try {
    const { propertyId, rating, reviewText } = req.body;

    if (!propertyId || !rating || !reviewText) {
      return res.status(400).json({ success: false, message: 'Please provide property ID, rating, and review text' });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check if tenant already reviewed this property
    const existingReview = await Review.findOne({
      propertyId,
      tenantId: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this property. Only one review per property is allowed.'
      });
    }

    // Create review
    const review = await Review.create({
      propertyId,
      tenantId: req.user.id,
      rating: Number(rating),
      reviewText
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for a property
// @route   GET /api/reviews/:propertyId
// @access  Public
exports.getPropertyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ propertyId: req.params.propertyId })
      .populate({
        path: 'tenantId',
        select: 'name profileImage'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Tenant who wrote it, or Admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check permissions (User who wrote it or Admin)
    if (review.tenantId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const propertyId = review.propertyId;

    // Use deleteOne
    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
