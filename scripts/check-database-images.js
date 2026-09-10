require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Offer = require("../models/Offer");

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error("No MongoDB URI found in environment");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to DB successfully.\n");

  const products = await Product.find({}, "name imgpath");
  console.log(`=== PRODUCTS (${products.length}) ===`);
  products.forEach(p => {
    const isCloud = p.imgpath && p.imgpath.startsWith("http");
    const isLocal = p.imgpath && p.imgpath.startsWith("/uploads");
    const status = isCloud ? "? Cloudinary" : isLocal ? "?? Local (/uploads/)" : "? No Image";
    console.log(`[${status}] ${p.name} -> ${p.imgpath || "(empty)"}`);
  });

  const categories = await Category.find({}, "name image");
  console.log(`\n=== CATEGORIES (${categories.length}) ===`);
  categories.forEach(c => {
    const isCloud = c.image && c.image.startsWith("http");
    const isLocal = c.image && c.image.startsWith("/uploads");
    const status = isCloud ? "? Cloudinary" : isLocal ? "?? Local (/uploads/)" : "? No Image";
    console.log(`[${status}] ${c.name} -> ${c.image || "(empty)"}`);
  });

  const offers = await Offer.find({}, "title image");
  console.log(`\n=== OFFERS (${offers.length}) ===`);
  offers.forEach(o => {
    const isCloud = o.image && o.image.startsWith("http");
    const isLocal = o.image && o.image.startsWith("/uploads");
    const status = isCloud ? "? Cloudinary" : isLocal ? "?? Local (/uploads/)" : "? No Image";
    console.log(`[${status}] ${o.title} -> ${o.image || "(empty)"}`);
  });

  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});

