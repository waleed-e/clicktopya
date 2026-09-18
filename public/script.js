let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
let currentUser = null;
let lastCreatedOrder = null;
let checkoutSubmitting = false;

// Custom Sticker Interactive State
let customStickerState = {
    sizeKey: 'under_7cm', // 'under_7cm' (10 EGP) or '7_to_15cm' (15 EGP)
    quantity: 10,
    unitPrice: 10,
    notes: ''
};

const API_BASE = `${window.location.origin}/api`;
const WHATSAPP_NUMBER = '201011643099';
const LANG_KEY = 'language';

const translations = {
    ar: {
        home: 'الرئيسية',
        products: 'المنتجات',
        categories: 'التصنيفات',
        cart: 'عربة التسوق',
        myOrders: 'طلباتي',
        admin: 'لوحة التحكم',
        login: 'دخول',
        register: 'تسجيل',
        logout: 'خروج',
        shopNow: 'تسوق دلوقتي',
        heroTitle: 'Clicktopya',
        heroSubtitle: 'اطلب اللي يعجبك ويوصلك لحد باب بيتك — استيكرات لابتوب فينيل بأعلى جودة وتصاميم على ذوقك',
        ourProducts: 'تصفح كل المنتجات',
        searchPlaceholder: 'ابحث عن منتج...',
        allCategories: 'جميع التصنيفات',
        sortBy: 'ترتيب حسب',
        priceAsc: 'السعر: من الأقل للأعلى',
        priceDesc: 'السعر: من الأعلى للأقل',
        nameAsc: 'الاسم: أ-ي',
        loading: 'جاري التحميل...',
        loadingProduct: 'جاري تحميل المنتج...',
        loadingCategories: 'جاري تحميل التصنيفات...',
        noProducts: 'لا توجد منتجات',
        loadError: 'خطأ في تحميل المنتجات',
        productLoadError: 'خطأ في تحميل المنتج',
        productNotFound: 'المنتج غير موجود',
        inStock: 'متوفر',
        outOfStock: 'غير متوفر',
        inStockQty: 'متوفر ({n} قطعة)',
        addToCart: 'ضيف للعربة',
        addToCartLong: 'ضيف للعربة',
        addedToCart: 'تمام! ضفناه لعربة التسوق',
        backToProducts: 'العودة إلى المنتجات',
        categoryLabel: 'التصنيف',
        unspecified: 'غير محدد',
        noDescription: 'لا يوجد وصف متوفر لهذا المنتج',
        currency: 'جنيه',
        quickLinks: 'روابط سريعة',
        contactUs: 'تواصل معنا',
        footerTagline: 'أضغط واشتري — متجر مصري متكامل للإكسسوارات واستيكرات اللابتوب الفينيل بالدفع عند الاستلام',
        copyright: 'Clicktopya — جميع الحقوق محفوظة',
        loginTitle: 'تسجيل الدخول',
        registerTitle: 'إنشاء حساب',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        fullName: 'الاسم الكامل',
        fillLogin: 'اكتب البريد الإلكتروني وكلمة المرور',
        fillAll: 'املأ كل الخانات المطلوبة',
        loginSuccess: 'أهلاً بيك! تم تسجيل الدخول بنجاح',
        loginFail: 'بيانات الدخول مش صحيحة، جرب تاني',
        registerSuccess: 'تمام! حسابك اتعمل بنجاح',
        registerFail: 'فشل إنشاء الحساب، تأكد من البيانات',
        serverError: 'حصلت مشكلة في الاتصال بالسيرفر، جرب تاني',
        loginRequired: 'سجل دخولك الأول عشان تشوف طلباتك',
        noOrders: 'لسه مفيش طلبات مسجلة',
        myOrdersTitle: 'طلباتي',
        ordersSubtitle: 'تابع حالة طلباتك خطوة بخطوة من أول ما تأكد الطلب لحد ما يوصل لباب بيتك',
        orderLine: 'طلب رقم {id} - المجموع: {total} {currency} - الحالة: {status}',
        ordersFetchError: 'حدث خطأ أثناء جلب طلباتك',
        emptyCart: 'العربة بتاعتك لسه فاضية',
        emptyCartHint: 'شوف أحدث المنتجات واستيكرات اللابتوب واطلب بضغطة واحدة!',
        continueShopping: 'كمّل تسوق',
        productCol: 'المنتج',
        priceCol: 'السعر',
        qtyCol: 'الكمية',
        totalCol: 'الإجمالي',
        grandTotal: 'المجموع الكلي',
        remove: 'حذف',
        checkout: 'تأكيد الطلب والدفع عند الاستلام',
        checkoutTitle: 'بيانات توصيل الطلب',
        customerName: 'الاسم الكامل',
        customerPhone: 'رقم الموبايل',
        customerAddress: 'العنوان بالتفصيل (المدينة - المنطقة - الشارع)',
        confirmOrder: 'تأكيد الطلب الآن',
        cancel: 'إلغاء والعودة للعربة',
        checkoutRequired: 'اكتب بياناتك عشان نقدر نجهز طلبك',
        orderSuccess: 'تمام! طلبك اتأكد بنجاح',
        orderError: 'حصل خطأ أثناء تأكيد الطلب، حاول مرة تانية',
        orderSummary: 'ملخص وتأكيد الطلب',
        customerInfo: 'بيانات المستلم',
        orderInfo: 'تفاصيل المنتجات',
        sendWhatsApp: 'تواصل مع الدعم عبر واتساب',
        allCategoriesTitle: 'جميع التصنيفات',
        noAccount: 'لسه معندكش حساب؟',
        createAccount: 'إنشاء حساب جديد',
        hasAccount: 'عندك حساب بالفعل؟',
        goLogin: 'تسجيل الدخول',
        pageHomeTitle: 'Clicktopya | متجرك الإلكتروني',
        pageProductsTitle: 'Clicktopya | المنتجات',
        pageCartTitle: 'Clicktopya | عربة التسوق',
        pageCategoriesTitle: 'Clicktopya | التصنيفات',
        pageProductTitle: 'Clicktopya | تفاصيل المنتج',
        pageOrdersTitle: 'Clicktopya | طلباتي',
        pageLoginTitle: 'Clicktopya | تسجيل الدخول',
        pageRegisterTitle: 'Clicktopya | إنشاء حساب',
        waNewOrder: 'طلب جديد من Clicktopya',
        waName: 'اسم العميل',
        waPhone: 'رقم الموبايل',
        waAddress: 'العنوان',
        waProducts: 'المنتجات',
        waTotal: 'الإجمالي',

        // Latest Offers Translations
        latestOffersTitle: 'أحدث العروض الحصرية',
        latestOffersSubtitle: 'تخفيضات نشطة ومحدودة لفترة معينة — استغل الفرصة واطلب دلوقتي',
        shopOffer: 'تسوق العرض',
        expiresIn: 'متبقي',
        days: 'أيام',
        hours: 'ساعات',
        endsSoon: 'ينتهي قريباً',

        // Laptop Stickers Specific Translations
        stickersNav: 'استيكرات لابتوب',
        stickersSectionTitle: 'قسم استيكرات اللابتوب',
        stickersSectionSubtitle: 'حوّل لابتوبك لقطعة فنية فريدة مع استيكرات فينيل أصلية مقاومة للمية والخدش، أو صمّم استيكرك الخاص بالكامل!',
        customStickersTitle: 'صمّم الاستيكر بتاعك',
        customStickersSubtitle: 'اطبع لوجو شركتك، شخصيتك المفضلة، أو أي فكرة في بالك بالمقاس والكمية اللي تناسبك',
        stickerSizeSmall: 'أصغر من 7 × 7 سم',
        stickerSizeSmallPrice: '10 جنيه / استيكر',
        stickerSizeLarge: 'من 7 × 7 سم حتى 15 × 15 سم',
        stickerSizeLargePrice: '15 جنيه / استيكر',
        minQtyNotice: 'الحد الأدنى للطلب 10 استيكرات',
        minQtyExplain: 'الحد الأدنى 10 قطع لضمان دقة الطباعة وتكلفة القص بالليزر',
        customWarningNotice: 'الاستيكرز المخصصة بتحتاج من 7 إلى 10 أيام للتنفيذ.',
        stickerOffersTitle: 'عروض وباقات الاستيكرات الحصرية',
        offer10Title: 'باقة 10 استيكرات',
        offer10Price: '50 جنيه',
        offer10Badge: 'الأكثر شعبية',
        offer20Title: 'باقة 20 استيكر',
        offer20Price: '90 جنيه',
        offer20Badge: 'الأكثر طلباً',
        offer50Title: 'باقة 50 استيكر',
        offer50Price: '180 جنيه',
        offer50Badge: 'أفضل توفير',
        orderPackageBtn: 'اطلب الباقة الآن',
        addCustomStickerBtn: 'إضافة الاستيكر المخصص للعربة',
        customStickerDesignNote: 'رابط التصميم أو وصف الاستيكر (اختياري)',
        customStickerDesignPlaceholder: 'اكتب فكرة التصميم أو رابط درايف/بينترست، أو سنتواصل معك لتأكيد الملف'
    },
    en: {
        home: 'Home',
        products: 'Products',
        categories: 'Categories',
        cart: 'Cart',
        myOrders: 'My Orders',
        admin: 'Admin',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        shopNow: 'Shop Now',
        heroTitle: 'Clicktopya',
        heroSubtitle: 'Click and buy — premium computer gear & waterproof custom laptop stickers',
        ourProducts: 'Our Products',
        searchPlaceholder: 'Search for a product...',
        allCategories: 'All categories',
        sortBy: 'Sort by',
        priceAsc: 'Price: low to high',
        priceDesc: 'Price: high to low',
        nameAsc: 'Name: A-Z',
        loading: 'Loading...',
        loadingProduct: 'Loading product...',
        loadingCategories: 'Loading categories...',
        noProducts: 'No products found',
        loadError: 'Failed to load products',
        productLoadError: 'Failed to load product',
        productNotFound: 'Product not found',
        inStock: 'In stock',
        outOfStock: 'Out of stock',
        inStockQty: 'In stock ({n} items)',
        addToCart: 'Add to cart',
        addToCartLong: 'Add to cart',
        addedToCart: 'Product added to cart',
        backToProducts: 'Back to products',
        categoryLabel: 'Category',
        unspecified: 'Unspecified',
        noDescription: 'No description available',
        currency: 'EGP',
        quickLinks: 'Quick links',
        contactUs: 'Contact us',
        footerTagline: 'Click and buy — a distinctive shopping experience for tech and custom laptop stickers',
        copyright: 'Clicktopya — All rights reserved',
        loginTitle: 'Login',
        registerTitle: 'Create account',
        email: 'Email',
        password: 'Password',
        fullName: 'Full name',
        fillLogin: 'Please enter email and password',
        fillAll: 'Please fill in all fields',
        loginSuccess: 'Logged in successfully',
        loginFail: 'Login failed',
        registerSuccess: 'Account created successfully',
        registerFail: 'Registration failed',
        serverError: 'Could not reach the server',
        loginRequired: 'Please log in first',
        noOrders: 'No orders yet',
        myOrdersTitle: 'My orders',
        ordersSubtitle: 'Track your orders step-by-step from preparation to your door',
        orderLine: 'Order #{id} — Total: {total} {currency} — Status: {status}',
        ordersFetchError: 'Could not load orders',
        emptyCart: 'Your cart is empty',
        emptyCartHint: 'You have not added any products to your cart yet.',
        continueShopping: 'Continue shopping',
        productCol: 'Product',
        priceCol: 'Price',
        qtyCol: 'Qty',
        totalCol: 'Total',
        grandTotal: 'Grand total',
        remove: 'Remove',
        checkout: 'Checkout & Cash on Delivery',
        checkoutTitle: 'Delivery Details',
        customerName: 'Full Name',
        customerPhone: 'Phone Number',
        customerAddress: 'Full Address',
        confirmOrder: 'Confirm Order Now',
        cancel: 'Cancel and return to cart',
        checkoutRequired: 'Please enter name, phone, and address',
        orderSuccess: 'Your order was confirmed successfully!',
        orderError: 'Could not create order, please try again',
        orderSummary: 'Order Summary & Confirmation',
        customerInfo: 'Customer information',
        orderInfo: 'Order details',
        sendWhatsApp: 'Contact support on WhatsApp',
        allCategoriesTitle: 'All categories',
        noAccount: "Don't have an account?",
        createAccount: 'Create a new account',
        hasAccount: 'Already have an account?',
        goLogin: 'Log in',
        pageHomeTitle: 'Clicktopya | Your online store',
        pageProductsTitle: 'Clicktopya | Products',
        pageCartTitle: 'Clicktopya | Cart',
        pageCategoriesTitle: 'Clicktopya | Categories',
        pageProductTitle: 'Clicktopya | Product details',
        pageOrdersTitle: 'Clicktopya | My Orders',
        pageLoginTitle: 'Clicktopya | Login',
        pageRegisterTitle: 'Clicktopya | Register',
        waNewOrder: 'New Order from Clicktopya',
        waName: 'Customer Name',
        waPhone: 'Phone',
        waAddress: 'Address',
        waProducts: 'Products',
        waTotal: 'Total',

        // Latest Offers Translations (EN)
        latestOffersTitle: 'Latest Exclusive Offers',
        latestOffersSubtitle: 'Active, time-limited discounts and deals — take advantage before they expire',
        shopOffer: 'Shop Offer',
        expiresIn: 'Expires in',
        days: 'days',
        hours: 'hours',
        endsSoon: 'Ends soon',

        // Laptop Stickers Specific Translations (EN)
        stickersNav: 'Laptop Stickers',
        stickersSectionTitle: 'Laptop Stickers Studio',
        stickersSectionSubtitle: 'Turn your laptop into art with waterproof vinyl stickers, or fully customize your own!',
        customStickersTitle: 'Create Your Own Sticker',
        customStickersSubtitle: 'Print your artwork, logo, or favorite characters in your chosen size and quantity',
        stickerSizeSmall: 'Under 7 × 7 cm',
        stickerSizeSmallPrice: '10 EGP / sticker',
        stickerSizeLarge: '7 × 7 cm – 15 × 15 cm',
        stickerSizeLargePrice: '15 EGP / sticker',
        minQtyNotice: 'Minimum order: 10 stickers',
        minQtyExplain: 'Minimum 10 stickers to ensure professional die-cut and print precision',
        customWarningNotice: 'Customized stickers require 7–10 days for production.',
        stickerOffersTitle: 'Exclusive Sticker Package Deals',
        offer10Title: '10 Stickers Pack',
        offer10Price: '50 EGP',
        offer10Badge: 'Popular',
        offer20Title: '20 Stickers Pack',
        offer20Price: '90 EGP',
        offer20Badge: 'Best Seller',
        offer50Title: '50 Stickers Pack',
        offer50Price: '180 EGP',
        offer50Badge: 'Best Value',
        orderPackageBtn: 'Order Pack Now',
        addCustomStickerBtn: 'Add Custom Sticker to Cart',
        customStickerDesignNote: 'Design link or notes (optional)',
        customStickerDesignPlaceholder: 'Enter design theme or link, or we will coordinate with you on WhatsApp'
    }
};

function getLang() {
    return localStorage.getItem(LANG_KEY) || 'ar';
}

function t(key, vars) {
    const lang = getLang();
    let text = (translations[lang] && translations[lang][key]) || translations.ar[key] || key;
    if (vars) {
        Object.keys(vars).forEach((k) => {
            text = text.replace(`{${k}}`, vars[k]);
        });
    }
    return text;
}

function formatPrice(value) {
    const num = Number(value) || 0;
    return `${num.toLocaleString()} ${t('currency')}`;
}

function applyDocumentDir() {
    const lang = getLang();
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

function applyI18n() {
    applyDocumentDir();
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (key) el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key) el.setAttribute('placeholder', t(key));
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
        const key = el.getAttribute('data-i18n-title');
        if (key) document.title = t(key);
    });
    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.lang === getLang());
    });
}

function setLanguage(lang) {
    localStorage.setItem(LANG_KEY, lang === 'en' ? 'en' : 'ar');
    applyI18n();
    if (document.getElementById('productsGrid') && products.length) {
        displayProducts(products);
        updateCategoryFilter();
    }
    if (document.getElementById('categoriesGrid') || document.getElementById('categoriesCarouselTrack')) {
        loadCategories();
    }
    if (document.getElementById('cartContent')) {
        displayCart();
    }
    if (typeof updateCustomStickerUI === 'function') {
        updateCustomStickerUI();
    }
    if (typeof window.reloadProductDetails === 'function') {
        window.reloadProductDetails();
    }
}

function setupNavbarScroll() {
    const nav = document.querySelector('nav.navbar, #siteNavbar');
    if (!nav) return;
    const onScroll = () => {
        if (window.scrollY > 15) {
            nav.classList.add('navbar-scrolled');
        } else {
            nav.classList.remove('navbar-scrolled');
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

function toggleMobileNav() {
    const menu = document.getElementById('mobileNav');
    if (menu) menu.classList.toggle('hidden');
}

function handleLogoError(img) {
    if (!img) return;
    img.classList.add('is-hidden');
    img.style.display = 'none';
}

// Modern Non-Blocking Toast Notification System
function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    
    let iconClass = 'fa-check';
    if (type === 'error') iconClass = 'fa-exclamation-triangle';
    if (type === 'info') iconClass = 'fa-info-circle';

    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${iconClass}"></i></div>
        <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('toast-show');
    });

    setTimeout(() => {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 350);
    }, 3200);
}

// ============= Auth Functions =============
async function login() {
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
        showToast(t('fillLogin'), 'error');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('يرجى إدخال بريد إلكتروني صحيح', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.toLowerCase(), password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast(t('loginSuccess'), 'success');
            setTimeout(() => { window.location.href = '/'; }, 500);
        } else {
            showToast(data.message || t('loginFail'), 'error');
        }
    } catch (error) {
        showToast(t('serverError'), 'error');
    }
}

async function register() {
    const name = document.getElementById('regName')?.value?.trim();
    const email = document.getElementById('regEmail')?.value?.trim();
    const password = document.getElementById('regPassword')?.value;

    if (!name || !email || !password) {
        showToast(t('fillAll'), 'error');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('يرجى إدخال بريد إلكتروني صحيح ومكتمل', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email: email.toLowerCase(), password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast(t('registerSuccess'), 'success');
            setTimeout(() => { window.location.href = '/'; }, 500);
        } else {
            showToast(data.message || t('registerFail'), 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        showToast(t('serverError'), 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('open');
        return;
    }
    window.location.href = '/login';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
    }
}

function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('open');
        return;
    }
    window.location.href = '/register';
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
    }
}

function showLogin() { showLoginModal(); }
function showRegister() { showRegisterModal(); }
function closeLogin() { closeLoginModal(); }
function closeRegister() { closeRegisterModal(); }

// ============= Products Functions =============
function renderProductSkeleton() {
    return Array.from({ length: 8 }).map(() => `
        <div class="rounded-2xl sm:rounded-3xl bg-white shadow-sm border border-slate-200/70 overflow-hidden">
            <div class="aspect-square skeleton-shimmer"></div>
            <div class="p-4 space-y-2">
                <div class="h-4 skeleton-shimmer rounded-full w-3/4"></div>
                <div class="h-3 skeleton-shimmer rounded-full w-1/2"></div>
                <div class="h-9 skeleton-shimmer rounded-full mt-3"></div>
            </div>
        </div>
    `).join('');
}

function renderProductSwiperSkeleton() {
    return Array.from({ length: 3 }).map(() => `
        <div class="swiper-slide">
            <div class="product-swiper-card bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm">
                <div class="card-img-wrap aspect-[16/5] md:aspect-[2/3] min-h-[220px] skeleton-shimmer"></div>
                <div class="card-info-bar p-4 space-y-3">
                    <div class="h-5 skeleton-shimmer rounded-full w-3/4"></div>
                    <div class="flex items-center justify-between pt-2">
                        <div class="h-6 skeleton-shimmer rounded-full w-1/4"></div>
                        <div class="h-8 skeleton-shimmer rounded-full w-1/3"></div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

let productSwiperInstance = null;

function initProductSwiper() {
    const swiperEl = document.getElementById('mobileProductsSwiper');
    if (!swiperEl || typeof Swiper === 'undefined') return;

    if (productSwiperInstance) {
        try {
            productSwiperInstance.destroy(true, true);
        } catch (e) {
            console.warn('Error destroying swiper instance:', e);
        }
        productSwiperInstance = null;
    }

    productSwiperInstance = new Swiper(swiperEl, {
        slidesPerView: 'auto',
        spaceBetween: 14,
        centeredSlides: false,
        grabCursor: true,
        watchOverflow: true,
        navigation: {
            nextEl: swiperEl.querySelector('.swiper-button-next'),
            prevEl: swiperEl.querySelector('.swiper-button-prev'),
        },
        breakpoints: {
            640: {
                slidesPerView: 2.15,
                spaceBetween: 16
            },
            768: {
                slidesPerView: 3,
                spaceBetween: 20
            }
        }
    });
}

function handleBottomNavAccount() {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/orders';
    } else {
        showLoginModal();
    }
}

function updateBottomNavActive() {
    const path = window.location.pathname;
    const items = document.querySelectorAll('.bottom-mobile-nav .bnav-item');
    items.forEach(el => el.classList.remove('active'));
    if (path === '/' || path === '/index.html') {
        document.querySelector('.bottom-mobile-nav .bnav-home')?.classList.add('active');
    } else if (path.startsWith('/products') || path.startsWith('/product')) {
        document.querySelector('.bottom-mobile-nav .bnav-store')?.classList.add('active');
    } else if (path.startsWith('/cart')) {
        document.querySelector('.bottom-mobile-nav .bnav-cart')?.classList.add('active');
    } else if (path.startsWith('/orders')) {
        document.querySelector('.bottom-mobile-nav .bnav-account')?.classList.add('active');
    }
}

function getCategoryFromURL() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryCat = urlParams.get('category');
        if (queryCat && queryCat.trim() !== '') return decodeURIComponent(queryCat.trim());

        const pathMatch = window.location.pathname.match(/\/products\/category\/([^/?#]+)/);
        if (pathMatch && pathMatch[1]) return decodeURIComponent(pathMatch[1].trim());
    } catch (e) {
        console.warn('Error reading category from URL:', e);
    }
    return null;
}

let availableCategories = [];

async function updateCategoryFilter(selectedCategoryName = '') {
    const select = document.getElementById('categoryFilter');
    if (!select) return;

    if (!availableCategories.length) {
        try {
            const res = await fetch(`${API_BASE}/categories`);
            if (res.ok) availableCategories = await res.json();
        } catch (e) {
            console.warn('Error loading categories for filter:', e);
        }
    }

    const current = selectedCategoryName || select.value || '';
    const catOptions = (availableCategories || []).map(cat => {
        const name = typeof cat === 'string' ? cat : (cat.name || '');
        const isSelected = name.toLowerCase() === current.toLowerCase() ? 'selected' : '';
        return `<option value="${name}" ${isSelected}>${name}</option>`;
    }).join('');

    select.innerHTML = `<option value="">${t('allCategories')}</option>` + catOptions;
    if (current) select.value = current;
}

async function loadProducts(categoryOverride = null) {
    const grid = document.getElementById('productsGrid');
    const swiperTrack = document.getElementById('productsSwiperTrack');
    if (grid) grid.innerHTML = renderProductSkeleton();
    if (swiperTrack) swiperTrack.innerHTML = renderProductSwiperSkeleton();

    const selectedCategory = categoryOverride !== null ? categoryOverride : getCategoryFromURL();
    const categoryTitle = document.getElementById('categoryTitle');

    if (categoryTitle) {
        if (selectedCategory) {
            categoryTitle.textContent = `${t('products')} — ${selectedCategory}`;
        } else {
            categoryTitle.textContent = t('products');
        }
    }

    try {
        const fetchUrl = selectedCategory
            ? `${API_BASE}/products?category=${encodeURIComponent(selectedCategory)}`
            : `${API_BASE}/products`;

        const res = await fetch(fetchUrl);
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
            throw new Error(data.message || 'bad response');
        }
        products = data;
        displayProducts(products);
        await updateCategoryFilter(selectedCategory || '');
    } catch (error) {
        console.error('Error loading products:', error);
        const errHtml = `
            <div class="col-span-full text-center py-16 bg-white rounded-3xl border border-rose-100 shadow-sm">
                <i class="fas fa-circle-exclamation text-4xl text-rose-500 mb-3"></i>
                <p class="text-rose-600 font-bold text-lg mb-4">${t('loadError')}</p>
                <button class="btn-hover bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm" onclick="loadProducts()">إعادة المحاولة</button>
            </div>
        `;
        if (grid) grid.innerHTML = errHtml;
        if (swiperTrack) swiperTrack.innerHTML = errHtml;
    }
}

function displayProducts(productsToShow) {
    const grid = document.getElementById('productsGrid');
    const swiperTrack = document.getElementById('productsSwiperTrack');
    if (!grid && !swiperTrack) return;

    if (!productsToShow.length) {
        const emptyHtml = `
            <div class="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <i class="fas fa-box-open text-5xl text-slate-300 mb-3"></i>
                <p class="text-slate-500 font-bold text-lg">${t('noProducts')}</p>
            </div>
        `;
        if (grid) grid.innerHTML = emptyHtml;
        if (swiperTrack) swiperTrack.innerHTML = emptyHtml;
        return;
    }

    // 1. Render Desktop Grid
    if (grid) {
        grid.innerHTML = productsToShow.map((product, index) => {
            const isAvailable = product.Quantity > 0;
            const categoryName = product.cat_id?.name || '';
            const img = product.imgpath || '/logo.png';
            const isSticker = categoryName.toLowerCase().includes('sticker') || product.name.includes('استيكر');

            return `
                <article class="product-card card-enter group bg-white rounded-3xl overflow-hidden border ${isSticker ? 'border-red-200/90 shadow-red-500/5' : 'border-slate-200/80'} shadow-sm flex flex-col justify-between" style="animation-delay:${index * 35}ms">
                    <a href="/products/${product._id}" class="card-media block relative overflow-hidden bg-slate-50 aspect-square flex items-center justify-center p-4">
                        <img src="${img}" alt="${product.name}" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" onerror="this.src='/logo.png'">
                        ${categoryName ? `<span class="hidden sm:inline-block absolute top-3 start-3 ${isSticker ? 'bg-red-600 text-white' : 'bg-white/95 text-slate-700'} text-xs font-black px-2.5 py-1 rounded-full shadow-sm">${categoryName}</span>` : ''}
                        ${isSticker ? '<span class="hidden sm:inline-block absolute top-3 end-3 bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">فينيل ضد الماء</span>' : ''}
                    </a>
                    <div class="card-body p-4 sm:p-5 flex flex-col flex-grow justify-between text-start">
                        <div>
                            <h3 class="card-title text-sm sm:text-base font-extrabold text-slate-800 mb-1 line-clamp-2 hover:text-red-600 transition">
                                <a href="/products/${product._id}">${product.name}</a>
                            </h3>
                            <div class="flex items-center justify-between my-2">
                                <span class="card-price text-sm sm:text-xl font-black text-red-600">${formatPrice(product.price)}</span>
                                <span class="hidden sm:inline-block text-xs font-bold px-2 py-0.5 rounded-full ${isAvailable ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}">
                                    ${isAvailable ? t('inStock') : t('outOfStock')}
                                </span>
                            </div>
                        </div>
                        <button class="card-btn btn-hover mt-3 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5 transition" onclick="addToCart('${product._id}')" title="${t('addToCart')}">
                            <i class="fas fa-cart-plus text-xs sm:text-sm"></i>
                            <span>${t('addToCart')}</span>
                        </button>
                    </div>
                </article>
            `;
        }).join('');
    }

    // 2. Render Mobile Swiper Slides (matching the reference layout)
    if (swiperTrack) {
        swiperTrack.innerHTML = productsToShow.map((product) => {
            const isAvailable = product.Quantity > 0;
            const categoryName = product.cat_id?.name || '';
            const img = product.imgpath || '/logo.png';
            const isSticker = categoryName.toLowerCase().includes('sticker') || product.name.includes('استيكر');

            return `
                <div class="swiper-slide">
                    <div class="product-swiper-card group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-md flex flex-col justify-between h-full relative">
                        <!-- Image area: large, clear, filling card with aspect ratio -->
                        <a href="/products/${product._id}" class="card-img-wrap aspect-[16/5] md:aspect-[2/3] block relative overflow-hidden bg-slate-50 w-full flex items-center justify-center p-3">
                            <img src="${img}" alt="${product.name}" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" onerror="this.src='/logo.png'">
                            ${categoryName ? `<span class="category-badge">${categoryName}</span>` : ''}
                            ${isSticker ? `<span class="stock-badge bg-amber-400 text-slate-900">فينيل ضد الماء</span>` : (isAvailable ? `<span class="stock-badge text-emerald-600">${t('inStock')}</span>` : `<span class="stock-badge text-rose-600">${t('outOfStock')}</span>`)}
                        </a>
                        <!-- White bar directly below the image inside the same card -->
                        <div class="card-info-bar bg-white p-4 flex flex-col justify-between flex-grow">
                            <div>
                                <h3 class="product-name font-bold text-base text-slate-800 mb-1 hover:text-red-600 transition">
                                    <a href="/products/${product._id}">${product.name}</a>
                                </h3>
                            </div>
                            <div class="price-row flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                                <span class="product-price text-xl font-black text-red-600">${formatPrice(product.price)}</span>
                                <button class="add-btn btn-hover bg-red-600 hover:bg-red-700 text-white py-2 px-5 rounded-full font-bold text-sm shadow-md shadow-red-600/20 flex items-center gap-2 transition" onclick="addToCart('${product._id}')" title="${t('addToCart')}">
                                    <i class="fas fa-cart-plus text-xs"></i>
                                    <span>${t('addToCart')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        initProductSwiper();
    }

    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}


async function filterByCategory() {
    const categoryName = document.getElementById('categoryFilter')?.value || '';
    const newUrl = categoryName
        ? `/products?category=${encodeURIComponent(categoryName)}`
        : '/products';

    if (window.history && window.history.pushState) {
        window.history.pushState(null, '', newUrl);
    }
    await loadProducts(categoryName);
}

function searchProducts() {
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm));
    displayProducts(filtered);
}

function sortProducts() {
    const sortBy = document.getElementById('sortSelect')?.value;
    let sorted = [...products];

    if (sortBy === 'price_asc') sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') sorted.sort((a, b) => b.price - a.price);
    if (sortBy === 'name_asc') sorted.sort((a, b) => a.name.localeCompare(b.name));

    displayProducts(sorted);
}

async function loadCategories() {
    // Support both #categoriesGrid (categories.html) and
    // #categoriesCarouselTrack (index.html inline section)
    const grid   = document.getElementById('categoriesGrid');
    const track  = document.getElementById('categoriesCarouselTrack');
    const target = grid || track;

    try {
        const res = await fetch(`${API_BASE}/categories`);
        const categories = await res.json();
        availableCategories = categories;

        if (target) {
            if (!Array.isArray(categories) || !categories.length) {
                target.innerHTML = `<div class="col-span-full text-center text-slate-500 py-12">${t('noProducts')}</div>`;
                return;
            }

            // Skeleton cards replaced with real cards
            target.innerHTML = categories.map((cat, index) => {
                const catImg = cat.image || '';
                // Fallback gradient background when no image
                const fallbackBg = !catImg
                    ? 'background: linear-gradient(135deg,#fee2e2 0%,#fecaca 100%);'
                    : '';
                const fallbackIcon = !catImg
                    ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:0.3;">
                            <i class="fas fa-folder-open"></i>
                       </div>`
                    : '';

                return `
                    <div class="cat-card" tabindex="0" role="button" aria-label="${cat.name}"
                         onclick="goToCategoryProducts('${cat.name}')"
                         onkeydown="if(event.key==='Enter')goToCategoryProducts('${cat.name}')"
                         style="${fallbackBg}">
                        ${catImg
                            ? `<img src="${catImg}" alt="${cat.name}" class="cat-card-img" loading="lazy"
                                    onerror="this.style.display='none'">`
                            : fallbackIcon}
                        <div class="cat-card-overlay"></div>
                        <div class="cat-card-pill">
                            <span class="cat-card-pill-name">${cat.name}</span>
                            <span class="cat-card-pill-icon"><i class="fas fa-chevron-left"></i></span>
                        </div>
                    </div>
                `;
            }).join('');

            // On mobile, boot the auto-scroll behaviour
            if (window.innerWidth < 768) {
                initCategoryCarousel(target);
            }

            if (typeof AOS !== 'undefined') AOS.refresh();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        if (target) {
            target.innerHTML = `<div class="col-span-full text-center text-rose-600 py-10 font-bold">${t('loadError')}</div>`;
        }
    }
}

/**
 * Initialise the mobile auto-scrolling carousel.
 * @param {HTMLElement} track - The .cat-carousel-track element.
 */
function initCategoryCarousel(track) {
    if (!track) return;
    const cards = Array.from(track.querySelectorAll('.cat-card'));
    if (cards.length < 2) return;

    let currentIndex = 0;
    let autoTimer = null;
    let pauseTimer = null;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartTranslate = 0;

    function getCardWidth() {
        const card = track.querySelector('.cat-card');
        if (!card) return 180;
        return card.offsetWidth + 14; // width + gap
    }

    function slideTo(index) {
        const total = cards.length;
        currentIndex = ((index % total) + total) % total;
        const offset = currentIndex * getCardWidth();
        // CSS transforms are always in physical pixel space (not affected by dir="rtl")
        // Negative translateX scrolls the track left → revealing cards to the left (next card)
        track.style.transform = `translateX(-${offset}px)`;
    }

    function startAuto() {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = setInterval(() => {
            slideTo(currentIndex + 1);
        }, 2200);
    }

    function pauseAuto(resumeDelay = 3000) {
        clearInterval(autoTimer);
        clearTimeout(pauseTimer);
        pauseTimer = setTimeout(startAuto, resumeDelay);
    }

    // ── Touch / pointer drag support ──
    track.addEventListener('pointerdown', (e) => {
        isDragging = true;
        dragStartX = e.clientX;
        const match = (track.style.transform || '').match(/translateX\(([^)]+)px\)/);
        dragStartTranslate = match ? parseFloat(match[1]) : 0;
        track.setPointerCapture(e.pointerId);
        pauseAuto(4000);
        track.style.transition = 'none';
    }, { passive: true });

    track.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const delta = e.clientX - dragStartX;
        track.style.transform = `translateX(${dragStartTranslate + delta}px)`;
    }, { passive: true });

    function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = '';
        const delta = e.clientX - dragStartX;
        const threshold = getCardWidth() * 0.3;
        if (delta < -threshold) {
            slideTo(currentIndex + 1);
        } else if (delta > threshold) {
            slideTo(currentIndex - 1);
        } else {
            slideTo(currentIndex);
        }
    }

    track.addEventListener('pointerup', endDrag, { passive: true });
    track.addEventListener('pointercancel', endDrag, { passive: true });

    // Init
    slideTo(0);
    startAuto();
}



function filterByCategoryName(categoryName) {
    window.location.href = `/products?category=${encodeURIComponent(categoryName)}`;
}

function goToCategoryProducts(categoryName) {
    window.location.href = `/products?category=${encodeURIComponent(categoryName)}`;
}

// ============= Laptop Sticker Customizer Functions =============
function selectStickerSize(sizeKey) {
    customStickerState.sizeKey = sizeKey;
    customStickerState.unitPrice = sizeKey === '7_to_15cm' ? 15 : 10;
    updateCustomStickerUI();
}

function adjustCustomStickerQty(delta) {
    let newQty = customStickerState.quantity + delta;
    if (newQty < 10) newQty = 10;
    customStickerState.quantity = newQty;
    updateCustomStickerUI();
}

function setCustomStickerQty(val) {
    let num = parseInt(val, 10);
    if (isNaN(num) || num < 10) num = 10;
    customStickerState.quantity = num;
    updateCustomStickerUI();
}

function updateCustomStickerUI() {
    const isLarge = customStickerState.sizeKey === '7_to_15cm';
    const total = customStickerState.quantity * customStickerState.unitPrice;

    // Update size buttons
    const btnSmall = document.getElementById('sizeBtnSmall');
    const btnLarge = document.getElementById('sizeBtnLarge');
    if (btnSmall && btnLarge) {
        if (isLarge) {
            btnLarge.classList.add('border-red-600', 'bg-red-50/70', 'ring-2', 'ring-red-300');
            btnLarge.classList.remove('border-slate-200', 'bg-white');
            btnSmall.classList.remove('border-red-600', 'bg-red-50/70', 'ring-2', 'ring-red-300');
            btnSmall.classList.add('border-slate-200', 'bg-white');
        } else {
            btnSmall.classList.add('border-red-600', 'bg-red-50/70', 'ring-2', 'ring-red-300');
            btnSmall.classList.remove('border-slate-200', 'bg-white');
            btnLarge.classList.remove('border-red-600', 'bg-red-50/70', 'ring-2', 'ring-red-300');
            btnLarge.classList.add('border-slate-200', 'bg-white');
        }
    }

    // Update quantity input
    const qtyInput = document.getElementById('customStickerQtyInput');
    if (qtyInput) qtyInput.value = customStickerState.quantity;

    // Update unit price & total
    const unitPriceEl = document.getElementById('customStickerUnitPrice');
    if (unitPriceEl) unitPriceEl.textContent = formatPrice(customStickerState.unitPrice);

    const totalEl = document.getElementById('customStickerTotal');
    if (totalEl) totalEl.textContent = formatPrice(total);

    // Update visual preview on laptop back mock
    const previewSticker = document.getElementById('laptopPreviewSticker');
    const previewBadge = document.getElementById('previewSizeBadge');
    if (previewSticker) {
        if (isLarge) {
            previewSticker.style.width = '105px';
            previewSticker.style.height = '105px';
            if (previewBadge) previewBadge.textContent = '12 × 12 سم (كبير)';
        } else {
            previewSticker.style.width = '62px';
            previewSticker.style.height = '62px';
            if (previewBadge) previewBadge.textContent = '6 × 6 سم (صغير)';
        }
    }
}

function addCustomStickerToCart() {
    const notesInput = document.getElementById('customStickerNotes');
    const notes = (notesInput?.value || '').trim();
    const isLarge = customStickerState.sizeKey === '7_to_15cm';
    const sizeLabel = isLarge ? t('stickerSizeLarge') : t('stickerSizeSmall');
    const qty = Math.max(10, customStickerState.quantity);
    const unitPrice = isLarge ? 15 : 10;

    let detailsText = `المقاس: ${sizeLabel}`;
    if (notes) detailsText += ` • التصميم: ${notes}`;
    detailsText += ' • مدة التنفيذ: 7-10 أيام';

    cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if duplicate exists
    const existingIndex = cart.findIndex(item => item.isCustom && item.sizeKey === customStickerState.sizeKey && item.customDetails === detailsText);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += qty;
    } else {
        cart.push({
            productId: 'custom-sticker',
            name: 'استيكر لابتوب مخصص (Custom Laptop Sticker)',
            price: unitPrice,
            quantity: qty,
            sizeKey: customStickerState.sizeKey,
            customDetails: detailsText,
            isCustom: true,
            imgpath: '/logo.png'
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(true);
    showToast(t('addedToCart'));
}

function addStickerOfferToCart(offerCount, offerPrice) {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    const offerKey = `sticker-offer-${offerCount}`;
    let offerName = `باقة ${offerCount} استيكرات لابتوب`;
    if (offerCount === 10) offerName += ' (الأكثر شعبية)';
    else if (offerCount === 20) offerName += ' (الأكثر طلباً)';
    else if (offerCount === 50) offerName += ' (أفضل توفير)';

    const details = `عرض ترويجي: ${offerCount} استيكرات منوعة للابتوب بجودة فينيل ممتازة ضد الماء`;

    const existingIndex = cart.findIndex(item => item.productId === offerKey);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            productId: offerKey,
            name: offerName,
            price: offerPrice,
            quantity: 1,
            stickerCount: offerCount,
            customDetails: details,
            isOffer: true,
            imgpath: '/logo.png'
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(true);
    showToast(`تمت إضافة ${offerName} للسلة بنجاح!`);
}

// ============= Cart Functions =============
function addToCart(productId) {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItem = cart.find(item => item.productId === productId);
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imgpath: product.imgpath || '/logo.png'
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(true);
    showToast(t('addedToCart'));
}

function updateCartCount(animate = false) {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountSpans = document.querySelectorAll('#cartCount, #cartCountMobile, .nav-cart-counter, .cart-badge-counter');
    cartCountSpans.forEach(span => {
        if (span) {
            span.textContent = count;
            // Optionally hide or style when count is 0
            if (span.classList.contains('nav-cart-counter')) {
                span.style.display = count > 0 ? 'inline-block' : 'none';
            }
            if (animate) {
                span.classList.add('bump');
                setTimeout(() => span.classList.remove('bump'), 300);
            }
        }
    });

    if (animate) {
        document.querySelectorAll('.nav-cart-btn, .cart-badge').forEach(el => {
            el.classList.add('bump');
            setTimeout(() => el.classList.remove('bump'), 300);
        });
    }
}

function showCart() {
    window.location.href = '/cart';
}

function updateQuantity(index, newQuantity) {
    newQuantity = parseInt(newQuantity, 10);
    const isCustom = cart[index] && cart[index].isCustom;
    const min = isCustom ? 10 : 1;
    if (isNaN(newQuantity) || newQuantity < min) newQuantity = min;
    if (cart[index]) {
        cart[index].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(true);
        displayCart();
    }
}

function removeItem(index) {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(true);
    displayCart();
}

function displayCart() {
    const container = document.getElementById('cartContent');
    if (!container) return;

    cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (lastCreatedOrder) {
        renderOrderSummary(lastCreatedOrder);
        return;
    }

    if (!cart.length) {
        container.innerHTML = `
            <div class="text-center py-16 text-slate-500">
                <div class="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <h3 class="text-2xl font-black text-slate-800 mb-2" data-i18n="emptyCart">${t('emptyCart')}</h3>
                <p class="text-slate-500 mb-8 max-w-sm mx-auto text-sm" data-i18n="emptyCartHint">${t('emptyCartHint')}</p>
                <div class="flex flex-wrap justify-center gap-3">
                    <button class="btn-hover bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-red-600/30 transition text-sm" onclick="window.location.href='/products'">
                        <i class="fas fa-arrow-right me-1"></i> ${t('continueShopping')}
                    </button>
                    <button class="btn-hover bg-slate-800 hover:bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold transition text-sm" onclick="window.location.href='/stickers'">
                        <i class="fas fa-fire text-amber-400 me-1"></i> تصفح استيكرات اللابتوب
                    </button>
                </div>
            </div>
        `;
        updateCartCount();
        return;
    }

    let total = 0;
    const rows = cart.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const isCustom = !!item.isCustom;
        const isOffer = !!item.isOffer;
        const step = isCustom ? 10 : 1;

        return `
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-b-0">
                <!-- Item Info -->
                <div class="flex items-center gap-3 flex-1">
                    <div class="w-14 h-14 rounded-2xl ${isCustom ? 'bg-amber-50 text-amber-600 border border-amber-200' : isOffer ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-red-50 text-red-600'} flex items-center justify-center shrink-0 text-xl shadow-xs">
                        <i class="fas ${isCustom ? 'fa-wand-magic-sparkles' : isOffer ? 'fa-fire' : 'fa-box'}"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <h4 class="font-black text-slate-800 text-base leading-snug">${item.name}</h4>
                            ${isCustom ? '<span class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black">مخصص (Custom)</span>' : ''}
                            ${isOffer ? '<span class="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black">عرض ترويجي <i class="fas fa-bolt text-rose-600 ms-0.5"></i></span>' : ''}
                        </div>
                        ${item.customDetails ? `<p class="text-xs text-slate-600 mt-1 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 inline-block"><i class="fas fa-info-circle text-red-500 me-1"></i>${item.customDetails}</p>` : ''}
                        <div class="text-xs text-slate-400 mt-1">${formatPrice(item.price)} للقطعة</div>
                    </div>
                </div>

                <!-- Quantity Controls -->
                <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div class="flex items-center border border-slate-200 rounded-full bg-slate-50 p-1">
                        <button class="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-xs text-slate-600 hover:text-red-600 font-bold transition" onclick="updateQuantity(${index}, ${item.quantity - step})">-</button>
                        <span class="w-10 text-center font-black text-sm text-slate-800">${item.quantity}</span>
                        <button class="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-xs text-slate-600 hover:text-red-600 font-bold transition" onclick="updateQuantity(${index}, ${item.quantity + step})">+</button>
                    </div>

                    <!-- Item Total -->
                    <div class="text-start sm:text-end min-w-[90px]">
                        <span class="font-black text-slate-900 text-base">${formatPrice(itemTotal)}</span>
                    </div>

                    <!-- Remove -->
                    <button class="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition" title="${t('remove')}" onclick="removeItem(${index})">
                        <i class="fas fa-trash-alt text-sm"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="divide-y divide-slate-100 mb-6">
            ${rows}
        </div>

        <!-- Total Breakdown & Checkout Action -->
        <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100 mt-6 space-y-3">
            <div class="flex justify-between text-sm text-slate-500">
                <span>المجموع الفرعي</span>
                <span>${formatPrice(total)}</span>
            </div>
            <div class="flex justify-between text-sm text-slate-500">
                <span>طريقة الدفع</span>
                <span class="font-bold text-emerald-600">الدفع عند الاستلام</span>
            </div>
            <div class="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span class="text-base font-black text-slate-900" data-i18n="grandTotal">${t('grandTotal')}</span>
                <span class="text-2xl font-black text-red-600">${formatPrice(total)}</span>
            </div>
        </div>

        <!-- Checkout Button (ID btn-checkout preserved) -->
        <button id="btn-checkout" class="btn-hover w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-full text-lg font-extrabold shadow-xl shadow-red-600/30 mt-6 flex items-center justify-center gap-3 transition" onclick="openCheckoutModal()">
            <i class="fas fa-lock"></i>
            <span data-i18n="checkout">${t('checkout')}</span>
        </button>
    `;
    updateCartCount();
}

// ============= Egyptian Locations Handler for Checkout =============
const EGYPT_GOVS_LIST = (typeof EGYPT_GOVERNORATES !== 'undefined') ? EGYPT_GOVERNORATES : [
    { name: "القاهرة", cities: ["مدينة نصر", "المعادي", "التجمع الخامس / القاهرة الجديدة", "مصر الجديدة", "الزمالك", "شبرا", "وسط البلد", "حلوان", "المقطم", "عين شمس", "النزهة", "الشروق", "بدر", "مدينتي", "الرحاب", "المستقبل", "حدائق القبة", "الوايلي", "العباسية", "المطرية", "المرج"] },
    { name: "الجيزة", cities: ["الدقي", "المهندسين", "6 أكتوبر", "الشيخ زايد", "الهرم", "فيصل", "العجوزة", "العمرانية", "الوراق", "إمبابة", "الحوامدية", "البدرشين", "حدائق الأهرام"] },
    { name: "الإسكندرية", cities: ["سموحة", "سيدي جابر", "الإبراهيمية", "لوران", "سان ستيفانو", "المنشية", "العجمي", "ميامي", "سيدي بشر", "المعمورة", "المنتزه", "كفر عبده", "برج العرب"] },
    { name: "القليوبية", cities: ["بنها", "شبرا الخيمة", "قليوب", "القناطر الخيرية", "طوخ", "الخانكة", "كفر شكر", "العبور", "قها"] },
    { name: "الدقهلية", cities: ["المنصورة", "ميت غمر", "السنبلاوين", "دكرنس", "بلقاس", "أجا", "شربين", "المنزلة", "طلخا"] },
    { name: "الشرقية", cities: ["الزقازيق", "العاشر من رمضان", "بلبيس", "منيا القمح", "فاقوس", "أبو حماد", "ديرب نجم"] },
    { name: "المنوفية", cities: ["شبين الكوم", "قويسنا", "بركة السبع", "تلا", "منوف", "أشمون", "السادات"] },
    { name: "الغربية", cities: ["طنطا", "المحلة الكبرى", "كفر الزيات", "زفتى", "سمنود", "قطور", "بسيون"] },
    { name: "كفر الشيخ", cities: ["كفر الشيخ", "دسوق", "فوه", "مطوبس", "بيلا", "الحامول", "بلطيم"] },
    { name: "البحيرة", cities: ["دمنهور", "كفر الدوار", "رشيد", "إدكو", "أبو حمص", "إيتاي البارود", "حوش عيسى", "كوم حمادة"] },
    { name: "دمياط", cities: ["دمياط", "رأس البر", "دمياط الجديدة", "كفر سعد", "فارسكور", "الزرقا"] },
    { name: "بورسعيد", cities: ["حي الشرق", "حي العرب", "حي المناخ", "حي الضواحي", "حي الزهور", "بورفؤاد"] },
    { name: "الإسماعيلية", cities: ["الإسماعيلية", "فايد", "القنطرة غرب", "القنطرة شرق", "التل الكبير", "القصاصين"] },
    { name: "السويس", cities: ["حي السويس", "حي الأربعين", "حي فيصل", "حي عتاقة", "حي الجناين", "العين السخنة"] },
    { name: "بني سويف", cities: ["بني سويف", "الواسطى", "ناصر", "ببا", "الفشن", "سمسطا", "إهناسيا"] },
    { name: "الفيوم", cities: ["الفيوم", "سنورس", "إطسا", "طامية", "يوسف الصديق", "أبشواي"] },
    { name: "المنيا", cities: ["المنيا", "مغاغة", "بني مزار", "مطاي", "سمالوط", "أبو قرقاص", "ملوي"] },
    { name: "أسيوط", cities: ["أسيوط", "ديروط", "القوصية", "أبنوب", "منفلوط", "الفتح", "أبو تيج"] },
    { name: "سوهاج", cities: ["سوهاج", "أخميم", "طهطا", "طما", "المراغة", "جرجا", "المنشأة", "البلينا"] },
    { name: "قنا", cities: ["قنا", "نجع حمادي", "دشنا", "قوص", "فرشوط", "أبو تشت", "فقط"] },
    { name: "الأقصر", cities: ["الأقصر", "إسنا", "أرمنت", "القرنة", "الطود", "البياضية"] },
    { name: "أسوان", cities: ["أسوان", "كوم أمبو", "إدفو", "نصر النوبة", "دراو", "أبو سمبل"] },
    { name: "البحر الأحمر", cities: ["الغردقة", "الجونة", "سفاجا", "القصير", "مرسى علم", "رأس غارب"] },
    { name: "جنوب سيناء", cities: ["شرم الشيخ", "دهب", "نويبع", "طابا", "طور سيناء", "رأس سدر"] },
    { name: "شمال سيناء", cities: ["العريش", "رفح", "الشيخ زويد", "بئر العبد"] },
    { name: "مطروح", cities: ["مرسى مطروح", "العلمين", "الساحل الشمالي", "الحمام", "الضبعة", "سيوة"] },
    { name: "الوادي الجديد", cities: ["الخارجة", "الداخلة", "الفرافرة", "باريس"] }
];

function populateGovernorates() {
    const govSelect = document.getElementById('customerGovernorate');
    if (!govSelect) return;
    if (govSelect.options.length > 1) return;

    const list = (typeof EGYPT_GOVERNORATES !== 'undefined') ? EGYPT_GOVERNORATES : EGYPT_GOVS_LIST;
    list.forEach(gov => {
        const opt = document.createElement('option');
        opt.value = gov.name;
        opt.textContent = gov.name;
        govSelect.appendChild(opt);
    });
}

function onGovernorateChange(govName) {
    const citySelect = document.getElementById('customerCity');
    if (!citySelect) return;

    citySelect.innerHTML = '<option value="" disabled selected>اختر المدينة / المنطقة...</option>';
    citySelect.disabled = true;

    const list = (typeof EGYPT_GOVERNORATES !== 'undefined') ? EGYPT_GOVERNORATES : EGYPT_GOVS_LIST;
    const foundGov = list.find(g => g.name === govName);

    if (foundGov && foundGov.cities && foundGov.cities.length) {
        foundGov.cities.forEach(city => {
            const opt = document.createElement('option');
            opt.value = city;
            opt.textContent = city;
            citySelect.appendChild(opt);
        });
        citySelect.disabled = false;
    }

    syncCompositeAddress();
}

function onCityChange() {
    syncCompositeAddress();
}

function syncCompositeAddress() {
    const gov = document.getElementById('customerGovernorate')?.value || '';
    const city = document.getElementById('customerCity')?.value || '';
    const detail = document.getElementById('customerDetailedAddress')?.value || '';
    const hiddenAddr = document.getElementById('customerAddress');

    if (hiddenAddr) {
        const parts = [];
        if (gov) parts.push(gov);
        if (city) parts.push(city);
        if (detail.trim()) parts.push(detail.trim());
        hiddenAddr.value = parts.join(' - ');
    }
}

function openCheckoutModal() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!cart.length) {
        showToast(t('emptyCart'), 'info');
        return;
    }
    const modal = document.getElementById('checkoutModal');
    if (!modal) {
        showToast(t('checkoutRequired'), 'error');
        return;
    }
    populateGovernorates();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.name) {
        const nameInput = document.getElementById('customerName');
        if (nameInput && !nameInput.value) nameInput.value = user.name;
    }
    modal.style.display = 'flex';
    modal.classList.add('open');
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
    }
}

async function submitGuestOrder(event) {
    if (event) event.preventDefault();
    if (checkoutSubmitting) return;

    cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!cart.length) {
        showToast(t('emptyCart'), 'info');
        return;
    }

    const customerName = (document.getElementById('customerName')?.value || '').trim();
    const customerPhone = (document.getElementById('customerPhone')?.value || '').trim();
    const governorate = (document.getElementById('customerGovernorate')?.value || '').trim();
    const city = (document.getElementById('customerCity')?.value || '').trim();
    const detailedAddress = (document.getElementById('customerDetailedAddress')?.value || '').trim();

    syncCompositeAddress();
    let customerAddress = (document.getElementById('customerAddress')?.value || '').trim();

    if (!customerAddress && (governorate || city || detailedAddress)) {
        customerAddress = [governorate, city, detailedAddress].filter(Boolean).join(' - ');
    }

    if (!customerName || !customerPhone || !customerAddress) {
        showToast('يرجى استكمال جميع بيانات التوصيل (الاسم، الموبايل، والعنوان)', 'error');
        return;
    }

    if (document.getElementById('customerGovernorate') && (!governorate || !city || !detailedAddress)) {
        showToast('يرجى اختيار المحافظة والمدينة وكتابة العنوان بالتفصيل', 'error');
        return;
    }

    // Egyptian phone normalization: clean non-digits, check 010/011/012/015
    let cleanPhone = customerPhone.replace(/[\s\-\(\)\.]/g, '');
    if (cleanPhone.startsWith('+20')) cleanPhone = '0' + cleanPhone.slice(3);
    else if (cleanPhone.startsWith('0020')) cleanPhone = '0' + cleanPhone.slice(4);
    else if (cleanPhone.startsWith('20') && cleanPhone.length === 12) cleanPhone = '0' + cleanPhone.slice(2);

    const egPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!egPhoneRegex.test(cleanPhone)) {
        showToast('رقم الموبايل غير صحيح — يرجى كتابة رقم موبايل مصري صحيح (010, 011, 012, 015)', 'error');
        return;
    }

    checkoutSubmitting = true;
    const submitBtn = document.getElementById('confirmOrderBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<div class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin me-2"></div> جاري تأكيد الطلب...`;
    }

    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
        const res = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                customerName,
                customerPhone,
                customerAddress,
                governorate,
                city,
                detailedAddress,
                items: cart.map((item) => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    customDetails: item.customDetails || '',
                    isCustom: !!item.isCustom,
                    isOffer: !!item.isOffer,
                    sizeKey: item.sizeKey || '',
                    stickerCount: item.stickerCount || 0
                }))
            })
        });

        const data = await res.json();

        if (!res.ok || !data._id) {
            showToast(data.message || t('orderError'), 'error');
            checkoutSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fas fa-check-circle me-1"></i> ${t('confirmOrder')}`;
            }
            return;
        }

        // Cache order in guest orders for easy tracking on /orders
        try {
            const guestOrders = JSON.parse(localStorage.getItem('myGuestOrders') || '[]');
            guestOrders.unshift(data);
            localStorage.setItem('myGuestOrders', JSON.stringify(guestOrders.slice(0, 20)));
        } catch (e) {
            console.warn('Could not cache guest order:', e);
        }

        // Clear cart now that order is securely saved in backend
        localStorage.removeItem('cart');
        cart = [];
        updateCartCount();

        showToast('تم تأكيد طلبك بنجاح! جاري عرض ملخص الطلب...', 'success');

        lastCreatedOrder = data;
        checkoutSubmitting = false;
        closeCheckoutModal();
        renderOrderSummary(data);
    } catch (error) {
        console.error('Order error:', error);
        showToast(t('serverError'), 'error');
        checkoutSubmitting = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fas fa-check-circle me-1"></i> ${t('confirmOrder')}`;
        }
    }
}

function renderOrderSummary(order) {
    const container = document.getElementById('cartContent');
    if (!container) return;

    const itemsHtml = (order.items || []).map((item) => `
        <li class="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0 text-sm">
            <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-black flex items-center justify-center shrink-0">${item.quantity}</span>
                <div>
                    <span class="font-bold text-slate-800">${item.name}</span>
                    ${item.customDetails ? `<div class="text-xs text-red-600 mt-0.5"><i class="fas fa-tag me-1"></i>${item.customDetails}</div>` : ''}
                </div>
            </div>
            <div class="text-end font-extrabold text-slate-900">
                ${formatPrice(item.price * item.quantity)}
            </div>
        </li>
    `).join('');

    container.innerHTML = `
        <div id="orderSummary" class="space-y-6 card-enter">
            <!-- Success Banner -->
            <div class="text-center py-4">
                <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-3 text-3xl shadow-sm animate-pulse">
                    <i class="fas fa-check"></i>
                </div>
                <h3 class="text-2xl sm:text-3xl font-black text-slate-900">${t('orderSuccess')}</h3>
                <p class="text-slate-500 text-sm mt-1">طلبك رقم <span class="font-mono font-bold text-red-600">#${order._id.slice(-6).toUpperCase()}</span> تم تسجيله في النظام</p>
            </div>

            <!-- Customer Details Card -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 sm:p-6 space-y-3">
                <h4 class="font-black text-slate-900 text-sm flex items-center gap-2 mb-2">
                    <i class="fas fa-user-check text-red-600"></i> ${t('customerInfo')}
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                    <div class="bg-white p-3 rounded-2xl border border-slate-100">
                        <span class="block text-slate-400 text-xs mb-1">${t('customerName')}</span>
                        <strong class="text-slate-800">${order.customerName}</strong>
                    </div>
                    <div class="bg-white p-3 rounded-2xl border border-slate-100">
                        <span class="block text-slate-400 text-xs mb-1">${t('customerPhone')}</span>
                        <strong class="text-slate-800" dir="ltr">${order.customerPhone}</strong>
                    </div>
                    <div class="bg-white p-3 rounded-2xl border border-slate-100">
                        <span class="block text-slate-400 text-xs mb-1">${t('customerAddress')}</span>
                        <strong class="text-slate-800">${order.customerAddress}</strong>
                    </div>
                </div>
            </div>

            <!-- Products Summary Card -->
            <div class="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6">
                <h4 class="font-black text-slate-900 text-sm flex items-center gap-2 mb-4">
                    <i class="fas fa-receipt text-red-600"></i> ${t('orderInfo')}
                </h4>
                <ul class="divide-y divide-slate-100 mb-4">
                    ${itemsHtml}
                </ul>
                <div class="pt-4 border-t-2 border-slate-100 flex justify-between items-center">
                    <span class="text-base font-black text-slate-900">${t('grandTotal')}</span>
                    <span class="text-2xl font-black text-red-600">${formatPrice(order.totalPrice)}</span>
                </div>
            </div>

            <!-- WhatsApp Order Submission Action -->
            <div class="pt-2">
                <p class="text-center text-xs text-slate-500 mb-3">اضغط على الزر أدناه لإرسال تفاصيل طلبك مباشرة للبائع عبر واتساب لتأكيد الشحن</p>
                <button id="btn-whatsapp" class="btn-hover btn-whatsapp-pulse w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-full text-lg font-extrabold shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition" onclick="sendOrderOnWhatsApp()">
                    <i class="fab fa-whatsapp text-2xl"></i>
                    <span>${t('sendWhatsApp')}</span>
                </button>
                <div id="waSuccessMsg" class="hidden mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-800 text-sm font-semibold">
                    <i class="fas fa-check-circle text-emerald-600 me-1"></i>
                    تم فتح المحادثة على واتساب وتفريغ السلة بنجاح. شكراً لتسوقك مع Clicktopya!
                    <div class="mt-3">
                        <button class="btn-hover bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-bold" onclick="lastCreatedOrder=null; displayCart();">طلب جديد</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function buildWhatsAppMessage(order) {
    const lines = [
        `[Clicktopya] ${t('waNewOrder')} #${order._id.slice(-6).toUpperCase()}`,
        '',
        `*${t('waName')}:* ${order.customerName}`,
        `*${t('waPhone')}:* ${order.customerPhone}`,
        `*${t('waAddress')}:* ${order.customerAddress}`,
        '',
        `*${t('waProducts')}:*`,
        ...(order.items || []).map((item) => {
            const details = item.customDetails ? ` (${item.customDetails})` : '';
            return `- ${item.name}${details} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`;
        }),
        '',
        `*${t('waTotal')}:* ${formatPrice(order.totalPrice)}`
    ];
    return lines.join('\n');
}

function sendOrderOnWhatsApp() {
    if (!lastCreatedOrder) return;
    const text = encodeURIComponent(buildWhatsAppMessage(lastCreatedOrder));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');

    localStorage.removeItem('cart');
    cart = [];
    updateCartCount();

    const btn = document.getElementById('btn-whatsapp');
    if (btn) {
        btn.innerHTML = `<i class="fas fa-check-double text-xl"></i> <span>تم فتح واتساب وتأكيد الطلب</span>`;
        btn.classList.remove('btn-whatsapp-pulse');
        btn.classList.add('bg-slate-800', 'hover:bg-slate-900');
    }
    const msg = document.getElementById('waSuccessMsg');
    if (msg) {
        msg.classList.remove('hidden');
    }
}

// Legacy checkout helpers
function checkoutWithStripe() { openCheckoutModal(); }
function placeCashOrder() { openCheckoutModal(); }
function checkout() { openCheckoutModal(); }

// ============= Orders Functions =============
function showOrders() {
    window.location.href = '/orders';
}

// ============= UI Helpers =============
function scrollToProducts() {
    const productsSection = document.getElementById('productsSection');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.location.href = '/products';
    }
}

function scrollToStickers() {
    const stickersSection = document.getElementById('stickersSection');
    if (stickersSection) {
        stickersSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.location.href = '/stickers';
    }
}

function showProductsPage() {
    const productsSection = document.getElementById('productsSection');
    const categoriesSection = document.getElementById('categoriesSection');
    if (productsSection) productsSection.style.display = 'block';
    if (categoriesSection) categoriesSection.style.display = 'none';
    loadProducts();
}

function showCategoriesPage() {
    const productsSection = document.getElementById('productsSection');
    const categoriesSection = document.getElementById('categoriesSection');
    if (productsSection) productsSection.style.display = 'none';
    if (categoriesSection) categoriesSection.style.display = 'block';
    loadCategories();
}

function checkUserStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            const authButtons = document.getElementById('authButtons');
            const authButtonsMobile = document.getElementById('authButtonsMobile');
            const userInfo = document.getElementById('userInfo');
            const userNameSpan = document.getElementById('userName');
            const adminLink = document.getElementById('adminLink');

            if (authButtons) {
                authButtons.classList.add('hidden');
                authButtons.style.display = 'none';
            }
            if (authButtonsMobile) {
                authButtonsMobile.classList.add('hidden');
                authButtonsMobile.style.display = 'none';
            }
            if (userInfo) {
                userInfo.classList.remove('hidden');
                userInfo.style.display = 'flex';
            }
            if (userNameSpan) userNameSpan.textContent = currentUser.name;
            if (adminLink && currentUser.isAdmin) {
                adminLink.style.display = 'inline-block';
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
}

// ============= Offers Functions =============
async function loadLatestOffers() {
    const grid = document.getElementById('latestOffersGrid');
    const section = document.getElementById('latestOffersSection');
    if (!grid) return;

    try {
        const res = await fetch(`${API_BASE}/offers`);
        if (!res.ok) throw new Error('Offers fetch failed');
        const offers = await res.json();

        if (!offers || offers.length === 0) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = 'block';

        grid.innerHTML = offers.map(offer => {
            const hasImg = offer.image && offer.image.trim() !== '';
            const discountBadge = offer.discount ? `<div class="discount-ribbon font-black text-xs"><i class="fas fa-bolt me-1"></i>${offer.discount}</div>` : '';
            const ctaText = offer.ctaText || 'تسوق الآن';
            const ctaLink = offer.ctaLink || '/products';

            return `
                <div class="offer-card group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-red-400">
                    <div>
                        <div class="relative h-48 bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 overflow-hidden flex items-center justify-center">
                            ${discountBadge}
                            ${hasImg ? `
                                <img src="${offer.image}" alt="${offer.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                            ` : `
                                <div class="text-center p-6 text-white">
                                    <div class="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mx-auto flex items-center justify-center text-3xl mb-3 text-red-400">
                                        <i class="fas fa-gift"></i>
                                    </div>
                                    <span class="text-xs uppercase tracking-widest text-red-300 font-bold">عرض خاص حصري</span>
                                </div>
                            `}
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-black text-slate-900 mb-2 group-hover:text-red-600 transition">${offer.title}</h3>
                            <p class="text-slate-600 text-sm leading-relaxed mb-4">${offer.description || ''}</p>
                        </div>
                    </div>
                    <div class="p-6 pt-0">
                        <a href="${ctaLink}" class="btn-hover inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-lg shadow-red-600/25 transition">
                            <span>${ctaText}</span>
                            <i class="fas fa-arrow-left text-xs"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.warn('Error loading latest offers:', err);
        if (section) section.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyI18n();
    setupNavbarScroll();
    checkUserStatus();
    updateCartCount();
    updateBottomNavActive();

    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            easing: 'ease-out-cubic',
            once: true,
            offset: 30
        });
    }

    if (document.getElementById('productsGrid') || document.getElementById('productsSwiperTrack')) {
        loadProducts();
    }
    if (document.getElementById('latestOffersGrid')) {
        loadLatestOffers();
    }
    if (document.getElementById('categoriesGrid') || document.getElementById('categoriesCarouselTrack')) {
        loadCategories();
    }
    if (document.getElementById('cartContent') && typeof displayCart === 'function') {
        displayCart();
    }
    if (document.getElementById('customStickerQtyInput')) {
        updateCustomStickerUI();
    }
});


// Sync cart counter across browser tabs in real time
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        updateCartCount(true);
        if (document.getElementById('cartContent') && typeof displayCart === 'function') {
            displayCart();
        }
    }
});
