const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  time: { type: String, required: true }, // HH:MM
  label: { type: String },
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  restaurantName: { type: String, default: 'Aromatic', trim: true },
  openingTime: { type: String, default: '10:00' }, // HH:MM
  closingTime: { type: String, default: '22:00' }, // HH:MM
  slotDurationMinutes: { type: Number, default: 60, min: 15, max: 240 },
  blockedDates: [{ type: String }], // YYYY-MM-DD
  maxGuestsPerTable: { type: Number, default: 10 },
  advanceBookingDays: { type: Number, default: 30 },
  timeZone: { type: String, default: 'Asia/Kolkata' },
}, { timestamps: true });

// Only one settings document ever
settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
