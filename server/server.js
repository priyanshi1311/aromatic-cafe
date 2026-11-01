require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const tableRoutes = require('./routes/tableRoutes');
const customerRoutes = require('./routes/customerRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Connect DB & auto-seed on initial launch
connectDB().then(async () => {
  try {
    const Admin = require('./models/Admin');
    const Table = require('./models/Table');
    const Settings = require('./models/Settings');
    const { v4: uuidv4 } = require('uuid');

    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        name: process.env.ADMIN_NAME || 'Aromatic Admin',
        email: process.env.ADMIN_EMAIL || 'admin@aromatic.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
      });
      console.log('Default admin auto-seeded on first launch');
    }

    await Settings.getSingleton();

    const tableCount = await Table.countDocuments();
    if (tableCount === 0) {
      const sampleTables = [
        { tableNumber: 1, capacity: 2, location: 'Window Lounge', qrToken: uuidv4() },
        { tableNumber: 2, capacity: 2, location: 'Window Lounge', qrToken: uuidv4() },
        { tableNumber: 3, capacity: 4, location: 'Velvet Dining Salon', qrToken: uuidv4() },
        { tableNumber: 4, capacity: 4, location: 'Velvet Dining Salon', qrToken: uuidv4() },
        { tableNumber: 5, capacity: 4, location: 'Main Hall', qrToken: uuidv4() },
        { tableNumber: 6, capacity: 6, location: 'Royal Arch Celebration Suite', qrToken: uuidv4() },
        { tableNumber: 7, capacity: 8, location: 'Terrace & Rooftop Hall', qrToken: uuidv4() },
        { tableNumber: 8, capacity: 10, location: 'Event Hall', qrToken: uuidv4() },
      ];
      await Table.insertMany(sampleTables);
      console.log('Sample dining tables auto-seeded on first launch');
    }
  } catch (err) {
    console.log('Auto-seed note:', err.message);
  }
});

const app = express();

// Security & logging
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS
const allowedOrigins = [
  process.env.RESTAURANT_BASE_URL,
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean).map(u => u.replace(/\/+$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    const cleanOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes('*') || allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in initial setup to prevent deployment lockouts
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend in production (for monolithic single-service deployments e.g. Render)
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
