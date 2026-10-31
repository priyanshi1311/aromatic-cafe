const Settings = require('../models/Settings');

/**
 * Generate time slots based on settings
 * @returns {string[]} Array of "HH:MM" strings
 */
const generateTimeSlots = (openingTime, closingTime, durationMinutes) => {
  const slots = [];
  const [openH, openM] = openingTime.split(':').map(Number);
  const [closeH, closeM] = closingTime.split(':').map(Number);

  let currentMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  while (currentMinutes + durationMinutes <= closeMinutes) {
    const h = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
    const m = (currentMinutes % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    currentMinutes += durationMinutes;
  }
  return slots;
};

/**
 * Validate that a date+time is not in the past
 */
const isDateTimePast = (dateStr, timeStr) => {
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  return dt < new Date();
};

/**
 * Validate date format YYYY-MM-DD
 */
const isValidDate = (dateStr) => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};

module.exports = { generateTimeSlots, isDateTimePast, isValidDate };
