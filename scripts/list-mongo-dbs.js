require('dotenv').config();
const mongoose = require('mongoose');
const { normalizeMongoUri } = require('../config/database');

function dbNameFromUri(uri) {
  if (!uri) return null;
  const q = uri.indexOf('?');
  const base = q >= 0 ? uri.slice(0, q) : uri;
  const match = base.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^/?]*)/);
  return match ? match[1] || '(empty-path)' : '(unparsed)';
}

async function main() {
  const raw = process.env.MONGO_URI;
  const normalized = normalizeMongoUri(raw);
  console.log(JSON.stringify({
    rawDb: dbNameFromUri(raw),
    normalizedDb: dbNameFromUri(normalized),
  }));

  await mongoose.connect(normalized, { serverSelectionTimeoutMS: 30000 });
  const { databases } = await mongoose.connection.db.admin().listDatabases();
  const result = [];
  for (const d of databases) {
    if (['admin', 'local'].includes(d.name)) continue;
    const db = mongoose.connection.client.db(d.name);
    const cols = await db.listCollections().toArray();
    const collections = [];
    for (const c of cols) {
      const count = await db.collection(c.name).countDocuments();
      collections.push({ name: c.name, count });
    }
    result.push({ db: d.name, collections });
  }
  console.log(JSON.stringify({ connectedAs: mongoose.connection.name, result }, null, 2));
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('SCRIPT_ERROR', err.message);
  process.exit(1);
});
