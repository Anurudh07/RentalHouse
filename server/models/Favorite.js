const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  }
}, {
  timestamps: true
});

// Create compound index for faster checking and to enforce uniqueness
FavoriteSchema.index({ tenantId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
