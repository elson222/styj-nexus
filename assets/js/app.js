/**
 * STY. J NEXUS — App Logic
 * Cart management, animations, toasts, UI interactions
 */

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
        image:    product.image,
        imageFallback: product.imageFallback,
        qty,
      });
    }
    save(items);
    showToast(`✅ ${product.name} added to cart`);
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
function showToast(msg, duration = 2800) {
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
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

/* ── Navbar Scroll Effect ────────────────────────────────── */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  const toggle  = document.querySelector('.menu-toggle');
  const drawer  = document.querySelector('.mobile-drawer');

  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      drawer.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // Close when a link is tapped
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Highlight active nav link
  const path = window.location.pathname;
  document.querySelectorAll('.navbar__nav a, .mobile-drawer a').forEach(a => {
    if (a.getAttribute('href') && path.endsWith(a.getAttribute('href').split('/').pop())) {
      a.classList.add('active');
    }
  });
}

/* ── Scroll Reveal Animations ────────────────────────────── */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ── Product Card Builder ─────────────────────────────────── */
function buildProductCard(product, size = 'normal') {
  const minPrice = getMinPrice(product);
  const defaultVariant = product.storage[0];

  const card = document.createElement('div');
  card.className = `product-card reveal`;
  card.dataset.productId = product.id;

  card.innerHTML = `
    <div class="product-card__image-wrap">
      ${product.badge ? `<span class="product-card__badge badge ${product.badgeType || 'badge-blue'}">${product.badge}</span>` : ''}
      <img
        class="product-card__image"
        src="${product.image}"
        alt="${product.name}"
        loading="lazy"
        onerror="this.src='${product.imageFallback}'"
      />
    </div>
    <div class="product-card__body">
      <h3 class="product-card__name">${product.name}</h3>
      <p class="product-card__desc">${product.desc}</p>
      ${product.storage.length > 1 ? `
        <select class="form-input variant-select" style="padding:0.5rem 0.75rem;font-size:0.8rem;" data-product-id="${product.id}">
          ${product.storage.map(s => `<option value="${s}">${s} — ${formatPrice(product.price[s])}</option>`).join('')}
        </select>
      ` : ''}
      <div class="product-card__price">
        <span class="from">${product.storage.length > 1 ? 'from' : 'Price'}</span>
        <span class="amount">${formatPrice(minPrice)}</span>
      </div>
      <div class="product-card__actions">
        <button class="btn btn-primary btn-sm add-to-cart" data-product-id="${product.id}">
          🛒 Add to Cart
        </button>
        <a href="${buildWhatsAppLink(`Hi! I'm interested in the ${product.name}. Is it available?`)}"
           target="_blank" rel="noopener"
           class="btn btn-wa btn-sm">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.528 5.847L.057 23.492a.5.5 0 0 0 .613.63l5.74-1.498A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.98 0-3.838-.582-5.4-1.584l-.386-.243-3.995 1.043 1.072-3.907-.265-.408A9.96 9.96 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
          WhatsApp
        </a>
      </div>
    </div>
  `;

  // Add to cart handler
  card.querySelector('.add-to-cart').addEventListener('click', () => {
    const sel = card.querySelector('.variant-select');
    const variant = sel ? sel.value : product.storage[0];
    Cart.addItem(product, variant);
    // Animate button
    const btn = card.querySelector('.add-to-cart');
    btn.textContent = '✓ Added!';
    btn.style.background = 'var(--clr-green)';
    setTimeout(() => {
      btn.innerHTML = '🛒 Add to Cart';
      btn.style.background = '';
    }, 1500);
  });

  return card;
}

/* ── Render Product Carousel ──────────────────────────────── */
function renderCarousel(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;
  products.forEach((p, i) => {
    const item = document.createElement('div');
    item.className = 'carousel-item';
    const card = buildProductCard(p);
    card.style.transitionDelay = `${i * 0.08}s`;
    item.appendChild(card);
    container.appendChild(item);
  });
  setTimeout(initReveal, 100);
}

/* ── Render Products Grid ─────────────────────────────────── */
function renderProductsGrid(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  products.forEach((p, i) => {
    const card = buildProductCard(p);
    card.classList.add(`reveal-delay-${Math.min(i % 4 + 1, 4)}`);
    container.appendChild(card);
  });
  setTimeout(initReveal, 100);
}

/* ── Floating WhatsApp Button ────────────────────────────── */
function initFab() {
  const fab = document.querySelector('.fab-wa');
  if (!fab) return;
  fab.href = buildWhatsAppLink(`Hi STY. J Tech Hub! 👋 I'd like to enquire about your products.`);
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
          if (filter === 'value') return p.badge === 'Value';
          if (filter === 'new') return p.badge === 'New';
          return true;
        });
      }
      renderProductsGrid(gridId, products);
    });
  });
}

/* ── Cart Page Renderer ───────────────────────────────────── */
function renderCartPage() {
  const container = document.getElementById('cart-items');
  const emptyState = document.getElementById('cart-empty');
  const cartFull   = document.getElementById('cart-full');
  const totalEl    = document.getElementById('cart-total');
  const countEl    = document.getElementById('cart-count');
  const checkoutBtn = document.getElementById('checkout-btn');
  const waOrderBtn  = document.getElementById('wa-order-btn');

  if (!container) return;

  function redraw() {
    const items = Cart.getItems();
    if (items.length === 0) {
      emptyState && (emptyState.style.display = 'block');
      cartFull   && (cartFull.style.display = 'none');
      return;
    }
    emptyState && (emptyState.style.display = 'none');
    cartFull   && (cartFull.style.display = 'block');

    container.innerHTML = items.map(item => `
      <div class="cart-item">
        <img class="cart-item__image"
             src="${item.image}"
             alt="${item.name}"
             onerror="this.src='${item.imageFallback}'"
             loading="lazy">
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__variant">${item.variant}</div>
          <div class="cart-item__price">${formatPrice(item.price * item.qty)}</div>
        </div>
        <div class="cart-item__qty">
          <button class="qty-btn" data-id="${item.id}" data-variant="${item.variant}" data-action="dec">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-variant="${item.variant}" data-action="inc">+</button>
        </div>
        <button class="btn btn-sm" style="color:var(--clr-red);background:rgba(255,69,58,0.1);border:1px solid rgba(255,69,58,0.2);padding:0.4rem 0.75rem;"
                data-id="${item.id}" data-variant="${item.variant}" data-action="remove">✕</button>
      </div>
    `).join('');

    const total = Cart.getTotal();
    if (totalEl) totalEl.textContent = formatPrice(total);
    if (countEl) countEl.textContent = Cart.getCount();

    // WhatsApp order button
    if (waOrderBtn) {
      waOrderBtn.href = buildOrderWhatsAppLink(items);
    }
    if (checkoutBtn) {
      checkoutBtn.href = 'checkout.html';
    }

    // Qty/remove event delegation
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
    }, { once: true }); // re-add on redraw
  }

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

  // Populate hidden fields
  if (itemsField) {
    itemsField.value = items.map(i => `${i.name} (${i.variant}) x${i.qty} @ ${formatPrice(i.price)}`).join('\n');
  }
  if (totalField) {
    totalField.value = formatPrice(Cart.getTotal());
  }

  // Render order summary
  if (summaryEl) {
    summaryEl.innerHTML = items.map(i => `
      <div style="display:flex;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:0.875rem;">
        <div>
          <div style="font-weight:600;color:#f5f5f7;">${i.name}</div>
          <div style="color:#86868b;font-size:0.8rem;">${i.variant} × ${i.qty}</div>
        </div>
        <div style="font-weight:700;color:#0a84ff;">${formatPrice(i.price * i.qty)}</div>
      </div>
    `).join('') + `
      <div style="display:flex;justify-content:space-between;padding:1rem 0 0;font-size:1rem;font-weight:800;color:#f5f5f7;">
        <span>Total</span>
        <span style="color:#0a84ff;">${formatPrice(Cart.getTotal())}</span>
      </div>
    `;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Placing order…';

    const data = Object.fromEntries(new FormData(form));
    const orderObj = {
      ...data,
      items: Cart.getItems(),
      total: Cart.getTotal(),
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    // 1) Submit to Formspree (email)
    let emailOk = false;
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(orderObj),
      });
      emailOk = res.ok;
    } catch {}

    // 2) Save to Firebase Firestore
    try {
      await saveOrderToFirestore(orderObj);
    } catch (err) {
      console.warn('Firestore save failed:', err);
    }

    // 3) Show confirmation + open WhatsApp
    const waLink = buildOrderWhatsAppLink(Cart.getItems());
    Cart.clear();

    // Redirect to success page with WhatsApp link
    sessionStorage.setItem('order_success', JSON.stringify({
      name: data.name,
      waLink,
    }));
    window.location.href = '../order-success.html';
  });
}

/* ── Firebase Firestore Integration ─────────────────────── */
// Firebase config — filled in from your Firebase project settings
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

// Firestore helpers (loaded via CDN in HTML)
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
  sessionStorage.removeItem('order_success');

  const nameEl = document.getElementById('success-name');
  const waBtn  = document.getElementById('success-wa-btn');

  if (nameEl) nameEl.textContent = data.name;

  if (waBtn) {
    waBtn.href = data.waLink;
    // Auto-open WhatsApp after 1.5s
    setTimeout(() => window.open(data.waLink, '_blank'), 1500);
  }
}

/* ── DOM Ready ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initReveal();
  initFab();
  updateCartBadge();

  // Page-specific init
  if (document.getElementById('home-iphones-carousel')) {
    renderCarousel('home-iphones-carousel', PRODUCTS.iphones.slice(0, 6));
    renderCarousel('home-laptops-carousel', PRODUCTS.laptops.slice(0, 4));
    // Accessories strip
    const accStrip = document.getElementById('acc-strip');
    if (accStrip) {
      PRODUCTS.accessories.forEach(p => {
        const item = document.createElement('div');
        item.className = 'acc-item';
        item.innerHTML = `
          <div class="acc-item__img-wrap">
            <img class="acc-item__img" src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='${p.imageFallback}'">
          </div>
          <div class="acc-item__name">${p.name}</div>
          <div class="acc-item__price">from ${formatPrice(getMinPrice(p))}</div>
        `;
        item.addEventListener('click', () => window.location.href = `products/accessories.html`);
        accStrip.appendChild(item);
      });
    }
  }

  if (document.getElementById('products-grid')) {
    const category = document.body.dataset.category;
    if (category) {
      renderProductsGrid('products-grid', getProductsByCategory(category));
      initFilterChips('products-grid', category);
    }
  }

  if (document.getElementById('cart-items')) renderCartPage();
  if (document.getElementById('order-form'))  initCheckoutPage();
  if (document.getElementById('success-name')) initSuccessPage();
});
