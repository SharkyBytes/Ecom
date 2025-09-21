// Application configuration and constants
export const APP_CONFIG = {
  ROUTES: {
    CANCEL_ORDER: '/',
    USER2: '/user2',
    FLASH_SALE: '/flash-sale',
  },
  API_BASE_URL: 'http://localhost:5000',
  SOCKET_URL: 'http://localhost:5000',
  MOCK_DATA: {
    ORDER_ID: '77777777-7777-7777-7777-777777777777',
    USER_IDS: {
      MUMBAI_USER: '11111111-1111-1111-1111-111111111111',
      DELHI_USER: '22222222-2222-2222-2222-222222222222',
      BANGALORE_USER: '33333333-3333-3333-3333-333333333333'
    }
  }
};

// Cancellation reasons
export const CANCELLATION_REASONS = [
  { id: 'quality', label: 'Quality issues with the product' },
  { id: 'size', label: 'Size/fit is not as expected' },
  { id: 'color', label: 'Color/design is different from what was shown' },
  { id: 'damaged', label: 'Product arrived damaged' },
  { id: 'wrong', label: 'Received wrong product' },
  { id: 'changed_mind', label: 'Changed my mind' },
  { id: 'delay', label: 'Delivery taking too long' },
  { id: 'other', label: 'Other reason' }
];

// Product data
export const PRODUCTS = {
  KURTI_BLUE: {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Cotton Kurti Blue',
    category: 'women_clothing',
    price: 899.99,
    image: '/assets/images/blue_kurti.png',
    description: 'Elegant blue cotton kurti with traditional design',
    rating: 4.2,
    reviews: 128
  },
  KURTI_RED: {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Cotton Kurti Red',
    category: 'women_clothing',
    price: 799.99,
    image: '/assets/images/blue_kurti.png',
    description: 'Stylish red cotton kurti for casual wear',
    rating: 4.5,
    reviews: 96
  }
};

// Banner images
export const BANNERS = [
  {
    id: 1,
    image: "/assets/images/mega_sale.png",
    alt: 'Mega Blockbuster Sale',
    link: '#'
  },
  {
    id: 2,
    image: "https://images.meesho.com/images/marketing/1678691617864_1200.webp",
    alt: 'Western Wear Collection',
    link: '#'
  }
];