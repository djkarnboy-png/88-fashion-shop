# 8:8 — Premium Fashion E-Commerce

Modern luxury streetwear brand website with full e-commerce functionality.

## Quick Start

Open `index.html` in your browser, or serve locally:

```powershell
cd C:\Users\djkar\Projects\88-fashion
python -m http.server 8080
```

Then visit [http://localhost:8080](http://localhost:8080)

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Homepage with hero, collections, story, lookbook, carousel, newsletter |
| `shop.html` | Full catalog with category filters and sorting |
| `cart.html` | Shopping cart with quantity controls |
| `checkout.html` | Secure checkout flow |
| `account.html` | Customer login, wishlist |

## Features

- Luxury loading screen with 8:8 logo
- Mouse-follow lighting & grain texture overlay
- Scroll reveal animations & parallax lookbook
- Product hover image swaps
- Quick view modal with size selection
- Shopping cart (localStorage)
- Supabase-backed catalog, wishlist, newsletter signups, orders, and account auth
- Live product search
- Category filtering & sorting
- Size guide modal
- Newsletter signup
- Mobile-responsive navigation

## Supabase

The site is connected to Supabase project `blxymrnwvzswozxffcqt` through `js/supabase.js`.

Tables:

- `products`
- `newsletter_subscribers`
- `orders`
- `order_items`
- `wishlist_items`

The storefront uses the publishable key in the browser. Row-level security is enabled on all public tables.

## Brand Colors

- Deep Black: `#0A0A0A`
- Off White: `#F5F5F0`
- Metallic Silver: `#BFC2C7`
- Electric Blue: `#3B82F6`

## Fonts

- Headlines: [Syne](https://fonts.google.com/specimen/Syne)
- Body: [DM Sans](https://fonts.google.com/specimen/DM+Sans)
