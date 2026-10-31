const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCustomers, getCustomerById, updateCustomer, exportCustomersCSV, deleteCustomer } = require('../controllers/customerController');

router.get('/', protect, getCustomers);
router.get('/export', protect, exportCustomersCSV);
router.get('/:id', protect, getCustomerById);
router.put('/:id', protect, updateCustomer);
router.delete('/:id', protect, deleteCustomer);

module.exports = router;
