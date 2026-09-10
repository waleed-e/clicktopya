require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Category = require('../models/Category');
const Product = require('../models/Product');

async function seedStickers() {
  await connectDB();
  console.log('Connected to DB for seeding stickers...');

  let stickerCategory = await Category.findOne({ name: { $in: ['stickers', 'Stickers', 'استيكرات'] } });
  if (!stickerCategory) {
    stickerCategory = await Category.create({
      name: 'stickers',
      description: 'استيكرات لابتوب مقاومة للماء والخدش بجودة طباعة فينيل عالية'
    });
    console.log('Created stickers category:', stickerCategory._id);
  } else {
    console.log('Stickers category already exists:', stickerCategory._id);
  }

  const stickerProducts = [
    {
      name: 'بكج استيكرات المبرمجين (Dev & Coding Pack)',
      description: 'مجموعة مكونة من 10 استيكرات فينيل ضد الماء لأشهر لغات البرمجة وأدوات المطورين (JavaScript, Python, React, Git, Linux)',
      price: 50,
      Quantity: 80,
      imgpath: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80',
      cat_id: stickerCategory._id
    },
    {
      name: 'بكج استيكرات الجيمينج (Cyber Gaming Pack)',
      description: 'مجموعة مميزة من 10 استيكرات لعشاق الألعاب والسايبر بانك بجودة طباعة فائقة الدقة وألوان زاهية لا تبهت',
      price: 50,
      Quantity: 65,
      imgpath: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
      cat_id: stickerCategory._id
    },
    {
      name: 'بكج استيكرات الأنمي والبوب آرت (Anime Vibes Pack)',
      description: 'تشكيلة رهيبة من 10 استيكرات فينيل لأشهر شخصيات الأنمي الكلاسيكية والحديثة مع طبقة حماية ضد الخدوش',
      price: 50,
      Quantity: 90,
      imgpath: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80',
      cat_id: stickerCategory._id
    },
    {
      name: 'بكج استيكرات الميمز والبوب كالتشر (Trending Memes Pack)',
      description: '10 استيكرات فكاهية مضحكة وخفيفة الدم لأشهر ميمز الإنترنت مناسبة لظهر اللابتوب أو التابلت',
      price: 50,
      Quantity: 110,
      imgpath: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80',
      cat_id: stickerCategory._id
    },
    {
      name: 'استيكر فينيل لابتوب هولوجرافيك لامع (Holo Sticker)',
      description: 'استيكر بتأثير هولوجرافيك ثلاثي الأبعاد يعكس الألوان مع الضوء، مقاوم للماء والشمس مع لصق قوي قابل للإزالة دون أثر',
      price: 20,
      Quantity: 150,
      imgpath: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&auto=format&fit=crop&q=80',
      cat_id: stickerCategory._id
    },
    {
      name: 'استيكر لابتوب مخصص بتصميمك (Custom Laptop Sticker)',
      description: 'استيكر لابتوب مطبوع خصيصاً لك بأعلى جودة فينيل. متاح بالمقاس الصغير والكبير مع تنفيذ سريع وشحن لباب البيت',
      price: 10,
      Quantity: 999,
      imgpath: 'https://images.unsplash.com/photo-1589384267710-7a2559599557?w=500&auto=format&fit=crop&q=80',
      cat_id: stickerCategory._id
    }
  ];

  for (const prodData of stickerProducts) {
    const existing = await Product.findOne({ name: prodData.name });
    if (!existing) {
      await Product.create(prodData);
      console.log('Created product:', prodData.name);
    } else {
      console.log('Product already exists:', prodData.name);
    }
  }

  console.log('Seeding completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

seedStickers().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
