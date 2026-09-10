const https = require('https');

/**
 * Format order details into a clean, professional Egyptian Arabic message.
 * Strictly no emojis as requested.
 */
function formatOrderMessage(order) {
  const orderNumber = (order._id ? order._id.toString().slice(-6) : 'N/A').toUpperCase();
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const lines = [
    'طلب جديد من Clicktopya',
    '========================',
    `رقم الطلب: #${orderNumber}`,
    `تاريخ الطلب: ${dateStr}`,
    `اسم العميل: ${order.customerName || 'غير محدد'}`,
    `رقم الموبايل: ${order.customerPhone || 'غير محدد'}`,
    `العنوان: ${order.customerAddress || 'غير محدد'}`,
    '------------------------',
    'المنتجات المطلوبة:'
  ];

  if (Array.isArray(order.items) && order.items.length) {
    order.items.forEach((item, idx) => {
      const details = item.customDetails ? ` (${item.customDetails})` : '';
      const unitPrice = item.price != null ? `${item.price} جنيه` : '';
      lines.push(`${idx + 1}. ${item.name}${details} × ${item.quantity} [${unitPrice}]`);
    });
  } else {
    lines.push('(لا توجد عناصر)');
  }

  lines.push('------------------------');
  lines.push(`المجموع الكلي: ${order.totalPrice || 0} جنيه`);
  lines.push('طريقة الدفع: الدفع عند الاستلام');
  lines.push('الحالة: جاري المراجعة والتجهيز');
  lines.push('========================');

  return lines.join('\n');
}

/**
 * Dispatch automatic order notification to store/admin WhatsApp.
 * Uses Meta WhatsApp Cloud API if credentials are provided in .env.
 * Order creation is never blocked or failed if notification fails.
 */
async function sendOrderNotification(order) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '201011643099';

  const messageText = formatOrderMessage(order);

  // If credentials are not yet configured in .env, log cleanly and return
  if (!token || !phoneNumberId) {
    console.log('[WhatsApp Service] Notification prepared for order #' + (order._id ? order._id.toString().slice(-6) : '') +
      '. To deliver live, configure WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env.');
    return { success: false, reason: 'unconfigured_credentials' };
  }

  return new Promise((resolve) => {
    try {
      const payload = JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: adminPhone.replace(/[^0-9]/g, ''),
        type: 'text',
        text: {
          preview_url: false,
          body: messageText
        }
      });

      const options = {
        hostname: 'graph.facebook.com',
        path: `/v20.0/${phoneNumberId}/messages`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 8000
      };

      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[WhatsApp Service] Automatic order notification sent successfully for order #${order._id}`);
            resolve({ success: true, status: res.statusCode });
          } else {
            console.warn(`[WhatsApp Service] Meta API responded with status ${res.statusCode}.`);
            resolve({ success: false, status: res.statusCode });
          }
        });
      });

      req.on('error', (err) => {
        console.warn('[WhatsApp Service] Network error sending notification:', err.message);
        resolve({ success: false, error: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        console.warn('[WhatsApp Service] Request timed out while notifying admin.');
        resolve({ success: false, error: 'timeout' });
      });

      req.write(payload);
      req.end();
    } catch (err) {
      console.warn('[WhatsApp Service] Unexpected error in sendOrderNotification:', err.message);
      resolve({ success: false, error: err.message });
    }
  });
}

module.exports = {
  formatOrderMessage,
  sendOrderNotification
};
