const mongoose = require('mongoose');

// Normalize phone: keep digits and leading +
const normalizePhone = (phone) => {
  if (!phone) return phone;
  return phone.replace(/[\s\-()]/g, '');
};

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  email: { type: String, trim: true, lowercase: true, default: '' },
  tag: { type: String, enum: ['Regular', 'VIP', 'Blacklisted'], default: 'Regular' },
  visitCount: { type: Number, default: 0 },
  lastVisit: { type: Date },
  notes: { type: String, trim: true, default: '' },
  totalBookings: { type: Number, default: 0 },
  totalCancellations: { type: Number, default: 0 },
}, { timestamps: true });

customerSchema.pre('save', function (next) {
  this.phone = normalizePhone(this.phone);
  next();
});

customerSchema.statics.normalizePhone = normalizePhone;

customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ name: 'text', phone: 'text', email: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
