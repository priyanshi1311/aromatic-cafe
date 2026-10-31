const Table = require('../models/Table');
const Booking = require('../models/Booking');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// @desc  Get all tables
// @route GET /api/tables
// @access Private
const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json({ success: true, count: tables.length, data: tables });
  } catch (err) { next(err); }
};

// @desc  Get public table list (for booking form)
// @route GET /api/tables/public
// @access Public
const getPublicTables = async (req, res, next) => {
  try {
    const tables = await Table.find({ isActive: true }, 'tableNumber capacity location').sort({ tableNumber: 1 });
    res.json({ success: true, data: tables });
  } catch (err) { next(err); }
};

// @desc  Create table
// @route POST /api/tables
// @access Private
const createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, location, notes } = req.body;
    if (!tableNumber || !capacity) {
      return res.status(400).json({ success: false, message: 'tableNumber and capacity are required' });
    }
    const qrToken = uuidv4();
    const table = await Table.create({ tableNumber, capacity, location, notes, qrToken });
    res.status(201).json({ success: true, data: table });
  } catch (err) { next(err); }
};

// @desc  Update table
// @route PUT /api/tables/:id
// @access Private
const updateTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.json({ success: true, data: table });
  } catch (err) { next(err); }
};

// @desc  Delete table
// @route DELETE /api/tables/:id
// @access Private
const deleteTable = async (req, res, next) => {
  try {
    const activeBookings = await Booking.countDocuments({
      table: req.params.id,
      status: { $in: ['Pending', 'Confirmed', 'Seated'] },
    });
    if (activeBookings > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete table with active bookings' });
    }
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.json({ success: true, message: 'Table deleted' });
  } catch (err) { next(err); }
};

const getBaseUrl = (req) => {
  if (process.env.RESTAURANT_BASE_URL) {
    return process.env.RESTAURANT_BASE_URL.replace(/\/+$/, '');
  }
  const origin = req.get('origin');
  if (origin && !origin.includes('localhost')) {
    return origin.replace(/\/+$/, '');
  }
  const host = req.get('host');
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${protocol}://${host}`;
};

// @desc  Generate QR code for a table (data URL)
// @route GET /api/tables/:id/qr
// @access Private
const getTableQR = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

    const baseUrl = getBaseUrl(req);
    const url = `${baseUrl}/book?table=${table._id}&token=${table.qrToken}`;
    const qrDataUrl = await qrcode.toDataURL(url, { width: 400, margin: 2 });
    res.json({ success: true, qrDataUrl, bookingUrl: url, table });
  } catch (err) { next(err); }
};

// @desc  Generate restaurant-level QR (no table)
// @route GET /api/tables/restaurant-qr
// @access Private
const getRestaurantQR = async (req, res, next) => {
  try {
    const baseUrl = getBaseUrl(req);
    const url = `${baseUrl}/book`;
    const qrDataUrl = await qrcode.toDataURL(url, { width: 400, margin: 2 });
    res.json({ success: true, qrDataUrl, bookingUrl: url });
  } catch (err) { next(err); }
};

module.exports = { getTables, getPublicTables, createTable, updateTable, deleteTable, getTableQR, getRestaurantQR };
