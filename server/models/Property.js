const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a property title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  rent: {
    type: Number,
    required: [true, 'Please add monthly rent amount']
  },
  deposit: {
    type: Number,
    required: [true, 'Please add deposit amount']
  },
  propertyType: {
    type: String,
    required: [true, 'Please select a property type'],
    enum: ['Apartment', 'Villa', 'Independent House', 'PG']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Please specify the number of bedrooms']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Please specify the number of bathrooms']
  },
  area: {
    type: Number,
    required: [true, 'Please specify the area in sq ft']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  city: {
    type: String,
    required: [true, 'Please add a city'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'Please add a state'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Please add a pincode'],
    trim: true
  },
  amenities: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  locationCoordinates: {
    lat: {
      type: Number,
      default: 0
    },
    lng: {
      type: Number,
      default: 0
    }
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'pending'],
    default: 'available'
  },
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for reviews
PropertySchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'propertyId',
  justOne: false
});

module.exports = mongoose.model('Property', PropertySchema);
