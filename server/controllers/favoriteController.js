const Favorite = require('../models/Favorite');
const Property = require('../models/Property');

// @desc    Get all favorites of current tenant
// @route   GET /api/favorites
// @access  Private (Tenant only)
exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ tenantId: req.user.id })
      .populate({
        path: 'propertyId',
        select: 'title rent deposit propertyType address city images status averageRating bedrooms bathrooms area'
      })
      .sort('-createdAt');

    // Filter out any favorites where property was deleted in the meantime
    const activeFavorites = favorites.filter(fav => fav.propertyId !== null);

    res.status(200).json({
      success: true,
      count: activeFavorites.length,
      data: activeFavorites
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add property to favorites
// @route   POST /api/favorites
// @access  Private (Tenant only)
exports.addFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'Please provide a property ID' });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check if already favorited
    const isFavorited = await Favorite.findOne({
      tenantId: req.user.id,
      propertyId
    });

    if (isFavorited) {
      return res.status(400).json({ success: false, message: 'Property is already in your wishlist' });
    }

    const favorite = await Favorite.create({
      tenantId: req.user.id,
      propertyId
    });

    res.status(201).json({
      success: true,
      data: favorite
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove property from favorites
// @route   DELETE /api/favorites/:propertyId
// @access  Private (Tenant only)
exports.removeFavorite = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      tenantId: req.user.id,
      propertyId: req.params.propertyId
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Property was not in your wishlist' });
    }

    res.status(200).json({
      success: true,
      message: 'Property removed from wishlist'
    });
  } catch (err) {
    next(err);
  }
};
