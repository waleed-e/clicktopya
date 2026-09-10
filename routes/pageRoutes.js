const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

router.get('/', pageController.index);
router.get('/products', pageController.products);
router.get('/products/category/:categoryName', pageController.productsByCategory);
router.get('/products/:id', pageController.productDetail);
router.get('/categories', pageController.categories);
router.get('/cart', pageController.cart);
router.get('/orders', pageController.orders);
router.get('/login', pageController.login);
router.get('/register', pageController.register);
router.get('/admin', pageController.adminDashboard);
router.get('/admin/products', pageController.adminProducts);
router.get('/admin/categories', pageController.adminCategories);
router.get('/admin/users', pageController.adminUsers);
router.get('/admin/orders', pageController.adminOrders);
router.get('/admin/offers', pageController.adminOffers);

module.exports = router;
