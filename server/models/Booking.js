const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const STATUSES = ['Pending', 'Confirmed', 'Seated', 'Completed', 'Cancelled', 'No-show'];

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: () => 'BK' + uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase(),
  },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  timeSlot: { type: String, required: true }, // HH:MM
  guests: { type: Number, required: true, min: 1, max: 20 },
  status: { type: String, enum: STATUSES, default: 'Pending' },
  specialRequests: { type: String, trim: true, default: '' },
  // Snapshot for display without populating
  customerName: { type: String },
  customerPhone: { type: String },
  tableNumber: { type: Number },
  // Admin notes
  adminNotes: { type: String, trim: true, default: '' },
  // Seating info
  seatedAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  cancelReason: { type: String, trim: true, default: '' },
}, { timestamps: true });

// Compound index to prevent double-booking
bookingSchema.index({ table: 1, date: 1, timeSlot: 1, status: 1 });
bookingSchema.index({ date: 1, status: 1 });
bookingSchema.index({ customer: 1, date: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
module.exports.STATUSES = STATUSES;
