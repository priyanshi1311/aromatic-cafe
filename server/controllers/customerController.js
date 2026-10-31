const Customer = require('../models/Customer');
const Booking = require('../models/Booking');

// @desc  Get all customers
// @route GET /api/customers
// @access Private
const getCustomers = async (req, res, next) => {
  try {
    const { search, tag, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (tag) filter.tag = tag;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ visitCount: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Customer.countDocuments(filter),
    ]);

    res.json({ success: true, data: customers, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { next(err); }
};

// @desc  Get single customer + booking history
// @route GET /api/customers/:id
// @access Private
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const bookings = await Booking.find({ customer: customer._id })
      .populate('table', 'tableNumber')
      .sort({ date: -1 })
      .limit(20);

    res.json({ success: true, data: { customer, bookings } });
  } catch (err) { next(err); }
};

// @desc  Update customer (tag, notes)
// @route PUT /api/customers/:id
// @access Private
const updateCustomer = async (req, res, next) => {
  try {
    const { tag, notes, name, email } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    if (tag) customer.tag = tag;
    if (notes !== undefined) customer.notes = notes;
    if (name) customer.name = name;
    if (email !== undefined) customer.email = email;

    await customer.save();
    res.json({ success: true, data: customer });
  } catch (err) { next(err); }
};

// @desc  Export customers to CSV
// @route GET /api/customers/export
// @access Private
const exportCustomersCSV = async (req, res, next) => {
  try {
    const { tag } = req.query;
    const filter = {};
    if (tag) filter.tag = tag;
    const customers = await Customer.find(filter).sort({ visitCount: -1 });

    let csv = 'Name,Phone,Email,Tag,Total Visits,Total Bookings,Cancellations,Notes\n';
    customers.forEach(c => {
      const row = [
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.phone || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${c.tag || 'Regular'}"`,
        c.visitCount || 0,
        c.totalBookings || 0,
        c.totalCancellations || 0,
        `"${(c.notes || '').replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
    res.send(csv);
  } catch (err) { next(err); }
};

// @desc  Delete customer
// @route DELETE /api/customers/:id
// @access Private
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Customer record deleted' });
  } catch (err) { next(err); }
};

module.exports = { getCustomers, getCustomerById, updateCustomer, exportCustomersCSV, deleteCustomer };
