// js/cart.js
let cart = [];

// Cargar carrito desde localStorage
function loadCart() {
    const stored = localStorage.getItem('xboxCart');
    if (stored) {
        cart = JSON.parse(stored);
    }
    updateCartUI();
}

// Guardar carrito en localStorage
function saveCart() {
    localStorage.setItem('xboxCart', JSON.stringify(cart));
}

// Actualizar badge y contenido del menú lateral
function updateCartUI() {
    // Badge del carrito (icono superior derecho)
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    }

    // Contenedor de items del menú lateral
    const itemsContainer = document.getElementById('cart-items');
    const totalSpan = document.getElementById('cart-total');
    if (!itemsContainer) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        if (totalSpan) totalSpan.textContent = '$0.00';
        return;
    }

    let html = '';
    let total = 0;
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        html += `
            <div class="cart-item">
                <div class="cart-item__info">
                    <h4>${escapeHtml(item.name)}</h4>
                    <p>$${item.price.toFixed(2)} USD x ${item.quantity}</p>
                </div>
                <div class="cart-item__actions">
                    <button class="cart-item__remove" data-id="${item.id}">🗑️</button>
                </div>
            </div>
        `;
    });
    itemsContainer.innerHTML = html;
    if (totalSpan) totalSpan.textContent = `$${total.toFixed(2)}`;

    // Asignar eventos a los botones de eliminar
    document.querySelectorAll('.cart-item__remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            removeFromCart(id);
        });
    });
}

// Escapar HTML para evitar inyección (simple)
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Añadir producto al carrito
function addToCart(productId, productName, productPrice, quantity = 1) {
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            quantity: quantity
        });
    }
    saveCart();
    updateCartUI();
    openCartDrawer(); // Abre el menú automáticamente
}

// Eliminar producto por ID
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Vaciar carrito
function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

// Abrir menú lateral
function openCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('active');
}

// Cerrar menú lateral
function closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

// Inicializar eventos
function initCart() {
    loadCart();

    // Botones "Agregar al carrito"
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.product-card');
            if (!card) return;

            const id = card.getAttribute('data-id');
            const name = card.querySelector('.product-card__title')?.innerText.trim() || 'Producto';
            const priceText = card.querySelector('.product-card__price')?.innerText || '0';
            const price = parseFloat(priceText.replace('$', '').replace(' USD', ''));

            if (id && name && !isNaN(price)) {
                addToCart(id, name, price);
            } else {
                console.warn('Faltan datos del producto', {id, name, price});
            }
        });
    });

    // Botón de abrir menú (hamburguesa izquierda)
    const trigger = document.getElementById('cart-drawer-trigger');
    if (trigger) trigger.addEventListener('click', openCartDrawer);

    // Botón cerrar (X)
    const closeBtn = document.getElementById('close-drawer');
    if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);

    // Cerrar al hacer clic en overlay
    const overlay = document.getElementById('cart-drawer-overlay');
    if (overlay) overlay.addEventListener('click', closeCartDrawer);

    // Botón vaciar carrito
    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) clearBtn.addEventListener('click', clearCart);
}

document.addEventListener('DOMContentLoaded', initCart);