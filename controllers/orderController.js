const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const whatsappService = require('../services/whatsappService');
const { normalizeEgyptianPhone } = require('../utils/validation');

exports.create = async (req, res) => {
  try {
    const { items, customerName, customerPhone, customerAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const name = (customerName || '').trim();
    const rawPhone = (customerPhone || '').trim();
    const address = (customerAddress || '').trim();

    if (!name || !rawPhone || !address) {
      return res.status(400).json({
        message: 'Customer name, phone, and address are required',
      });
    }

    const phone = normalizeEgyptianPhone(rawPhone);
    if (!phone) {
      return res.status(400).json({
        message: 'رقم الموبايل غير صحيح — يجب أن يكون رقم مصري يبدأ بـ 010 أو 011 أو 012 أو 015',
      });
    }

    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      // 1. Check if item is a Customized Sticker
      if (item.isCustom || item.productId === 'custom-sticker') {
        const isLarge = item.sizeKey === '7_to_15cm' || (item.customDetails && item.customDetails.includes('15'));
        const unitPrice = isLarge ? 15 : 10;
        const quantity = Math.max(10, Number(item.quantity) || 10);
        const itemName = item.name || 'استيكر لابتوب مخصص (Custom Laptop Sticker)';
        const details = item.customDetails || (isLarge ? 'المقاس: 7×7 سم - 15×15 سم' : 'المقاس: أصغر من 7×7 سم');

        orderItems.push({
          productId: null,
          name: itemName,
          price: unitPrice,
          quantity,
          customDetails: details,
          isCustom: true,
        });
        totalPrice += unitPrice * quantity;
        continue;
      }

      // 2. Check if item is a Promotional Sticker Offer Bundle
      if (item.isOffer || (typeof item.productId === 'string' && item.productId.startsWith('sticker-offer-'))) {
        let bundlePrice = 50;
        let bundleName = item.name || 'عرض بكج استيكرات (10 استيكرات)';
        const count = Number(item.stickerCount) || 10;

        if (count >= 50 || (item.productId && item.productId.includes('50'))) {
          bundlePrice = 180;
          bundleName = item.name || 'عرض التوفير الأكبر (50 استيكر لابتوب)';
        } else if (count >= 20 || (item.productId && item.productId.includes('20'))) {
          bundlePrice = 90;
          bundleName = item.name || 'عرض الأكثر طلباً (20 استيكر لابتوب)';
        } else {
          bundlePrice = 50;
          bundleName = item.name || 'عرض البداية (10 استيكرات لابتوب)';
        }

        const quantity = Math.max(1, Number(item.quantity) || 1);
        orderItems.push({
          productId: null,
          name: bundleName,
          price: bundlePrice,
          quantity,
          customDetails: item.customDetails || `عرض ترويجي: ${count} استيكر`,
          isCustom: false,
        });
        totalPrice += bundlePrice * quantity;
        continue;
      }

      // 3. Standard DB Product lookup
      if (!mongoose.isValidObjectId(item.productId)) {
        return res.status(400).json({ message: `Invalid product ID: ${item.productId}` });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }

      const quantity = Math.max(1, Number(item.quantity) || 1);
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        customDetails: item.customDetails || '',
        isCustom: false,
      });
      totalPrice += product.price * quantity;
    }

    const order = await Order.create({
      user: req.user?._id || null,
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      items: orderItems,
      totalPrice,
    });

    // Automatically notify store/admin on WhatsApp (runs asynchronously, safe error handling)
    whatsappService.sendOrderNotification(order).catch((err) => {
      console.warn('[WhatsApp Notification] Background delivery exception:', err.message);
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
