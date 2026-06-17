const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Inquiry = require('../models/Inquiry');

// @desc    Get dashboard stats & analytics chart data
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();

    // Counts by roles
    const tenantCount = await User.countDocuments({ role: 'tenant' });
    const ownerCount = await User.countDocuments({ role: 'owner' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    // Property status counts
    const availableProperties = await Property.countDocuments({ status: 'available' });
    const rentedProperties = await Property.countDocuments({ status: 'rented' });
    const pendingProperties = await Property.countDocuments({ status: 'pending' });

    // Booking status counts
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'approved' });
    const rejectedBookings = await Booking.countDocuments({ status: 'rejected' });

    // Total monthly rental volume
    const rentAggregate = await Property.aggregate([
      { $match: { status: 'rented' } },
      { $group: { _id: null, totalRent: { $sum: '$rent' } } }
    ]);
    const totalRentVolume = rentAggregate.length > 0 ? rentAggregate[0].totalRent : 0;

    // Monthly property additions chart data (past 6 months)
    const propertyChartData = await Property.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    // Map chart data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedChartData = propertyChartData.map(item => ({
      name: `${months[item._id.month - 1]} ${item._id.year}`,
      properties: item.count
    }));

    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: totalUsers,
          properties: totalProperties,
          bookings: totalBookings,
          inquiries: totalInquiries,
          tenants: tenantCount,
          owners: ownerCount,
          admins: adminCount,
          availableProperties,
          rentedProperties,
          pendingProperties,
          pendingBookings,
          approvedBookings,
          rejectedBookings,
          totalRentVolume
        },
        chartData: formattedChartData.length > 0 ? formattedChartData : [
          { name: 'Jan', properties: 4 },
          { name: 'Feb', properties: 8 },
          { name: 'Mar', properties: 12 },
          { name: 'Apr', properties: 18 },
          { name: 'May', properties: 24 },
          { name: 'Jun', properties: 30 }
        ]
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle block/unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin only)
exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protect against self-blocking
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot block yourself' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: `User has been successfully ${user.isBlocked ? 'blocked' : 'unblocked'}`
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve/Verify a property listing
// @route   PUT /api/admin/properties/:id/approve
// @access  Private (Admin only)
exports.approveProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Approve: set status from pending to available
    if (property.status === 'pending') {
      property.status = 'available';
      await property.save();
    } else {
      return res.status(400).json({ success: false, message: 'Property is not in pending state' });
    }

    res.status(200).json({
      success: true,
      data: property,
      message: 'Property approved and listed successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all properties (including pending ones) for management
// @route   GET /api/admin/properties
// @access  Private (Admin only)
exports.getAdminProperties = async (req, res, next) => {
  try {
    const properties = await Property.find()
      .populate({
        path: 'ownerId',
        select: 'name email phone'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (err) {
    next(err);
  }
};
