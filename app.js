const express = require('express');
const cors = require('cors');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const offerRoutes = require('./routes/offerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const pageRoutes = require('./routes/pageRoutes');

const connectDB = require('./config/database');

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(express.static('public'));

// Ensure DB is connected for serverless calls on Vercel
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection failed in middleware:', err.message);
    res.status(500).json({ message: 'فشل الاتصال بقاعدة البيانات: ' + err.message });
  }
});

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint for Render & uptime monitors
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

app.use(pageRoutes);

// 404 handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Fallback for unmatched web routes: send index.html (SPA friendly)
app.use((req, res, next) => {
  if (req.method === 'GET') {
    return res.status(404).sendFile(require('path').join(__dirname, 'public', 'index.html'));
  }
  next();
});

// Global central error handler middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack || err.message || err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'حدث خطأ في الخادم الداخلي',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

module.exports = app;
