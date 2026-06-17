const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: [true, 'Please add a review text'],
    trim: true
  }
}, {
  timestamps: true
});

// Enforce one review per property per user
ReviewSchema.index({ propertyId: 1, tenantId: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function(propertyId) {
  const obj = await this.aggregate([
    {
      $match: { propertyId: propertyId }
    },
    {
      $group: {
        _id: '$propertyId',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    const average = obj.length > 0 ? Math.round(obj[0].averageRating * 10) / 10 : 0;
    await mongoose.model('Property').findByIdAndUpdate(propertyId, {
      averageRating: average
    });
  } catch (err) {
    console.error(`Error updating average rating: ${err.message}`);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', async function() {
  await this.constructor.getAverageRating(this.propertyId);
});

// Call getAverageRating after remove / delete
ReviewSchema.post('deleteOne', { document: true, query: false }, async function() {
  await this.constructor.getAverageRating(this.propertyId);
});

module.exports = mongoose.model('Review', ReviewSchema);
