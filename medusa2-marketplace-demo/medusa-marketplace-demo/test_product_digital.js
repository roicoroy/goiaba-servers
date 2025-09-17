const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:9000';

// --- Admin Credentials ---
const ADMIN_EMAIL = 'admin@medusa-test.com'; // Replace with your admin email
const ADMIN_PASSWORD = 'supersecret'; // Replace with your admin password

// --- Customer Credentials (You need to obtain this manually) ---
// Register a customer via your storefront or API, then log them in to get this token.
const CUSTOMER_AUTH_TOKEN = 'YOUR_CUSTOMER_AUTH_TOKEN_HERE'; // <<< IMPORTANT: REPLACE THIS

// --- Paths ---
const DUMMY_PDF_PATH = path.join(__dirname, 'static', 'dummy.pdf');

let adminAuthToken = '';
let createdProductId = '';
let createdVariantId = '';
let createdDigitalProductId = '';
let createdMediaId = '';
let customerOrderId = '';
let customerDigitalProductMediaId = '';

async function adminRequest(method, url, data) {
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (adminAuthToken) {
            headers['Authorization'] = `Bearer ${adminAuthToken}`;
        }
        const response = await axios({ method, url: `${BASE_URL}${url}`, headers, data });
        return response.data;
    } catch (error) {
        console.error(`Admin Request Error (${method} ${url}):`, error.response ? error.response.data : error.message);
        throw error;
    }
}

async function storeRequest(method, url, data, customerToken = '') {
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (customerToken) {
            headers['Authorization'] = `Bearer ${customerToken}`;
        }
        const response = await axios({ method, url: `${BASE_URL}${url}`, headers, data });
        return response.data;
    } catch (error) {
        console.error(`Store Request Error (${method} ${url}):`, error.response ? error.response.data : error.message);
        throw error;
    }
}

async function runTest() {
    console.log('Starting digital product module test scenario...');

    // --- 1. Admin Login ---
    console.log('\n--- 1. Admin Login ---');
    try {
        const loginRes = await adminRequest('POST', '/admin/auth', {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
        });
        adminAuthToken = loginRes.access_token;
        console.log('Admin logged in successfully. Token obtained.');
    } catch (error) {
        console.error('Failed to log in as admin. Exiting.');
        return;
    }

    // --- 2. Create a Product and Variant ---
    console.log('\n--- 2. Creating Product and Variant ---');
    try {
        const productRes = await adminRequest('POST', '/admin/products', {
            title: 'Automated Test Digital Product',
            description: 'Product for automated digital product testing',
            is_giftcard: false,
            discountable: true,
            options: [{ title: 'Size' }],
            variants: [
                {
                    title: 'Digital Test Variant',
                    prices: [{ amount: 1000, currency_code: 'usd' }],
                    options: { size: 'One Size' },
                },
            ],
        });
        createdProductId = productRes.product.id;
        createdVariantId = productRes.product.variants[0].id;
        console.log(`Product created: ${createdProductId}, Variant created: ${createdVariantId}`);
    } catch (error) {
        console.error('Failed to create product. Exiting.');
        return;
    }

    // --- 3. Create a Digital Product ---
    console.log('\n--- 3. Creating Digital Product ---');
    try {
        const digitalProductRes = await adminRequest('POST', '/admin/digital-products', {
            title: 'Automated Test Ebook',
            description: 'An ebook for automated testing',
            product_variant_id: createdVariantId,
        });
        createdDigitalProductId = digitalProductRes.digital_product.id;
        console.log(`Digital Product created: ${createdDigitalProductId}`);
    } catch (error) {
        console.error('Failed to create digital product. Exiting.');
        return;
    }

    // --- 4. Upload Media for the Digital Product ---
    console.log('\n--- 4. Uploading Media for Digital Product ---');
    try {
        const form = new FormData();
        form.append('digital_product_id', createdDigitalProductId);
        form.append('file', fs.createReadStream(DUMMY_PDF_PATH), 'dummy.pdf');

        const uploadRes = await axios.post(`${BASE_URL}/admin/digital-products/upload/file`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${adminAuthToken}`,
            },
        });
        createdMediaId = uploadRes.data.digital_product_media.id;
        console.log(`Media uploaded: ${createdMediaId}`);
    } catch (error) {
        console.error('Failed to upload media. Exiting.');
        return;
    }

    // --- 5. Create a Cart ---
    console.log('\n--- 5. Creating a Cart ---');
    let cartId = '';
    try {
        const cartRes = await storeRequest('POST', '/store/carts');
        cartId = cartRes.cart.id;
        console.log(`Cart created: ${cartId}`);
    } catch (error) {
        console.error('Failed to create cart. Exiting.');
        return;
    }

    // --- 6. Add Product Variant to Cart ---
    console.log('\n--- 6. Adding Product Variant to Cart ---');
    try {
        await storeRequest('POST', `/store/carts/${cartId}/line-items`, {
            variant_id: createdVariantId,
            quantity: 1,
        });
        console.log('Product variant added to cart.');
    } catch (error) {
        console.error('Failed to add product variant to cart. Exiting.');
        return;
    }

    // --- 7. Complete the Cart (Checkout) ---
    console.log('\n--- 7. Completing the Cart (Checkout) ---');
    try {
        const completeRes = await storeRequest('POST', `/store/carts/${cartId}/complete`);
        customerOrderId = completeRes.order.id;
        console.log(`Cart completed. Order ID: ${customerOrderId}`);
    } catch (error) {
        console.error('Failed to complete cart. Exiting.');
        return;
    }

    // --- 8. Retrieve Customer's Digital Products ---
    console.log('\n--- 8. Retrieving Customer\'s Digital Products ---');
    if (CUSTOMER_AUTH_TOKEN === 'YOUR_CUSTOMER_AUTH_TOKEN_HERE') {
        console.warn('WARNING: Please replace YOUR_CUSTOMER_AUTH_TOKEN_HERE with a valid customer token to test digital product retrieval and download.');
        console.log('Skipping customer digital product retrieval and download steps.');
        return;
    }
    try {
        const customerDigitalProductsRes = await storeRequest('GET', '/store/customers/me/digital-products', null, CUSTOMER_AUTH_TOKEN);
        const foundDigitalProduct = customerDigitalProductsRes.digital_products.find(dp => dp.id === createdDigitalProductId);

        if (foundDigitalProduct) {
            customerDigitalProductMediaId = foundDigitalProduct.media[0].id;
            console.log(`Customer found digital product with media ID: ${customerDigitalProductMediaId}`);
        } else {
            console.error('Digital product not found in customer\'s list. Exiting.');
            return;
        }
    } catch (error) {
        console.error('Failed to retrieve customer digital products. Exiting.');
        return;
    }

    // --- 9. Download the Digital Product Media ---
    console.log('\n--- 9. Downloading Digital Product Media ---');
    try {
        const downloadRes = await axios.get(`${BASE_URL}/store/customers/me/digital-products/${customerDigitalProductMediaId}/download`, {
            headers: {
                'Authorization': `Bearer ${CUSTOMER_AUTH_TOKEN}`,
            },
            responseType: 'arraybuffer', // To handle binary data
        });

        const downloadedFilePath = path.join(__dirname, 'downloaded_dummy.pdf');
        fs.writeFileSync(downloadedFilePath, downloadRes.data);
        console.log(`Digital product media downloaded to: ${downloadedFilePath}`);
        console.log('Test scenario completed successfully!');
    } catch (error) {
        console.error('Failed to download digital product media. Exiting.');
        return;
    }
}

runTest();
