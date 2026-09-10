async function testLiveServer() {
    console.log('Testing live server at http://localhost:5000 ...\n');

    // 1. Static Pages
    for (const page of ['/', '/products', '/cart', '/categories', '/login', '/register']) {
        const res = await fetch(`http://localhost:5000${page}`);
        console.log(`GET ${page} -> Status: ${res.status} (${res.headers.get('content-type')})`);
        if (!res.ok) throw new Error(`Failed to load ${page}`);
    }

    // 2. Products API
    const prodRes = await fetch('http://localhost:5000/api/products');
    const prods = await prodRes.json();
    console.log(`\nGET /api/products -> Status: ${prodRes.status}, count: ${Array.isArray(prods) ? prods.length : 0}`);
    if (prods.length > 0) {
        console.log(`Sample product: ${prods[0].name} - Price: ${prods[0].price} - ID: ${prods[0]._id}`);
    }

    // 3. Categories API
    const catRes = await fetch('http://localhost:5000/api/categories');
    const cats = await catRes.json();
    console.log(`\nGET /api/categories -> Status: ${catRes.status}, count: ${Array.isArray(cats) ? cats.length : 0}`);

    // 4. Guest Order Creation (No Login Required)
    if (prods.length > 0) {
        const orderPayload = {
            customerName: 'أحمد محمود زائر تجريبي',
            customerPhone: '01099887766',
            customerAddress: 'الجيزة، المهندسين، شارع جامعة الدول',
            items: [
                { productId: prods[0]._id, quantity: 2 }
            ]
        };

        const orderRes = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });

        const createdOrder = await orderRes.json();
        console.log(`\nPOST /api/orders (Guest) -> Status: ${orderRes.status}`);
        console.log('Created Order ID:', createdOrder._id);
        console.log('Customer Name:', createdOrder.customerName);
        console.log('Customer Phone:', createdOrder.customerPhone);
        console.log('Customer Address:', createdOrder.customerAddress);
        console.log('Total Price (authoritative calculated by backend):', createdOrder.totalPrice);
        console.log('User field:', createdOrder.user); // Should be null for guest!
        console.log('Status:', createdOrder.status);

        if (createdOrder.user !== null) {
            throw new Error('Guest order user must be null!');
        }
        if (createdOrder.customerName !== orderPayload.customerName) {
            throw new Error('Customer name mismatch!');
        }
    }

    console.log('\n✓ ALL LIVE ENDPOINT & GUEST CHECKOUT TESTS PASSED WITH FLYING COLORS!');
}

testLiveServer().catch(err => {
    console.error('LIVE TEST ERROR:', err);
    process.exit(1);
});
