const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const User = require('../models/User');
const { sendInquiryEmail } = require('../services/emailService');

// @desc    Create a new property inquiry
// @route   POST /api/inquiries
// @access  Public (Optional auth)
exports.createInquiry = async (req, res, next) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    if (!propertyId || !name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const inquiryData = {
      propertyId,
      name,
      email,
      phone,
      message
    };

    // If request contains authorization, set tenantId
    if (req.user) {
      inquiryData.tenantId = req.user.id;
    }

    const inquiry = await Inquiry.create(inquiryData);

    // Notify owner
    const owner = await User.findById(property.ownerId);
    if (owner) {
      sendInquiryEmail(owner, property, inquiry).catch(err =>
        console.error('Error sending inquiry notification to owner:', err.message)
      );
    }

    res.status(201).json({
      success: true,
      data: inquiry,
      message: 'Inquiry submitted successfully. The owner has been notified.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get inquiries
// @route   GET /api/inquiries
// @access  Private (Owner, Admin)
exports.getInquiries = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      query = Inquiry.find();
    } else if (req.user.role === 'owner') {
      const ownedProperties = await Property.find({ ownerId: req.user.id }).select('_id');
      const propertyIds = ownedProperties.map(p => p._id);
      query = Inquiry.find({ propertyId: { $in: propertyIds } });
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized to view inquiries' });
    }

    const inquiries = await query
      .populate({
        path: 'propertyId',
        select: 'title rent address city images'
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private (Owner, Admin)
exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['new', 'contacted', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    const property = await Property.findById(inquiry.propertyId);

    // Make sure owner or admin is updating
    if (req.user.role !== 'admin' && (!property || property.ownerId.toString() !== req.user.id)) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this inquiry' });
    }

    inquiry.status = status;
    await inquiry.save();

    res.status(200).json({
      success: true,
      data: inquiry
    });
  } catch (err) {
    next(err);
  }
};
