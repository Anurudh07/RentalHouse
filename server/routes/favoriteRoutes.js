const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite
} = require('../controllers/favoriteController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorizeRoles('tenant')); // Only tenants can manage favorites/wishlist

router.route('/')
  .get(getFavorites)
  .post(addFavorite);

router.route('/:propertyId')
  .delete(removeFavorite);

module.exports = router;
