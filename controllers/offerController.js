const Offer = require('../models/Offer');

// Helper to compute dynamic lifecycle status
function computeOfferStatus(offer) {
  const now = new Date();
  const start = new Date(offer.startDate);
  const end = new Date(offer.endDate);

  if (!offer.active) return 'disabled';
  if (now < start) return 'scheduled';
  if (now > end) return 'expired';
  return 'active';
}

// GET /api/offers - Public: get currently active offers
exports.getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      active: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ createdAt: -1 });

    res.json(offers);
  } catch (error) {
    console.error('Error fetching active offers:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب العروض الترويجية' });
  }
};

// GET /api/offers/all - Admin: get all offers with computed status
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    const offersWithStatus = offers.map(o => {
      const obj = o.toObject();
      obj.computedStatus = computeOfferStatus(o);
      return obj;
    });
    res.json(offersWithStatus);
  } catch (error) {
    console.error('Error fetching all offers for admin:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب قائمة العروض' });
  }
};

// POST /api/offers - Admin: create offer
exports.createOffer = async (req, res) => {
  try {
    const { title, description, discount, image, startDate, endDate, active, ctaText, ctaLink } = req.body;

    if (!title || !title.trim() || !startDate || !endDate) {
      return res.status(400).json({ message: 'العنوان وتواريخ البداية والنهاية حقول مطلوبة' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'صيغة التواريخ غير صحيحة' });
    }

    if (end < start) {
      return res.status(400).json({ message: 'تاريخ نهاية العرض يجب أن يكون بعد تاريخ البداية' });
    }

    const offer = await Offer.create({
      title: title.trim(),
      description: (description || '').trim(),
      discount: (discount || '').trim(),
      image: (image || '').trim(),
      startDate: start,
      endDate: end,
      active: active !== undefined ? Boolean(active) : true,
      ctaText: (ctaText || 'تسوق العرض').trim(),
      ctaLink: (ctaLink || '/#stickersSection').trim()
    });

    const obj = offer.toObject();
    obj.computedStatus = computeOfferStatus(offer);
    res.status(201).json(obj);
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(400).json({ message: error.message || 'فشل إنشاء العرض' });
  }
};

// PUT /api/offers/:id - Admin: update offer
exports.updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, discount, image, startDate, endDate, active, ctaText, ctaLink } = req.body;

    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: 'العرض غير موجود' });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        return res.status(400).json({ message: 'تاريخ نهاية العرض يجب أن يكون بعد تاريخ البداية' });
      }
      offer.startDate = start;
      offer.endDate = end;
    } else if (startDate) {
      const start = new Date(startDate);
      if (offer.endDate < start) {
        return res.status(400).json({ message: 'تاريخ البداية لا يمكن أن يكون بعد تاريخ النهاية' });
      }
      offer.startDate = start;
    } else if (endDate) {
      const end = new Date(endDate);
      if (end < offer.startDate) {
        return res.status(400).json({ message: 'تاريخ النهاية لا يمكن أن يكون قبل تاريخ البداية' });
      }
      offer.endDate = end;
    }

    if (title) offer.title = title.trim();
    if (description) offer.description = description.trim();
    if (discount) offer.discount = discount.trim();
    if (image !== undefined) offer.image = image.trim();
    if (active !== undefined) offer.active = Boolean(active);
    if (ctaText) offer.ctaText = ctaText.trim();
    if (ctaLink) offer.ctaLink = ctaLink.trim();

    await offer.save();

    const obj = offer.toObject();
    obj.computedStatus = computeOfferStatus(offer);
    res.json(obj);
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(400).json({ message: error.message || 'فشل تعديل العرض' });
  }
};

// DELETE /api/offers/:id - Admin: delete offer
exports.deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Offer.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'العرض غير موجود' });
    }
    res.json({ message: 'تم حذف العرض بنجاح' });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({ message: 'فشل حذف العرض' });
  }
};

// PATCH /api/offers/:id/toggle - Admin: quick toggle active
exports.toggleOfferActive = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: 'العرض غير موجود' });
    }

    offer.active = !offer.active;
    await offer.save();

    const obj = offer.toObject();
    obj.computedStatus = computeOfferStatus(offer);
    res.json(obj);
  } catch (error) {
    console.error('Error toggling offer:', error);
    res.status(500).json({ message: 'فشل تغيير حالة العرض' });
  }
};
