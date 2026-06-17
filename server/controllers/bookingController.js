const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const { sendBookingEmail } = require('../services/emailService');

// @desc    Create a booking request
// @route   POST /api/bookings
// @access  Private (Tenant only)
exports.createBooking = async (req, res, next) => {
  try {
    const { propertyId, bookingDate } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check if property is available
    if (property.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Property is not available for booking' });
    }

    // Check if tenant already has a pending/approved booking request for this property
    const existingBooking = await Booking.findOne({
      tenantId: req.user.id,
      propertyId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or approved booking request for this property'
      });
    }

    // Create booking request
    const booking = await Booking.create({
      tenantId: req.user.id,
      propertyId,
      bookingDate: bookingDate || Date.now(),
      status: 'pending'
    });

    // Notify owner
    const owner = await User.findById(property.ownerId);
    const tenant = req.user;
    if (owner) {
      sendBookingEmail(tenant, owner, property, booking, 'pending').catch(err =>
        console.error('Error sending booking inquiry email to owner:', err.message)
      );
    }

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get booking requests
// @route   GET /api/bookings
// @access  Private (Tenant, Owner, Admin)
exports.getBookings = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      // Admin gets all bookings
      query = Booking.find();
    } else if (req.user.role === 'owner') {
      // Owner gets booking requests for their properties
      const ownedProperties = await Property.find({ ownerId: req.user.id }).select('_id');
      const propertyIds = ownedProperties.map(p => p._id);
      query = Booking.find({ propertyId: { $in: propertyIds } });
    } else {
      // Tenant gets bookings they applied for
      query = Booking.find({ tenantId: req.user.id });
    }

    const bookings = await query
      .populate({
        path: 'propertyId',
        select: 'title rent deposit propertyType address city images status ownerId'
      })
      .populate({
        path: 'tenantId',
        select: 'name email phone profileImage'
      })
      .sort('-createdAt');

    // For owner requests, also populate the property's owner details (already populated through path: 'propertyId')
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update booking request status (Approve / Reject / Cancel)
// @route   PUT /api/bookings/:id
// @access  Private (Tenant, Owner, Admin)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved', 'rejected', 'cancelled'
    
    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const property = await Property.findById(booking.propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const tenant = await User.findById(booking.tenantId);
    const owner = await User.findById(property.ownerId);

    // Permission checks
    if (status === 'cancelled') {
      // Tenant can cancel their own request
      if (booking.tenantId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Not authorized to cancel this booking' });
      }
      if (booking.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Can only cancel pending bookings' });
      }
    } else {
      // Owner/Admin can approve/reject request
      if (property.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Not authorized to update this booking' });
      }
      if (booking.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Can only update status of pending bookings' });
      }
    }

    // Update booking status
    booking.status = status;
    await booking.save();

    // If booking is approved, mark property as rented and reject all other pending bookings for this property
    if (status === 'approved') {
      property.status = 'rented';
      await property.save();

      // Reject all other pending bookings for the same property
      await Booking.updateMany(
        {
          propertyId: property._id,
          _id: { $ne: booking._id },
          status: 'pending'
        },
        { status: 'rejected' }
      );
    }

    // Send notification email
    if (tenant && owner) {
      sendBookingEmail(tenant, owner, property, booking, status).catch(err =>
        console.error('Error sending booking confirmation email:', err.message)
      );
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};
