const mongoose = require('mongoose');

/** Ensure db name + Atlas-recommended write concern params without dropping auth. */
function normalizeMongoUri(uri) {
  if (!uri) return uri;
  const qIndex = uri.indexOf('?');
  const base = qIndex >= 0 ? uri.slice(0, qIndex) : uri;
  const query = qIndex >= 0 ? uri.slice(qIndex + 1) : '';

  let withDb = base;
  if (/mongodb(\+srv)?:\/\/[^/]+\/?$/.test(base)) {
    withDb = base.replace(/\/?$/, '/ecommerce');
  } else if (/mongodb(\+srv)?:\/\/[^/]+\/\?/.test(uri)) {
    withDb = base.replace(/\/$/, '') + '/ecommerce';
  }

  const params = new URLSearchParams(query);
  if (!params.has('retryWrites')) params.set('retryWrites', 'true');
  if (!params.has('w')) params.set('w', 'majority');
  if (!params.has('appName')) params.set('appName', 'ecommerce-project');

  const qs = params.toString();
  return qs ? `${withDb}?${qs}` : withDb;
}

function logConnectFailure(err) {
  const topology = err.cause || err.reason;
  const servers = [];
  try {
    const map = topology?.servers;
    if (map && typeof map.forEach === 'function') {
      map.forEach((desc, address) => {
        servers.push({
          address,
          type: desc?.type,
          primary: desc?.primary || null,
          error: desc?.error?.message || desc?.error?.code || null,
        });
      });
    }
  } catch (_) {}

  console.error('Database error:', err.message);
  if (err.code === 8000 || /bad auth/i.test(err.message || '')) {
    console.error(`
→ MongoDB Atlas rejected the database username/password (AtlasError 8000).
  This is not a Node/network bug: the credentials in MONGO_URI do not match Atlas.
  Fix: Atlas → Database Access → user matching MONGO_URI → Edit Password (or create a user),
  then put that username and password into .env MONGO_URI, save the file, and restart.
`);
  }
  if (topology?.type === 'ReplicaSetNoPrimary') {
    const primaryHint =
      servers.find((s) => s.type === 'RSSecondary' && s.primary)?.primary ||
      servers.find((s) => s.type === 'Unknown')?.address ||
      'unknown';
    console.error(`
→ Atlas replica set has no reachable PRIMARY (ReplicaSetNoPrimary).
  Declared primary: ${primaryHint}
  Reachable: ${servers.filter((s) => s.type && s.type !== 'Unknown').map((s) => s.address).join(', ') || 'none'}
  Unreachable: ${servers.filter((s) => s.type === 'Unknown').map((s) => s.address).join(', ') || 'none'}
  This is usually the current Wi-Fi/ISP blocking the primary node IP.
  Use a VPN or mobile hotspot, then retry.
`);
  }
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with caching for serverless environments (e.g. Vercel).
 */
async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!rawUri) {
    throw new Error('Neither MONGODB_URI nor MONGO_URI is set in environment');
  }

  const uri = normalizeMongoUri(rawUri);

  if (!cached.promise) {
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, options).then((mongooseInstance) => {
      console.log(
        `Database connected successfully (db=${mongooseInstance.connection.name}, host=${mongooseInstance.connection.host})`
      );
      return mongooseInstance.connection;
    }).catch((err) => {
      cached.promise = null;
      logConnectFailure(err);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    throw err;
  }
}

module.exports = connectDB;
module.exports.normalizeMongoUri = normalizeMongoUri;
