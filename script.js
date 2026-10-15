/* =========================================================
   Moss & Clay shop: script (no libraries)
   Needs products.js to be loaded first (it defines the product list).
   - Cart and favorites are saved in localStorage, so they survive
     moving between index.html and product.html.
   - index.html   -> data-page="catalog"
   - product.html -> data-page="product"
   ========================================================= */

(() => {
  'use strict';

  const PRODUCTS = window.MC_PRODUCTS || [];
  const CATEGORIES = window.MC_CATEGORIES || [];
  // 4 columns on wide screens (8 per page = 2 full rows), 3 or 2 columns below that (9 per page)
  const wideScreen = window.matchMedia('(min-width: 1200px)');
  const pageSize = () => (wideScreen.matches ? 8 : 9);
  const MAX_QTY = 20;
  const KEY_CART = 'mc_cart';
  const KEY_FAV = 'mc_fav';

  const params = new URLSearchParams(window.location.search);

  /* ---------- Small helpers ---------- */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = (n) => '$' + Number(n).toFixed(2);
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const byId = (id) => PRODUCTS.find((p) => p.id === Number(id));

  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  /* ---------- Saved data (falls back to memory if localStorage is blocked) ---------- */
  const memory = {};
  const storage = {
    read(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (error) {
        return key in memory ? memory[key] : fallback;
      }
    },
    write(key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); }
      catch (error) { memory[key] = value; }
    },
  };

  // cart: { productId: quantity }      favs: [productId, ...]
  let cart = {};
  let favs = [];

  (function loadSaved() {
    const savedCart = storage.read(KEY_CART, {});
    Object.keys(savedCart || {}).forEach((id) => {
      const qty = Number(savedCart[id]);
      if (byId(id) && qty > 0) cart[Number(id)] = Math.min(qty, MAX_QTY);
    });
    const savedFavs = storage.read(KEY_FAV, []);
    favs = (Array.isArray(savedFavs) ? savedFavs : []).map(Number).filter((id) => byId(id));
  })();

  const cartCount = () => Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartTotal = () => Object.keys(cart).reduce((sum, id) => sum + byId(id).price * cart[id], 0);
  const isFav = (id) => favs.includes(Number(id));

  function saveAll() {
    storage.write(KEY_CART, cart);
    storage.write(KEY_FAV, favs);
    updateBadges();
  }

  function addToCart(id, qty = 1) {
    id = Number(id);
    cart[id] = Math.min(MAX_QTY, (cart[id] || 0) + qty);
    saveAll();
  }

  function setQty(id, qty) {
    id = Number(id);
    if (qty <= 0) delete cart[id];
    else cart[id] = Math.min(MAX_QTY, qty);
    saveAll();
  }

  function toggleFav(id) {
    id = Number(id);
    favs = isFav(id) ? favs.filter((x) => x !== id) : [...favs, id];
    saveAll();
    return isFav(id);
  }

  /* ---------- Screen reader message + small UI feedback ---------- */
  function announce(message) {
    const live = $('#liveStatus');
    if (!live) return;
    live.textContent = '';
    window.setTimeout(() => { live.textContent = message; }, 30);
  }

  function bump(el) {
    if (!el) return;
    el.classList.remove('bump');
    void el.offsetWidth;              // restart the animation
    el.classList.add('bump');
  }

  function flash(button, label = 'Added') {
    if (!button.dataset.label) button.dataset.label = button.textContent;
    button.textContent = label;
    button.classList.add('is-done');
    window.clearTimeout(Number(button.dataset.timer));
    button.dataset.timer = window.setTimeout(() => {
      button.textContent = button.dataset.label;
      button.classList.remove('is-done');
    }, 1400);
  }

  function updateBadges() {
    const cartEl = $('#cartCount');
    const favEl = $('#favCount');
    if (cartEl) {
      if (cartEl.textContent !== String(cartCount())) { cartEl.textContent = cartCount(); bump(cartEl); }
      cartEl.classList.toggle('is-zero', cartCount() === 0);
    }
    if (favEl) {
      if (favEl.textContent !== String(favs.length)) { favEl.textContent = favs.length; bump(favEl); }
      favEl.classList.toggle('is-zero', favs.length === 0);
    }

    $$('.fav[data-id]').forEach((button) => {
      const on = isFav(button.dataset.id);
      const product = byId(button.dataset.id);
      button.classList.toggle('is-fav', on);
      button.setAttribute('aria-pressed', String(on));
      button.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + product.name + (on ? ' from favorites' : ' to favorites'));
    });
  }

  /* ---------- Catalog page ---------- */
  const wantedCategory = params.get('category');
  const catalog = {
    category: CATEGORIES.some((c) => c.id === wantedCategory) ? wantedCategory : 'all',
    page: 1,
    favoritesOnly: params.get('view') === 'favorites',
  };

  function cardHTML(p, index) {
    const fallback = p.fallback ? ` data-fallback="${esc(p.fallback)}"` : '';
    return `
      <article class="card" style="--i:${index}">
        <div class="card__media">
          <a class="card__link" href="product.html?id=${p.id}" aria-label="${esc(p.name)}">
            <img src="${esc(p.image)}"${fallback} alt="${esc(p.name)}" loading="lazy" decoding="async">
          </a>
          <button type="button" class="fav" data-action="fav" data-id="${p.id}" aria-pressed="false" aria-label="Add ${esc(p.name)} to favorites">${HEART}</button>
        </div>
        <div class="card__head">
          <h3 class="card__title"><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
          <p class="card__price">${money(p.price)}</p>
        </div>
        <p class="card__size">${esc(p.size)}</p>
        <button type="button" class="btn-outline" data-action="add" data-id="${p.id}">Add to cart</button>
      </article>`;
  }

  function visibleProducts() {
    return PRODUCTS.filter((p) =>
      (catalog.category === 'all' || p.category === catalog.category) &&
      (!catalog.favoritesOnly || isFav(p.id)));
  }

  function renderFilters() {
    const box = $('#filters');
    box.innerHTML = CATEGORIES.map((c) =>
      `<button type="button" data-action="filter" data-value="${c.id}" aria-pressed="${c.id === catalog.category}">${esc(c.label)}</button>`
    ).join('');
  }

  function renderPager(totalPages) {
    const pager = $('#pager');
    if (totalPages <= 1) { pager.innerHTML = ''; return; }
    let html = '';
    if (catalog.page > 1) html += '<button type="button" data-action="page" data-value="prev" aria-label="Previous page">&larr;</button>';
    for (let n = 1; n <= totalPages; n += 1) {
      html += `<button type="button" data-action="page" data-value="${n}" aria-label="Page ${n}"${n === catalog.page ? ' aria-current="page"' : ''}>${n}</button>`;
    }
    if (catalog.page < totalPages) html += '<button type="button" data-action="page" data-value="next" aria-label="Next page">&rarr;</button>';
    pager.innerHTML = html;
  }

  function renderCatalog(focusGrid = false) {
    const list = visibleProducts();
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize()));
    catalog.page = Math.min(catalog.page, totalPages);
    const pageItems = list.slice((catalog.page - 1) * pageSize(), catalog.page * pageSize());
    const grid = $('#grid');

    if (pageItems.length) {
      grid.innerHTML = pageItems.map(cardHTML).join('');
    } else if (catalog.favoritesOnly) {
      grid.innerHTML = '<p class="empty">No favorites yet. Tap the heart on any piece to save it here. <a href="index.html">Browse the catalog</a></p>';
    } else {
      grid.innerHTML = '<p class="empty">Nothing here yet.</p>';
    }

    renderPager(totalPages);
    $$('#filters button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === catalog.category)));
    updateBadges();
    if (focusGrid) grid.focus({ preventScroll: true });
  }

  function initCatalog() {
    const hero = $('#hero');
    if (catalog.favoritesOnly) {
      if (hero) hero.hidden = true;
      $('#collectionTitle').textContent = 'Your favorites';
      document.title = 'Favorites | Moss & Clay';
    }

    // If img/hero.jpg exists, show it behind the text instead of the illustration
    const heroPhoto = $('.hero__photo');
    if (hero && heroPhoto) {
      const useIt = () => hero.classList.add('has-photo');
      if (heroPhoto.complete && heroPhoto.naturalWidth > 0) useIt();
      else heroPhoto.addEventListener('load', useIt);
    }

    renderFilters();
    renderCatalog();

    // If the window is resized across the wide-screen line, redraw with the right page size
    let lastSize = pageSize();
    const onResize = () => {
      if (pageSize() === lastSize) return;   // nothing to change
      lastSize = pageSize();
      renderCatalog();
    };
    if (wideScreen.addEventListener) wideScreen.addEventListener('change', onResize);
    else wideScreen.addListener(onResize);
  }

  /* ---------- Product page ---------- */
  const VIEWS = [
    { label: 'Front view', cls: 'view-1' },
    { label: 'Rim detail', cls: 'view-2' },
    { label: 'Close-up', cls: 'view-3' },
  ];
  let pdpQty = 1;

  function productHTML(p) {
    const fallback = p.fallback ? ` data-fallback="${esc(p.fallback)}"` : '';
    const img = (alt) => `<img src="${esc(p.image)}"${fallback} alt="${esc(alt)}">`;
    const thumbs = VIEWS.map((v, i) => `
      <button type="button" class="thumb${i === 0 ? ' is-active' : ''}" data-action="thumb" data-view="${i}" aria-pressed="${i === 0}" aria-label="${v.label}">
        <span class="thumb__box ${v.cls}"><img src="${esc(p.image)}"${fallback} alt="" loading="lazy"></span>
      </button>`).join('');

    return `
      <div class="pdp__gallery">
        <div class="pdp__main view-1" id="pdpMain">${img(p.name)}</div>
        <div class="pdp__thumbs" role="group" aria-label="Product views">${thumbs}</div>
      </div>
      <div class="pdp__info">
        <h1 class="pdp__title">${esc(p.name)}</h1>
        <p class="pdp__price">${money(p.price)}</p>
        <div class="pdp__actions">
          <div class="qty" role="group" aria-label="Quantity">
            <button type="button" data-action="pdp-minus" aria-label="Decrease quantity">&minus;</button>
            <output id="pdpQty" aria-live="polite">1</output>
            <button type="button" data-action="pdp-plus" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="btn-outline" data-action="pdp-add" data-id="${p.id}">Add to cart</button>
          <button type="button" class="fav" data-action="fav" data-id="${p.id}" aria-pressed="false" aria-label="Add ${esc(p.name)} to favorites">${HEART}</button>
        </div>
        <p class="pdp__desc">${esc(p.description)} Size: ${esc(p.size)}.</p>
      </div>`;
  }

  function initProduct() {
    const root = $('#product');
    const p = byId(params.get('id'));
    if (!p) {
      root.innerHTML = '<p class="empty">We could not find that piece. <a href="index.html">Back to the catalog</a></p>';
      $('#crumbCurrent').textContent = 'Not found';
      return;
    }
    document.title = p.name + ' | Moss & Clay';
    $('#crumbCurrent').textContent = p.name;
    root.innerHTML = productHTML(p);
    updateBadges();
  }

  function setPdpQty(value) {
    pdpQty = Math.max(1, Math.min(MAX_QTY, value));
    const out = $('#pdpQty');
    if (out) out.textContent = pdpQty;
  }

  function selectView(index) {
    const main = $('#pdpMain');
    VIEWS.forEach((v) => main.classList.remove(v.cls));
    main.classList.add(VIEWS[index].cls);
    $$('.thumb').forEach((t, i) => {
      t.classList.toggle('is-active', i === index);
      t.setAttribute('aria-pressed', String(i === index));
    });
  }

  /* ---------- Cart drawer ---------- */
  function cartItemHTML(p, qty) {
    const fallback = p.fallback ? ` data-fallback="${esc(p.fallback)}"` : '';
    return `
      <li class="cart-item">
        <a class="cart-item__img" href="product.html?id=${p.id}"><img src="${esc(p.image)}"${fallback} alt="${esc(p.name)}"></a>
        <div>
          <a class="cart-item__name" href="product.html?id=${p.id}">${esc(p.name)}</a>
          <span class="cart-item__price">${money(p.price)}</span>
          <div class="qty qty--sm" role="group" aria-label="Quantity of ${esc(p.name)}">
            <button type="button" data-action="cart-minus" data-id="${p.id}" aria-label="Decrease quantity of ${esc(p.name)}">&minus;</button>
            <output>${qty}</output>
            <button type="button" data-action="cart-plus" data-id="${p.id}" aria-label="Increase quantity of ${esc(p.name)}">+</button>
          </div>
        </div>
        <button type="button" class="link-btn" data-action="cart-remove" data-id="${p.id}" aria-label="Remove ${esc(p.name)} from cart">Remove</button>
      </li>`;
  }

  function renderCart() {
    const body = $('#cartBody');
    const foot = $('#cartFoot');
    if (!body || !foot) return;
    const ids = Object.keys(cart).map(Number);

    if (!ids.length) {
      body.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
      foot.innerHTML = '<button type="button" class="btn-outline btn-ghost" data-action="cart-close">Keep browsing</button>';
      return;
    }
    body.innerHTML = `<ul class="cart-list">${ids.map((id) => cartItemHTML(byId(id), cart[id])).join('')}</ul>`;
    foot.innerHTML = `
      <div class="cart-total"><span>Subtotal</span><span>${money(cartTotal())}</span></div>
      <button type="button" class="btn-outline" data-action="checkout">Checkout</button>
      <p class="cart-note" id="cartNote"></p>`;
  }

  function openCart() {
    const dialog = $('#cartDialog');
    if (!dialog) return;
    renderCart();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.classList.add('has-dialog');
  }

  function closeCart() {
    const dialog = $('#cartDialog');
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    document.body.classList.remove('has-dialog');
  }

  /* ---------- One click handler for every button ---------- */
  document.addEventListener('click', (event) => {
    const el = event.target.closest('[data-action]');
    if (!el) return;
    const { action, id, value, view } = el.dataset;

    switch (action) {
      case 'add': {
        addToCart(id, 1);
        flash(el, 'Added');
        announce(byId(id).name + ' added to your cart');
        break;
      }
      case 'pdp-add': {
        addToCart(id, pdpQty);
        flash(el, 'Added');
        announce(pdpQty + ' × ' + byId(id).name + ' added to your cart');
        break;
      }
      case 'fav': {
        const on = toggleFav(id);
        bump(el);
        announce(byId(id).name + (on ? ' saved to favorites' : ' removed from favorites'));
        if (catalog.favoritesOnly && document.body.dataset.page === 'catalog') renderCatalog();
        break;
      }
      case 'filter':
        catalog.category = value;
        catalog.page = 1;
        renderCatalog();
        break;
      case 'page': {
        const totalPages = Math.max(1, Math.ceil(visibleProducts().length / pageSize()));
        if (value === 'prev') catalog.page = Math.max(1, catalog.page - 1);
        else if (value === 'next') catalog.page = Math.min(totalPages, catalog.page + 1);
        else catalog.page = Number(value);
        renderCatalog(true);
        $('#grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
      case 'pdp-minus': setPdpQty(pdpQty - 1); break;
      case 'pdp-plus': setPdpQty(pdpQty + 1); break;
      case 'thumb': selectView(Number(view)); break;
      case 'cart-open': openCart(); break;
      case 'cart-close': closeCart(); break;
      case 'cart-plus': setQty(id, (cart[id] || 0) + 1); renderCart(); break;
      case 'cart-minus': setQty(id, (cart[id] || 0) - 1); renderCart(); break;
      case 'cart-remove': setQty(id, 0); renderCart(); break;
      case 'checkout': {
        const note = $('#cartNote');
        if (note) note.textContent = 'This is a demo shop, so checkout is not connected.';
        break;
      }
      default: break;
    }
  });

  /* ---------- Dialog: click on the dark backdrop closes it ---------- */
  const dialog = $('#cartDialog');
  if (dialog) {
    dialog.addEventListener('click', (event) => { if (event.target === dialog) closeCart(); });
    dialog.addEventListener('close', () => document.body.classList.remove('has-dialog'));
  }

  /* ---------- If a photo is missing, use its fallback picture ---------- */
  document.addEventListener('error', (event) => {
    const img = event.target;
    if (img.tagName === 'IMG' && img.dataset.fallback && !img.dataset.failed) {
      img.dataset.failed = '1';
      img.src = img.dataset.fallback;
    }
  }, true);

  /* ---------- Header gets a line and shadow after scrolling ---------- */
  const header = $('#siteHeader');
  let ticking = false;
  const onScroll = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Newsletter (demo: nothing is sent) ---------- */
  const newsletter = $('#newsletter');
  if (newsletter) {
    newsletter.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = $('#nlEmail');
      const status = $('#nlStatus');
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      if (!valid) {
        status.classList.add('is-error');
        status.textContent = 'Please enter a valid email address.';
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      status.classList.remove('is-error');
      input.removeAttribute('aria-invalid');
      status.textContent = "Thanks, you're on the list.";
      newsletter.reset();
    });
  }

  /* ---------- Start ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  const page = document.body.dataset.page;
  if (page === 'catalog') initCatalog();
  if (page === 'product') initProduct();
  updateBadges();
})();
