require('dotenv').config();
const connectDB = require('./config/database');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

async function start() {
  await connectDB();

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT} (port ${PORT})`);
  });
}

// In local development or standalone server, start the HTTP server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  start().catch((err) => {
    console.error('Failed to start server:', err.message);
  });
}

module.exports = app;
