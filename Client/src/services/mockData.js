import { PRODUCT_CATEGORIES, ORDER_STATUS } from '../utils/constants';

// Sample User Data for all three users with profiles and interests
export const MOCK_USERS = {
  user1: {
    id: 'user1',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 98765 43210',
    address: '123 MG Road, Bangalore, Karnataka 560001',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    interests: [PRODUCT_CATEGORIES.FASHION, PRODUCT_CATEGORIES.BEAUTY, PRODUCT_CATEGORIES.HOME_DECOR]
  },
  user2: {
    id: 'user2',
    name: 'Rahul Patel',
    email: 'rahul.patel@email.com',
    phone: '+91 87654 32109',
    address: '456 Park Street, Mumbai, Maharashtra 400001',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    interests: [PRODUCT_CATEGORIES.ELECTRONICS, PRODUCT_CATEGORIES.SPORTS, PRODUCT_CATEGORIES.BOOKS]
  },
  user3: {
    id: 'user3',
    name: 'Anita Singh',
    email: 'anita.singh@email.com',
    phone: '+91 76543 21098',
    address: '789 Civil Lines, Delhi, Delhi 110001',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    interests: [PRODUCT_CATEGORIES.FASHION, PRODUCT_CATEGORIES.ELECTRONICS, PRODUCT_CATEGORIES.HOME_DECOR]
  }
};

// Sample Order Data with product details and categories
export const MOCK_ORDERS = {
  order2: {
    id: 'order2',
    userId: 'user1',
    productName: 'Cotton Kurta Set',
    category: PRODUCT_CATEGORIES.FASHION,
    price: 1599,
    discountedPrice: 1279, // 20% discount for flash sale
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300&h=300&fit=crop',
    quantity: 1,
    status: ORDER_STATUS.ACTIVE,
    createdAt: new Date('2024-01-14T14:20:00Z'),
    description: 'Comfortable cotton kurta set perfect for casual and festive occasions'
  },
  order3: {
    id: 'order3',
    userId: 'user2',
    productName: 'Decorative Wall Mirror',
    category: PRODUCT_CATEGORIES.HOME_DECOR,
    price: 3499,
    discountedPrice: 2799, // 20% discount for flash sale
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
    quantity: 1,
    status: ORDER_STATUS.ACTIVE,
    createdAt: new Date('2024-01-13T09:15:00Z'),
    description: 'Elegant decorative mirror with ornate golden frame for living room'
  }
};

// Sample Product Categories with representative items
export const SAMPLE_PRODUCTS_BY_CATEGORY = {
  [PRODUCT_CATEGORIES.ELECTRONICS]: [
    {
      name: 'Smartphone',
      price: 15999,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop'
    },
    {
      name: 'Laptop',
      price: 45999,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop'
    }
  ],
  [PRODUCT_CATEGORIES.FASHION]: [
    {
      name: 'Designer Saree',
      price: 2999,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=300&fit=crop'
    },
    {
      name: 'Casual T-Shirt',
      price: 599,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'
    }
  ],
  [PRODUCT_CATEGORIES.HOME_DECOR]: [
    {
      name: 'Table Lamp',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop'
    },
    {
      name: 'Cushion Covers',
      price: 799,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop'
    }
  ],
  [PRODUCT_CATEGORIES.BEAUTY]: [
    {
      name: 'Skincare Set',
      price: 1899,
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&h=300&fit=crop'
    }
  ],
  [PRODUCT_CATEGORIES.SPORTS]: [
    {
      name: 'Yoga Mat',
      price: 999,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop'
    }
  ],
  [PRODUCT_CATEGORIES.BOOKS]: [
    {
      name: 'Programming Book',
      price: 699,
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop'
    }
  ]
};

// Helper function to get user by ID
export const getUserById = (userId) => {
  return MOCK_USERS[userId] || null;
};

// Helper function to get orders by user ID
export const getOrdersByUserId = (userId) => {
  return Object.values(MOCK_ORDERS).filter(order => order.userId === userId);
};

// Helper function to get order by ID
export const getOrderById = (orderId) => {
  return MOCK_ORDERS[orderId] || null;
};

// Helper function to check if user is interested in a product category
export const isUserInterestedInCategory = (userId, category) => {
  const user = getUserById(userId);
  return user ? user.interests.includes(category) : false;
};