const Property = require('../models/Property');
const Review = require('../models/Review');
const { uploadImageToCloud } = require('../services/imageUploadService');
const fs = require('fs');

// @desc    Get all properties with filters, search, sorting, pagination
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from direct filtering
    const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'minRent', 'maxRent', 'bedrooms', 'bathrooms', 'rating'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query object
    let queryObj = { ...reqQuery };

    // Add status: default to available unless specified otherwise
    if (!queryObj.status) {
      queryObj.status = 'available';
    } else if (queryObj.status === 'all') {
      delete queryObj.status;
    }

    // Keyword text search (across title, description, address, city, state)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryObj.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { address: searchRegex },
        { city: searchRegex },
        { state: searchRegex }
      ];
    }

    // Min and Max Rent
    if (req.query.minRent || req.query.maxRent) {
      queryObj.rent = {};
      if (req.query.minRent) {
        queryObj.rent.$gte = Number(req.query.minRent);
      }
      if (req.query.maxRent) {
        queryObj.rent.$lte = Number(req.query.maxRent);
      }
    }

    // Bedrooms
    if (req.query.bedrooms) {
      // support both exact match and "4+" beds
      if (req.query.bedrooms.toString().endsWith('+')) {
        const val = parseInt(req.query.bedrooms);
        queryObj.bedrooms = { $gte: val };
      } else {
        queryObj.bedrooms = Number(req.query.bedrooms);
      }
    }

    // Bathrooms
    if (req.query.bathrooms) {
      if (req.query.bathrooms.toString().endsWith('+')) {
        const val = parseInt(req.query.bathrooms);
        queryObj.bathrooms = { $gte: val };
      } else {
        queryObj.bathrooms = Number(req.query.bathrooms);
      }
    }

    // Rating filter
    if (req.query.rating) {
      queryObj.averageRating = { $gte: Number(req.query.rating) };
    }

    // Build the mongoose query
    let query = Property.find(queryObj);

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort;
      if (sortBy === 'rent_asc') {
        query = query.sort('rent');
      } else if (sortBy === 'rent_desc') {
        query = query.sort('-rent');
      } else if (sortBy === 'rating_desc') {
        query = query.sort('-averageRating');
      } else if (sortBy === 'newest') {
        query = query.sort('-createdAt');
      } else {
        query = query.sort('-createdAt');
      }
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 9;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Property.countDocuments(queryObj);

    query = query.skip(startIndex).limit(limit);

    // Execute query and populate owner
    const properties = await query.populate({
      path: 'ownerId',
      select: 'name email phone profileImage'
    });

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      pagination,
      data: properties
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate({
        path: 'ownerId',
        select: 'name email phone profileImage'
      })
      .populate({
        path: 'reviews',
        populate: {
          path: 'tenantId',
          select: 'name profileImage'
        }
      });

    if (!property) {
      return res.status(404).json({ success: false, message: `Property not found with id of ${req.params.id}` });
    }

    // Find similar properties (same city and type, excluding itself)
    const similarProperties = await Property.find({
      city: property.city,
      propertyType: property.propertyType,
      _id: { $ne: property._id },
      status: 'available'
    }).limit(3);

    res.status(200).json({
      success: true,
      data: property,
      similar: similarProperties
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Owner, Admin)
exports.createProperty = async (req, res, next) => {
  try {
    // Add owner to req.body
    req.body.ownerId = req.user.id;

    // Parse coordinates and amenities if sent as strings (typical in form-data)
    if (typeof req.body.amenities === 'string') {
      try {
        req.body.amenities = JSON.parse(req.body.amenities);
      } catch (e) {
        req.body.amenities = req.body.amenities.split(',').map(a => a.trim());
      }
    }

    if (typeof req.body.locationCoordinates === 'string') {
      try {
        req.body.locationCoordinates = JSON.parse(req.body.locationCoordinates);
      } catch (e) {
        // use default
      }
    }

    // Handle multiple image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImageToCloud(file.path);
        if (url) imageUrls.push(url);
      }
    }
    req.body.images = imageUrls;

    // Create property
    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner, Admin)
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: `Property not found with id of ${req.params.id}` });
    }

    // Make sure user is owner or admin
    if (property.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update this property` });
    }

    // Parse coordinates and amenities if sent as strings
    if (typeof req.body.amenities === 'string') {
      try {
        req.body.amenities = JSON.parse(req.body.amenities);
      } catch (e) {
        req.body.amenities = req.body.amenities.split(',').map(a => a.trim());
      }
    }

    if (typeof req.body.locationCoordinates === 'string') {
      try {
        req.body.locationCoordinates = JSON.parse(req.body.locationCoordinates);
      } catch (e) {
        // keep same
      }
    }

    // Parse existing images array (if some were deleted by user in UI)
    let finalImages = [];
    if (req.body.existingImages) {
      try {
        finalImages = typeof req.body.existingImages === 'string' 
          ? JSON.parse(req.body.existingImages) 
          : req.body.existingImages;
      } catch (e) {
        finalImages = [req.body.existingImages];
      }
    } else {
      // If client didn't supply, keep current
      finalImages = property.images;
    }

    // Handle new uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImageToCloud(file.path);
        if (url) finalImages.push(url);
      }
    }
    req.body.images = finalImages;

    // Update property
    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner, Admin)
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: `Property not found with id of ${req.params.id}` });
    }

    // Make sure user is owner or admin
    if (property.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to delete this property` });
    }

    // Delete associated reviews
    await Review.deleteMany({ propertyId: property._id });

    // Use deleteOne
    await Property.deleteOne({ _id: property._id });

    res.status(200).json({
      success: true,
      data: {},
      message: 'Property and associated reviews deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
