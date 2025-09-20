/**
 * Race Condition Handling Tests
 * Tests the timestamp-based first-come-first-served logic for simultaneous purchases
 */

import storageService, { STORAGE_EVENTS } from '../storageService';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Race Condition Handling', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Clear any existing data in storage service
    storageService.clearAllData();
  });

  afterEach(() => {
    // Clean up after each test
    storageService.clearAllData();
  });

  describe('Purchase Attempt Recording', () => {
    test('should record purchase attempts with timestamps', () => {
      const flashSaleId = 'test_flash_sale_1';
      const buyerId1 = 'user2';
      const buyerId2 = 'user3';
      const timestamp1 = Date.now();
      const timestamp2 = timestamp1 + 100; // 100ms later

      // Record first purchase attempt
      storageService.recordPurchaseAttempt(flashSaleId, buyerId1, timestamp1);
      
      // Record second purchase attempt
      storageService.recordPurchaseAttempt(flashSaleId, buyerId2, timestamp2);

      const attempts = storageService.getPurchaseAttempts(flashSaleId);
      
      expect(attempts).toHaveLength(2);
      expect(attempts[0]).toMatchObject({
        flashSaleId,
        buyerId: buyerId1,
        timestamp: timestamp1,
        status: 'processing'
      });
      expect(attempts[1]).toMatchObject({
        flashSaleId,
        buyerId: buyerId2,
        timestamp: timestamp2,
        status: 'processing'
      });
    });

    test('should complete purchase attempts', () => {
      const flashSaleId = 'test_flash_sale_1';
      const buyerId = 'user2';
      const timestamp = Date.now();

      // Record and complete purchase attempt
      storageService.recordPurchaseAttempt(flashSaleId, buyerId, timestamp);
      storageService.completePurchaseAttempt(flashSaleId, buyerId, timestamp);

      const attempts = storageService.getPurchaseAttempts(flashSaleId);
      
      expect(attempts).toHaveLength(1);
      expect(attempts[0].status).toBe('completed');
      expect(attempts[0].completedAt).toBeDefined();
    });
  });

  describe('Race Condition Detection', () => {
    test('should allow first purchase attempt to succeed', () => {
      // Create a flash sale
      const flashSaleData = {
        id: 'test_flash_sale_1',
        orderId: 'order_123',
        productName: 'Test Product',
        category: 'Electronics',
        originalPrice: 1000,
        discountedPrice: 800,
        image: 'test.jpg',
        availableFor: ['user2', 'user3'],
        status: 'active',
        expiresAt: new Date(Date.now() + 300000).toISOString() // 5 minutes from now
      };

      storageService.storeFlashSale(flashSaleData);

      const buyerId = 'user2';
      const timestamp = Date.now();

      // First purchase attempt should succeed
      const result = storageService.markFlashSalePurchased(flashSaleData.id, buyerId, timestamp);

      expect(result.success).toBe(true);
      expect(result.purchaseTimestamp).toBe(timestamp);
      
      // Verify flash sale is marked as sold
      const flashSales = storageService.getFlashSales();
      expect(flashSales[flashSaleData.id].status).toBe('sold');
      expect(flashSales[flashSaleData.id].buyerId).toBe(buyerId);
    });

    test('should reject second purchase attempt for same flash sale', () => {
      // Create a flash sale
      const flashSaleData = {
        id: 'test_flash_sale_1',
        orderId: 'order_123',
        productName: 'Test Product',
        category: 'Electronics',
        originalPrice: 1000,
        discountedPrice: 800,
        image: 'test.jpg',
        availableFor: ['user2', 'user3'],
        status: 'active',
        expiresAt: new Date(Date.now() + 300000).toISOString()
      };

      storageService.storeFlashSale(flashSaleData);

      const buyerId1 = 'user2';
      const buyerId2 = 'user3';
      const timestamp1 = Date.now();
      const timestamp2 = timestamp1 + 100;

      // First purchase succeeds
      const result1 = storageService.markFlashSalePurchased(flashSaleData.id, buyerId1, timestamp1);
      expect(result1.success).toBe(true);

      // Second purchase should fail
      const result2 = storageService.markFlashSalePurchased(flashSaleData.id, buyerId2, timestamp2);
      expect(result2.success).toBe(false);
      expect(result2.reason).toBe('ALREADY_SOLD');
      expect(result2.soldTo).toBe(buyerId1);
    });

    test('should handle race condition with earlier timestamp wins', () => {
      // Create a flash sale
      const flashSaleData = {
        id: 'test_flash_sale_1',
        orderId: 'order_123',
        productName: 'Test Product',
        category: 'Electronics',
        originalPrice: 1000,
        discountedPrice: 800,
        image: 'test.jpg',
        availableFor: ['user2', 'user3'],
        status: 'active',
        expiresAt: new Date(Date.now() + 300000).toISOString()
      };

      storageService.storeFlashSale(flashSaleData);

      const buyerId1 = 'user2';
      const buyerId2 = 'user3';
      const timestamp1 = Date.now();
      const timestamp2 = timestamp1 - 50; // Earlier timestamp

      // User2 attempts purchase first (later timestamp)
      const result1 = storageService.markFlashSalePurchased(flashSaleData.id, buyerId1, timestamp1);
      expect(result1.success).toBe(true);

      // User3 attempts purchase second (earlier timestamp) - should fail because item is already sold
      const result2 = storageService.markFlashSalePurchased(flashSaleData.id, buyerId2, timestamp2);
      expect(result2.success).toBe(false);
      expect(result2.reason).toBe('ALREADY_SOLD');
      expect(result2.soldTo).toBe(buyerId1);
    });

    test('should handle non-existent flash sale', () => {
      const result = storageService.markFlashSalePurchased('non_existent_id', 'user2', Date.now());

      expect(result.success).toBe(false);
      expect(result.reason).toBe('NOT_FOUND');
      expect(result.error).toBe('Flash sale not found');
    });
  });

  describe('Cleanup Functionality', () => {
    test('should clean up old purchase attempts', () => {
      const flashSaleId = 'test_flash_sale_1';
      const buyerId = 'user2';
      const oldTimestamp = Date.now() - (2 * 60 * 60 * 1000); // 2 hours ago
      const recentTimestamp = Date.now() - (30 * 60 * 1000); // 30 minutes ago

      // Record old and recent attempts
      storageService.recordPurchaseAttempt(flashSaleId, buyerId, oldTimestamp);
      storageService.recordPurchaseAttempt(flashSaleId, 'user3', recentTimestamp);

      // Verify both attempts exist
      let attempts = storageService.getPurchaseAttempts(flashSaleId);
      expect(attempts).toHaveLength(2);

      // Run cleanup
      storageService.cleanupOldPurchaseAttempts();

      // Verify only recent attempt remains
      attempts = storageService.getPurchaseAttempts(flashSaleId);
      expect(attempts).toHaveLength(1);
      expect(attempts[0].timestamp).toBe(recentTimestamp);
    });
  });

  describe('Edge Cases', () => {
    test('should handle simultaneous purchases with identical timestamps', () => {
      // Create a flash sale
      const flashSaleData = {
        id: 'test_flash_sale_1',
        orderId: 'order_123',
        productName: 'Test Product',
        category: 'Electronics',
        originalPrice: 1000,
        discountedPrice: 800,
        image: 'test.jpg',
        availableFor: ['user2', 'user3'],
        status: 'active',
        expiresAt: new Date(Date.now() + 300000).toISOString()
      };

      storageService.storeFlashSale(flashSaleData);

      const buyerId1 = 'user2';
      const buyerId2 = 'user3';
      const sameTimestamp = Date.now();

      // First purchase with same timestamp should succeed
      const result1 = storageService.markFlashSalePurchased(flashSaleData.id, buyerId1, sameTimestamp);
      expect(result1.success).toBe(true);

      // Second purchase with same timestamp should fail (already sold)
      const result2 = storageService.markFlashSalePurchased(flashSaleData.id, buyerId2, sameTimestamp);
      expect(result2.success).toBe(false);
      expect(result2.reason).toBe('ALREADY_SOLD');
    });

    test('should handle localStorage unavailable gracefully', () => {
      // Test the error handling by mocking isStorageAvailable to return false
      const originalIsStorageAvailable = storageService.isStorageAvailable;
      storageService.isStorageAvailable = jest.fn(() => false);

      const result = storageService.markFlashSalePurchased('test_id', 'user2', Date.now());

      expect(result.success).toBe(false);
      expect(result.reason).toBe('NOT_FOUND'); // Since storage is unavailable, flash sale won't be found

      // Restore original method
      storageService.isStorageAvailable = originalIsStorageAvailable;
    });

    test('should handle proper race condition with simultaneous attempts', () => {
      // Create a flash sale
      const flashSaleData = {
        id: 'test_flash_sale_race',
        orderId: 'order_race',
        productName: 'Race Test Product',
        category: 'Electronics',
        originalPrice: 1000,
        discountedPrice: 800,
        image: 'test.jpg',
        availableFor: ['user2', 'user3'],
        status: 'active',
        expiresAt: new Date(Date.now() + 300000).toISOString()
      };

      storageService.storeFlashSale(flashSaleData);

      const buyerId1 = 'user2';
      const buyerId2 = 'user3';
      const timestamp1 = Date.now();
      const timestamp2 = timestamp1 + 10; // 10ms later

      // Simulate user2 starting purchase process first (records attempt)
      storageService.recordPurchaseAttempt(flashSaleData.id, buyerId1, timestamp1);

      // User3 tries to purchase with later timestamp - should lose due to race condition
      const result2 = storageService.markFlashSalePurchased(flashSaleData.id, buyerId2, timestamp2);
      expect(result2.success).toBe(false);
      expect(result2.reason).toBe('RACE_CONDITION_LOST');
      expect(result2.winningBuyer).toBe(buyerId1);
      expect(result2.winningTimestamp).toBe(timestamp1);

      // Verify flash sale is still available for user2 to complete
      const flashSales = storageService.getFlashSales();
      expect(flashSales[flashSaleData.id]).toBeDefined();
      expect(flashSales[flashSaleData.id].status).toBe('active');

      // User2 completes their purchase - should succeed
      const result1 = storageService.markFlashSalePurchased(flashSaleData.id, buyerId1, timestamp1);
      expect(result1.success).toBe(true);
    });
  });
});