// script.js

const apiURL = 'https://dummyjson.com/products';
let products = [];
let categories = [];
let currentCategory = 'all';
let itemsPerPage = 10;
let currentPage = 1;
let totalPages = 1;

// Keranjang Belanja
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const categorySelect = document.getElementById('category-select');
const itemsPerPageSelect = document.getElementById('items-per-page');
const productsContainer = document.getElementById('products');
const cartCount = document.getElementById('cart-count');
const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeButton = document.querySelector('.close-button');
const cartItemsContainer = document.getElementById('cart-items');
const totalProductsElem = document.getElementById('total-products');
const totalPriceElem = document.getElementById('total-price');
const checkoutButton = document.getElementById('checkout-button');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');

// Fetch Data dari API
async function fetchData() {
    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            throw new Error('Gagal mengambil data dari API.');
        }
        const data = await response.json();
        products = data.products;
        categories = data.products.map(p => p.category);
        categories = Array.from(new Set(categories));
        populateCategories();
        renderProducts();
    } catch (error) {
        productsContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

// Populate Kategori ke Select Option
function populateCategories() {
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = capitalizeFirstLetter(category);
        categorySelect.appendChild(option);
    });
}

// Capitalize First Letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Render Produk
function renderProducts() {
    productsContainer.innerHTML = '';
    let filteredProducts = currentCategory === 'all' ? products : products.filter(p => p.category === currentCategory);
    totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(start, end);

    paginatedProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        const img = document.createElement('img');
        img.src = product.thumbnail;
        img.alt = product.title;

        const details = document.createElement('div');
        details.className = 'product-details';

        const title = document.createElement('h3');
        title.textContent = product.title;

        const price = document.createElement('p');
        price.textContent = `Rp${product.price.toLocaleString()}`;

        const addButton = document.createElement('button');
        addButton.textContent = 'Tambah ke Keranjang';
        addButton.addEventListener('click', () => addToCart(product));

        details.appendChild(title);
        details.appendChild(price);
        details.appendChild(addButton);

        productCard.appendChild(img);
        productCard.appendChild(details);

        productsContainer.appendChild(productCard);
    });

    currentPageSpan.textContent = currentPage;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

// Tambah ke Keranjang
function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            quantity: 1
        });
    }
    updateCart();
}

// Update Keranjang
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    cartCount.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
}

// Tampilkan Keranjang
function showCart() {
    renderCartItems();
    cartModal.style.display = 'block';
}

// Sembunyikan Keranjang
function hideCart() {
    cartModal.style.display = 'none';
}

// Render Item Keranjang
function renderCartItems() {
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Keranjang kosong.</p>';
        totalProductsElem.textContent = '0';
        totalPriceElem.textContent = '0';
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        const itemInfo = document.createElement('div');
        itemInfo.innerHTML = `<p>${item.title}</p><p>Rp${item.price.toLocaleString()}</p>`;

        const quantityControls = document.createElement('div');
        quantityControls.className = 'quantity-controls';

        const decreaseBtn = document.createElement('button');
        decreaseBtn.textContent = '-';
        decreaseBtn.addEventListener('click', () => decreaseQuantity(item.id));

        const quantity = document.createElement('span');
        quantity.textContent = item.quantity;

        const increaseBtn = document.createElement('button');
        increaseBtn.textContent = '+';
        increaseBtn.addEventListener('click', () => increaseQuantity(item.id));

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Hapus';
        removeBtn.style.backgroundColor = '#dc3545';
        removeBtn.addEventListener('click', () => removeFromCart(item.id));

        quantityControls.appendChild(decreaseBtn);
        quantityControls.appendChild(quantity);
        quantityControls.appendChild(increaseBtn);
        quantityControls.appendChild(removeBtn);

        cartItem.appendChild(itemInfo);
        cartItem.appendChild(quantityControls);

        cartItemsContainer.appendChild(cartItem);
    });

    totalProductsElem.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
    totalPriceElem.textContent = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString();
}

// Kurangi Jumlah Item
function decreaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity -= 1;
        if (item.quantity === 0) {
            removeFromCart(id);
        }
        updateCart();
        renderCartItems();
    }
}

// Tambah Jumlah Item
function increaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += 1;
        updateCart();
        renderCartItems();
    }
}

// Hapus Item dari Keranjang
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
    renderCartItems();
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Keranjang kosong!');
        return;
    }
    alert('Checkout berhasil!');
    cart = [];
    updateCart();
    renderCartItems();
    hideCart();
}

// Event Listeners
categorySelect.addEventListener('change', () => {
    currentCategory = categorySelect.value;
    currentPage = 1;
    renderProducts();
});

itemsPerPageSelect.addEventListener('change', () => {
    itemsPerPage = parseInt(itemsPerPageSelect.value);
    currentPage = 1;
    renderProducts();
});

cartIcon.addEventListener('click', showCart);
closeButton.addEventListener('click', hideCart);
window.addEventListener('click', (event) => {
    if (event.target === cartModal) {
        hideCart();
    }
});

checkoutButton.addEventListener('click', checkout);

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderProducts();
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        renderProducts();
    }
});

// Inisialisasi
function init() {
    fetchData();
    updateCart();
}

// Jalankan Inisialisasi
init();