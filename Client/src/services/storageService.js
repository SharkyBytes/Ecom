/**
 * Storage Service for Cross-Tab Communication
 * Handles localStorage-based communication between browser tabs
 * for flash sale events and real-time synchronization
 */

// Event types for cross-tab communication
export const STORAGE_EVENTS = {
  FLASH_SALE_CREATED: 'FLASH_SALE_CREATED',
  FLASH_SALE_PURCHASED: 'FLASH_SALE_PURCHASED',
  FLASH_SALE_EXPIRED: 'FLASH_SALE_EXPIRED',
  ORDER_CANCELLED: 'ORDER_CANCELLED'
};

// Storage keys
const STORAGE_KEYS = {
  FLASH_SALES: 'flash_sales',
  EVENTS: 'flash_sale_events',
  PURCHASES: 'flash_sale_purchases',
  PURCHASE_ATTEMPTS: 'flash_sale_purchase_attempts'
};

class StorageService {
  constructor() {
    this.listeners = new Set();
    this.eventId = 0;
    this.cleanupInterval = null;
    
    // Bind methods to maintain context
    this.handleStorageChange = this.handleStorageChange.bind(this);
    
    // Start listening for storage events
    this.initializeStorageListener();
    
    // Start periodic cleanup of old purchase attempts
    this.startPeriodicCleanup();
  }

  /**
   * Initialize storage event listener for cross-tab communication
   */
  initializeStorageListener() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange);
    }
  }

  /**
   * Handle storage change events from other tabs
   * @param {StorageEvent} event - The storage event
   */
  handleStorageChange(event) {
    if (!event.key || !event.key.startsWith('flash_sale_')) {
      return;
    }

    try {
      const eventData = JSON.parse(event.newValue || '{}');
      
      // Notify all registered listeners
      this.listeners.forEach(callback => {
        try {
          callback(eventData);
        } catch (error) {
          console.error('Error in storage event listener:', error);
        }
      });
    } catch (error) {
      console.error('Error parsing storage event data:', error);
    }
  }

  /**
   * Broadcast a flash sale creation event to all tabs
   * @param {Object} flashSaleData - The flash sale data
   */
  broadcastFlashSale(flashSaleData) {
    const event = {
      type: STORAGE_EVENTS.FLASH_SALE_CREATED,
      id: this.generateEventId(),
      timestamp: Date.now(),
      data: {
        ...flashSaleData,
        status: 'active',
        createdAt: new Date().toISOString()
      }
    };

    // Store the flash sale data
    this.storeFlashSale(event.data);
    
    // Broadcast the event
    this.broadcastEvent(event);
    
    return event.id;
  }

  /**
   * Mark a flash sale as purchased and broadcast the event
   * @param {string} flashSaleId - The flash sale ID
   * @param {string} buyerId - The ID of the user who purchased
   * @param {number} purchaseTimestamp - The timestamp when purchase was initiated
   * @returns {Object} Result object with success status and details
   */
  markFlashSalePurchased(flashSaleId, buyerId, purchaseTimestamp = Date.now()) {
    try {
      // Check if flash sale still exists and is active
      const flashSales = this.getFlashSales();
      const flashSale = flashSales[flashSaleId];
      
      if (!flashSale) {
        return {
          success: false,
          error: 'Flash sale not found',
          reason: 'NOT_FOUND'
        };
      }

      if (flashSale.status !== 'active') {
        return {
          success: false,
          error: 'Flash sale is no longer available',
          reason: 'ALREADY_SOLD',
          soldTo: flashSale.buyerId,
          soldAt: flashSale.purchasedAt
        };
      }

      // Check for race condition - if there's already a purchase attempt with an earlier timestamp
      const existingPurchaseAttempts = this.getPurchaseAttempts(flashSaleId);
      const earlierAttempt = existingPurchaseAttempts.find(attempt => 
        attempt.timestamp < purchaseTimestamp && 
        attempt.status === 'processing' &&
        attempt.buyerId !== buyerId // Don't compare with own attempts
      );

      if (earlierAttempt) {
        return {
          success: false,
          error: 'Another user purchased this item first',
          reason: 'RACE_CONDITION_LOST',
          winningBuyer: earlierAttempt.buyerId,
          winningTimestamp: earlierAttempt.timestamp
        };
      }

      // Record this purchase attempt
      this.recordPurchaseAttempt(flashSaleId, buyerId, purchaseTimestamp);

      const event = {
        type: STORAGE_EVENTS.FLASH_SALE_PURCHASED,
        id: this.generateEventId(),
        timestamp: Date.now(),
        data: {
          flashSaleId,
          buyerId,
          purchaseTimestamp,
          purchasedAt: new Date().toISOString()
        }
      };

      // Update flash sale status
      try {
        this.updateFlashSaleStatus(flashSaleId, 'sold', buyerId, purchaseTimestamp);
      } catch (updateError) {
        console.error('Error updating flash sale status:', updateError);
        return {
          success: false,
          error: 'Failed to update flash sale status',
          reason: 'SYSTEM_ERROR'
        };
      }
      
      // Mark purchase attempt as completed
      this.completePurchaseAttempt(flashSaleId, buyerId, purchaseTimestamp);
      
      // Broadcast the purchase event
      this.broadcastEvent(event);
      
      return {
        success: true,
        eventId: event.id,
        purchaseTimestamp
      };
    } catch (error) {
      console.error('Error marking flash sale as purchased:', error);
      return {
        success: false,
        error: 'Failed to process purchase',
        reason: 'SYSTEM_ERROR'
      };
    }
  }

  /**
   * Mark a flash sale as expired and broadcast the event
   * @param {string} flashSaleId - The flash sale ID
   */
  markFlashSaleExpired(flashSaleId) {
    const event = {
      type: STORAGE_EVENTS.FLASH_SALE_EXPIRED,
      id: this.generateEventId(),
      timestamp: Date.now(),
      data: {
        flashSaleId,
        expiredAt: new Date().toISOString()
      }
    };

    // Update flash sale status
    this.updateFlashSaleStatus(flashSaleId, 'expired');
    
    // Broadcast the expiration event
    this.broadcastEvent(event);
    
    return event.id;
  }

  /**
   * Broadcast an order cancellation event
   * @param {Object} orderData - The cancelled order data
   */
  broadcastOrderCancellation(orderData) {
    const event = {
      type: STORAGE_EVENTS.ORDER_CANCELLED,
      id: this.generateEventId(),
      timestamp: Date.now(),
      data: {
        ...orderData,
        cancelledAt: new Date().toISOString()
      }
    };

    this.broadcastEvent(event);
    return event.id;
  }

  /**
   * Generic method to broadcast events to other tabs
   * @param {Object} event - The event to broadcast
   */
  broadcastEvent(event) {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('localStorage not available, cannot broadcast event');
        return;
      }
      
      const eventKey = `flash_sale_event_${event.id}`;
      localStorage.setItem(eventKey, JSON.stringify(event));
      
      // Clean up the event after a short delay to prevent storage bloat
      setTimeout(() => {
        try {
          localStorage.removeItem(eventKey);
        } catch (error) {
          console.error('Error cleaning up event:', error);
        }
      }, 1000);
    } catch (error) {
      console.error('Error broadcasting event:', error);
    }
  }

  /**
   * Store flash sale data in localStorage
   * @param {Object} flashSaleData - The flash sale data to store
   */
  storeFlashSale(flashSaleData) {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('localStorage not available, cannot store flash sale');
        return;
      }
      
      const existingFlashSales = this.getFlashSales();
      existingFlashSales[flashSaleData.id] = flashSaleData;
      localStorage.setItem(STORAGE_KEYS.FLASH_SALES, JSON.stringify(existingFlashSales));
    } catch (error) {
      console.error('Error storing flash sale:', error);
    }
  }

  /**
   * Update flash sale status
   * @param {string} flashSaleId - The flash sale ID
   * @param {string} status - The new status
   * @param {string} buyerId - Optional buyer ID for purchases
   * @param {number} purchaseTimestamp - Optional purchase timestamp
   */
  updateFlashSaleStatus(flashSaleId, status, buyerId = null, purchaseTimestamp = null) {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('localStorage not available, cannot update flash sale status');
        return;
      }
      
      const flashSales = this.getFlashSales();
      if (flashSales[flashSaleId]) {
        flashSales[flashSaleId].status = status;
        if (buyerId) {
          flashSales[flashSaleId].buyerId = buyerId;
          flashSales[flashSaleId].purchasedAt = new Date().toISOString();
          if (purchaseTimestamp) {
            flashSales[flashSaleId].purchaseTimestamp = purchaseTimestamp;
          }
        }
        if (status === 'expired') {
          flashSales[flashSaleId].expiredAt = new Date().toISOString();
        }
        localStorage.setItem(STORAGE_KEYS.FLASH_SALES, JSON.stringify(flashSales));
      }
    } catch (error) {
      console.error('Error updating flash sale status:', error);
    }
  }

  /**
   * Get all flash sales from localStorage
   * @returns {Object} Flash sales data
   */
  getFlashSales() {
    try {
      if (!this.isStorageAvailable()) {
        return {};
      }
      
      const flashSales = localStorage.getItem(STORAGE_KEYS.FLASH_SALES);
      return flashSales ? JSON.parse(flashSales) : {};
    } catch (error) {
      console.error('Error getting flash sales:', error);
      return {};
    }
  }

  /**
   * Get active flash sales for a specific user
   * @param {string} userId - The user ID
   * @returns {Array} Array of active flash sales for the user
   */
  getActiveFlashSalesForUser(userId) {
    try {
      const flashSales = this.getFlashSales();
      return Object.values(flashSales).filter(sale => 
        sale.status === 'active' && 
        sale.availableFor && 
        sale.availableFor.includes(userId)
      );
    } catch (error) {
      console.error('Error getting active flash sales for user:', error);
      return [];
    }
  }

  /**
   * Register a listener for storage events
   * @param {Function} callback - The callback function to register
   */
  onStorageChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
    }
  }

  /**
   * Remove a storage event listener
   * @param {Function} callback - The callback function to remove
   */
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Start periodic cleanup of old purchase attempts
   */
  startPeriodicCleanup() {
    // Clean up every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldPurchaseAttempts();
    }, 10 * 60 * 1000);
    
    // Run initial cleanup
    this.cleanupOldPurchaseAttempts();
  }

  /**
   * Clean up all listeners and storage event listener
   */
  cleanup() {
    this.listeners.clear();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageChange);
    }
    
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Generate a unique event ID
   * @returns {string} Unique event ID
   */
  generateEventId() {
    return `${Date.now()}_${++this.eventId}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all flash sale data (useful for testing)
   */
  clearAllData() {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('localStorage not available, cannot clear data');
        return;
      }
      
      localStorage.removeItem(STORAGE_KEYS.FLASH_SALES);
      localStorage.removeItem(STORAGE_KEYS.EVENTS);
      localStorage.removeItem(STORAGE_KEYS.PURCHASES);
      localStorage.removeItem(STORAGE_KEYS.PURCHASE_ATTEMPTS);
      
      // Clear any event keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('flash_sale_event_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing storage data:', error);
    }
  }

  /**
   * Record a purchase attempt for race condition handling
   * @param {string} flashSaleId - The flash sale ID
   * @param {string} buyerId - The buyer ID
   * @param {number} timestamp - The purchase attempt timestamp
   */
  recordPurchaseAttempt(flashSaleId, buyerId, timestamp) {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('localStorage not available, cannot record purchase attempt');
        return;
      }

      const attempts = this.getPurchaseAttempts(flashSaleId);
      const newAttempt = {
        flashSaleId,
        buyerId,
        timestamp,
        status: 'processing',
        recordedAt: new Date().toISOString()
      };

      attempts.push(newAttempt);
      
      const allAttempts = this.getAllPurchaseAttempts();
      allAttempts[flashSaleId] = attempts;
      
      localStorage.setItem(STORAGE_KEYS.PURCHASE_ATTEMPTS, JSON.stringify(allAttempts));
    } catch (error) {
      console.error('Error recording purchase attempt:', error);
    }
  }

  /**
   * Get purchase attempts for a specific flash sale
   * @param {string} flashSaleId - The flash sale ID
   * @returns {Array} Array of purchase attempts
   */
  getPurchaseAttempts(flashSaleId) {
    try {
      const allAttempts = this.getAllPurchaseAttempts();
      return allAttempts[flashSaleId] || [];
    } catch (error) {
      console.error('Error getting purchase attempts:', error);
      return [];
    }
  }

  /**
   * Get all purchase attempts from localStorage
   * @returns {Object} All purchase attempts data
   */
  getAllPurchaseAttempts() {
    try {
      if (!this.isStorageAvailable()) {
        return {};
      }
      
      const attempts = localStorage.getItem(STORAGE_KEYS.PURCHASE_ATTEMPTS);
      return attempts ? JSON.parse(attempts) : {};
    } catch (error) {
      console.error('Error getting all purchase attempts:', error);
      return {};
    }
  }

  /**
   * Mark a purchase attempt as completed
   * @param {string} flashSaleId - The flash sale ID
   * @param {string} buyerId - The buyer ID
   * @param {number} timestamp - The purchase attempt timestamp
   */
  completePurchaseAttempt(flashSaleId, buyerId, timestamp) {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('localStorage not available, cannot complete purchase attempt');
        return;
      }

      const allAttempts = this.getAllPurchaseAttempts();
      const attempts = allAttempts[flashSaleId] || [];
      
      const attemptIndex = attempts.findIndex(attempt => 
        attempt.buyerId === buyerId && attempt.timestamp === timestamp
      );

      if (attemptIndex >= 0) {
        attempts[attemptIndex].status = 'completed';
        attempts[attemptIndex].completedAt = new Date().toISOString();
        
        allAttempts[flashSaleId] = attempts;
        localStorage.setItem(STORAGE_KEYS.PURCHASE_ATTEMPTS, JSON.stringify(allAttempts));
      }
    } catch (error) {
      console.error('Error completing purchase attempt:', error);
    }
  }

  /**
   * Clean up old purchase attempts (older than 1 hour)
   */
  cleanupOldPurchaseAttempts() {
    try {
      if (!this.isStorageAvailable()) {
        return;
      }

      const allAttempts = this.getAllPurchaseAttempts();
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      let hasChanges = false;

      Object.keys(allAttempts).forEach(flashSaleId => {
        const attempts = allAttempts[flashSaleId];
        const filteredAttempts = attempts.filter(attempt => attempt.timestamp > oneHourAgo);
        
        if (filteredAttempts.length !== attempts.length) {
          allAttempts[flashSaleId] = filteredAttempts;
          hasChanges = true;
        }

        // Remove empty arrays
        if (filteredAttempts.length === 0) {
          delete allAttempts[flashSaleId];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        localStorage.setItem(STORAGE_KEYS.PURCHASE_ATTEMPTS, JSON.stringify(allAttempts));
      }
    } catch (error) {
      console.error('Error cleaning up old purchase attempts:', error);
    }
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} True if localStorage is available
   */
  isStorageAvailable() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return false;
      }
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create and export a singleton instance
const storageService = new StorageService();

export default storageService;