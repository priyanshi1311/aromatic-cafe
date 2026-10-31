const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Table = require('../models/Table');
const Settings = require('../models/Settings');
const { generateTimeSlots, isDateTimePast, isValidDate } = require('../utils/slotUtils');

// Helper: upsert customer by phone
const upsertCustomer = async ({ name, phone, email }) => {
  const normalizedPhone = Customer.normalizePhone(phone);
  let customer = await Customer.findOne({ phone: normalizedPhone });
  if (!customer) {
    customer = await Customer.create({ name, phone: normalizedPhone, email: email || '' });
  } else {
    // Update name/email if provided
    if (name) customer.name = name;
    if (email && !customer.email) customer.email = email;
    customer.totalBookings += 1;
    await customer.save();
  }
  return customer;
};

// @desc  Get available slots for a date
// @route GET /api/bookings/slots?date=YYYY-MM-DD&guests=N
// @access Public
const getAvailableSlots = async (req, res, next) => {
  try {
    const { date, guests = 1 } = req.query;
    if (!isValidDate(date)) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const settings = await Settings.getSingleton();

    // Check blocked dates
    if (settings.blockedDates.includes(date)) {
      return res.json({ success: true, slots: [], message: 'Restaurant is closed on this date' });
    }

    // Check not past
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return res.status(400).json({ success: false, message: 'Cannot book for past dates' });
    }

    // Max advance booking
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + settings.advanceBookingDays);
    if (new Date(date) > maxDate) {
      return res.status(400).json({ success: false, message: `Cannot book more than ${settings.advanceBookingDays} days in advance` });
    }

    const allSlots = generateTimeSlots(settings.openingTime, settings.closingTime, settings.slotDurationMinutes);

    // Get active tables with sufficient capacity
    const guestsNum = parseInt(guests);
    const tables = await Table.find({ isActive: true, capacity: { $gte: guestsNum } }).sort({ capacity: 1 });

    if (tables.length === 0) {
      return res.json({ success: true, slots: [], message: 'No tables available for this party size' });
    }

    // Get existing bookings for this date
    const existingBookings = await Booking.find({
      date,
      status: { $in: ['Pending', 'Confirmed', 'Seated'] },
    }).select('table timeSlot');

    // Build availability map: slot -> set of booked table IDs
    const bookedMap = {};
    existingBookings.forEach((b) => {
      if (!bookedMap[b.timeSlot]) bookedMap[b.timeSlot] = new Set();
      bookedMap[b.timeSlot].add(b.table.toString());
    });

    const now = new Date();
    const slotsWithAvailability = allSlots.map((slot) => {
      // Filter out past time slots if booking for today
      if (date === today) {
        const [h, m] = slot.split(':').map(Number);
        const slotTime = new Date(date);
        slotTime.setHours(h, m, 0, 0);
        if (slotTime <= now) return null;
      }

      const bookedTableIds = bookedMap[slot] || new Set();
      const availableTables = tables.filter((t) => !bookedTableIds.has(t._id.toString()));
      return {
        time: slot,
        availableCount: availableTables.length,
        available: availableTables.length > 0,
        tableIds: availableTables.map((t) => ({ id: t._id, tableNumber: t.tableNumber, capacity: t.capacity })),
      };
    }).filter(Boolean);

    res.json({ success: true, slots: slotsWithAvailability, settings: { openingTime: settings.openingTime, closingTime: settings.closingTime } });
  } catch (err) { next(err); }
};

// @desc  Create a new booking (public, no auth)
// @route POST /api/bookings
// @access Public
const createBooking = async (req, res, next) => {
  try {
    const { name, phone, email, guests, date, timeSlot, tableId, specialRequests } = req.body;

    // Basic validation
    if (!name || !phone || !guests || !date || !timeSlot || !tableId) {
      return res.status(400).json({ success: false, message: 'Name, phone, guests, date, timeSlot, and tableId are required' });
    }
    if (!isValidDate(date)) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    const settings = await Settings.getSingleton();

    // Blocked date check
    if (settings.blockedDates.includes(date)) {
      return res.status(400).json({ success: false, message: 'Restaurant is closed on this date' });
    }

    // Past date check
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return res.status(400).json({ success: false, message: 'Cannot book for past dates' });
    }
    if (date === today && isDateTimePast(date, timeSlot)) {
      return res.status(400).json({ success: false, message: 'Cannot book for a past time slot' });
    }

    // Valid slot check
    const allSlots = generateTimeSlots(settings.openingTime, settings.closingTime, settings.slotDurationMinutes);
    if (!allSlots.includes(timeSlot)) {
      return res.status(400).json({ success: false, message: 'Invalid time slot' });
    }

    // Table check
    const table = await Table.findById(tableId);
    if (!table || !table.isActive) {
      return res.status(400).json({ success: false, message: 'Table not found or inactive' });
    }
    if (parseInt(guests) > table.capacity) {
      return res.status(400).json({ success: false, message: `Table capacity is ${table.capacity}, but ${guests} guests requested` });
    }

    // Prevent double-booking with atomic check
    const conflictingBooking = await Booking.findOne({
      table: tableId,
      date,
      timeSlot,
      status: { $in: ['Pending', 'Confirmed', 'Seated'] },
    });
    if (conflictingBooking) {
      return res.status(409).json({ success: false, message: 'This table is already booked for the selected time slot. Please choose another.' });
    }

    // Upsert customer
    const customer = await upsertCustomer({ name, phone, email });

    // Create booking
    const booking = await Booking.create({
      customer: customer._id,
      table: tableId,
      date,
      timeSlot,
      guests: parseInt(guests),
      specialRequests: specialRequests || '',
      customerName: customer.name,
      customerPhone: customer.phone,
      tableNumber: table.tableNumber,
    });

    // Update customer stats
    customer.totalBookings = (customer.totalBookings || 0) + 1;
    customer.lastVisit = new Date(date);
    await customer.save();

    const populated = await Booking.findById(booking._id).populate('table', 'tableNumber capacity location');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingId: populated.bookingId,
        date: populated.date,
        timeSlot: populated.timeSlot,
        guests: populated.guests,
        status: populated.status,
        specialRequests: populated.specialRequests,
        table: { tableNumber: table.tableNumber, capacity: table.capacity },
        customer: { name: customer.name, phone: customer.phone, email: customer.email },
      },
    });
  } catch (err) { next(err); }
};

// @desc  Get all bookings (admin)
// @route GET /api/bookings
// @access Private
const getBookings = async (req, res, next) => {
  try {
    const { date, status, tableId, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (status) filter.status = status;
    if (tableId) filter.table = tableId;
    if (search) {
      filter.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('table', 'tableNumber capacity location')
        .populate('customer', 'name phone email tag')
        .sort({ date: -1, timeSlot: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Booking.countDocuments(filter),
    ]);

    res.json({ success: true, data: bookings, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
};

// @desc  Get single booking
// @route GET /api/bookings/:id
// @access Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ $or: [{ _id: req.params.id }, { bookingId: req.params.id }] })
      .populate('table', 'tableNumber capacity location')
      .populate('customer', 'name phone email tag visitCount');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// @desc  Get booking by bookingId (public - for confirmation page)
// @route GET /api/bookings/confirm/:bookingId
// @access Public
const getBookingConfirmation = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate('table', 'tableNumber capacity location');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({
      success: true,
      data: {
        bookingId: booking.bookingId,
        customerName: booking.customerName,
        date: booking.date,
        timeSlot: booking.timeSlot,
        guests: booking.guests,
        status: booking.status,
        specialRequests: booking.specialRequests,
        tableNumber: booking.tableNumber,
      },
    });
  } catch (err) { next(err); }
};

// @desc  Update booking status / details (admin)
// @route PUT /api/bookings/:id
// @access Private
const updateBooking = async (req, res, next) => {
  try {
    const { status, date, timeSlot, tableId, guests, adminNotes, cancelReason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // If rescheduling, validate new slot
    if (date || timeSlot || tableId) {
      const newDate = date || booking.date;
      const newTime = timeSlot || booking.timeSlot;
      const newTableId = tableId || booking.table.toString();

      const settings = await Settings.getSingleton();
      const allSlots = generateTimeSlots(settings.openingTime, settings.closingTime, settings.slotDurationMinutes);
      if (!allSlots.includes(newTime)) {
        return res.status(400).json({ success: false, message: 'Invalid time slot' });
      }

      // Check for conflict (excluding current booking)
      const conflict = await Booking.findOne({
        _id: { $ne: booking._id },
        table: newTableId,
        date: newDate,
        timeSlot: newTime,
        status: { $in: ['Pending', 'Confirmed', 'Seated'] },
      });
      if (conflict) {
        return res.status(409).json({ success: false, message: 'Slot already booked for this table' });
      }

      if (tableId) {
        const table = await Table.findById(newTableId);
        if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
        booking.tableNumber = table.tableNumber;
      }

      booking.date = newDate;
      booking.timeSlot = newTime;
      booking.table = newTableId;
    }

    if (status) {
      booking.status = status;
      if (status === 'Seated') booking.seatedAt = new Date();
      if (status === 'Completed') {
        booking.completedAt = new Date();
        // Update customer visit count
        const customer = await Customer.findById(booking.customer);
        if (customer) {
          customer.visitCount += 1;
          customer.lastVisit = new Date();
          if (customer.visitCount >= 5) customer.tag = 'VIP';
          await customer.save();
        }
      }
      if (status === 'Cancelled') {
        booking.cancelledAt = new Date();
        if (cancelReason) booking.cancelReason = cancelReason;
        const customer = await Customer.findById(booking.customer);
        if (customer) {
          customer.totalCancellations = (customer.totalCancellations || 0) + 1;
          await customer.save();
        }
      }
    }

    if (guests) booking.guests = parseInt(guests);
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;

    await booking.save();
    const updated = await Booking.findById(booking._id)
      .populate('table', 'tableNumber capacity location')
      .populate('customer', 'name phone email tag');

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

// @desc  Dashboard stats
// @route GET /api/bookings/dashboard
// @access Private
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [todayBookings, upcomingBookings, totalCustomers, totalCancellations, statusCounts] = await Promise.all([
      Booking.find({ date: today }).populate('table', 'tableNumber').populate('customer', 'name phone').sort({ timeSlot: 1 }),
      Booking.find({ date: { $gt: today }, status: { $in: ['Pending', 'Confirmed'] } })
        .populate('table', 'tableNumber')
        .populate('customer', 'name phone')
        .sort({ date: 1, timeSlot: 1 })
        .limit(10),
      Customer.countDocuments(),
      Booking.countDocuments({ status: 'Cancelled' }),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        todayBookings,
        upcomingBookings,
        totalCustomers,
        totalCancellations,
        statusCounts: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        totalBookingsToday: todayBookings.length,
      },
    });
  } catch (err) { next(err); }
};

// @desc  Export bookings CSV
// @route GET /api/bookings/export
// @access Private
const exportBookingsCSV = async (req, res, next) => {
  try {
    const { date, status } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter).populate('table', 'tableNumber').sort({ date: -1, timeSlot: 1 });

    const headers = ['Booking ID', 'Date', 'Time', 'Customer', 'Phone', 'Guests', 'Table', 'Status', 'Special Requests', 'Created At'];
    const rows = bookings.map((b) => [
      b.bookingId, b.date, b.timeSlot, b.customerName, b.customerPhone,
      b.guests, b.tableNumber || '', b.status, `"${(b.specialRequests || '').replace(/"/g, '""')}"`,
      b.createdAt.toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="bookings-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) { next(err); }
};

module.exports = {
  getAvailableSlots, createBooking, getBookings, getBookingById,
  getBookingConfirmation, updateBooking, getDashboardStats, exportBookingsCSV,
};
