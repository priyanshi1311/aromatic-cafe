const Settings = require('../models/Settings');

// @desc  Get settings
// @route GET /api/settings
// @access Private
const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSingleton();
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

// @desc  Update settings
// @route PUT /api/settings
// @access Private
const updateSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSingleton();
    const allowed = ['restaurantName', 'openingTime', 'closingTime', 'slotDurationMinutes', 'blockedDates', 'maxGuestsPerTable', 'advanceBookingDays', 'timeZone'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) settings[key] = req.body[key];
    });
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

// @desc  Add a blocked date
// @route POST /api/settings/blocked-dates
// @access Private
const addBlockedDate = async (req, res, next) => {
  try {
    const { date } = req.body;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: 'Valid date (YYYY-MM-DD) required' });
    }
    const settings = await Settings.getSingleton();
    if (!settings.blockedDates.includes(date)) {
      settings.blockedDates.push(date);
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

// @desc  Remove a blocked date
// @route DELETE /api/settings/blocked-dates/:date
// @access Private
const removeBlockedDate = async (req, res, next) => {
  try {
    const settings = await Settings.getSingleton();
    settings.blockedDates = settings.blockedDates.filter((d) => d !== req.params.date);
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

// @desc  Get public settings (for booking page)
// @route GET /api/settings/public
// @access Public
const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSingleton();
    res.json({
      success: true,
      data: {
        restaurantName: settings.restaurantName,
        openingTime: settings.openingTime,
        closingTime: settings.closingTime,
        slotDurationMinutes: settings.slotDurationMinutes,
        blockedDates: settings.blockedDates,
        advanceBookingDays: settings.advanceBookingDays,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { getSettings, updateSettings, addBlockedDate, removeBlockedDate, getPublicSettings };
