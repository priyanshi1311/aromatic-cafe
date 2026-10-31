const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSettings, updateSettings, addBlockedDate, removeBlockedDate, getPublicSettings } = require('../controllers/settingsController');

router.get('/public', getPublicSettings);
router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);
router.post('/blocked-dates', protect, addBlockedDate);
router.delete('/blocked-dates/:date', protect, removeBlockedDate);

module.exports = router;
