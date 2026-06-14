document.addEventListener('DOMContentLoaded', async () => {
  await Store.init();
  initLoader();
  initCursorLight();
  initScrollReveal();
  initParallax();
  initBrandStory();
  initCarousel();
  initNewsletter();
  initNav();
  initModals();
  initSearch();
  initCartDrawer();
  initPageSpecific();
});

function initLoader() {
  const loader = document.querySelector('.loader');
  if (!loader) return;
  const hide = () => setTimeout(() => loader.classList.add('hidden'), 1800);
  if (document.readyState === 'complete') hide();
  else window.addEventListener('load', hide);
}

function initCursorLight() {
  const light = document.querySelector('.cursor-light');
  if (!light || window.matchMedia('(pointer: coarse)').matches) return;

  let x = 0, y = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => {
    x = e.clientX;
    y = e.clientY;
  });

  function animate() {
    cx += (x - cx) * 0.08;
    cy += (y - cy) * 0.08;
    light.style.transform = `translate(${cx - 200}px, ${cy - 200}px)`;
    requestAnimationFrame(animate);
  }
  animate();
}

let revealObserver;

function initScrollReveal() {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  observeRevealElements();
}

function observeRevealElements(root = document) {
  if (!revealObserver) return;
  root.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible), .reveal-scale:not(.visible)').forEach(el => {
    revealObserver.observe(el);
  });
}

function initParallax() {
  const items = document.querySelectorAll('[data-parallax]');
  if (!items.length) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    items.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const rect = el.getBoundingClientRect();
      const target = el.querySelector('img') || el;
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        target.style.transform = `translateY(${(scrollY - el.offsetTop) * speed * 0.1}px)`;
      }
    });
  }, { passive: true });
}

function initBrandStory() {
  const words = document.querySelectorAll('.story-word');
  if (!words.length) return;

  let current = 0;
  setInterval(() => {
    words.forEach((w, i) => w.classList.toggle('active', i === current));
    current = (current + 1) % words.length;
  }, 3000);
}

function initCarousel() {
  const track = document.querySelector('.carousel-track');
  const prev = document.querySelector('.carousel-prev');
  const next = document.querySelector('.carousel-next');
  if (!track) return;

  let offset = 0;
  const cardWidth = () => (track.querySelector('.product-card')?.offsetWidth ?? 280) + 24;

  next?.addEventListener('click', () => {
    const max = track.scrollWidth - track.parentElement.offsetWidth;
    offset = Math.min(offset + cardWidth(), max);
    track.style.transform = `translateX(-${offset}px)`;
  });

  prev?.addEventListener('click', () => {
    offset = Math.max(offset - cardWidth(), 0);
    track.style.transform = `translateX(-${offset}px)`;
  });
}

function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    if (email) {
      try {
        await Store.subscribeNewsletter(email);
        Store.showToast('Welcome to the 8:8 community');
        form.reset();
      } catch (error) {
        Store.showToast(error.message || 'Could not subscribe');
      }
    }
  });
}

function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');

  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  toggle?.addEventListener('click', () => {
    menu?.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        menu?.classList.remove('open');
        toggle?.classList.remove('active');
      }
    });
  });
}

function initCartDrawer() {
  if (document.querySelector('.cart-drawer')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div class="cart-drawer-overlay" data-cart-close></div>
    <aside class="cart-drawer" aria-hidden="true" aria-label="Shopping cart">
      <div class="cart-drawer__header">
        <div>
          <span class="cart-drawer__label">Private Selection</span>
          <h2>Shopping Cart</h2>
        </div>
        <button class="cart-drawer__close" type="button" data-cart-close aria-label="Close cart">&times;</button>
      </div>
      <div class="cart-drawer__items"></div>
      <div class="cart-drawer__footer">
        <div class="cart-drawer__subtotal">
          <span>Subtotal</span>
          <strong data-cart-drawer-total>$0.00</strong>
        </div>
        <a href="checkout.html" class="btn btn--primary btn--full">Checkout</a>
      </div>
    </aside>
  `);

  const drawer = document.querySelector('.cart-drawer');
  const overlay = document.querySelector('.cart-drawer-overlay');
  const itemsEl = drawer.querySelector('.cart-drawer__items');
  const totalEl = drawer.querySelector('[data-cart-drawer-total]');
  const menu = document.querySelector('.nav-menu');
  const toggle = document.querySelector('.nav-toggle');

  function renderDrawer() {
    if (!itemsEl || !totalEl) return;

    if (Store.cart.length === 0) {
      itemsEl.innerHTML = `
        <div class="empty-state">
          <p>Your cart is empty.</p>
          <a href="shop.html#collection" class="btn btn--outline">Explore Collection</a>
        </div>`;
    } else {
      itemsEl.innerHTML = Store.cart.map(item => {
        const product = Store.getProduct(item.id);
        if (!product) return '';
        return `
          <article class="cart-drawer__item" data-id="${item.id}" data-size="${item.size}">
            <img src="${product.image}" alt="${product.name}">
            <div>
              <h3>${product.name}</h3>
              <p>Size ${item.size} / $${product.price}</p>
              <div class="cart-drawer__controls">
                <div class="drawer-qty" aria-label="Quantity for ${product.name}">
                  <button type="button" data-drawer-action="minus">-</button>
                  <span>${item.qty}</span>
                  <button type="button" data-drawer-action="plus">+</button>
                </div>
                <button class="cart-drawer__remove" type="button" data-drawer-action="remove">Remove</button>
              </div>
            </div>
          </article>`;
      }).join('');
    }

    totalEl.textContent = `$${Store.cartTotal().toFixed(2)}`;
  }

  function openDrawer() {
    renderDrawer();
    drawer.classList.add('open');
    overlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    menu?.classList.remove('open');
    toggle?.classList.remove('active');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.nav-cart-trigger').forEach(trigger => {
    trigger.addEventListener('click', openDrawer);
  });

  document.querySelectorAll('[data-cart-close]').forEach(close => {
    close.addEventListener('click', closeDrawer);
  });

  itemsEl.addEventListener('click', event => {
    const button = event.target.closest('[data-drawer-action]');
    const itemRow = event.target.closest('.cart-drawer__item');
    if (!button || !itemRow) return;

    const id = itemRow.dataset.id;
    const size = itemRow.dataset.size;
    const item = Store.cart.find(cartItem => cartItem.id === id && cartItem.size === size);
    if (!item) return;

    if (button.dataset.drawerAction === 'minus') {
      if (item.qty > 1) Store.updateQty(id, size, item.qty - 1);
      else Store.removeFromCart(id, size);
    }

    if (button.dataset.drawerAction === 'plus') {
      Store.updateQty(id, size, item.qty + 1);
    }

    if (button.dataset.drawerAction === 'remove') {
      Store.removeFromCart(id, size);
    }

    renderDrawer();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });

  document.addEventListener('cart:changed', renderDrawer);
  renderDrawer();
}

function initPageSpecific() {
  const page = document.body.dataset.page;

  if (page === 'home') initHome();
  if (page === 'shop') initShop();
  if (page === 'cart') initCart();
  if (page === 'checkout') initCheckout();
  if (page === 'account') initAccount();
}

function initHome() {
  const featuredGrid = document.querySelector('.featured-grid');
  if (featuredGrid) {
    const cats = ['Graphic Tees', 'Knitwear', 'Hoodies', 'Outerwear'];
    featuredGrid.innerHTML = cats.map(cat => {
      const p = PRODUCTS.find(pr => pr.category === cat);
      if (!p) return '';
      return `
        <a href="shop.html?category=${encodeURIComponent(cat)}" class="featured-card reveal">
          <img src="${p.image}" alt="${cat}" class="featured-card__img primary">
          <img src="${p.hoverImage}" alt="${cat}" class="featured-card__img hover">
          <div class="featured-card__overlay">
            <h3>${cat}</h3>
            <span>Explore &rarr;</span>
          </div>
        </a>
      `;
    }).join('');
    observeRevealElements(featuredGrid);
  }

  const newArrivals = document.querySelector('.new-arrivals-grid');
  if (newArrivals) {
    const products = PRODUCTS.filter(p => p.new);
    newArrivals.innerHTML = products.map(p => renderProductCard(p)).join('');
    bindProductEvents(newArrivals);
    observeRevealElements(newArrivals);
  }

  const bestsellers = document.querySelector('.carousel-track');
  if (bestsellers) {
    const products = PRODUCTS.filter(p => p.bestseller);
    bestsellers.innerHTML = products.map(p => renderProductCard(p, { showAddToCart: true })).join('');
    bindProductEvents(bestsellers);
    observeRevealElements(bestsellers);
  }
}

function initShop() {
  const grid = document.querySelector('.shop-grid');
  const filters = document.querySelectorAll('.filter-btn');
  const sortSelect = document.querySelector('.sort-select');
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  let category = params.get('category') || 'All';
  let sort = 'featured';

  function render() {
    const products = Store.filterProducts(category, sort);
    grid.innerHTML = products.length
      ? products.map(p => renderProductCard(p)).join('')
      : '<p class="empty-state">No products match your filters.</p>';
    bindProductEvents(grid);
    observeRevealElements(grid);
    const countEl = document.querySelector('.shop-count');
    if (countEl) countEl.textContent = `${products.length} product${products.length === 1 ? '' : 's'}`;
  }

  filters.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
    btn.addEventListener('click', () => {
      category = btn.dataset.category;
      filters.forEach(b => b.classList.toggle('active', b === btn));
      render();
    });
  });

  sortSelect?.addEventListener('change', () => {
    sort = sortSelect.value;
    render();
  });

  render();

  const productId = params.get('product');
  if (productId && Store.getProduct(productId)) {
    openQuickView(productId);
  }
}

function initCart() {
  const container = document.querySelector('.cart-items');
  const summary = document.querySelector('.cart-summary');
  if (!container) return;

  function render() {
    if (Store.cart.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Your cart is empty.</p>
          <a href="shop.html" class="btn btn--primary">Continue Shopping</a>
        </div>`;
      summary.innerHTML = '';
      return;
    }

    container.innerHTML = Store.cart.map(item => {
      const p = Store.getProduct(item.id);
      if (!p) return '';
      return `
        <div class="cart-item" data-id="${item.id}" data-size="${item.size}">
          <img src="${p.image}" alt="${p.name}">
          <div class="cart-item__info">
            <h3>${p.name}</h3>
            <p>Size: ${item.size}</p>
            <span class="cart-item__price">$${p.price}</span>
          </div>
          <div class="cart-item__qty">
            <button class="qty-btn" data-action="minus">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-action="plus">+</button>
          </div>
          <button class="cart-item__remove" aria-label="Remove">&times;</button>
        </div>`;
    }).join('');

    const total = Store.cartTotal();
    summary.innerHTML = `
      <h3>Order Summary</h3>
      <div class="summary-row"><span>Subtotal</span><span>$${total.toFixed(2)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>Free</span></div>
      <div class="summary-row total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
      <a href="checkout.html" class="btn btn--primary btn--full">Secure Checkout</a>`;

    container.querySelectorAll('.cart-item').forEach(row => {
      const id = row.dataset.id;
      const size = row.dataset.size;
      row.querySelector('[data-action="minus"]')?.addEventListener('click', () => {
        const item = Store.cart.find(i => i.id === id && i.size === size);
        if (item && item.qty > 1) Store.updateQty(id, size, item.qty - 1);
        else Store.removeFromCart(id, size);
        render();
      });
      row.querySelector('[data-action="plus"]')?.addEventListener('click', () => {
        const item = Store.cart.find(i => i.id === id && i.size === size);
        if (item) Store.updateQty(id, size, item.qty + 1);
        render();
      });
      row.querySelector('.cart-item__remove')?.addEventListener('click', () => {
        Store.removeFromCart(id, size);
        render();
      });
    });
  }

  render();
}

function initCheckout() {
  const form = document.querySelector('.checkout-form');
  const summary = document.querySelector('.checkout-summary');
  if (!summary) return;

  if (Store.cart.length === 0) {
    summary.innerHTML = `
      <div class="empty-state">
        <p>Your cart is empty.</p>
        <a href="shop.html" class="btn btn--primary btn--full">Continue Shopping</a>
      </div>`;
    form?.classList.add('hidden');
    return;
  }

  const total = Store.cartTotal();
  summary.innerHTML = `
    <h3>Your Order</h3>
    ${Store.cart.map(item => {
      const p = Store.getProduct(item.id);
      return p ? `<div class="summary-row"><span>${p.name} × ${item.qty}</span><span>$${(p.price * item.qty).toFixed(2)}</span></div>` : '';
    }).join('')}
    <div class="summary-row total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
    <p class="secure-note">🔒 Secure 256-bit SSL encryption</p>`;

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await Store.placeOrder(form);
      Store.cart = [];
      Store.save();
      Store.showToast('Order placed successfully!');
      setTimeout(() => window.location.href = 'index.html', 2000);
    } catch (error) {
      Store.showToast(error.message || 'Could not place order');
    }
  });
}

function initAccount() {
  const loginForm = document.querySelector('.login-form');
  const dashboard = document.querySelector('.account-dashboard');
  const loginSection = document.querySelector('.login-section');

  if (Store.user) {
    loginSection?.classList.add('hidden');
    dashboard?.classList.remove('hidden');
    dashboard.querySelector('.account-name').textContent = Store.user.name;
    dashboard.querySelector('.account-email').textContent = Store.user.email;

    const wishlistGrid = dashboard.querySelector('.wishlist-grid');
    if (wishlistGrid) {
      const items = Store.wishlist.map(id => Store.getProduct(id)).filter(Boolean);
      wishlistGrid.innerHTML = items.length
        ? items.map(p => renderProductCard(p)).join('')
        : '<p class="empty-state">Your wishlist is empty.</p>';
      bindProductEvents(wishlistGrid);
    }
  }

  loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = loginForm.querySelector('[name="email"]').value;
    const password = loginForm.querySelector('[name="password"]').value;
    if (email && password) {
      const ok = await Store.login(email, password);
      if (ok) location.reload();
    }
  });

  document.querySelector('.logout-btn')?.addEventListener('click', async () => {
    await Store.logout();
    location.reload();
  });
}
