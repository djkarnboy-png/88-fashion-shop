const PRODUCTS = [
  {
    id: 'tee-001',
    name: 'Balance Graphic Tee',
    category: 'Graphic Tees',
    price: 89,
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    description: 'Premium cotton tee with asymmetric 8:8 graphic print.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Off White'],
    featured: true,
    bestseller: true,
    new: true
  },
  {
    id: 'tee-002',
    name: 'Infinity Loop Tee',
    category: 'Graphic Tees',
    price: 95,
    rating: 4.8,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1583743814966-6a8c6a60b4e8?w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    description: 'Minimalist infinity motif on heavyweight organic cotton.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black'],
    featured: true,
    bestseller: false,
    new: true
  },
  {
    id: 'knit-001',
    name: 'Merino Balance Knit',
    category: 'Knitwear',
    price: 245,
    rating: 5.0,
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1620799140188-3b2a021fd9b1?w=800&q=80',
    description: 'Fine merino wool knit with subtle tonal 8:8 embroidery.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Charcoal', 'Off White'],
    featured: true,
    bestseller: true,
    new: false
  },
  {
    id: 'knit-002',
    name: 'Structured Crew Knit',
    category: 'Knitwear',
    price: 198,
    rating: 4.7,
    reviews: 52,
    image: 'https://images.unsplash.com/photo-1576871337628-1265db9a9aae?w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=80',
    description: 'Architectural silhouette with dropped shoulder construction.',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Silver Grey'],
    featured: true,
    bestseller: false,
    new: true
  },
  {
    id: 'hoodie-001',
    name: 'Precision Hoodie',
    category: 'Hoodies',
    price: 185,
    rating: 4.9,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1509941943102-10c232535736?w=800&q=80',
    description: 'Heavyweight French terry with concealed zip and metal hardware.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Off White'],
    featured: true,
    bestseller: true,
    new: false
  },
  {
    id: 'hoodie-002',
    name: 'Deconstructed Zip Hoodie',
    category: 'Hoodies',
    price: 210,
    rating: 4.8,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb265d0?w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1578587018452-892b837f9f2b?w=800&q=80',
    description: 'Asymmetric zip with raw-edge detailing and oversized fit.',
    sizes: ['M', 'L', 'XL'],
    colors: ['Black'],
    featured: true,
    bestseller: false,
    new: true
  },
  {
    id: 'outer-001',
    name: 'Architectural Shell Jacket',
    category: 'Outerwear',
    price: 425,
    rating: 4.9,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1548126032-079a241ea148?w=800&q=80',
    description: 'Water-resistant technical shell with modular pocket system.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Silver Grey'],
    featured: true,
    bestseller: true,
    new: false
  },
  {
    id: 'outer-002',
    name: 'Oversized Wool Coat',
    category: 'Outerwear',
    price: 580,
    rating: 5.0,
    reviews: 41,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce267608?w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80',
    description: 'Double-faced wool with hidden magnetic closure.',
    sizes: ['S', 'M', 'L'],
    colors: ['Black'],
    featured: true,
    bestseller: false,
    new: true
  },
  {
    id: 'tee-003',
    name: 'Repetition Print Tee',
    category: 'Graphic Tees',
    price: 78,
    rating: 4.6,
    reviews: 73,
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    description: 'Repeating 8:8 pattern in tonal discharge print.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Off White'],
    featured: false,
    bestseller: true,
    new: false
  },
  {
    id: 'hoodie-003',
    name: 'Essential Pullover',
    category: 'Hoodies',
    price: 165,
    rating: 4.7,
    reviews: 112,
    image: 'https://images.unsplash.com/photo-1509941943102-10c232535736?w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    description: 'Clean pullover with tonal embroidered logo.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Off White', 'Silver Grey'],
    featured: false,
    bestseller: true,
    new: false
  },
  {
    id: 'outer-003',
    name: 'Utility Bomber',
    category: 'Outerwear',
    price: 395,
    rating: 4.8,
    reviews: 88,
    image: 'https://images.unsplash.com/photo-1548126032-079a241ea148?w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
    description: 'Matte nylon bomber with articulated sleeve construction.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black'],
    featured: false,
    bestseller: true,
    new: false
  },
  {
    id: 'knit-003',
    name: 'Ribbed Mock Neck',
    category: 'Knitwear',
    price: 175,
    rating: 4.5,
    reviews: 38,
    image: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
    description: 'Fine-gauge rib knit with extended mock neck.',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Off White'],
    featured: false,
    bestseller: false,
    new: true
  }
];

const CATEGORIES = ['All', 'Graphic Tees', 'Knitwear', 'Hoodies', 'Outerwear'];

const LOOKBOOK = [
  {
    title: 'Urban Balance',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80',
    span: 'large'
  },
  {
    title: 'Night Shift',
    image: 'https://images.unsplash.com/photo-1483985988355-763728fa4b65?w=800&q=80',
    span: 'small'
  },
  {
    title: 'Concrete Dreams',
    image: 'https://images.unsplash.com/photo-1445205170230-053a830a5ebb?w=800&q=80',
    span: 'small'
  },
  {
    title: 'Between Moments',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80',
    span: 'large'
  },
  {
    title: 'Silent Motion',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    span: 'medium'
  }
];

const BRAND_VALUES = [
  { word: 'Balance.', desc: 'The symmetry of 8:8 — two halves in perfect equilibrium.' },
  { word: 'Infinity.', desc: 'Turned sideways, eight becomes forever. Endless expression.' },
  { word: 'Repetition.', desc: 'Patterns that echo. Design as rhythm and ritual.' },
  { word: 'Individual expression.', desc: 'Your moment. Your interpretation. Your 8:8.' }
];
