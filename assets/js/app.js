/**
 * STY. J NEXUS — App Logic
 * Apple Clean White | Mobile-First | styj.nexus
 */

/* ── Asset URL Helper ─────────────────────────────────────── */
function resolveAsset(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const isSub = window.location.pathname.includes('/products/');
  return (isSub ? '../' : '') + path;
}

/* ── Cart State ───────────────────────────────────────────── */
const Cart = (() => {
  const KEY = 'styj_cart';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    updateCartBadge();
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
  }

  function getItems() { return load(); }

  function getCount() {
    return load().reduce((s, i) => s + i.qty, 0);
  }

  function getTotal() {
    return load().reduce((s, i) => s + i.price * i.qty, 0);
  }

  function addItem(product, variant, qty = 1) {
    const items = load();
    const price = product.price[variant] || getMinPrice(product);
    const existIdx = items.findIndex(i => i.id === product.id && i.variant === variant);
    if (existIdx >= 0) {
      items[existIdx].qty += qty;
    } else {
      items.push({
        id:       product.id,
        name:     product.name,
        variant,
        price,
        image:    resolveAsset(product.image),
        imageFallback: resolveAsset(product.imageFallback),
        qty,
      });
    }
    save(items);
    showToast(`${product.name} added to cart`);
  }

  function removeItem(id, variant) {
    save(load().filter(i => !(i.id === id && i.variant === variant)));
  }

  function updateQty(id, variant, qty) {
    if (qty < 1) { removeItem(id, variant); return; }
    const items = load();
    const idx = items.findIndex(i => i.id === id && i.variant === variant);
    if (idx >= 0) { items[idx].qty = qty; save(items); }
  }

  function clear() { save([]); }

  return { getItems, getCount, getTotal, addItem, removeItem, updateQty, clear };
})();

/* ── Update Cart Badge ────────────────────────────────────── */
function updateCartBadge() {
  const count = Cart.getCount();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
    el.classList.toggle('visible', count > 0);
  });
}

/* ── Toast Notifications ─────────────────────────────────── */
function showToast(msg, duration = 2400) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ── Navbar Scroll Effect ────────────────────────────────── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const toggle  = document.querySelector('.menu-toggle');
  const drawer  = document.querySelector('.mobile-drawer');

  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      drawer.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  const path = window.location.pathname;
  document.querySelectorAll('.navbar__nav a, .mobile-drawer a').forEach(a => {
    if (a.getAttribute('href') && path.endsWith(a.getAttribute('href').split('/').pop())) {
      a.classList.add('active');
    }
  });
}

/* ── Product Card Builder (Clean White, No On-Card Specs) ── */
function buildProductCard(product) {
  const minPrice = getMinPrice(product);
  const defaultVariant = product.storage ? product.storage[0] : '';
  const hasMultiple = product.storage && product.storage.length > 1;

  const card = document.createElement('div');
  card.className = `product-card`;
  card.dataset.productId = product.id;

  const resolvedImg = resolveAsset(product.image);
  const resolvedFallback = resolveAsset(product.imageFallback);

  const inCartItem = Cart.getItems().find(i => i.id === product.id);
  const inCartClass = inCartItem ? ' in-cart' : '';
  const inCartContent = inCartItem
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:5px;vertical-align:-2px;"><polyline points="20 6 9 17 4 12"></polyline></svg>In Cart (${inCartItem.qty})`
    : 'Add to Cart';

  card.innerHTML = `
    <div class="product-card__image-wrap" onclick="openProductModal('${product.id}')">
      ${product.badge ? `<span class="product-card__badge ${product.badgeType || 'badge-blue'}">${product.badge}</span>` : ''}
      <img
        class="product-card__image"
        src="${resolvedImg}"
        alt="${product.name}"
        loading="lazy"
        decoding="async"
        width="220"
        height="220"
        onerror="this.src='${resolvedFallback}'"
      />
    </div>
    <div class="product-card__body">
      <h3 class="product-card__name" onclick="openProductModal('${product.id}')">${product.name}</h3>
      <div class="product-card__price">
        <span class="from">${hasMultiple ? 'from' : 'Price'}</span>
        <span class="amount">${formatPrice(minPrice)}</span>
      </div>
      <div class="product-card__actions">
        <button class="add-to-cart${inCartClass}" data-product-id="${product.id}">
          ${inCartContent}
        </button>
      </div>
    </div>
  `;

  // Add to cart click
  card.querySelector('.add-to-cart').addEventListener('click', (e) => {
    e.stopPropagation();
    Cart.addItem(product, defaultVariant);
  });

  return card;
}

/* ── Product Specs & Details Modal ───────────────────────── */
function openProductModal(productId) {
  let product = null;
  for (const cat in PRODUCTS) {
    const found = PRODUCTS[cat].find(p => p.id === productId);
    if (found) { product = found; break; }
  }
  if (!product) return;

  let modalOverlay = document.getElementById('product-modal-overlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'product-modal-overlay';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  const resolvedImg = resolveAsset(product.image);
  let selectedVariant = product.storage ? product.storage[0] : '';
  let currentPrice = product.price[selectedVariant] || getMinPrice(product);

  // Parse specs from description string
  const specParts = (product.desc || '').split('·').map(s => s.trim()).filter(Boolean);
  const specsHtml = specParts.length > 0
    ? `<table class="specs-table">
        ${specParts.map((part, i) => {
          let label = 'Feature';
          if (part.toLowerCase().includes('bionic') || part.toLowerCase().includes('chip') || part.toLowerCase().includes('intel') || part.toLowerCase().includes('amd') || part.toLowerCase().includes('ryzen') || part.toLowerCase().includes('m1') || part.toLowerCase().includes('m2') || part.toLowerCase().includes('m3') || part.toLowerCase().includes('m4')) label = 'Processor';
          else if (part.includes('″') || part.toLowerCase().includes('display') || part.toLowerCase().includes('retina') || part.toLowerCase().includes('oled')) label = 'Display';
          else if (part.toLowerCase().includes('camera') || part.toLowerCase().includes('mp')) label = 'Camera';
          else if (part.toLowerCase().includes('battery')) label = 'Battery';
          else if (part.toLowerCase().includes('ram')) label = 'Memory';
          return `<tr><td class="spec-label">${label}</td><td class="spec-value">${part}</td></tr>`;
        }).join('')}
        <tr><td class="spec-label">Condition</td><td class="spec-value">100% Authentic &amp; Factory Certified</td></tr>
        <tr><td class="spec-label">Warranty</td><td class="spec-value">Official Store Guarantee &amp; Testing</td></tr>
      </table>`
    : '';

  // Storage pills
  const variantsHtml = product.storage && product.storage.length > 1
    ? `<div class="modal-variants-label">Select Storage / Model:</div>
       <div class="modal-variants">
         ${product.storage.map((s, idx) => `
           <button class="variant-pill ${idx === 0 ? 'active' : ''}" data-variant="${s}">
             ${s}
           </button>
         `).join('')}
       </div>`
    : '';

  modalOverlay.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-sheet__header">
        <span class="modal-sheet__badge">${product.badge || 'Official Gear'}</span>
        <button class="modal-sheet__close" onclick="closeProductModal()">&times;</button>
      </div>

      <div class="modal-sheet__image-wrap">
        <img class="modal-sheet__image" src="${resolvedImg}" alt="${product.name}" />
      </div>

      <h2 class="modal-sheet__title">${product.name}</h2>

      ${specsHtml}
      ${variantsHtml}

      <div class="modal-footer-price">
        <span class="label">Price in Ghana:</span>
        <span class="price" id="modal-price">${formatPrice(currentPrice)}</span>
      </div>

      <button class="btn btn-primary btn-lg" id="modal-add-btn" style="width:100%;margin-bottom:0.75rem;">
        Add to Cart
      </button>

      <div style="text-align:center;">
        <a href="${buildWhatsAppLink(`Hi STY. J! I am asking about the ${product.name} (${selectedVariant}).`)}"
           target="_blank" rel="noopener"
           style="font-size:0.8rem;color:var(--clr-text-2);text-decoration:underline;">
          Have questions? Chat directly on WhatsApp
        </a>
      </div>
    </div>
  `;

  const updateModalBtnState = () => {
    const modalBtn = document.getElementById('modal-add-btn');
    if (!modalBtn) return;
    const items = Cart.getItems();
    const exist = items.find(i => i.id === product.id && i.variant === selectedVariant);
    if (exist) {
      modalBtn.classList.add('in-cart');
      modalBtn.style.background = 'var(--clr-green)';
      modalBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;vertical-align:-2px;"><polyline points="20 6 9 17 4 12"></polyline></svg>In Cart (${exist.qty}) · Add Another`;
    } else {
      modalBtn.classList.remove('in-cart');
      modalBtn.style.background = '';
      modalBtn.textContent = 'Add to Cart';
    }
  };

  updateModalBtnState();

  // Bind variant pills
  modalOverlay.querySelectorAll('.variant-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      modalOverlay.querySelectorAll('.variant-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedVariant = pill.dataset.variant;
      currentPrice = product.price[selectedVariant];
      document.getElementById('modal-price').textContent = formatPrice(currentPrice);
      updateModalBtnState();
    });
  });

  // Bind add button
  document.getElementById('modal-add-btn').addEventListener('click', () => {
    Cart.addItem(product, selectedVariant);
    updateModalBtnState();
  });

  // Close on outside tap
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeProductModal();
  });

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  const modalOverlay = document.getElementById('product-modal-overlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ── Render Products Grid ─────────────────────────────────── */
function renderProductsGrid(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  products.forEach(p => {
    container.appendChild(buildProductCard(p));
  });
  updateCartButtons();
}

function renderCarousel(containerId, products) {
  renderProductsGrid(containerId, products);
}

/* ── Filter Chips ─────────────────────────────────────────── */
function initFilterChips(gridId, category) {
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      let products = getProductsByCategory(category);
      if (filter !== 'all') {
        products = products.filter(p => {
          if (filter === 'featured') return p.featured;
          if (filter === 'flagship') return p.badge === 'Flagship' || p.badge === 'Latest Flagship' || p.badge === 'Powerhouse';
          if (filter === 'value') return p.badge === 'Value' || p.badge === 'Best Value' || p.badge === 'Best Starter' || p.badge === 'Classic';
          if (filter === 'new') return p.badge === 'New' || p.badge === 'Latest' || p.badge === 'Ultra-Slim';
          return true;
        });
      }
      renderProductsGrid(gridId, products);
    });
  });
}

/* ── Floating WhatsApp Button ────────────────────────────── */
function initFab() {
  const fab = document.querySelector('.fab-wa');
  if (!fab) return;
  fab.href = buildWhatsAppLink(`Hi STY. J Tech Hub! I'm visiting your website and have a question.`);
}

/* ── Cart Page Renderer (Clean White, No Duplicate WA Button) */
function renderCartPage() {
  const container = document.getElementById('cart-items');
  const emptyState = document.getElementById('cart-empty');
  const cartFull   = document.getElementById('cart-full');
  const totalEl    = document.getElementById('cart-total');
  const countEl    = document.getElementById('cart-count');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (!container) return;

  function redraw() {
    const items = Cart.getItems();
    if (items.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      if (cartFull) cartFull.style.display = 'none';
      return;
    }
    if (emptyState) emptyState.style.display = 'none';
    if (cartFull) cartFull.style.display = 'block';

    container.innerHTML = items.map(item => `
      <div class="cart-item">
        <img class="cart-item__img"
             src="${item.image}"
             alt="${item.name}"
             onerror="this.src='${item.imageFallback}'"
             loading="lazy">
        <div class="cart-item__details">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__variant">${item.variant}</div>
          <div class="cart-item__price">${formatPrice(item.price * item.qty)}</div>
        </div>
        <div class="qty-control">
          <button class="qty-btn" data-id="${item.id}" data-variant="${item.variant}" data-action="dec">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-variant="${item.variant}" data-action="inc">+</button>
        </div>
        <button class="cart-item__remove"
                data-id="${item.id}" data-variant="${item.variant}" data-action="remove"
                aria-label="Remove item">&times;</button>
      </div>
    `).join('');

    const total = Cart.getTotal();
    if (totalEl) totalEl.textContent = formatPrice(total);
    if (countEl) countEl.textContent = Cart.getCount();
    if (checkoutBtn) checkoutBtn.href = 'checkout.html';
  }

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { id, variant, action } = btn.dataset;
    const item = Cart.getItems().find(i => i.id === id && i.variant === variant);
    if (!item) return;
    if (action === 'inc') Cart.updateQty(id, variant, item.qty + 1);
    if (action === 'dec') Cart.updateQty(id, variant, item.qty - 1);
    if (action === 'remove') { Cart.removeItem(id, variant); showToast('Item removed'); }
    redraw();
  });

  redraw();
  window.addEventListener('cart:updated', redraw);
}

/* ── Checkout Page ────────────────────────────────────────── */
function initCheckoutPage() {
  const form       = document.getElementById('order-form');
  const itemsField = document.getElementById('order-items');
  const totalField = document.getElementById('order-total');
  const summaryEl  = document.getElementById('checkout-summary');

  if (!form) return;

  const items = Cart.getItems();
  if (items.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  if (itemsField) {
    itemsField.value = items.map(i => `${i.name} (${i.variant}) x${i.qty} @ ${formatPrice(i.price)}`).join('\n');
  }
  if (totalField) {
    totalField.value = formatPrice(Cart.getTotal());
  }

  if (summaryEl) {
    summaryEl.innerHTML = items.map(i => `
      <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #e5e5ea;font-size:0.875rem;">
        <div>
          <div style="font-weight:700;color:#1d1d1f;">${i.name}</div>
          <div style="color:#6e6e73;font-size:0.78rem;">${i.variant} &times; ${i.qty}</div>
        </div>
        <div style="font-weight:700;color:#0071e3;">${formatPrice(i.price * i.qty)}</div>
      </div>
    `).join('') + `
      <div style="display:flex;justify-content:space-between;padding:0.75rem 0 0;font-size:1.1rem;font-weight:800;color:#1d1d1f;">
        <span>Total</span>
        <span style="color:#0071e3;">${formatPrice(Cart.getTotal())}</span>
      </div>
    `;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing Order…';

    const data = Object.fromEntries(new FormData(form));
    const orderObj = {
      ...data,
      items: Cart.getItems(),
      total: Cart.getTotal(),
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    // 1. Submit to Formspree
    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(orderObj),
      });
    } catch {}

    // 2. Save to Firestore
    try {
      await saveOrderToFirestore(orderObj);
    } catch (err) {
      console.warn('Firestore save:', err);
    }

    // 3. Open WhatsApp link with preloaded order details
    const waLink = buildOrderWhatsAppLink(Cart.getItems());
    Cart.clear();

    sessionStorage.setItem('order_success', JSON.stringify({
      name: data.name,
      waLink,
    }));
    window.location.href = 'order-success.html';
  });
}

/* ── Firebase Firestore Helper ───────────────────────────── */
async function saveOrderToFirestore(orderData) {
  if (typeof firebase === 'undefined') return;
  const db = firebase.firestore();
  await db.collection('orders').add({
    ...orderData,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

/* ── Order Success Page ───────────────────────────────────── */
function initSuccessPage() {
  const data = JSON.parse(sessionStorage.getItem('order_success') || 'null');
  if (!data) return;

  const nameEl = document.getElementById('success-name');
  const waBtn  = document.getElementById('success-wa-btn');

  if (nameEl && data.name) nameEl.textContent = data.name;
  if (waBtn  && data.waLink) {
    waBtn.href = data.waLink;
    // Auto-open WhatsApp after small delay
    setTimeout(() => {
      window.open(data.waLink, '_blank');
    }, 1200);
  }
}

/* ── Sync In-Cart Button States ────────────────────────────── */
function updateCartButtons() {
  const items = Cart.getItems();
  document.querySelectorAll('.add-to-cart[data-product-id]').forEach(btn => {
    const pid = btn.dataset.productId;
    const cartItem = items.find(i => i.id === pid);
    if (cartItem) {
      btn.classList.add('in-cart');
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:5px;vertical-align:-2px;"><polyline points="20 6 9 17 4 12"></polyline></svg>In Cart (${cartItem.qty})`;
    } else {
      btn.classList.remove('in-cart');
      btn.textContent = 'Add to Cart';
    }
  });
}
window.addEventListener('cart:updated', updateCartButtons);

/* ── DOM Ready Initializer ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  updateCartBadge();
  updateCartButtons();
  initFab();

  // Page routers
  const path = window.location.pathname;
  if (path.endsWith('cart.html')) {
    renderCartPage();
  } else if (path.endsWith('checkout.html')) {
    initCheckoutPage();
  } else if (path.endsWith('order-success.html')) {
    initSuccessPage();
  }
});
