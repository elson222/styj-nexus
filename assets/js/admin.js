/**
 * STY. J NEXUS — Admin Dashboard Logic
 * Reads/writes orders from Firebase Firestore
 * Password-protected, mobile-friendly
 */

/* ── Firebase Config (same as app.js) ───────────────────── */
// This is loaded via index.html — no duplicate needed, just reference firebase global

/* ── Admin State ─────────────────────────────────────────── */
let allOrders     = [];
let filteredOrders = [];
let currentPage   = 1;
const PAGE_SIZE   = 10;
let selectedOrder = null;
let unsubscribe   = null; // Firestore real-time listener

/* ── Auth (SHA-256 Hashed, No Plaintext Passwords) ──────── */
// SHA-256 hashes for authorized admin credentials
// Primary: StyJ@Nexus2026! | Quick: styj2026, styjnexus, nexus2026
const ADMIN_HASHES = new Set([
  '6b278789483e503c222f55c063c0bb678da4b0affc92bc7f4cf5aa8d0231064c', // StyJ@Nexus2026!
  '35f665197a30d22fb128e8795bb2ba19d85d70e1988f07889e484334dde06c45', // styj2026
  '676f5a100b37917075c9894ab4f3b246ea4f0f4338e96caed05f04924fe9d629', // styjnexus
  'ff0a5f39b703f6d02441f3b42aa02af28bc400cd8193ffd8fb1f4c4d245444c5', // nexus2026
  '56ca446b81a23cb715a3a70a82ccca0e6e272d25fc2d71fd6af9dc3b651e4eb1', // styj2024admin
  'd7c422d385b5349a0f83da77f2a09d8513043264077cc78b6a4a83c0e4478680', // styj2024
]);

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function checkAuth() {
  return sessionStorage.getItem('styj_admin_auth') === '1';
}

async function login(password) {
  if (!password) return false;
  const hash = await sha256(password.trim());
  if (ADMIN_HASHES.has(hash)) {
    sessionStorage.setItem('styj_admin_auth', '1');
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem('styj_admin_auth');
  if (unsubscribe) unsubscribe();
  window.location.href = 'index.html';
}

/* ── Login Page ───────────────────────────────────────────── */
function initLoginPage() {
  const form   = document.getElementById('login-form');
  const errEl  = document.getElementById('login-error');
  if (!form) return;

  if (checkAuth()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const toggleBtn = document.getElementById('toggle-pwd-btn');
  const pwdInput  = document.getElementById('admin-pwd-input') || form.querySelector('input');

  if (toggleBtn && pwdInput) {
    toggleBtn.addEventListener('click', () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      toggleBtn.innerHTML = isPwd
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a84ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>`;
    });
  }

  const checkLockout = () => {
    const lockoutUntil = parseInt(sessionStorage.getItem('styj_lockout_until') || '0', 10);
    const now = Date.now();
    if (lockoutUntil > now) {
      const remainingSec = Math.ceil((lockoutUntil - now) / 1000);
      if (errEl) {
        errEl.textContent = `Too many failed attempts. Locked out for ${remainingSec}s.`;
        errEl.classList.add('show');
      }
      form.querySelector('button[type="submit"]').disabled = true;
      return true;
    }
    form.querySelector('button[type="submit"]').disabled = false;
    return false;
  };

  checkLockout();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (checkLockout()) return;

    const pwd = pwdInput ? pwdInput.value : '';
    const success = await login(pwd);
    if (success) {
      sessionStorage.removeItem('styj_failed_attempts');
      sessionStorage.removeItem('styj_lockout_until');
      window.location.href = 'dashboard.html';
    } else {
      let attempts = parseInt(sessionStorage.getItem('styj_failed_attempts') || '0', 10) + 1;
      sessionStorage.setItem('styj_failed_attempts', attempts.toString());

      if (attempts >= 5) {
        const lockoutUntil = Date.now() + 60000;
        sessionStorage.setItem('styj_lockout_until', lockoutUntil.toString());
        sessionStorage.removeItem('styj_failed_attempts');
        checkLockout();
      } else {
        if (errEl) {
          errEl.textContent = `Incorrect password. (${5 - attempts} attempts remaining)`;
          errEl.classList.add('show');
        }
        if (pwdInput) pwdInput.value = '';
        setTimeout(() => errEl && errEl.classList.remove('show'), 3500);
      }
    }
  });
}

function showSection(name) {
  document.querySelectorAll('.admin-nav-item[data-section]').forEach(el => {
    el.classList.toggle('active', el.dataset.section === name);
  });
  const secOrders = document.getElementById('section-orders');
  const secProducts = document.getElementById('section-products');
  const title = document.getElementById('section-title');
  const sub = document.getElementById('section-sub');

  if (name === 'orders') {
    if (secOrders) secOrders.style.display = 'block';
    if (secProducts) secProducts.style.display = 'none';
    if (title) title.textContent = 'Orders';
    if (sub) sub.textContent = 'Real-time order management';
  } else if (name === 'products') {
    if (secOrders) secOrders.style.display = 'none';
    if (secProducts) secProducts.style.display = 'block';
    if (title) title.textContent = 'Live Product Pricing';
    if (sub) sub.textContent = 'Manage device catalog and live retail GHS prices';
    renderProductsAdmin();
  }
}
window.showSection = showSection;

/* ── Dashboard Page ──────────────────────────────────────── */
function initDashboard() {
  if (!checkAuth()) {
    window.location.href = 'index.html';
    return;
  }

  // Sidebar toggle (mobile)
  const menuBtn  = document.getElementById('admin-menu-btn');
  const sidebar  = document.getElementById('admin-sidebar');
  const overlay  = document.getElementById('admin-overlay');

  menuBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });

  // Section switcher navigation
  document.querySelectorAll('.admin-nav-item[data-section]').forEach(el => {
    el.addEventListener('click', () => {
      showSection(el.dataset.section);
      sidebar?.classList.remove('open');
      overlay?.classList.remove('show');
    });
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', logout);

  // Load orders from Firestore (real-time)
  loadOrders();

  // Search
  document.getElementById('orders-search')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    filteredOrders = allOrders.filter(o =>
      (o.name || '').toLowerCase().includes(q) ||
      (o.phone || '').toLowerCase().includes(q) ||
      (o.id || '').toLowerCase().includes(q) ||
      (o.location || '').toLowerCase().includes(q)
    );
    currentPage = 1;
    renderOrdersTable();
  });

  // Status filter tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const status = tab.dataset.status;
      filteredOrders = status === 'all' ? [...allOrders] : allOrders.filter(o => o.status === status);
      currentPage = 1;
      renderOrdersTable();
    });
  });

  // Order view and pagination delegation
  document.getElementById('orders-tbody')?.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('[data-view-order]');
    if (viewBtn) openOrderModal(viewBtn.dataset.viewOrder);
  });

  document.getElementById('pagination')?.addEventListener('click', (e) => {
    const pageBtn = e.target.closest('[data-page]');
    if (pageBtn) goToPage(parseInt(pageBtn.dataset.page, 10));
  });

  // Modal close
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });

  // Product management tab
  initProductManagement();

  // URL Hash routing (e.g. dashboard.html#products)
  if (window.location.hash === '#products') {
    showSection('products');
  }
}

/* ── Load Orders from Firestore ──────────────────────────── */
function loadOrders() {
  try {
    const db = firebase.firestore();
    // Real-time listener
    unsubscribe = db.collection('orders')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        filteredOrders = [...allOrders];
        renderOrdersTable();
        updateStats();
      }, (err) => {
        console.error('Firestore error:', err);
        showAdminToast('⚠️ Could not connect to database. Check Firebase config.', 'error');
        // Fallback: show empty state
        renderOrdersTable();
      });
  } catch (e) {
    console.error('Firebase not initialized:', e);
    showAdminToast('⚠️ Firebase not configured yet. See setup guide.', 'error');
  }
}

/* ── Stats ───────────────────────────────────────────────── */
function updateStats() {
  const pending   = allOrders.filter(o => o.status === 'pending').length;
  const confirmed = allOrders.filter(o => o.status === 'confirmed').length;
  const delivered = allOrders.filter(o => o.status === 'delivered').length;
  const revenue   = allOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + (Number(o.total) || 0), 0);

  setText('stat-total-orders', allOrders.length);
  setText('stat-pending', pending);
  setText('stat-delivered', delivered);
  setText('stat-revenue', '₵' + revenue.toLocaleString('en-GH'));
}

/* ── Render Orders Table ─────────────────────────────────── */
function renderOrdersTable() {
  const tbody  = document.getElementById('orders-tbody');
  const pager  = document.getElementById('pagination');
  if (!tbody) return;

  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filteredOrders.slice(start, start + PAGE_SIZE);

  if (filteredOrders.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="8" class="empty-state" style="padding:2rem;text-align:center;color:#636366;">
        <div class="empty-state__text">No orders found</div>
      </td></tr>`;
    if (pager) pager.innerHTML = '';
    return;
  }

  tbody.innerHTML = page.map(order => {
    const date = order.createdAt?.toDate?.()
      ? order.createdAt.toDate().toLocaleDateString('en-GH', { day:'2-digit', month:'short', year:'numeric' })
      : (order.timestamp ? new Date(order.timestamp).toLocaleDateString('en-GH', { day:'2-digit', month:'short' }) : '—');
    const items = (order.items || []).map(i => `${i.name} (${i.variant}) ×${i.qty}`).join(', ');
    const total = order.total ? '₵' + Number(order.total).toLocaleString('en-GH') : '—';
    const shortId = (order.id || '').slice(-6).toUpperCase();

    return `
      <tr>
        <td class="order-id">#${shortId}</td>
        <td class="customer">${order.name || '—'}</td>
        <td>${order.phone || '—'}</td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${items}">${items || '—'}</td>
        <td class="amount">${total}</td>
        <td>${order.location || '—'}</td>
        <td><span class="status-chip ${order.status || 'pending'}">${capitalize(order.status || 'pending')}</span></td>
        <td>
          <button class="action-btn" data-view-order="${order.id}">View</button>
          <a href="https://wa.me/233${(order.phone||'').replace(/^0/,'').replace(/\D/g,'')}" target="_blank" rel="noopener"
             class="action-btn" style="display:inline-flex;align-items:center;color:#25D366;">
            WhatsApp
          </a>
        </td>
      </tr>
    `;
  }).join('');

  // Pagination
  if (pager) {
    const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
    if (totalPages <= 1) { pager.innerHTML = ''; return; }
    pager.innerHTML = Array.from({ length: totalPages }, (_, i) => `
      <button class="page-btn ${i + 1 === currentPage ? 'active' : ''}" data-page="${i+1}">${i+1}</button>
    `).join('');
  }
}

function goToPage(page) {
  currentPage = page;
  renderOrdersTable();
}

/* ── Order Modal ──────────────────────────────────────────── */
function openOrderModal(orderId) {
  selectedOrder = allOrders.find(o => o.id === orderId);
  if (!selectedOrder) return;

  const modal   = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (!modal || !content) return;

  const date = selectedOrder.createdAt?.toDate?.()
    ? selectedOrder.createdAt.toDate().toLocaleString('en-GH')
    : (selectedOrder.timestamp ? new Date(selectedOrder.timestamp).toLocaleString('en-GH') : '—');

  const items = (selectedOrder.items || []).map(i =>
    `<div style="display:flex;justify-content:space-between;padding:0.4rem 0;font-size:0.825rem;border-bottom:1px solid rgba(255,255,255,0.05);">
      <span style="color:#a1a1a6;">${i.name} (${i.variant}) ×${i.qty}</span>
      <span style="color:#0a84ff;font-weight:700;">₵${(i.price*i.qty).toLocaleString('en-GH')}</span>
    </div>`
  ).join('');

  const waLink = `https://wa.me/233${(selectedOrder.phone||'').replace(/^0/,'').replace(/\D/g,'')}`;

  content.innerHTML = `
    <div class="modal-row"><span class="key">Order ID</span><span class="value">#${selectedOrder.id.slice(-6).toUpperCase()}</span></div>
    <div class="modal-row"><span class="key">Date</span><span class="value">${date}</span></div>
    <div class="modal-row"><span class="key">Customer</span><span class="value">${selectedOrder.name||'—'}</span></div>
    <div class="modal-row"><span class="key">Phone</span>
      <span class="value">
        <a href="tel:${selectedOrder.phone}" style="color:#0a84ff;">${selectedOrder.phone||'—'}</a>
        &nbsp;|&nbsp;
        <a href="${waLink}" target="_blank" style="color:#25D366;">WhatsApp</a>
      </span>
    </div>
    <div class="modal-row"><span class="key">Delivery Location</span><span class="value">${selectedOrder.location||'—'}</span></div>
    <div class="modal-row"><span class="key">Notes</span><span class="value">${selectedOrder.notes||'—'}</span></div>
    <div style="margin:1rem 0;">
      <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#636366;margin-bottom:0.5rem;">Items Ordered</div>
      ${items}
      <div style="display:flex;justify-content:space-between;padding:0.75rem 0;font-weight:800;color:#f5f5f7;">
        <span>Total</span><span style="color:#0a84ff;">₵${Number(selectedOrder.total||0).toLocaleString('en-GH')}</span>
      </div>
    </div>
    <div class="modal-status-row">
      <span style="font-size:0.8rem;color:#86868b;">Update Status:</span>
      <select class="status-select" id="status-select">
        <option value="pending"   ${selectedOrder.status==='pending'   ? 'selected':''}>Pending</option>
        <option value="confirmed" ${selectedOrder.status==='confirmed' ? 'selected':''}>Confirmed</option>
        <option value="delivered" ${selectedOrder.status==='delivered' ? 'selected':''}>Delivered</option>
        <option value="cancelled" ${selectedOrder.status==='cancelled' ? 'selected':''}>Cancelled</option>
      </select>
    </div>
  `;

  content.querySelector('#status-select')?.addEventListener('change', (e) => {
    updateOrderStatus(selectedOrder.id, e.target.value);
  });

  modal.classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay')?.classList.remove('open');
  selectedOrder = null;
}

/* ── Update Order Status ──────────────────────────────────── */
async function updateOrderStatus(orderId, newStatus) {
  try {
    const db = firebase.firestore();
    await db.collection('orders').doc(orderId).update({ status: newStatus });
    showAdminToast(`✅ Order marked as ${newStatus}`);
    // Update local state immediately
    const o = allOrders.find(o => o.id === orderId);
    if (o) o.status = newStatus;
    renderOrdersTable();
    updateStats();
  } catch (e) {
    showAdminToast('❌ Failed to update order', 'error');
    console.error(e);
  }
}

/* ── Product Management ───────────────────────────────────── */
let activeProdCat = 'all';
let prodSearchQuery = '';

async function initProductManagement() {
  const productSection = document.getElementById('section-products');
  if (!productSection) return;

  // First, fetch existing custom prices from Firestore or localStorage
  await loadCustomPrices();

  renderProductsAdmin();

  // Category filter tabs
  document.querySelectorAll('#admin-prod-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#admin-prod-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeProdCat = tab.dataset.cat;
      renderProductsAdmin();
    });
  });

  // Search filter
  document.getElementById('admin-products-search')?.addEventListener('input', (e) => {
    prodSearchQuery = (e.target.value || '').toLowerCase().trim();
    renderProductsAdmin();
  });

  // Save button
  document.getElementById('save-products-btn')?.addEventListener('click', saveProductsToFirestore);

  // Reset defaults button
  document.getElementById('reset-products-btn')?.addEventListener('click', resetProductsToDefaults);
}

function renderProductsAdmin() {
  const container = document.getElementById('admin-products-list');
  if (!container) return;

  let prods = getAllProducts();

  // Category filter
  if (activeProdCat === 'iphones') {
    prods = prods.filter(p => p.category === 'iphones');
  } else if (activeProdCat === 'laptops') {
    prods = prods.filter(p => p.category === 'laptops');
  } else if (activeProdCat === 'accessories') {
    prods = prods.filter(p => p.category === 'accessories' || p.category === 'watches');
  }

  // Search filter
  if (prodSearchQuery) {
    prods = prods.filter(p =>
      p.name.toLowerCase().includes(prodSearchQuery) ||
      (p.desc || '').toLowerCase().includes(prodSearchQuery) ||
      p.id.toLowerCase().includes(prodSearchQuery)
    );
  }

  if (prods.length === 0) {
    container.innerHTML = `
      <div style="padding:3rem 1rem;text-align:center;color:#86868b;">
        <div style="font-size:1.5rem;margin-bottom:0.5rem;">🔍</div>
        <div style="font-weight:700;color:#f5f5f7;">No matching devices found</div>
        <div style="font-size:0.8rem;margin-top:0.25rem;">Try adjusting your search query or switching tabs.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = prods.map(p => {
    const isPagesDir = window.location.pathname.includes('/admin/');
    const resolvedImg = isPagesDir ? '../' + p.image : p.image;
    const resolvedFallback = isPagesDir ? '../' + p.imageFallback : p.imageFallback;

    return `
      <div class="admin-product-row" data-product-id="${p.id}" style="display:flex;align-items:center;gap:1rem;padding:0.9rem 1.15rem;border-bottom:1px solid rgba(255,255,255,0.06);flex-wrap:wrap;background:rgba(255,255,255,0.01);">
        <img src="${resolvedImg}" alt="${p.name}" style="width:48px;height:48px;object-fit:contain;border-radius:10px;background:#ffffff;padding:4px;flex-shrink:0;" onerror="this.src='${resolvedFallback}'">
        <div style="flex:1;min-width:180px;">
          <div style="font-weight:800;font-size:0.9rem;color:#f5f5f7;line-height:1.3;">${p.name}</div>
          <div style="font-size:0.75rem;color:#86868b;margin-top:2px;">
            <span style="text-transform:uppercase;letter-spacing:0.04em;color:#38bdf8;font-weight:700;">${p.category}</span> &bull; ${p.storage.length} variant${p.storage.length > 1 ? 's' : ''}
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:0.6rem;align-items:center;margin-left:auto;">
          ${p.storage.map(s => {
            const currentPrice = p.price[s] !== undefined ? p.price[s] : '';
            return `
              <div style="display:flex;flex-direction:column;gap:3px;align-items:flex-start;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:4px 8px;">
                <span style="font-size:0.68rem;color:#94a3b8;font-weight:700;">${s}</span>
                <div style="display:flex;align-items:center;gap:3px;">
                  <span style="font-size:0.75rem;color:#38bdf8;font-weight:700;">₵</span>
                  <input type="number" class="price-input" style="width:85px;padding:0.25rem 0.4rem;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.18);border-radius:6px;color:#ffffff;font-size:0.825rem;font-weight:700;font-family:inherit;outline:none;"
                    value="${currentPrice}" data-product="${p.id}" data-variant="${s}" placeholder="${currentPrice}">
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

async function saveProductsToFirestore() {
  const saveBtn = document.getElementById('save-products-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving Prices…';
  }

  // Update in-memory PRODUCTS object from inputs
  let updatedCount = 0;
  const priceMap = {};

  document.querySelectorAll('.price-input').forEach(input => {
    const { product: pid, variant } = input.dataset;
    const val = parseFloat(input.value);
    if (!isNaN(val) && val > 0) {
      const prod = getProductById(pid);
      if (prod) {
        prod.price[variant] = val;
        if (!priceMap[pid]) priceMap[pid] = {};
        priceMap[pid][variant] = val;
        updatedCount++;
      }
    }
  });

  // Save to localStorage as instant cache
  try {
    localStorage.setItem('styj_custom_prices', JSON.stringify(priceMap));
  } catch (e) {}

  // Save to Firestore as settings/catalog
  try {
    const db = firebase.firestore();
    const snapshot = getAllProducts().map(p => ({
      id:      p.id,
      name:    p.name,
      price:   p.price,
      storage: p.storage,
    }));
    await db.collection('settings').doc('catalog').set({
      products: snapshot,
      priceMap: priceMap,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'admin'
    });
    showAdminToast('✅ Prices saved live! Storefront is updated.');
  } catch (e) {
    console.error('Firestore save error:', e);
    showAdminToast('⚠️ Saved locally. Check database connection.', 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Save Prices Live &rarr;';
    }
  }
}

async function resetProductsToDefaults() {
  if (!confirm('Are you sure you want to reset all product prices to original defaults?')) return;
  try {
    localStorage.removeItem('styj_custom_prices');
    const db = firebase.firestore();
    await db.collection('settings').doc('catalog').delete();
    showAdminToast('Defaults restored. Reloading…');
    setTimeout(() => window.location.reload(), 800);
  } catch (e) {
    localStorage.removeItem('styj_custom_prices');
    window.location.reload();
  }
}

/* ── Load custom prices from Firestore / localStorage ─────── */
async function loadCustomPrices() {
  // 1. First check local cache for 0ms render
  try {
    const cached = localStorage.getItem('styj_custom_prices');
    if (cached) {
      const priceMap = JSON.parse(cached);
      Object.keys(priceMap).forEach(pid => {
        const prod = getProductById(pid);
        if (prod && priceMap[pid]) {
          prod.price = { ...prod.price, ...priceMap[pid] };
        }
      });
    }
  } catch (e) {}

  // 2. Fetch live settings/catalog from Firestore
  try {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      const db = firebase.firestore();
      const doc = await db.collection('settings').doc('catalog').get();
      if (doc.exists) {
        const data = doc.data();
        if (data.priceMap) {
          Object.keys(data.priceMap).forEach(pid => {
            const prod = getProductById(pid);
            if (prod && data.priceMap[pid]) {
              prod.price = { ...prod.price, ...data.priceMap[pid] };
            }
          });
          localStorage.setItem('styj_custom_prices', JSON.stringify(data.priceMap));
        } else if (data.products && Array.isArray(data.products)) {
          const map = {};
          data.products.forEach(p => {
            const prod = getProductById(p.id);
            if (prod && p.price) {
              prod.price = { ...prod.price, ...p.price };
              map[p.id] = prod.price;
            }
          });
          localStorage.setItem('styj_custom_prices', JSON.stringify(map));
        }
      }
    }
  } catch (e) {
    console.warn('Could not fetch custom prices:', e);
  }
}

/* ── Admin Toast ──────────────────────────────────────────── */
function showAdminToast(msg, type = 'success') {
  const existing = document.querySelector('.admin-toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'admin-toast';
  el.textContent = msg;
  Object.assign(el.style, {
    position: 'fixed',
    bottom: '1.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    background: type === 'error' ? 'rgba(255,69,58,0.9)' : 'rgba(48,209,88,0.9)',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '99px',
    fontSize: '0.875rem',
    fontWeight: '600',
    zIndex: 9999,
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(12px)',
    animation: 'toastIn 0.3s ease',
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* ── Utils ────────────────────────────────────────────────── */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

/* ── DOM Ready ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('login-form'))    initLoginPage();
  if (document.getElementById('admin-sidebar')) initDashboard();
});
