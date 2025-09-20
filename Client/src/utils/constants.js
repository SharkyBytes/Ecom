// App Configuration Constants
export const APP_CONFIG = {
  FLASH_SALE_DURATION: 300000, // 5 minutes in milliseconds
  STORAGE_KEYS: {
    FLASH_SALE: 'flash_sale_data',
    ORDERS: 'orders_data',
    USERS: 'users_data'
  },
  ROUTES: {
    USER1: '/',
    USER2: '/user2',
    USER3: '/user3'
  }
};

// Color Scheme Constants
export const COLORS = {
  PRIMARY: '#b282a4',
  PRIMARY_DARK: '#9a6b8f',
  PRIMARY_LIGHT: '#c299b5',
  TEXT: '#000000',
  BACKGROUND: '#ffffff',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444'
};

// Product Categories
export const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'Electronics',
  FASHION: 'Fashion',
  HOME_DECOR: 'Home & Decor',
  BEAUTY: 'Beauty & Personal Care',
  SPORTS: 'Sports & Fitness',
  BOOKS: 'Books & Media'
};

// Order Status
export const ORDER_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  SOLD: 'sold'
};

// Flash Sale Status
export const FLASH_SALE_STATUS = {
  ACTIVE: 'active',
  SOLD: 'sold',
  EXPIRED: 'expired'
};