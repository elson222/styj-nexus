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
      <h3 class="product-card__name" role="button" tabindex="0">${product.name}</h3>
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
        <tr><td class="spec-label">Verification</td><td class="spec-value">Clean IMEI • Free Testing Upon Handover</td></tr>
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
      <div class="modal-sheet__header" style="justify-content:flex-end;">
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

      <button type="button" class="btn btn-secondary" onclick="openPolicyModal('returns')" style="width:100%;margin-bottom:0.75rem;font-size:0.8rem;padding:8px 14px;">
        🔄 48-Hour Return &amp; Exchange Terms
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
          if (filter === 'watches') return p.category === 'watches';
          if (filter === 'airpods') return p.id.includes('airpods');
          if (filter === 'power') return !p.id.includes('airpods') && p.category !== 'watches';
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
        <div style="font-weight:700;color:#ffffff;">${formatPrice(i.price * i.qty)}</div>
      </div>
    `).join('') + `
      <div style="display:flex;justify-content:space-between;padding:0.75rem 0 0;font-size:1.1rem;font-weight:800;color:#ffffff;">
        <span>Total</span>
        <span style="color:#38bdf8;">${formatPrice(Cart.getTotal())}</span>
      </div>
    `;
  }

  // Handle Payment Method Card Selection & Dynamic Button Labeling
  const paymentInputs = form.querySelectorAll('input[name="payment_method"]');
  const submitBtn = document.getElementById('checkout-submit-btn') || form.querySelector('[type="submit"]');

  function updatePaymentCards() {
    const selected = form.querySelector('input[name="payment_method"]:checked')?.value || 'pay_on_delivery';
    form.querySelectorAll('.payment-method-card').forEach(card => {
      const radio = card.querySelector('input[type="radio"]');
      if (radio && radio.checked) {
        card.style.borderColor = '#38bdf8';
        card.style.background = 'rgba(56,189,248,0.06)';
      } else {
        card.style.borderColor = 'rgba(255,255,255,0.12)';
        card.style.background = 'rgba(255,255,255,0.02)';
      }
    });

    if (submitBtn) {
      if (selected === 'momo_pay') {
        submitBtn.innerHTML = `Confirm Order (Direct MoMo Pay) &rarr;`;
      } else {
        submitBtn.innerHTML = `Complete Order (Pay on Delivery) &rarr;`;
      }
    }
  }

  paymentInputs.forEach(input => {
    input.addEventListener('change', updatePaymentCards);
  });
  updatePaymentCards();

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

    const data = Object.fromEntries(new FormData(form));
    const paymentMethod = data.payment_method || 'pay_on_delivery';
    const orderItems = Cart.getItems();
    const orderTotal = Cart.getTotal();

    isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Securing Order…';
    }

    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${datePart}-${randPart}`;

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
      payment_method: paymentMethod,
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
      <div style="font-weight:800;color:#ffffff;">${formatPrice(i.price * i.qty)}</div>
    </div>
  `).join('');

  container.innerHTML = `
    <!-- Success Badge -->
    <div style="width:72px;height:72px;border-radius:50%;background:var(--color-surface-soft-alt);border:2px solid #38bdf8;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>

    <span style="display:inline-block;padding:4px 12px;border-radius:99px;background:var(--color-surface-soft-alt);border:1px solid var(--color-border);color:#e2e8f0;font-size:0.8rem;font-weight:800;letter-spacing:0.04em;margin-bottom:0.75rem;">
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
        <span style="color:#ffffff;">${totalStr}</span>
      </div>

      <div style="margin-top:1rem;padding-top:1rem;border-top:1px dashed var(--color-border);font-size:0.825rem;color:var(--color-text-muted);display:flex;flex-direction:column;gap:4px;">
        <div><strong>Delivery to:</strong> ${data.location || '—'}</div>
        <div><strong>Phone:</strong> ${data.phone || '—'}</div>
        <div><strong>Method:</strong> ${data.delivery_type === 'pickup' ? 'In-Person Pickup (Accra)' : 'Nationwide Delivery'}</div>
      </div>

      ${(() => {
        if (data.payment_method === 'momo_pay') {
          return `
            <div style="margin-top:1rem;padding:0.875rem 1rem;border-radius:12px;background:rgba(250,204,21,0.08);border:1px solid rgba(250,204,21,0.25);font-size:0.825rem;color:#fef08a;line-height:1.45;">
              <strong style="color:#facc15;display:block;margin-bottom:4px;font-size:0.875rem;">Official STY. J Nexus MoMo Details:</strong>
              <div>• MoMo Hotline: <strong>055 371 4373</strong></div>
              <div>• Reference to use: <strong>${shortId}</strong></div>
              <div style="font-size:0.75rem;color:#cbd5e1;margin-top:4px;">Please send the MoMo transaction ID or screenshot on WhatsApp to confirm immediate dispatch.</div>
            </div>
          `;
        } else {
          return `
            <div style="margin-top:1rem;padding:0.875rem 1rem;border-radius:12px;background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.25);font-size:0.825rem;color:#bae6fd;line-height:1.45;">
              <strong style="color:#38bdf8;display:block;margin-bottom:2px;font-size:0.875rem;">Payment Option: Pay on Delivery (Nationwide)</strong>
              Inspect your device upon delivery before releasing payment via MoMo or cash to our courier.
            </div>
          `;
        }
      })()}
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
      Need immediate phone assistance? Call: <a href="tel:0553714373" style="color:#38bdf8;font-weight:700;">055 371 4373</a>
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
function openPolicyModal(tab = 'returns') {
  let modal = document.getElementById('policy-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'policy-modal-overlay';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-sheet" style="max-width:620px;">
        <div class="modal-sheet__header">
          <div style="font-size:1.1rem;font-weight:800;color:#ffffff;display:flex;align-items:center;gap:8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            STY. J Nexus Store Policies
          </div>
          <button class="modal-sheet__close" id="policy-modal-close" aria-label="Close policies">&times;</button>
        </div>

        <!-- Policy Navigation Tabs -->
        <div class="filter-bar" style="margin-bottom:1rem;" role="tablist">
          <button class="filter-chip active" data-tab="returns" role="tab">Returns &amp; Exchanges</button>
          <button class="filter-chip" data-tab="delivery" role="tab">Nationwide Delivery</button>
          <button class="filter-chip" data-tab="privacy" role="tab">Privacy &amp; Terms</button>
        </div>

        <!-- Policy Tab Contents -->
        <div id="policy-tab-returns" class="policy-tab-content">
          <h3 style="font-size:1.05rem;font-weight:800;color:#ffffff;margin-bottom:0.5rem;">48-Hour Return &amp; Exchange Guarantee</h3>
          <p style="color:var(--color-text-muted);font-size:0.875rem;line-height:1.5;margin-bottom:1rem;">
            We give all customers a 48-hour testing window to inspect and use their device. If any technical discrepancy or defect occurs within 48 hours, you are entitled to an immediate swap or full refund.
          </p>
          <ul style="display:flex;flex-direction:column;gap:0.6rem;font-size:0.85rem;color:var(--color-text-muted);margin-bottom:1rem;">
            <li style="display:flex;gap:8px;"><span style="color:#38bdf8;font-weight:700;">✓</span> <div><strong style="color:#ffffff;">On-Delivery Inspection:</strong> For all deliveries within Accra, our courier waits while you test Face ID / Touch ID, cameras, charging, and call quality.</div></li>
            <li style="display:flex;gap:8px;"><span style="color:#38bdf8;font-weight:700;">✓</span> <div><strong style="color:#ffffff;">Instant Replacement:</strong> If a fault is confirmed, our store dispatches a replacement device on the same day.</div></li>
            <li style="display:flex;gap:8px;"><span style="color:#38bdf8;font-weight:700;">✓</span> <div><strong style="color:#ffffff;">Eligibility:</strong> Device must remain in the same physical condition as received without user-induced screen cracks, water submersion, or iCloud locks.</div></li>
          </ul>
        </div>

        <div id="policy-tab-delivery" class="policy-tab-content" style="display:none;">
          <h3 style="font-size:1.05rem;font-weight:800;color:#ffffff;margin-bottom:0.5rem;">Nationwide Delivery Across Ghana</h3>
          <p style="color:var(--color-text-muted);font-size:0.875rem;line-height:1.5;margin-bottom:1rem;">
            We coordinate safe, insured delivery from our Accra headquarters to all 16 regions of Ghana.
          </p>
          <ul style="display:flex;flex-direction:column;gap:0.6rem;font-size:0.85rem;color:var(--color-text-muted);margin-bottom:1rem;">
            <li style="display:flex;gap:8px;"><span style="color:#38bdf8;font-weight:700;">🚚</span> <div><strong style="color:#ffffff;">Greater Accra &amp; Tema:</strong> Same-day dispatch within 1–3 hours of confirmation. Cash or MoMo on delivery accepted.</div></li>
            <li style="display:flex;gap:8px;"><span style="color:#38bdf8;font-weight:700;">🚚</span> <div><strong style="color:#ffffff;">Kumasi, Takoradi, Sunyani, Cape Coast:</strong> Next-day delivery to your doorstep or trusted courier hub.</div></li>
            <li style="display:flex;gap:8px;"><span style="color:#38bdf8;font-weight:700;">🚚</span> <div><strong style="color:#ffffff;">Northern &amp; All Other Regions:</strong> 24–48 hours via tracked transport services (VIP / FedEx).</div></li>
            <li style="display:flex;gap:8px;"><span style="color:#38bdf8;font-weight:700;">📍</span> <div><strong style="color:#ffffff;">In-Person Pickup:</strong> Available daily in Accra by appointment.</div></li>
          </ul>
        </div>

        <div id="policy-tab-privacy" class="policy-tab-content" style="display:none;">
          <h3 style="font-size:1.05rem;font-weight:800;color:#ffffff;margin-bottom:0.5rem;">Privacy Policy &amp; Terms of Service</h3>
          <p style="color:var(--color-text-muted);font-size:0.875rem;line-height:1.5;margin-bottom:1rem;">
            STY. J Nexus values your privacy. We collect only the information necessary to fulfill your order and communicate delivery updates.
          </p>
          <ul style="display:flex;flex-direction:column;gap:0.6rem;font-size:0.85rem;color:var(--color-text-muted);margin-bottom:1rem;">
            <li style="display:flex;gap:8px;"><span style="color:#38bdf8;font-weight:700;">🔒</span> <div><strong style="color:#ffffff;">Data Confidentiality:</strong> Your name, phone number, and address are strictly used for delivery coordination. We never share or sell customer data.</div></li>
            <li style="display:flex;gap:8px;"><span style="color:#38bdf8;font-weight:700;">🔒</span> <div><strong style="color:#ffffff;">Stock Confirmation:</strong> Submitting an order reserves your request. Final availability and delivery time are verified via WhatsApp/call prior to dispatch.</div></li>
            <li style="display:flex;gap:8px;"><span style="color:#38bdf8;font-weight:700;">🔒</span> <div><strong style="color:#ffffff;">Legal Identity:</strong> &copy; 2026 STY. J Nexus. Operating from Accra, Ghana.</div></li>
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

/* ── Instant Live Search System ────────────────────────────── */
let searchOverlay = null;
let currentSearchCategory = 'all';

function openSearchModal() {
  if (!searchOverlay) {
    searchOverlay = document.createElement('div');
    searchOverlay.id = 'search-overlay';
    searchOverlay.className = 'search-overlay';
    searchOverlay.innerHTML = `
      <div class="search-dialog" role="dialog" aria-modal="true" aria-label="Search devices">
        <div class="search-dialog__header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="search" class="search-dialog__input" id="search-modal-input" placeholder="Search iPhones, MacBooks, Watches, AirPods..." autocomplete="off" />
          <button type="button" class="search-dialog__close" id="search-modal-close" aria-label="Close search">&times;</button>
        </div>

        <div class="search-dialog__filters">
          <button type="button" class="search-filter-pill active" data-cat="all">All Devices</button>
          <button type="button" class="search-filter-pill" data-cat="iphones">iPhones</button>
          <button type="button" class="search-filter-pill" data-cat="laptops">Laptops</button>
          <button type="button" class="search-filter-pill" data-cat="watches-accessories">Watches &amp; Accessories</button>
        </div>

        <div class="search-results" id="search-modal-results"></div>

        <div class="search-dialog__footer">
          <span>Tip: Click device to inspect specifications</span>
          <span>Esc to close</span>
        </div>
      </div>
    `;
    document.body.appendChild(searchOverlay);

    // Event listeners
    const input = document.getElementById('search-modal-input');
    const closeBtn = document.getElementById('search-modal-close');

    closeBtn?.addEventListener('click', closeSearchModal);
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) closeSearchModal();
    });

    input?.addEventListener('input', (e) => {
      renderSearchResults(e.target.value.trim());
    });

    searchOverlay.querySelectorAll('.search-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        searchOverlay.querySelectorAll('.search-filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentSearchCategory = pill.dataset.cat;
        renderSearchResults(input ? input.value.trim() : '');
      });
    });
  }

  searchOverlay.classList.add('open');
  const input = document.getElementById('search-modal-input');
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 80);
  }
  renderSearchResults('');
}

function closeSearchModal() {
  if (searchOverlay) searchOverlay.classList.remove('open');
}

function renderSearchResults(query = '') {
  const resultsContainer = document.getElementById('search-modal-results');
  if (!resultsContainer) return;

  const allProds = typeof getAllProducts === 'function' ? getAllProducts() : [];
  const q = query.toLowerCase();

  const filtered = allProds.filter(p => {
    // Category filter check
    if (currentSearchCategory === 'watches-accessories') {
      if (p.category !== 'watches' && p.category !== 'accessories') return false;
    } else if (currentSearchCategory !== 'all' && p.category !== currentSearchCategory) {
      return false;
    }
    // Query check
    if (!q) return true;
    const matchName = (p.name || '').toLowerCase().includes(q);
    const matchDesc = (p.desc || '').toLowerCase().includes(q);
    const matchStorage = (p.storage || []).some(s => s.toLowerCase().includes(q));
    const matchCategory = (p.category || '').toLowerCase().includes(q);
    return matchName || matchDesc || matchStorage || matchCategory;
  });

  if (filtered.length === 0) {
    const rawDevice = query || 'this device';
    const initialWaMsg = `Hi STY. J Nexus! 👋\n\nI searched your website for "${rawDevice}".\n• Target Budget: ₵5,000 – ₵10,000\n\nDo you have this in stock or can you source it for me?`;
    const initialWaLink = `https://wa.me/233553714373?text=${encodeURIComponent(initialWaMsg)}`;

    resultsContainer.innerHTML = `
      <div class="search-enquiry-card" style="padding:1.5rem 1.25rem;text-align:center;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.12);border-radius:18px;margin:0.5rem 0.25rem;">
        <div style="font-size:1.6rem;margin-bottom:0.35rem;">📦</div>
        <div style="font-weight:800;font-size:1.05rem;color:#ffffff;margin-bottom:0.35rem;">
          Device Not Listed? We Can Source It!
        </div>
        <p style="font-size:0.825rem;color:#94a3b8;margin-bottom:1.15rem;line-height:1.45;max-width:440px;margin-left:auto;margin-right:auto;">
          We carry extensive inventory beyond what is shown online, including custom MacBooks, Dell/HP laptops, and other phone models. Tell us what you need and our Accra store will check live stock immediately:
        </p>

        <div style="display:flex;flex-direction:column;gap:0.75rem;max-width:340px;margin:0 auto 1.25rem;text-align:left;">
          <div>
            <label style="font-size:0.725rem;font-weight:700;color:#94a3b8;text-transform:uppercase;display:block;margin-bottom:4px;">Device Requested</label>
            <input type="text" id="enquiry-device-name" value="${query.replace(/"/g, '&quot;')}" placeholder="e.g. Dell XPS 15, iPhone 12, MacBook Pro M3..." style="width:100%;box-sizing:border-box;background:#070d1f;border:1px solid rgba(255,255,255,0.18);border-radius:10px;padding:8px 12px;color:#ffffff;font-size:0.875rem;outline:none;" />
          </div>

          <div>
            <label style="font-size:0.725rem;font-weight:700;color:#94a3b8;text-transform:uppercase;display:block;margin-bottom:4px;">Your Target Budget</label>
            <select id="enquiry-device-budget" style="width:100%;box-sizing:border-box;background:#070d1f;border:1px solid rgba(255,255,255,0.18);border-radius:10px;padding:8px 12px;color:#ffffff;font-size:0.875rem;outline:none;">
              <option value="Under ₵5,000">Under ₵5,000</option>
              <option value="₵5,000 – ₵10,000" selected>₵5,000 – ₵10,000</option>
              <option value="₵10,000 – ₵18,000">₵10,000 – ₵18,000</option>
              <option value="₵18,000 – ₵28,000">₵18,000 – ₵28,000</option>
              <option value="₵28,000+">₵28,000+ (High-End / Pro Spec)</option>
            </select>
          </div>
        </div>

        <a id="enquiry-wa-btn" href="${initialWaLink}" target="_blank" rel="noopener" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:8px;padding:10px 24px;border-radius:9999px;font-weight:700;font-size:0.875rem;text-decoration:none;background:#38bdf8;color:#020618;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Direct WhatsApp Enquiry &rarr;
        </a>
      </div>
    `;

    const devInput = document.getElementById('enquiry-device-name');
    const bgtSelect = document.getElementById('enquiry-device-budget');
    const waBtn = document.getElementById('enquiry-wa-btn');

    function updateWaEnquiry() {
      const dev = (devInput ? devInput.value.trim() : '') || 'a specific device';
      const bgt = bgtSelect ? bgtSelect.value : 'Flexible';
      const txt = `Hi STY. J Nexus! 👋\n\nI searched your website for "${dev}".\n• Target Budget: ${bgt}\n\nDo you have this in stock or can you source it for me?`;
      if (waBtn) waBtn.href = `https://wa.me/233553714373?text=${encodeURIComponent(txt)}`;
    }

    devInput?.addEventListener('input', updateWaEnquiry);
    bgtSelect?.addEventListener('change', updateWaEnquiry);
    return;
  }

  const itemsHtml = filtered.slice(0, 15).map(p => {
    const minPrice = getMinPrice(p);
    const hasMultiple = p.storage && p.storage.length > 1;
    const isPagesDir = window.location.pathname.includes('/products/');
    const resolvedImg = isPagesDir ? '../' + p.image : p.image;
    const resolvedFallback = isPagesDir ? '../' + p.imageFallback : p.imageFallback;

    return `
      <div class="search-result-item" data-product-id="${p.id}" tabindex="0" role="button" aria-label="View ${p.name}">
        <img class="search-result-img" src="${resolvedImg}" alt="${p.name}" onerror="this.src='${resolvedFallback}'" />
        <div class="search-result-info">
          <div class="search-result-name">${p.name}</div>
          <div class="search-result-meta">${p.category === 'iphones' ? 'Apple iPhone' : p.category === 'laptops' ? 'MacBook & Laptops' : p.category === 'watches' ? 'Apple Watch' : 'Original Gear'} &bull; In Stock</div>
        </div>
        <div class="search-result-price">
          <span style="font-size:0.75rem;color:#94a3b8;font-weight:400;">${hasMultiple ? 'From ' : ''}</span>${formatPrice(minPrice)}
        </div>
      </div>
    `;
  }).join('');

  const enquiryFooter = `
    <div style="padding:0.75rem 1rem;margin-top:0.5rem;border-radius:12px;background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
      <div style="font-size:0.8rem;color:#94a3b8;">
        Looking for a different spec or unlisted model?
      </div>
      <a href="https://wa.me/233553714373?text=${encodeURIComponent(`Hi STY. J Nexus! I'm looking for a specific configuration of ${query || 'a device'}. What are your available options?`)}" target="_blank" rel="noopener" style="font-size:0.8rem;color:#38bdf8;font-weight:700;white-space:nowrap;text-decoration:none;">
        WhatsApp Us for Inquiries &rarr;
      </a>
    </div>
  `;

  resultsContainer.innerHTML = itemsHtml + enquiryFooter;

  resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const pid = item.dataset.productId;
      closeSearchModal();
      openProductModal(pid);
    });
  });
}

window.openSearchModal = openSearchModal;
window.closeSearchModal = closeSearchModal;

// Keyboard shortcuts: '/' opens search, 'Escape' closes all open modals
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
    e.preventDefault();
    openSearchModal();
  } else if (e.key === 'Escape') {
    closeSearchModal();
    const policyModal = document.getElementById('policy-modal-overlay');
    if (policyModal) policyModal.classList.remove('open');
    const productModal = document.getElementById('modal-overlay');
    if (productModal) productModal.classList.remove('open');
  }
});

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

/* ── High-Speed Image & Asset Preloader ─────────────────── */
function preloadProductImages() {
  if (typeof PRODUCTS === 'undefined') return;
  const allProds = typeof getAllProducts === 'function' ? getAllProducts() : [];
  const isPagesDir = window.location.pathname.includes('/products/');

  const runPreload = window.requestIdleCallback || ((cb) => setTimeout(cb, 50));
  runPreload(() => {
    allProds.forEach((p, index) => {
      setTimeout(() => {
        const img = new Image();
        img.src = isPagesDir ? '../' + p.image : p.image;
      }, index * 20);
    });
  });
}

/* ── DOM Ready Initializer ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  updateCartBadge();
  updateCartButtons();
  initFab();
  preloadProductImages();

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
  } else if ((path.endsWith('accessories.html') || path.endsWith('watches.html')) && typeof PRODUCTS !== 'undefined') {
    const combined = getProductsByCategory('accessories');
    renderProductsGrid('products-grid', combined);
    initFilterChips('products-grid', 'accessories');
  } else if (path.endsWith('cart.html')) {
    renderCartPage();
  } else if (path.endsWith('checkout.html')) {
    initCheckoutPage();
  } else if (path.endsWith('order-success.html')) {
    initSuccessPage();
  }
});
