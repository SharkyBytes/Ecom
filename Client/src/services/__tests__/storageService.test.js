/**
 * Tests for StorageService
 * Testing cross-tab communication functionality
 */

// Mock localStorage before importing the service
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => Object.keys(store)[index] || null)
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock window.addEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true
});
Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true
});

import storageService, { STORAGE_EVENTS } from '../storageService';



describe('StorageService', () => {
  beforeEach(() => {
    // Clear localStorage mock
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Clear any existing listeners
    storageService.listeners.clear();
    
    // Reset the localStorage mock to work properly
    localStorageMock.getItem.mockImplementation((key) => {
      const store = localStorageMock.__store || {};
      return store[key] || null;
    });
    
    localStorageMock.setItem.mockImplementation((key, value) => {
      if (!localStorageMock.__store) localStorageMock.__store = {};
      localStorageMock.__store[key] = value.toString();
    });
    
    localStorageMock.removeItem.mockImplementation((key) => {
      if (localStorageMock.__store) {
        delete localStorageMock.__store[key];
      }
    });
    
    localStorageMock.clear.mockImplementation(() => {
      localStorageMock.__store = {};
    });
  });

  afterEach(() => {
    storageService.clearAllData();
  });

  describe('Initialization', () => {
    test('should have storage listener initialized', () => {
      // The service should be initialized and have listeners set up
      expect(storageService.listeners).toBeDefined();
      expect(storageService.handleStorageChange).toBeDefined();
    });

    test('should check if localStorage is available', () => {
      expect(storageService.isStorageAvailable()).toBe(true);
    });
  });

  describe('Flash Sale Broadcasting', () => {
    test('should broadcast flash sale creation event', () => {
      const flashSaleData = {
        id: 'flash_sale_1',
        orderId: 'order_123',
        productName: 'Test Product',
        originalPrice: 100,
        discountedPrice: 80,
        availableFor: ['user2', 'user3']
      };

      const eventId = storageService.broadcastFlashSale(flashSaleData);

      expect(eventId).toBeDefined();
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      // Check if flash sale was stored
      const storedFlashSales = storageService.getFlashSales();
      expect(storedFlashSales[flashSaleData.id]).toBeDefined();
      expect(storedFlashSales[flashSaleData.id].status).toBe('active');
    });

    test('should mark flash sale as purchased', () => {
      const flashSaleId = 'flash_sale_1';
      const buyerId = 'user2';

      // First create a flash sale
      storageService.storeFlashSale({
        id: flashSaleId,
        status: 'active',
        productName: 'Test Product'
      });

      const eventId = storageService.markFlashSalePurchased(flashSaleId, buyerId);

      expect(eventId).toBeDefined();
      
      // Check if flash sale status was updated
      const flashSales = storageService.getFlashSales();
      expect(flashSales[flashSaleId].status).toBe('sold');
      expect(flashSales[flashSaleId].buyerId).toBe(buyerId);
    });

    test('should mark flash sale as expired', () => {
      const flashSaleId = 'flash_sale_1';

      // First create a flash sale
      storageService.storeFlashSale({
        id: flashSaleId,
        status: 'active',
        productName: 'Test Product'
      });

      const eventId = storageService.markFlashSaleExpired(flashSaleId);

      expect(eventId).toBeDefined();
      
      // Check if flash sale status was updated
      const flashSales = storageService.getFlashSales();
      expect(flashSales[flashSaleId].status).toBe('expired');
    });
  });

  describe('Event Listeners', () => {
    test('should register and remove event listeners', () => {
      const mockCallback = jest.fn();

      storageService.onStorageChange(mockCallback);
      expect(storageService.listeners.has(mockCallback)).toBe(true);

      storageService.removeListener(mockCallback);
      expect(storageService.listeners.has(mockCallback)).toBe(false);
    });

    test('should handle storage change events', () => {
      const mockCallback = jest.fn();
      storageService.onStorageChange(mockCallback);

      const mockEvent = {
        key: 'flash_sale_event_123',
        newValue: JSON.stringify({
          type: STORAGE_EVENTS.FLASH_SALE_CREATED,
          data: { productName: 'Test Product' }
        })
      };

      storageService.handleStorageChange(mockEvent);
      expect(mockCallback).toHaveBeenCalledWith({
        type: STORAGE_EVENTS.FLASH_SALE_CREATED,
        data: { productName: 'Test Product' }
      });
    });

    test('should ignore non-flash-sale storage events', () => {
      const mockCallback = jest.fn();
      storageService.onStorageChange(mockCallback);

      const mockEvent = {
        key: 'some_other_key',
        newValue: JSON.stringify({ data: 'test' })
      };

      storageService.handleStorageChange(mockEvent);
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Flash Sale Retrieval', () => {
    test('should get active flash sales for user', () => {
      const userId = 'user2';
      const flashSales = {
        'sale1': {
          id: 'sale1',
          status: 'active',
          availableFor: ['user2', 'user3'],
          productName: 'Product 1'
        },
        'sale2': {
          id: 'sale2',
          status: 'sold',
          availableFor: ['user2', 'user3'],
          productName: 'Product 2'
        },
        'sale3': {
          id: 'sale3',
          status: 'active',
          availableFor: ['user3'],
          productName: 'Product 3'
        }
      };

      // Store flash sales
      localStorageMock.setItem('flash_sales', JSON.stringify(flashSales));

      const activeFlashSales = storageService.getActiveFlashSalesForUser(userId);
      
      expect(activeFlashSales).toHaveLength(1);
      expect(activeFlashSales[0].id).toBe('sale1');
    });

    test('should return empty array when no active flash sales for user', () => {
      const userId = 'user1';
      const activeFlashSales = storageService.getActiveFlashSalesForUser(userId);
      
      expect(activeFlashSales).toHaveLength(0);
    });
  });

  describe('Cleanup', () => {
    test('should cleanup listeners and storage events', () => {
      const mockCallback = jest.fn();
      storageService.onStorageChange(mockCallback);

      storageService.cleanup();

      expect(storageService.listeners.size).toBe(0);
      expect(mockRemoveEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
    });

    test('should clear all data', () => {
      // Add some test data
      storageService.storeFlashSale({
        id: 'test_sale',
        status: 'active'
      });

      storageService.clearAllData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('flash_sales');
    });
  });

  describe('Error Handling', () => {
    test('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const flashSaleData = {
        id: 'test_sale',
        productName: 'Test Product'
      };

      // Should not throw an error
      expect(() => {
        storageService.broadcastFlashSale(flashSaleData);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should handle invalid JSON in storage events', () => {
      const mockCallback = jest.fn();
      storageService.onStorageChange(mockCallback);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockEvent = {
        key: 'flash_sale_event_123',
        newValue: 'invalid json'
      };

      storageService.handleStorageChange(mockEvent);
      
      expect(mockCallback).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});