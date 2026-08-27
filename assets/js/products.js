/**
 * STY. J NEXUS — Product Catalog
 * Edit prices and add new products here.
 * Currency: GHS (₵)
 */

const PRODUCTS = {

  /* ── iPhones ─────────────────────────────────────────── */
  iphones: [
    {
      id: 'iphone-17-pro-max',
      name: 'iPhone 17 Pro Max',
      category: 'iphones',
      badge: 'New',
      badgeType: 'badge-blue',
      desc: 'A19 Pro · 6.9″ Super Retina XDR · ProRes Video',
      storage: ['256GB', '512GB', '1TB'],
      price: { '256GB': 25500, '512GB': 28000, '1TB': 32000 },
      image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-17-pro-finish-select-202509-6-9inch-deepblue_FMT_WHH?wid=800&hei=800&fmt=p-jpg&qlt=80',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-17-pro-17-pro-max-hero.png',
      colors: ['Deep Blue', 'Cosmic Orange', 'Natural Titanium', 'Black Titanium', 'White Titanium'],
      featured: true,
    },
    {
      id: 'iphone-17-pro',
      name: 'iPhone 17 Pro',
      category: 'iphones',
      badge: 'New',
      badgeType: 'badge-blue',
      desc: 'A19 Pro · 6.3″ Super Retina XDR · Titanium',
      storage: ['128GB', '256GB', '512GB', '1TB'],
      price: { '128GB': 20500, '256GB': 23000, '512GB': 25500, '1TB': 29000 },
      image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-17-pro-finish-select-202509-6-3inch-deepblue_FMT_WHH?wid=800&hei=800&fmt=p-jpg&qlt=80',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-17-pro-17-pro-max-hero.png',
      colors: ['Deep Blue', 'Cosmic Orange', 'Natural Titanium', 'Black Titanium', 'White Titanium'],
      featured: true,
    },
    {
      id: 'iphone-17',
      name: 'iPhone 17',
      category: 'iphones',
      badge: 'New',
      badgeType: 'badge-blue',
      desc: 'A18 · 6.1″ Super Retina XDR · 48MP Camera',
      storage: ['128GB', '256GB', '512GB'],
      price: { '128GB': 14500, '256GB': 16500, '512GB': 19000 },
      image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-17-finish-select-202509-6-1inch-pink_FMT_WHH?wid=800&hei=800&fmt=p-jpg&qlt=80',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-17.png',
      colors: ['Sky Blue', 'Pink', 'Black', 'White', 'Teal'],
      featured: true,
    },
    {
      id: 'iphone-16-pro-max',
      name: 'iPhone 16 Pro Max',
      category: 'iphones',
      badge: 'Hot',
      badgeType: 'badge-gold',
      desc: 'A18 Pro · 6.9″ · Camera Control · ProRes',
      storage: ['256GB', '512GB', '1TB'],
      price: { '256GB': 22000, '512GB': 25000, '1TB': 28500 },
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-9inch-deserttitanium?wid=800&hei=800&fmt=p-jpg&qlt=80',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-16-pro-16-pro-max-hero.png',
      colors: ['Desert Titanium', 'Natural Titanium', 'Black Titanium', 'White Titanium'],
      featured: true,
    },
    {
      id: 'iphone-16-pro',
      name: 'iPhone 16 Pro',
      category: 'iphones',
      badge: 'Hot',
      badgeType: 'badge-gold',
      desc: 'A18 Pro · 6.3″ · Camera Control · 4K 120fps',
      storage: ['128GB', '256GB', '512GB', '1TB'],
      price: { '128GB': 18000, '256GB': 20000, '512GB': 22500, '1TB': 26000 },
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-deserttitanium?wid=800&hei=800&fmt=p-jpg&qlt=80',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-16-pro-16-pro-max-hero.png',
      colors: ['Desert Titanium', 'Natural Titanium', 'Black Titanium', 'White Titanium'],
      featured: false,
    },
    {
      id: 'iphone-16',
      name: 'iPhone 16',
      category: 'iphones',
      badge: null,
      desc: 'A18 · 6.1″ · Action Button · Camera Control',
      storage: ['128GB', '256GB', '512GB'],
      price: { '128GB': 12500, '256GB': 14500, '512GB': 16500 },
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-finish-select-202409-6-1inch-pink?wid=800&hei=800&fmt=p-jpg&qlt=80',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-16.png',
      colors: ['Pink', 'Teal', 'Ultramarine', 'White', 'Black'],
      featured: false,
    },
    {
      id: 'iphone-15-pro-max',
      name: 'iPhone 15 Pro Max',
      category: 'iphones',
      badge: null,
      desc: 'A17 Pro · 6.7″ · Titanium · USB 3 · 5× zoom',
      storage: ['256GB', '512GB', '1TB'],
      price: { '256GB': 18500, '512GB': 21000, '1TB': 24000 },
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-bluetitanium?wid=800&hei=800&fmt=p-jpg&qlt=80',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-15-pro-max.png',
      colors: ['Blue Titanium', 'Black Titanium', 'Natural Titanium', 'White Titanium'],
      featured: false,
    },
    {
      id: 'iphone-15',
      name: 'iPhone 15',
      category: 'iphones',
      badge: null,
      desc: 'A16 Bionic · 6.1″ Dynamic Island · USB-C',
      storage: ['128GB', '256GB', '512GB'],
      price: { '128GB': 9500, '256GB': 11500, '512GB': 13500 },
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=800&hei=800&fmt=p-jpg&qlt=80',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-15.png',
      colors: ['Pink', 'Yellow', 'Green', 'Blue', 'Black'],
      featured: false,
    },
    {
      id: 'iphone-14',
      name: 'iPhone 14',
      category: 'iphones',
      badge: null,
      desc: 'A15 Bionic · 6.1″ · Crash Detection · 12MP',
      storage: ['128GB', '256GB', '512GB'],
      price: { '128GB': 7500, '256GB': 9000, '512GB': 11000 },
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch-purple?wid=800&hei=800&fmt=p-jpg&qlt=80',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-14.png',
      colors: ['Purple', 'Midnight', 'Starlight', 'Blue', 'Red'],
      featured: false,
    },
    {
      id: 'iphone-13',
      name: 'iPhone 13',
      category: 'iphones',
      badge: null,
      desc: 'A15 Bionic · 6.1″ · Cinematic Mode · 5G',
      storage: ['128GB', '256GB', '512GB'],
      price: { '128GB': 5500, '256GB': 7000, '512GB': 8500 },
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-finish-select-202207-6-1inch-pink?wid=800&hei=800&fmt=p-jpg&qlt=80',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-13.png',
      colors: ['Pink', 'Blue', 'Midnight', 'Starlight', 'Green', 'Red'],
      featured: false,
    },
    {
      id: 'iphone-12',
      name: 'iPhone 12',
      category: 'iphones',
      badge: null,
      desc: 'A14 Bionic · 6.1″ · 5G · Ceramic Shield',
      storage: ['64GB', '128GB', '256GB'],
      price: { '64GB': 3500, '128GB': 4500, '256GB': 5500 },
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-12-select-family-2024?wid=800&hei=800&fmt=p-jpg&qlt=80',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-12.png',
      colors: ['Black', 'White', 'Blue', 'Purple', 'Green', 'Red'],
      featured: false,
    },
    {
      id: 'iphone-se-3',
      name: 'iPhone SE (3rd Gen)',
      category: 'iphones',
      badge: 'Value',
      badgeType: 'badge-green',
      desc: 'A15 Bionic · 4.7″ · Touch ID · 5G · Compact',
      storage: ['64GB', '128GB', '256GB'],
      price: { '64GB': 2800, '128GB': 3500, '256GB': 4500 },
      image: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111866_sp867-iphone-se-3gen.png',
      imageFallback: 'https://cdsassets.apple.com/live/SZLF0YNV/images/sp/111866_sp867-iphone-se-3gen.png',
      colors: ['Midnight', 'Starlight', 'Red'],
      featured: false,
    },
  ],

  /* ── Laptops ─────────────────────────────────────────── */
  laptops: [
    {
      id: 'macbook-air-m4-15',
      name: 'MacBook Air 15"',
      category: 'laptops',
      badge: 'New',
      badgeType: 'badge-blue',
      desc: 'Apple M4 · 16GB RAM · 256GB SSD · 18-hr battery',
      storage: ['256GB', '512GB', '1TB'],
      price: { '256GB': 18500, '512GB': 21000, '1TB': 24500 },
      image: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/macbook-air-15-m4.png',
      imageFallback: 'https://www.apple.com/v/macbook-air/z/images/overview/design/design_screen__dyxf1fkdmpme_large.jpg',
      featured: true,
    },
    {
      id: 'macbook-air-m4-13',
      name: 'MacBook Air 13"',
      category: 'laptops',
      badge: 'New',
      badgeType: 'badge-blue',
      desc: 'Apple M4 · 16GB RAM · Liquid Retina · 18-hr battery',
      storage: ['256GB', '512GB', '1TB'],
      price: { '256GB': 15500, '512GB': 18000, '1TB': 21000 },
      image: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/macbook-air-13-m4.png',
      imageFallback: 'https://www.apple.com/v/macbook-air/z/images/overview/design/design_screen__dyxf1fkdmpme_large.jpg',
      featured: true,
    },
    {
      id: 'macbook-pro-14',
      name: 'MacBook Pro 14"',
      category: 'laptops',
      badge: 'Pro',
      badgeType: 'badge-gold',
      desc: 'Apple M4 Pro · 24GB · Liquid Retina XDR · 22-hr',
      storage: ['512GB', '1TB', '2TB'],
      price: { '512GB': 28000, '1TB': 32000, '2TB': 38000 },
      image: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/macbook-pro-14-m4.png',
      imageFallback: 'https://www.apple.com/v/macbook-pro/ag/images/overview/design/design_screen__dyxf1fkdmpme_large.jpg',
      featured: false,
    },
    {
      id: 'hp-spectre-x360',
      name: 'HP Spectre x360 14"',
      category: 'laptops',
      badge: null,
      desc: 'Intel Core Ultra 7 · 16GB RAM · 1TB SSD · OLED Touch',
      storage: ['512GB', '1TB'],
      price: { '512GB': 16500, '1TB': 19500 },
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=600&fit=crop&auto=format',
      imageFallback: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=600&fit=crop',
      featured: false,
    },
    {
      id: 'dell-xps-15',
      name: 'Dell XPS 15',
      category: 'laptops',
      badge: null,
      desc: 'Intel Core i7-13700H · 16GB · 512GB · OLED Display',
      storage: ['512GB', '1TB'],
      price: { '512GB': 18000, '1TB': 21000 },
      image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop&auto=format',
      imageFallback: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop',
      featured: false,
    },
    {
      id: 'lenovo-thinkpad-x1',
      name: 'Lenovo ThinkPad X1 Carbon',
      category: 'laptops',
      badge: null,
      desc: 'Intel Core Ultra 5 · 16GB · 512GB · 14" IPS · 2.48lbs',
      storage: ['256GB', '512GB', '1TB'],
      price: { '256GB': 12500, '512GB': 15000, '1TB': 18000 },
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop&auto=format',
      imageFallback: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop',
      featured: false,
    },
    {
      id: 'hp-pavilion-15',
      name: 'HP Pavilion 15',
      category: 'laptops',
      badge: 'Value',
      badgeType: 'badge-green',
      desc: 'AMD Ryzen 5 · 8GB RAM · 512GB SSD · Full HD',
      storage: ['256GB', '512GB'],
      price: { '256GB': 5500, '512GB': 7000 },
      image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=600&fit=crop&auto=format',
      imageFallback: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=600&fit=crop',
      featured: false,
    },
    {
      id: 'lenovo-ideapad-5',
      name: 'Lenovo IdeaPad 5',
      category: 'laptops',
      badge: 'Value',
      badgeType: 'badge-green',
      desc: 'AMD Ryzen 5 · 8GB RAM · 256GB SSD · 15.6" FHD',
      storage: ['256GB', '512GB'],
      price: { '256GB': 4800, '512GB': 6200 },
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop&auto=format',
      imageFallback: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop',
      featured: false,
    },
  ],

  /* ── Apple Watch ─────────────────────────────────────── */
  watches: [
    {
      id: 'apple-watch-ultra-2',
      name: 'Apple Watch Ultra 2',
      category: 'watches',
      badge: 'Pro',
      badgeType: 'badge-gold',
      desc: '49mm Titanium · Precision GPS · 36hr battery',
      storage: ['One Size'],
      price: { 'One Size': 12500 },
      image: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/apple-watch-ultra-2.png',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/apple-watch-ultra-2.png',
      featured: true,
    },
    {
      id: 'apple-watch-s10',
      name: 'Apple Watch Series 10',
      category: 'watches',
      badge: 'New',
      badgeType: 'badge-blue',
      desc: '46mm · Thinnest ever · Sleep Apnea detection',
      storage: ['42mm', '46mm'],
      price: { '42mm': 5500, '46mm': 6200 },
      image: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/apple-watch-series-10.png',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/apple-watch-series-10.png',
      featured: true,
    },
    {
      id: 'apple-watch-se-2',
      name: 'Apple Watch SE (2nd Gen)',
      category: 'watches',
      badge: 'Value',
      badgeType: 'badge-green',
      desc: '44mm · Crash Detection · Family Setup · S8 chip',
      storage: ['40mm', '44mm'],
      price: { '40mm': 2800, '44mm': 3200 },
      image: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/apple-watch-se-2.png',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/apple-watch-se-2.png',
      featured: false,
    },
  ],

  /* ── Accessories ──────────────────────────────────────── */
  accessories: [
    {
      id: 'airpods-4',
      name: 'AirPods 4',
      category: 'accessories',
      badge: 'New',
      badgeType: 'badge-blue',
      desc: 'Active Noise Cancellation · H2 chip · USB-C',
      storage: ['Standard', 'with ANC'],
      price: { 'Standard': 1500, 'with ANC': 2200 },
      image: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/airpods-4.png',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/airpods-4.png',
      featured: true,
    },
    {
      id: 'airpods-pro-2',
      name: 'AirPods Pro (2nd Gen)',
      category: 'accessories',
      badge: 'Hot',
      badgeType: 'badge-gold',
      desc: 'Adaptive Audio · H2 chip · USB-C · Hearing Aid',
      storage: ['One Size'],
      price: { 'One Size': 3500 },
      image: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/airpods-pro-2nd-gen.png',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/airpods-pro-2nd-gen.png',
      featured: true,
    },
    {
      id: 'magsafe-charger',
      name: 'MagSafe Charger',
      category: 'accessories',
      badge: null,
      desc: '15W fast wireless · Attach magnetically · USB-C',
      storage: ['1m', '2m'],
      price: { '1m': 350, '2m': 450 },
      image: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/magsafe-charger.png',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/magsafe-charger.png',
      featured: false,
    },
    {
      id: 'apple-usb-c-adapter',
      name: 'USB-C 30W Adapter',
      category: 'accessories',
      badge: null,
      desc: 'Compatible with iPhone 15+, MacBook · Fast charge',
      storage: ['One Size'],
      price: { 'One Size': 250 },
      image: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/usb-c-30w-adapter.png',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/usb-c-30w-adapter.png',
      featured: false,
    },
    {
      id: 'iphone-case-clear',
      name: 'iPhone Case (Clear)',
      category: 'accessories',
      badge: null,
      desc: 'Fits iPhone 13–17 Pro Max · Drop protection',
      storage: ['iPhone 15', 'iPhone 16', 'iPhone 17'],
      price: { 'iPhone 15': 120, 'iPhone 16': 150, 'iPhone 17': 180 },
      image: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-16-clear-case.png',
      imageFallback: 'https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/iphone-16-clear-case.png',
      featured: false,
    },
    {
      id: 'screen-protector',
      name: 'Tempered Glass Protector',
      category: 'accessories',
      badge: null,
      desc: '9H hardness · Anti-scratch · Full coverage',
      storage: ['iPhone 15', 'iPhone 16', 'iPhone 17'],
      price: { 'iPhone 15': 80, 'iPhone 16': 90, 'iPhone 17': 100 },
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop&auto=format',
      imageFallback: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop',
      featured: false,
    },
    {
      id: 'anker-powerbank',
      name: 'Anker 20000mAh Power Bank',
      category: 'accessories',
      badge: null,
      desc: '65W Fast charging · Dual USB-C · LED display',
      storage: ['One Size'],
      price: { 'One Size': 950 },
      image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop&auto=format',
      imageFallback: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop',
      featured: false,
    },
    {
      id: 'lightning-cable',
      name: 'USB-C to USB-C Cable',
      category: 'accessories',
      badge: null,
      desc: '2m · 240W PD · Braided · iPhone 15+ compatible',
      storage: ['1m', '2m'],
      price: { '1m': 75, '2m': 110 },
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&auto=format',
      imageFallback: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      featured: false,
    },
  ],
};

/* ── Helpers ──────────────────────────────────────────────── */

/** Get the min price for a product */
function getMinPrice(product) {
  return Math.min(...Object.values(product.price));
}

/** Format price as GHS */
function formatPrice(amount) {
  return '₵' + amount.toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/** Get all products as flat array */
function getAllProducts() {
  return Object.values(PRODUCTS).flat();
}

/** Get featured products across all categories */
function getFeaturedProducts() {
  return getAllProducts().filter(p => p.featured);
}

/** Get products by category */
function getProductsByCategory(category) {
  return PRODUCTS[category] || [];
}

/** Get a product by ID */
function getProductById(id) {
  return getAllProducts().find(p => p.id === id) || null;
}

/* ── WhatsApp Config ──────────────────────────────────────── */
const WA_NUMBER = '233553714373'; // Ghana format (country code + number)
const BUSINESS_NAME = 'STY. J Tech Hub';

function buildWhatsAppLink(message) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

function buildOrderWhatsAppLink(items) {
  const lines = items.map(i => `• ${i.name} (${i.variant}) x${i.qty} — ${formatPrice(i.price * i.qty)}`);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const msg = `Hello ${BUSINESS_NAME}! 👋\n\nI'd like to order:\n${lines.join('\n')}\n\n*Total: ${formatPrice(total)}*\n\nPlease confirm availability and delivery.`;
  return buildWhatsAppLink(msg);
}

/* ── Formspree Config ─────────────────────────────────────── */
// Replace with your actual Formspree endpoint after signing up at formspree.io
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/meaqjknp';

