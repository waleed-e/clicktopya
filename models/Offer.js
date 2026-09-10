const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  discount: { type: String, default: '', trim: true },
  image: { type: String, default: '' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  active: { type: Boolean, default: true },
  ctaText: { type: String, default: 'تسوق العرض' },
  ctaLink: { type: String, default: '/#stickersSection' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

offerSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Offer', offerSchema);
