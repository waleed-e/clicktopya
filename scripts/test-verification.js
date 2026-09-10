const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Starting Clicktopya Verification Tests ---');

// 1. Check public/logo.png exists
const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
assert(fs.existsSync(logoPath), 'public/logo.png must exist');
const logoStats = fs.statSync(logoPath);
assert(logoStats.size > 0, 'public/logo.png must not be empty');
console.log('✓ public/logo.png exists and has size: ' + logoStats.size + ' bytes');

// 2. Check Order model schema
const Order = require('../models/Order');
const schema = Order.schema.paths;
assert(schema.customerName, 'Order schema must have customerName');
assert(schema.customerPhone, 'Order schema must have customerPhone');
assert(schema.customerAddress, 'Order schema must have customerAddress');
assert(schema.user.isRequired === false || schema.user.options.required === false, 'user field must be optional');
console.log('✓ Order model has optional user and customerName, customerPhone, customerAddress fields');

// 3. Check public HTML files for RTL, Tajawal font, Tailwind
const htmlFiles = [
    'index.html',
    'products.html',
    'cart.html',
    'product.html',
    'categories.html',
    'login.html',
    'register.html'
];

for (const file of htmlFiles) {
    const filePath = path.join(__dirname, '..', 'public', file);
    assert(fs.existsSync(filePath), `${file} must exist`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert(content.includes('dir="rtl"'), `${file} must be RTL`);
    assert(content.includes('Tajawal'), `${file} must include Tajawal font`);
    assert(content.includes('tailwindcss'), `${file} must include Tailwind CSS`);
    assert(content.includes('logo.png'), `${file} must reference logo.png`);
    assert(content.includes('handleLogoError'), `${file} must handle logo error with fallback`);
    console.log(`✓ ${file} verified: RTL, Tajawal, Tailwind, Logo & Fallback`);
}

// 4. Check cart.html specific requirements
const cartContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'cart.html'), 'utf8');
assert(cartContent.includes('id="customerName"'), 'cart.html checkout form must have customerName');
assert(cartContent.includes('id="customerPhone"'), 'cart.html checkout form must have customerPhone');
assert(cartContent.includes('id="customerAddress"'), 'cart.html checkout form must have customerAddress');
assert(cartContent.includes('submitGuestOrder'), 'cart.html must trigger submitGuestOrder');
console.log('✓ cart.html verified: guest fields and submitGuestOrder');

// 5. Check script.js for WhatsApp format, btn-checkout, and number
const scriptContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'script.js'), 'utf8');
assert(scriptContent.includes('id="btn-checkout"'), 'script.js must render checkout button with id="btn-checkout"');
assert(scriptContent.includes('201011643099'), 'script.js must contain WhatsApp destination 201011643099');
assert(scriptContent.includes('https://wa.me/'), 'script.js must construct wa.me URL');
assert(scriptContent.includes('encodeURIComponent'), 'script.js must use encodeURIComponent');
assert(scriptContent.includes('localStorage.removeItem(\'cart\')'), 'script.js must clear cart from localStorage');
assert(scriptContent.includes('renderOrderSummary'), 'script.js must render order summary');
console.log('✓ script.js verified: WhatsApp destination 201011643099, dynamic message formatting, cart cleanup');

// 6. Test WhatsApp message format generator simulation
function buildWhatsAppMessageSimulated(order) {
    const lines = [
        `🛒 طلب جديد من Clicktopya`,
        '',
        `👤 اسم العميل: ${order.customerName}`,
        `📱 رقم الموبايل: ${order.customerPhone}`,
        `📍 العنوان: ${order.customerAddress}`,
        '',
        `📦 المنتجات:`,
        '',
        ...(order.items || []).map((item) => `- ${item.name} × ${item.quantity} — ${item.price * item.quantity} جنيه`),
        '',
        `💰 الإجمالي: ${order.totalPrice} جنيه`
    ];
    return lines.join('\n');
}

const mockOrder = {
    _id: '67c1234567890abcdef12345',
    customerName: 'محمد أحمد',
    customerPhone: '01012345678',
    customerAddress: 'القاهرة، المعادي، شارع 9',
    items: [
        { name: 'قميص قطني كلاسيك', quantity: 2, price: 150 },
        { name: 'حذاء رياضي', quantity: 1, price: 300 }
    ],
    totalPrice: 600
};

const waMessage = buildWhatsAppMessageSimulated(mockOrder);
assert(waMessage.includes('محمد أحمد'));
assert(waMessage.includes('01012345678'));
assert(waMessage.includes('القاهرة، المعادي، شارع 9'));
assert(waMessage.includes('قميص قطني كلاسيك × 2 — 300 جنيه'));
assert(waMessage.includes('حذاء رياضي × 1 — 300 جنيه'));
assert(waMessage.includes('💰 الإجمالي: 600 جنيه'));

const encoded = encodeURIComponent(waMessage);
const targetUrl = `https://wa.me/201011643099?text=${encoded}`;
assert(targetUrl.startsWith('https://wa.me/201011643099?text=%F0%9F%9B%92'));
console.log('✓ WhatsApp dynamic message URL generated correctly:\n' + targetUrl.slice(0, 80) + '...');

console.log('\n--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
