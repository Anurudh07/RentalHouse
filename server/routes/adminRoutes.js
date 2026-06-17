const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  toggleBlockUser,
  approveProperty,
  getAdminProperties
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorizeRoles('admin')); // All admin routes require admin role

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/block', toggleBlockUser);
router.get('/properties', getAdminProperties);
router.put('/properties/:id/approve', approveProperty);

module.exports = router;
