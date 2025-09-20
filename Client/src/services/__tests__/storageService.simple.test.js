/**
 * Simple integration tests for StorageService
 * Testing the core functionality in a browser-like environment
 */

import { STORAGE_EVENTS } from '../storageService';

// Simple test to verify the service can be imported and has the right structure
describe('StorageService - Basic Functionality', () => {
  test('should export STORAGE_EVENTS constants', () => {
    expect(STORAGE_EVENTS).toBeDefined();
    expect(STORAGE_EVENTS.FLASH_SALE_CREATED).toBe('FLASH_SALE_CREATED');
    expect(STORAGE_EVENTS.FLASH_SALE_PURCHASED).toBe('FLASH_SALE_PURCHASED');
    expect(STORAGE_EVENTS.FLASH_SALE_EXPIRED).toBe('FLASH_SALE_EXPIRED');
    expect(STORAGE_EVENTS.ORDER_CANCELLED).toBe('ORDER_CANCELLED');
  });

  test('should have all required methods', () => {
    // Import the service dynamically to avoid window issues
    return import('../storageService').then((module) => {
      const storageService = module.default;
      
      expect(typeof storageService.broadcastFlashSale).toBe('function');
      expect(typeof storageService.markFlashSalePurchased).toBe('function');
      expect(typeof storageService.markFlashSaleExpired).toBe('function');
      expect(typeof storageService.broadcastOrderCancellation).toBe('function');
      expect(typeof storageService.onStorageChange).toBe('function');
      expect(typeof storageService.removeListener).toBe('function');
      expect(typeof storageService.getFlashSales).toBe('function');
      expect(typeof storageService.getActiveFlashSalesForUser).toBe('function');
      expect(typeof storageService.clearAllData).toBe('function');
      expect(typeof storageService.isStorageAvailable).toBe('function');
    });
  });

  test('should handle missing localStorage gracefully', () => {
    return import('../storageService').then((module) => {
      const storageService = module.default;
      
      // In Node.js environment, localStorage should not be available
      // The service should handle this gracefully
      expect(() => {
        storageService.getFlashSales();
      }).not.toThrow();
      
      expect(() => {
        storageService.broadcastFlashSale({
          id: 'test',
          productName: 'Test Product'
        });
      }).not.toThrow();
    });
  });
});