const Store = {
  cart: JSON.parse(localStorage.getItem('88-cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('88-wishlist') || '[]'),
  user: JSON.parse(localStorage.getItem('88-user') || 'null'),
  supabase: window.EIGHT_SUPABASE || null,

  async init() {
    await this.refreshSession();
    await this.loadProducts();
    await this.loadWishlist();
    this.updateBadges();
  },

  save() {
    localStorage.setItem('88-cart', JSON.stringify(this.cart));
    localStorage.setItem('88-wishlist', JSON.stringify(this.wishlist));
    if (this.user) localStorage.setItem('88-user', JSON.stringify(this.user));
    else localStorage.removeItem('88-user');
    this.updateBadges();
    document.dispatchEvent(new CustomEvent('cart:changed'));
  },

  async refreshSession() {
    if (!this.supabase) return;
    const { user, error } = await this.supabase.getUser();
    if (error || !user) {
      this.user = null;
      localStorage.removeItem('88-user');
      return;
    }
    this.user = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email.split('@')[0]
    };
    localStorage.setItem('88-user', JSON.stringify(this.user));
  },

  async loadProducts() {
    if (!this.supabase) return;
    const data = await this.supabase.getProducts().catch(() => null);
    if (!data?.length) return;

    const products = data.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: Number(product.price),
      rating: Number(product.rating),
      reviews: product.reviews,
      image: product.image,
      hoverImage: product.hover_image,
      description: product.description,
      sizes: product.sizes || [],
      colors: product.colors || [],
      featured: product.featured,
      bestseller: product.bestseller,
      new: product.is_new
    }));
    PRODUCTS.splice(0, PRODUCTS.length, ...products);
    document.documentElement.dataset.supabaseProducts = String(products.length);
  },

  async loadWishlist() {
    if (!this.supabase || !this.user?.id) return;
    const data = await this.supabase.getWishlist(this.user.id).catch(() => null);
    if (!data) return;
    this.wishlist = data.map(item => item.product_id);
    localStorage.setItem('88-wishlist', JSON.stringify(this.wishlist));
  },

  getProduct(id) {
    return PRODUCTS.find(p => p.id === id);
  },

  addToCart(id, size = 'M', qty = 1) {
    const existing = this.cart.find(i => i.id === id && i.size === size);
    if (existing) existing.qty += qty;
    else this.cart.push({ id, size, qty });
    this.save();
    this.showToast('Added to cart');
  },

  removeFromCart(id, size) {
    this.cart = this.cart.filter(i => !(i.id === id && i.size === size));
    this.save();
  },

  updateQty(id, size, qty) {
    const item = this.cart.find(i => i.id === id && i.size === size);
    if (item) {
      item.qty = Math.max(1, qty);
      this.save();
    }
  },

  cartTotal() {
    return this.cart.reduce((sum, item) => {
      const p = this.getProduct(item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  },

  cartCount() {
    return this.cart.reduce((sum, i) => sum + i.qty, 0);
  },

  async toggleWishlist(id) {
    const idx = this.wishlist.indexOf(id);
    const nextActive = idx === -1;

    if (idx > -1) {
      this.wishlist.splice(idx, 1);
    } else {
      this.wishlist.push(id);
    }
    this.save();

    if (this.supabase && this.user?.id) {
      try {
        if (nextActive) await this.supabase.addWishlist(this.user.id, id);
        else await this.supabase.removeWishlist(this.user.id, id);
      } catch (error) {
        if (nextActive) this.wishlist = this.wishlist.filter(item => item !== id);
        else this.wishlist.push(id);
        this.save();
        this.showToast('Could not update wishlist');
        return this.wishlist.includes(id);
      }
    }

    this.showToast(nextActive ? 'Added to wishlist' : 'Removed from wishlist');
    return this.wishlist.includes(id);
  },

  isWishlisted(id) {
    return this.wishlist.includes(id);
  },

  updateBadges() {
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      const count = this.cartCount();
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
    document.querySelectorAll('[data-wishlist-count]').forEach(el => {
      const count = this.wishlist.length;
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('visible'), 2500);
  },

  searchProducts(query) {
    const q = query.toLowerCase().trim();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  },

  filterProducts(category, sort = 'featured') {
    let list = category === 'All' ? [...PRODUCTS] : PRODUCTS.filter(p => p.category === category);
    switch (sort) {
      case 'price-low': list.sort((a, b) => a.price - b.price); break;
      case 'price-high': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      case 'new': list = list.filter(p => p.new); break;
      default: break;
    }
    return list;
  },

  async login(email, password) {
    if (!this.supabase) {
      this.user = { email, name: email.split('@')[0] };
      localStorage.setItem('88-user', JSON.stringify(this.user));
      return true;
    }

    try {
      await this.supabase.signIn(email, password);
    } catch (error) {
      try {
        await this.supabase.signUp(email, password, email.split('@')[0]);
      } catch (signUpError) {
        this.showToast(signUpError.message);
        return false;
      }
    }

    await this.refreshSession();
    await this.loadWishlist();
    this.save();

    if (!this.user) {
      this.showToast('Check your email to confirm your account');
      return false;
    }

    return true;
  },

  async logout() {
    if (this.supabase) await this.supabase.signOut();
    this.user = null;
    localStorage.removeItem('88-user');
    this.wishlist = [];
    this.save();
  },

  async subscribeNewsletter(email) {
    if (!this.supabase) return true;
    try {
      await this.supabase.subscribeNewsletter(email);
    } catch (error) {
      if (error.status !== 409 && error.code !== '23505') throw error;
    }
    return true;
  },

  async placeOrder(form) {
    if (!this.supabase) return true;

    const data = new FormData(form);
    const customerName = `${data.get('first')} ${data.get('last')}`.trim();
    const customerEmail = data.get('email');
    const total = this.cartTotal();

    const items = this.cart.map(item => {
      const product = this.getProduct(item.id);
      return {
        product_id: item.id,
        product_name: product?.name || item.id,
        size: item.size,
        quantity: item.qty,
        unit_price: product?.price || 0
      };
    });

    await this.supabase.createOrder({
      user_id: this.user?.id || null,
      customer_email: customerEmail,
      customer_name: customerName,
      cart_total: total,
      shipping_address: {
        address: data.get('address'),
        city: data.get('city'),
        zip: data.get('zip')
      }
    }, items);
    return true;
  }
};

function renderStars(rating) {
  const full = Math.floor(rating);
  let html = '';
  for (let i = 0; i < 5; i++) {
    html += `<span class="star ${i < full ? 'filled' : ''}">&#9733;</span>`;
  }
  return html;
}

function renderProductCard(product, options = {}) {
  const { showQuickView = true, showAddToCart = false, reveal = true } = options;
  const wishlisted = Store.isWishlisted(product.id);
  return `
    <article class="product-card ${reveal ? 'reveal' : ''}" data-id="${product.id}">
      <div class="product-card__media">
        <img src="${product.image}" alt="${product.name}" class="product-card__img primary" loading="lazy">
        <img src="${product.hoverImage}" alt="${product.name}" class="product-card__img hover" loading="lazy">
        <div class="product-card__actions">
          <button class="icon-btn wishlist-btn ${wishlisted ? 'active' : ''}" data-wishlist="${product.id}" aria-label="Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${wishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          ${showQuickView ? `<button class="icon-btn quick-view-btn" data-quick="${product.id}" aria-label="Quick view"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>` : ''}
        </div>
        ${product.new ? '<span class="product-badge">New</span>' : ''}
      </div>
      <div class="product-card__info">
        <span class="product-card__category">${product.category}</span>
        <h3 class="product-card__name">${product.name}</h3>
        <div class="product-card__meta">
          <span class="product-card__price">$${product.price}</span>
          <span class="product-card__rating">${renderStars(product.rating)} <small>(${product.reviews})</small></span>
        </div>
        ${showAddToCart ? `<button class="btn btn--sm btn--primary add-cart-btn" data-add="${product.id}">Quick Add</button>` : ''}
      </div>
    </article>
  `;
}

function openQuickView(id) {
  const p = Store.getProduct(id);
  if (!p) return;
  const modal = document.getElementById('quickViewModal');
  if (!modal) return;
  modal.querySelector('.qv-image').src = p.image;
  modal.querySelector('.qv-name').textContent = p.name;
  modal.querySelector('.qv-price').textContent = `$${p.price}`;
  modal.querySelector('.qv-desc').textContent = p.description;
  modal.querySelector('.qv-rating').innerHTML = renderStars(p.rating) + ` <small>(${p.reviews} reviews)</small>`;
  const sizesEl = modal.querySelector('.qv-sizes');
  sizesEl.innerHTML = p.sizes.map(s => `<button class="size-btn ${s === 'M' ? 'active' : ''}" data-size="${s}">${s}</button>`).join('');
  modal.querySelector('.qv-add').dataset.id = id;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function bindProductEvents(container) {
  container.querySelectorAll('[data-wishlist]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const id = btn.dataset.wishlist;
      const active = await Store.toggleWishlist(id);
      btn.classList.toggle('active', active);
      btn.querySelector('svg').setAttribute('fill', active ? 'currentColor' : 'none');
    });
  });
  container.querySelectorAll('[data-quick]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openQuickView(btn.dataset.quick);
    });
  });
  container.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      Store.addToCart(btn.dataset.add);
    });
  });
}

function openSizeGuide() {
  closeModal('quickViewModal');
  document.getElementById('sizeGuideModal')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function initSearch() {
  const input = document.querySelector('.search-input');
  const results = document.querySelector('.search-results');
  if (!input || !results) return;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (q.length < 2) {
      results.classList.remove('open');
      return;
    }
    const found = Store.searchProducts(q).slice(0, 6);
    if (found.length === 0) {
      results.innerHTML = '<p class="search-empty">No products found</p>';
    } else {
      results.innerHTML = found.map(p => `
        <a href="shop.html?product=${p.id}" class="search-result">
          <img src="${p.image}" alt="${p.name}">
          <div><strong>${p.name}</strong><span>$${p.price}</span></div>
        </a>
      `).join('');
    }
    results.classList.add('open');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrap')) results.classList.remove('open');
  });
}

function initModals() {
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  document.querySelector('.qv-sizes')?.addEventListener('click', e => {
    if (e.target.classList.contains('size-btn')) {
      e.target.closest('.qv-sizes').querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    }
  });

  document.querySelector('.qv-add')?.addEventListener('click', e => {
    const id = e.target.dataset.id;
    const size = document.querySelector('.qv-sizes .size-btn.active')?.dataset.size || 'M';
    Store.addToCart(id, size);
    closeModal('quickViewModal');
  });

  document.querySelectorAll('[data-size-guide]').forEach(el => {
    el.addEventListener('click', openSizeGuide);
  });
}
