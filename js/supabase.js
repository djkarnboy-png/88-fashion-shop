const SUPABASE_URL = 'https://blxymrnwvzswozxffcqt.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_z31mDWKX9Z0mNz4AbhyKBg_Q2V1_Qtf';
const SUPABASE_SESSION_KEY = '88-supabase-session';

function readStoredSupabaseSession() {
  try {
    return JSON.parse(localStorage.getItem(SUPABASE_SESSION_KEY) || 'null');
  } catch {
    localStorage.removeItem(SUPABASE_SESSION_KEY);
    return null;
  }
}

const SupabaseApi = {
  session: readStoredSupabaseSession(),

  saveSession(session) {
    this.session = session;
    if (session) localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SUPABASE_SESSION_KEY);
  },

  async request(path, options = {}) {
    const headers = {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${options.auth ? this.session?.access_token : SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(`${SUPABASE_URL}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw Object.assign(new Error(details.message || response.statusText), details, { status: response.status });
    }

    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  },

  async authRequest(path, body) {
    const response = await fetch(`${SUPABASE_URL}${path}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(data.msg || data.message || response.statusText), data);
    if (data.access_token) this.saveSession(data);
    return data;
  },

  async refreshSession() {
    if (!this.session?.refresh_token) return null;
    return this.authRequest('/auth/v1/token?grant_type=refresh_token', {
      refresh_token: this.session.refresh_token
    });
  },

  async getUser() {
    if (!this.session?.access_token) return { user: null };

    try {
      const data = await this.request('/auth/v1/user', { auth: true });
      return { user: data };
    } catch (error) {
      if (error.status === 401 || error.message === 'Invalid JWT') {
        await this.refreshSession().catch(() => this.saveSession(null));
        if (this.session?.access_token) {
          const data = await this.request('/auth/v1/user', { auth: true });
          return { user: data };
        }
      }
      return { user: null, error };
    }
  },

  signIn(email, password) {
    return this.authRequest('/auth/v1/token?grant_type=password', { email, password });
  },

  async signUp(email, password, name) {
    const data = await this.authRequest('/auth/v1/signup', {
      email,
      password,
      data: { name }
    });
    if (data.session) this.saveSession(data.session);
    return data;
  },

  async signOut() {
    if (this.session?.access_token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${this.session.access_token}`
        }
      }).catch(() => {});
    }
    this.saveSession(null);
  },

  getProducts() {
    return this.request('/rest/v1/products?select=*&order=created_at.asc');
  },

  getWishlist(userId) {
    return this.request(`/rest/v1/wishlist_items?select=product_id&user_id=eq.${encodeURIComponent(userId)}`, { auth: true });
  },

  addWishlist(userId, productId) {
    return this.request('/rest/v1/wishlist_items?on_conflict=user_id,product_id', {
      method: 'POST',
      auth: true,
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: { user_id: userId, product_id: productId }
    });
  },

  removeWishlist(userId, productId) {
    return this.request(`/rest/v1/wishlist_items?user_id=eq.${encodeURIComponent(userId)}&product_id=eq.${encodeURIComponent(productId)}`, {
      method: 'DELETE',
      auth: true
    });
  },

  subscribeNewsletter(email) {
    return this.request('/rest/v1/newsletter_subscribers', {
      method: 'POST',
      body: { email }
    });
  },

  async createOrder(order, items) {
    const created = await this.request('/rest/v1/orders?select=id', {
      method: 'POST',
      auth: !!this.session?.access_token,
      headers: { Prefer: 'return=representation' },
      body: order
    });
    const orderId = created?.[0]?.id;
    if (!orderId) throw new Error('Order was not created');

    await this.request('/rest/v1/order_items', {
      method: 'POST',
      auth: !!this.session?.access_token,
      body: items.map(item => ({ ...item, order_id: orderId }))
    });
    return orderId;
  }
};

window.EIGHT_SUPABASE = SupabaseApi;
document.documentElement.dataset.supabase = 'ready';
