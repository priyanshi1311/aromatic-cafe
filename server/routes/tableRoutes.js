const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTables, getPublicTables, createTable, updateTable, deleteTable, getTableQR, getRestaurantQR,
} = require('../controllers/tableController');

// Public
router.get('/public', getPublicTables);

// Private - order matters: specific routes before parameterized
router.get('/restaurant-qr', protect, getRestaurantQR);
router.get('/:id/qr', protect, getTableQR);
router.route('/').get(protect, getTables).post(protect, createTable);
router.route('/:id').put(protect, updateTable).delete(protect, deleteTable);

module.exports = router;
