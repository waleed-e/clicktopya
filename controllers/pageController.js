const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

function sendPage(file) {
  return (req, res) => {
    res.sendFile(path.join(publicDir, file));
  };
}

exports.index = sendPage('index.html');
exports.products = sendPage('products.html');
exports.productsByCategory = sendPage('products.html');
exports.productDetail = sendPage('product.html');
exports.categories = sendPage('categories.html');
exports.cart = sendPage('cart.html');
exports.login = sendPage('login.html');
exports.register = sendPage('register.html');
exports.orders = sendPage('orders.html');
exports.adminDashboard = sendPage('admin/dashboard.html');
exports.adminProducts = sendPage('admin/admin-products.html');
exports.adminCategories = sendPage('admin/admin-categories.html');
exports.adminUsers = sendPage('admin/admin-users.html');
exports.adminOrders = sendPage('admin/admin-orders.html');
exports.adminOffers = sendPage('admin/admin-offers.html');
