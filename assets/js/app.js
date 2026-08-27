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

/* ── Product Card Builder (Evanex-Inspired Split Card) ── */
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
    ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;vertical-align:-2px;"><polyline points="20 6 9 17 4 12"></polyline></svg>In Cart (${inCartItem.qty})`
    : '+ Add';

  const categoryTag = product.category === 'iphones'
    ? (defaultVariant ? defaultVariant + ' · VERIFIED' : 'APPLE IPHONE')
    : (product.category === 'laptops'
      ? (product.storage ? product.storage[0] + ' · PRO LAPTOP' : 'LAPTOP')
      : (product.category === 'watches' ? 'GPS + CELLULAR' : 'GENUINE APPLE'));

  card.innerHTML = `
    <div class="product-card__image-wrap" role="button" tabindex="0" aria-label="View ${product.name} specifications">
      ${product.badge ? `<span class="product-card__badge ${product.badgeType || 'badge-blue'}">${product.badge}</span>` : ''}
      <button class="product-card__info-btn" aria-label="View specifications" title="View specifications">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </button>
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
      <div class="product-card__tag">${categoryTag}</div>
      <h3 class="product-card__name" role="button" tabindex="0">${product.name}</h3>
      <p class="product-card__desc">${product.desc || 'Tested & certified authentic device with 6-month warranty.'}</p>
      <div class="product-card__condition">
        <span class="condition-dot"></span> Condition: ${product.condition || 'Brand New (Sealed)'}
      </div>
      <div class="product-card__footer">
        <div class="product-card__price">
          <span class="from">${hasMultiple ? 'From' : ''}</span>
          <span class="amount">${formatPrice(minPrice)}</span>
        </div>
        <div class="product-card__actions">
          <button class="add-to-cart${inCartClass}" data-product-id="${product.id}" aria-label="Add ${product.name} to bag">
            ${inCartContent}
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach modal trigger listeners cleanly
  const openModal = () => openProductModal(product.id);
  const imgWrap = card.querySelector('.product-card__image-wrap');
  const nameEl = card.querySelector('.product-card__name');
  const infoBtn = card.querySelector('.product-card__info-btn');
  imgWrap.addEventListener('click', openModal);
  imgWrap.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); } });
  nameEl.addEventListener('click', openModal);
  nameEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); } });
  if (infoBtn) {
    infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal();
    });
  }

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
        <tr><td class="spec-label">Condition</td><td class="spec-value" style="color:var(--color-primary-light);font-weight:700;">${product.condition || 'Authentic • IMEI Verified'}</td></tr>
        <tr><td class="spec-label">Warranty</td><td class="spec-value">6-Month Hardware &amp; Battery Warranty</td></tr>
        <tr><td class="spec-label">Verification</td><td class="spec-value">Clean IMEI • Free Testing Upon Delivery</td></tr>
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
        <button class="modal-sheet__close" id="modal-close-btn" aria-label="Close modal">&times;</button>
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

      <button class="btn btn-primary btn-lg" id="modal-add-btn" style="width:100%;margin-bottom:0.5rem;">
        Add to Cart
      </button>

      <button type="button" class="btn btn-secondary" onclick="openPolicyModal('warranty')" style="width:100%;margin-bottom:0.75rem;font-size:0.8rem;padding:8px 14px;">
        🛡️ View 6-Month Warranty &amp; Return Terms
      </button>

      <div style="text-align:center;">
        <a href="${buildWhatsAppLink(`Hi STY. J Nexus! I am asking about the ${product.name} (${selectedVariant}).`)}"
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

  // Close on button or outside tap
  modalOverlay.querySelector('#modal-close-btn')?.addEventListener('click', closeProductModal);
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
    const el2 = document.getElementById('cart-total-2');
    if (el2) el2.textContent = formatPrice(total);
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
      <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--color-border);font-size:0.875rem;">
        <div>
          <div style="font-weight:700;color:#ffffff;">${i.name}</div>
          <div style="color:var(--color-text-muted);font-size:0.78rem;">${i.variant} &times; ${i.qty}</div>
        </div>
        <div style="font-weight:700;color:var(--color-primary);">${formatPrice(i.price * i.qty)}</div>
      </div>
    `).join('') + `
      <div style="display:flex;justify-content:space-between;padding:0.75rem 0 0;font-size:1.1rem;font-weight:800;color:#ffffff;">
        <span>Total</span>
        <span style="color:var(--color-primary);">${formatPrice(Cart.getTotal())}</span>
      </div>
    `;
  }

  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validation
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const locationInput = document.getElementById('location');

    const nameVal = (nameInput?.value || '').trim();
    const phoneVal = (phoneInput?.value || '').trim();
    const locationVal = (locationInput?.value || '').trim();

    // Reset error styling
    [nameInput, phoneInput, locationInput].forEach(inp => {
      if (inp) {
        inp.style.borderColor = '';
        inp.style.boxShadow = '';
      }
    });

    if (nameVal.length < 2) {
      if (nameInput) {
        nameInput.style.borderColor = 'var(--color-red, #e11d48)';
        nameInput.focus();
      }
      showToast('Please enter your full name');
      return;
    }

    // Ghana phone validation: 10 digits starting with 02, 05, 03 or international +233...
    const cleanPhone = phoneVal.replace(/[\s\-()]/g, '');
    const ghPhoneRegex = /^(?:\+233|0)[235][0-9]{8}$/;
    if (!ghPhoneRegex.test(cleanPhone) && cleanPhone.length < 9) {
      if (phoneInput) {
        phoneInput.style.borderColor = 'var(--color-red, #e11d48)';
        phoneInput.focus();
      }
      showToast('Please enter a valid Ghana phone number (e.g. 055 371 4373)');
      return;
    }

    if (locationVal.length < 3) {
      if (locationInput) {
        locationInput.style.borderColor = 'var(--color-red, #e11d48)';
        locationInput.focus();
      }
      showToast('Please enter your delivery city & area (e.g. East Legon, Accra)');
      return;
    }

    isSubmitting = true;
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Securing Order…';
    }

    // Generate cryptographically random, unguessable Order ID
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${datePart}-${randPart}`;

    const data = Object.fromEntries(new FormData(form));
    const orderItems = Cart.getItems();
    const orderTotal = Cart.getTotal();

    const orderObj = {
      ...data,
      orderId,
      items: orderItems,
      total: orderTotal,
      timestamp: today.toISOString(),
      status: 'pending',
    };

    // 1. Submit to Formspree
    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(orderObj),
      });
    } catch (err) {
      console.warn('Formspree submit:', err);
    }

    // 2. Save to Firestore (if available)
    try {
      await saveOrderToFirestore(orderObj);
    } catch (err) {
      console.warn('Firestore save:', err);
    }

    // 3. Build WhatsApp link with complete order details & order ID
    const waLink = buildOrderWhatsAppLink(orderItems, data, orderId);

    // Save complete order details into sessionStorage so customer never loses data
    sessionStorage.setItem('order_success', JSON.stringify({
      orderId,
      name: data.name,
      phone: data.phone,
      location: data.location,
      delivery_type: data.delivery_type,
      notes: data.notes,
      items: orderItems,
      total: orderTotal,
      waLink,
    }));

    Cart.clear();
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
  const container = document.getElementById('order-success-container');
  if (!container) return;

  if (!data) {
    container.innerHTML = `
      <div style="padding:2rem 0;text-align:center;">
        <h1 style="font-size:1.5rem;font-weight:800;color:var(--clr-text);margin-bottom:0.5rem;">No Active Order Found</h1>
        <p style="color:var(--color-text-muted);font-size:0.9rem;margin-bottom:1.5rem;">You haven't placed an order recently in this browser session.</p>
        <a href="index.html" class="btn btn-primary btn-lg">&larr; Return to Store</a>
      </div>
    `;
    return;
  }

  const shortId = data.orderId || 'ORD-CONFIRMED';
  const name = data.name || 'Valued Customer';
  const totalStr = formatPrice(data.total || 0);
  const items = data.items || [];
  const waLink = data.waLink || 'https://wa.me/233553714373';

  // Build items list
  const itemsHtml = items.map(i => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.6rem 0;border-bottom:1px solid var(--color-border);font-size:0.875rem;">
      <div>
        <div style="font-weight:700;color:var(--color-text);">${i.name}</div>
        <div style="color:var(--color-text-muted);font-size:0.78rem;">${i.variant} &times; ${i.qty}</div>
      </div>
      <div style="font-weight:800;color:var(--color-cta);">${formatPrice(i.price * i.qty)}</div>
    </div>
  `).join('');

  container.innerHTML = `
    <!-- Green Check Badge -->
    <div style="width:72px;height:72px;border-radius:50%;background:var(--color-surface-soft-alt);border:2px solid var(--color-success);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>

    <span style="display:inline-block;padding:4px 12px;border-radius:99px;background:var(--color-surface-soft-alt);border:1px solid rgba(15,118,110,0.2);color:var(--color-primary);font-size:0.8rem;font-weight:800;letter-spacing:0.04em;margin-bottom:0.75rem;">
      ${shortId}
    </span>

    <h1 style="font-size:clamp(1.6rem,5vw,2.2rem);font-weight:800;letter-spacing:-0.03em;margin-bottom:0.4rem;color:var(--clr-text);">
      Order Registered
    </h1>
    <p style="font-size:0.95rem;color:var(--color-text-muted);margin-bottom:1.5rem;">
      Thank you, <strong style="color:var(--color-text);">${name}</strong>. Your order request has been received and saved.
    </p>

    <!-- Order Details Box -->
    <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--r-lg);padding:1.25rem;text-align:left;margin-bottom:1.5rem;box-shadow:var(--shadow-card);">
      <div style="font-size:0.75rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:var(--color-text-subtle);margin-bottom:0.75rem;">
        Order Breakdown
      </div>
      ${itemsHtml}
      <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0 0;font-size:1.1rem;font-weight:800;color:var(--color-text);">
        <span>Total</span>
        <span style="color:var(--color-cta);">${totalStr}</span>
      </div>

      <div style="margin-top:1rem;padding-top:1rem;border-top:1px dashed var(--color-border);font-size:0.825rem;color:var(--color-text-muted);display:flex;flex-direction:column;gap:4px;">
        <div><strong>Delivery to:</strong> ${data.location || '—'}</div>
        <div><strong>Phone:</strong> ${data.phone || '—'}</div>
        <div><strong>Method:</strong> ${data.delivery_type === 'pickup' ? 'In-Person Pickup (Accra)' : 'Doorstep Delivery (Nationwide)'}</div>
      </div>
    </div>

    <p style="font-size:0.875rem;color:var(--color-text-muted);margin-bottom:1.5rem;line-height:1.5;">
      Connecting on WhatsApp allows our Accra store team to confirm stock availability, device condition, and coordinate your dispatch directly.
    </p>

    <div style="display:flex;flex-direction:column;gap:0.75rem;">
      <a id="success-wa-btn" href="${waLink}" target="_blank" rel="noopener" class="btn btn-wa btn-lg" style="width:100%;justify-content:center;">
        Confirm via WhatsApp &rarr;
      </a>
      <button type="button" id="copy-order-btn" class="btn btn-secondary btn-lg" style="width:100%;justify-content:center;">
        Copy Order Details
      </button>
      <a href="index.html" class="btn btn-secondary btn-lg" style="width:100%;justify-content:center;">
        &larr; Return to Store
      </a>
    </div>

    <p style="margin-top:2rem;font-size:0.8rem;color:var(--color-text-subtle);">
      Need immediate phone assistance? Call: <a href="tel:0553714373" style="color:var(--color-primary);font-weight:700;">055 371 4373</a>
    </p>
  `;

  // Copy order details button listener
  document.getElementById('copy-order-btn')?.addEventListener('click', () => {
    const copyText = `STY. J Nexus Order #${shortId}\nName: ${name}\nPhone: ${data.phone}\nLocation: ${data.location}\nTotal: ${totalStr}\nItems: ${items.map(i => `${i.name} (${i.variant}) x${i.qty}`).join(', ')}`;
    navigator.clipboard.writeText(copyText).then(() => {
      showToast('Order details copied to clipboard!');
    }).catch(() => {
      showToast('Could not copy to clipboard');
    });
  });
}

/* ── Sync In-Cart Button States ────────────────────────────── */
function updateCartButtons() {
  const items = Cart.getItems();
  document.querySelectorAll('.add-to-cart[data-product-id]').forEach(btn => {
    const pid = btn.dataset.productId;
    const cartItem = items.find(i => i.id === pid);
    if (cartItem) {
      btn.classList.add('in-cart');
      btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;vertical-align:-2px;"><polyline points="20 6 9 17 4 12"></polyline></svg>In Cart (${cartItem.qty})`;
    } else {
      btn.classList.remove('in-cart');
      btn.textContent = '+ Add';
    }
  });
}
window.addEventListener('cart:updated', updateCartButtons);

/* ── Store Policies Modal System ──────────────────────────── */
function openPolicyModal(tab = 'warranty') {
  let modal = document.getElementById('policy-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'policy-modal-overlay';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-sheet" style="max-width:620px;">
        <div class="modal-sheet__header">
          <div style="font-size:1.1rem;font-weight:800;color:#ffffff;display:flex;align-items:center;gap:8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            STY. J Nexus Store Policies
          </div>
          <button class="modal-sheet__close" id="policy-modal-close" aria-label="Close policies">&times;</button>
        </div>

        <!-- Policy Navigation Tabs -->
        <div class="filter-bar" style="margin-bottom:1rem;" role="tablist">
          <button class="filter-chip active" data-tab="warranty" role="tab">6-Month Warranty</button>
          <button class="filter-chip" data-tab="returns" role="tab">Returns &amp; Exchanges</button>
          <button class="filter-chip" data-tab="delivery" role="tab">Nationwide Delivery</button>
          <button class="filter-chip" data-tab="privacy" role="tab">Privacy &amp; Terms</button>
        </div>

        <!-- Policy Tab Contents -->
        <div id="policy-tab-warranty" class="policy-tab-content">
          <h3 style="font-size:1.05rem;font-weight:800;color:#ffffff;margin-bottom:0.5rem;">6-Month Hardware &amp; Battery Warranty</h3>
          <p style="color:var(--color-text-muted);font-size:0.875rem;line-height:1.5;margin-bottom:1rem;">
            Every iPhone, MacBook, and Apple Watch sold by STY. J Nexus includes a comprehensive 6-month store warranty protecting you against internal component and hardware defects.
          </p>
          <ul style="display:flex;flex-direction:column;gap:0.6rem;font-size:0.85rem;color:var(--color-text-muted);margin-bottom:1rem;">
            <li style="display:flex;gap:8px;"><span style="color:var(--color-primary);font-weight:700;">✓</span> <div><strong style="color:#ffffff;">Motherboard &amp; Logic Board:</strong> Full coverage for power, chip, and board functionality.</div></li>
            <li style="display:flex;gap:8px;"><span style="color:var(--color-primary);font-weight:700;">✓</span> <div><strong style="color:#ffffff;">Battery Health Guarantee:</strong> Minimum 85%+ battery health on all UK Used Grade A+ devices; 100% on Brand New devices.</div></li>
            <li style="display:flex;gap:8px;"><span style="color:var(--color-primary);font-weight:700;">✓</span> <div><strong style="color:#ffffff;">Authenticity Guarantee:</strong> Original Apple displays and cameras — never replaced with cheap aftermarket components.</div></li>
            <li style="display:flex;gap:8px;"><span style="color:var(--color-primary);font-weight:700;">✓</span> <div><strong style="color:#ffffff;">IMEI Clean &amp; Unlocked:</strong> Factory unlocked for MTN, Telecel, and AT networks in Ghana and worldwide.</div></li>
          </ul>
        </div>

        <div id="policy-tab-returns" class="policy-tab-content" style="display:none;">
          <h3 style="font-size:1.05rem;font-weight:800;color:#ffffff;margin-bottom:0.5rem;">48-Hour Return &amp; Exchange Guarantee</h3>
          <p style="color:var(--color-text-muted);font-size:0.875rem;line-height:1.5;margin-bottom:1rem;">
            We give all customers a 48-hour testing window to inspect and use their device. If any technical discrepancy or defect occurs within 48 hours, you are entitled to an immediate swap or full refund.
          </p>
          <ul style="display:flex;flex-direction:column;gap:0.6rem;font-size:0.85rem;color:var(--color-text-muted);margin-bottom:1rem;">
            <li style="display:flex;gap:8px;"><span style="color:var(--color-primary);font-weight:700;">✓</span> <div><strong style="color:#ffffff;">On-Delivery Inspection:</strong> For all deliveries within Accra, our courier waits while you test Face ID / Touch ID, cameras, charging, and call quality.</div></li>
            <li style="display:flex;gap:8px;"><span style="color:var(--color-primary);font-weight:700;">✓</span> <div><strong style="color:#ffffff;">Instant Replacement:</strong> If a fault is confirmed, our store dispatches a replacement device on the same day.</div></li>
            <li style="display:flex;gap:8px;"><span style="color:var(--color-primary);font-weight:700;">✓</span> <div><strong style="color:#ffffff;">Eligibility:</strong> Device must remain in the same physical condition as received without user-induced screen cracks, water submersion, or iCloud locks.</div></li>
          </ul>
        </div>

        <div id="policy-tab-delivery" class="policy-tab-content" style="display:none;">
          <h3 style="font-size:1.05rem;font-weight:800;color:#ffffff;margin-bottom:0.5rem;">Nationwide Delivery Across Ghana</h3>
          <p style="color:var(--color-text-muted);font-size:0.875rem;line-height:1.5;margin-bottom:1rem;">
            We coordinate safe, insured delivery from our Accra headquarters to all 16 regions of Ghana.
          </p>
          <ul style="display:flex;flex-direction:column;gap:0.6rem;font-size:0.85rem;color:var(--color-text-muted);margin-bottom:1rem;">
            <li style="display:flex;gap:8px;"><span style="color:var(--color-primary);font-weight:700;">🚚</span> <div><strong style="color:#ffffff;">Greater Accra &amp; Tema:</strong> Same-day dispatch within 1–3 hours of confirmation. Cash or MoMo on delivery accepted.</div></li>
            <li style="display:flex;gap:8px;"><span style="color:var(--color-primary);font-weight:700;">🚚</span> <div><strong style="color:#ffffff;">Kumasi, Takoradi, Sunyani, Cape Coast:</strong> Next-day delivery to your doorstep or trusted courier hub.</div></li>
            <li style="display:flex;gap:8px;"><span style="color:var(--color-primary);font-weight:700;">🚚</span> <div><strong style="color:#ffffff;">Northern &amp; All Other Regions:</strong> 24–48 hours via tracked transport services (VIP / FedEx).</div></li>
            <li style="display:flex;gap:8px;"><span style="color:var(--color-primary);font-weight:700;">📍</span> <div><strong style="color:#ffffff;">In-Person Pickup:</strong> Available daily in Accra by appointment.</div></li>
          </ul>
        </div>

        <div id="policy-tab-privacy" class="policy-tab-content" style="display:none;">
          <h3 style="font-size:1.05rem;font-weight:800;color:#ffffff;margin-bottom:0.5rem;">Privacy Policy &amp; Terms of Service</h3>
          <p style="color:var(--color-text-muted);font-size:0.875rem;line-height:1.5;margin-bottom:1rem;">
            STY. J Nexus values your privacy. We collect only the information necessary to fulfill your order and communicate delivery updates.
          </p>
          <ul style="display:flex;flex-direction:column;gap:0.6rem;font-size:0.85rem;color:var(--color-text-muted);margin-bottom:1rem;">
            <li style="display:flex;gap:8px;"><span style="color:var(--color-primary);font-weight:700;">🔒</span> <div><strong style="color:#ffffff;">Data Confidentiality:</strong> Your name, phone number, and address are strictly used for delivery coordination. We never share or sell customer data.</div></li>
            <li style="display:flex;gap:8px;"><span style="color:var(--color-primary);font-weight:700;">🔒</span> <div><strong style="color:#ffffff;">Stock Confirmation:</strong> Submitting an order reserves your request. Final availability and delivery time are verified via WhatsApp/call prior to dispatch.</div></li>
            <li style="display:flex;gap:8px;"><span style="color:var(--color-primary);font-weight:700;">🔒</span> <div><strong style="color:#ffffff;">Legal Identity:</strong> &copy; 2026 STY. J Nexus. Operating from Accra, Ghana.</div></li>
          </ul>
        </div>

        <div style="margin-top:1.5rem;display:flex;justify-content:flex-end;">
          <button type="button" class="btn btn-primary" id="policy-modal-dismiss" style="padding:8px 20px;">Got It</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Close listeners
    const closeModal = () => modal.classList.remove('open');
    document.getElementById('policy-modal-close')?.addEventListener('click', closeModal);
    document.getElementById('policy-modal-dismiss')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // Tab switching
    modal.querySelectorAll('.filter-chip[data-tab]').forEach(chip => {
      chip.addEventListener('click', () => {
        modal.querySelectorAll('.filter-chip[data-tab]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const activeTab = chip.dataset.tab;
        modal.querySelectorAll('.policy-tab-content').forEach(content => {
          content.style.display = content.id === `policy-tab-${activeTab}` ? 'block' : 'none';
        });
      });
    });
  }

  // Switch to selected tab
  modal.querySelectorAll('.filter-chip[data-tab]').forEach(c => {
    c.classList.toggle('active', c.dataset.tab === tab);
  });
  modal.querySelectorAll('.policy-tab-content').forEach(content => {
    content.style.display = content.id === `policy-tab-${tab}` ? 'block' : 'none';
  });

  modal.classList.add('open');
}
window.openPolicyModal = openPolicyModal;

/* ── Home Page Initializer ───────────────────────────────── */
function renderHomePage() {
  if (typeof PRODUCTS === 'undefined') return;
  if (document.getElementById('home-iphones-grid') && PRODUCTS.iphones) {
    renderProductsGrid('home-iphones-grid', PRODUCTS.iphones.slice(0, 4));
  }
  if (document.getElementById('home-laptops-grid') && PRODUCTS.laptops) {
    renderProductsGrid('home-laptops-grid', PRODUCTS.laptops.slice(0, 4));
  }
}

/* ── DOM Ready Initializer ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  updateCartBadge();
  updateCartButtons();
  initFab();

  // Automatic Page Routing based on DOM markers and URL path
  const path = window.location.pathname;

  if (document.getElementById('home-iphones-grid')) {
    renderHomePage();
  } else if (path.endsWith('iphones.html') && typeof PRODUCTS !== 'undefined') {
    renderProductsGrid('products-grid', PRODUCTS.iphones);
    initFilterChips('products-grid', 'iphones');
  } else if (path.endsWith('laptops.html') && typeof PRODUCTS !== 'undefined') {
    renderProductsGrid('products-grid', PRODUCTS.laptops);
    initFilterChips('products-grid', 'laptops');
  } else if (path.endsWith('watches.html') && typeof PRODUCTS !== 'undefined') {
    renderProductsGrid('products-grid', PRODUCTS.watches);
    initFilterChips('products-grid', 'watches');
  } else if (path.endsWith('accessories.html') && typeof PRODUCTS !== 'undefined') {
    renderProductsGrid('products-grid', PRODUCTS.accessories);
    initFilterChips('products-grid', 'accessories');
  } else if (path.endsWith('cart.html')) {
    renderCartPage();
  } else if (path.endsWith('checkout.html')) {
    initCheckoutPage();
  } else if (path.endsWith('order-success.html')) {
    initSuccessPage();
  }
});
