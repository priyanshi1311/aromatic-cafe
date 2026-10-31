const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  capacity: { type: Number, required: true, min: 1, max: 20 },
  location: { type: String, trim: true, default: 'Main Hall' },
  isActive: { type: Boolean, default: true },
  qrToken: { type: String, unique: true },
  notes: { type: String, trim: true },
}, { timestamps: true });

tableSchema.index({ tableNumber: 1 });
tableSchema.index({ isActive: 1 });

module.exports = mongoose.model('Table', tableSchema);
