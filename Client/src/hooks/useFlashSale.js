import { useState, useEffect, useCallback, useRef } from 'react';
import storageService, { STORAGE_EVENTS } from '../services/storageService';
import { APP_CONFIG, FLASH_SALE_STATUS } from '../utils/constants';
import { isUserInterestedInCategory } from '../services/mockData';

/**
 * Custom hook for managing flash sale state and cross-tab synchronization
 * Handles flash sale creation, purchase, and expiration logic
 * Integrates with storage service for real-time updates
 */
export const useFlashSale = (userId) => {
  // State management
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for cleanup and timers
  const timersRef = useRef(new Map());
  const mountedRef = useRef(true);

  /**
   * Handle storage events from other tabs
   */
  const handleStorageEvent = useCallback((event) => {
    if (!mountedRef.current) return;

    try {
      switch (event.type) {
        case STORAGE_EVENTS.FLASH_SALE_CREATED:
          handleFlashSaleCreated(event.data);
          break;
        case STORAGE_EVENTS.FLASH_SALE_PURCHASED:
          handleFlashSalePurchased(event.data);
          break;
        case STORAGE_EVENTS.FLASH_SALE_EXPIRED:
          handleFlashSaleExpired(event.data);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error handling storage event:', err);
      setError('Failed to sync flash sale data');
    }
  }, []);

  /**
   * Handle flash sale creation event
   */
  const handleFlashSaleCreated = useCallback((flashSaleData) => {
    // Only show flash sales for products the user is interested in
    if (!isUserInterestedInCategory(userId, flashSaleData.category)) {
      return;
    }

    // Check if user is in the availableFor list
    if (!flashSaleData.availableFor || !flashSaleData.availableFor.includes(userId)) {
      return;
    }

    setFlashSales(prevSales => {
      // Avoid duplicates
      const existingIndex = prevSales.findIndex(sale => sale.id === flashSaleData.id);
      if (existingIndex >= 0) {
        return prevSales;
      }

      const newSale = {
        ...flashSaleData,
        timeLeft: APP_CONFIG.FLASH_SALE_DURATION
      };

      // Set up expiration timer
      setupExpirationTimer(newSale.id, APP_CONFIG.FLASH_SALE_DURATION);

      return [...prevSales, newSale];
    });
  }, [userId]);

  /**
   * Handle flash sale purchase event
   */
  const handleFlashSalePurchased = useCallback((purchaseData) => {
    setFlashSales(prevSales => 
      prevSales.filter(sale => sale.id !== purchaseData.flashSaleId)
    );

    // Clear any existing timer for this flash sale
    clearExpirationTimer(purchaseData.flashSaleId);
  }, []);

  /**
   * Handle flash sale expiration event
   */
  const handleFlashSaleExpired = useCallback((expirationData) => {
    setFlashSales(prevSales => 
      prevSales.filter(sale => sale.id !== expirationData.flashSaleId)
    );

    // Clear the timer for this flash sale
    clearExpirationTimer(expirationData.flashSaleId);
  }, []);

  /**
   * Set up expiration timer for a flash sale
   */
  const setupExpirationTimer = useCallback((flashSaleId, duration) => {
    // Clear existing timer if any
    clearExpirationTimer(flashSaleId);

    const timerId = setTimeout(() => {
      if (!mountedRef.current) return;

      // Mark as expired in storage
      storageService.markFlashSaleExpired(flashSaleId);

      // Remove from local state
      setFlashSales(prevSales => 
        prevSales.filter(sale => sale.id !== flashSaleId)
      );

      // Clean up timer reference
      timersRef.current.delete(flashSaleId);
    }, duration);

    timersRef.current.set(flashSaleId, timerId);
  }, []);

  /**
   * Clear expiration timer for a flash sale
   */
  const clearExpirationTimer = useCallback((flashSaleId) => {
    const timerId = timersRef.current.get(flashSaleId);
    if (timerId) {
      clearTimeout(timerId);
      timersRef.current.delete(flashSaleId);
    }
  }, []);

  /**
   * Create a new flash sale from a cancelled order
   */
  const createFlashSale = useCallback(async (orderData, availableForUsers = []) => {
    setLoading(true);
    setError(null);

    try {
      const flashSaleData = {
        id: `flash_sale_${orderData.id}_${Date.now()}`,
        orderId: orderData.id,
        productName: orderData.productName,
        category: orderData.category,
        originalPrice: orderData.price,
        discountedPrice: orderData.discountedPrice,
        image: orderData.image,
        description: orderData.description,
        availableFor: availableForUsers,
        status: FLASH_SALE_STATUS.ACTIVE,
        expiresAt: new Date(Date.now() + APP_CONFIG.FLASH_SALE_DURATION).toISOString()
      };

      // Broadcast the flash sale to other tabs
      const eventId = storageService.broadcastFlashSale(flashSaleData);
      
      return { success: true, flashSaleId: flashSaleData.id, eventId };
    } catch (err) {
      console.error('Error creating flash sale:', err);
      setError('Failed to create flash sale');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Purchase a flash sale item with race condition handling
   */
  const purchaseFlashSale = useCallback(async (flashSaleId) => {
    setLoading(true);
    setError(null);

    try {
      // Check if flash sale still exists and is active in local state
      const existingFlashSale = flashSales.find(sale => sale.id === flashSaleId);
      if (!existingFlashSale) {
        throw new Error('Flash sale no longer available');
      }

      // Record the purchase attempt timestamp for race condition handling
      const purchaseTimestamp = Date.now();

      // Attempt to mark as purchased in storage with race condition handling
      const result = storageService.markFlashSalePurchased(flashSaleId, userId, purchaseTimestamp);

      if (!result.success) {
        // Handle different failure reasons
        switch (result.reason) {
          case 'NOT_FOUND':
            setError('Flash sale not found');
            break;
          case 'ALREADY_SOLD':
            setError(`Item was already purchased by another user`);
            break;
          case 'RACE_CONDITION_LOST':
            setError('Another user purchased this item first. Better luck next time!');
            break;
          case 'SYSTEM_ERROR':
          default:
            setError('Failed to purchase item. Please try again.');
            break;
        }

        // Remove from local state since it's no longer available
        setFlashSales(prevSales => 
          prevSales.filter(sale => sale.id !== flashSaleId)
        );

        // Clear expiration timer
        clearExpirationTimer(flashSaleId);

        return { 
          success: false, 
          error: result.error,
          reason: result.reason,
          details: result
        };
      }

      // Success - remove from local state immediately
      setFlashSales(prevSales => 
        prevSales.filter(sale => sale.id !== flashSaleId)
      );

      // Clear expiration timer
      clearExpirationTimer(flashSaleId);

      return { 
        success: true, 
        eventId: result.eventId,
        purchaseTimestamp: result.purchaseTimestamp
      };
    } catch (err) {
      console.error('Error purchasing flash sale:', err);
      setError('Failed to purchase item');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [flashSales, userId, clearExpirationTimer]);

  /**
   * Dismiss a flash sale notification (remove from UI without purchasing)
   */
  const dismissFlashSale = useCallback((flashSaleId) => {
    setFlashSales(prevSales => 
      prevSales.filter(sale => sale.id !== flashSaleId)
    );
    
    // Clear expiration timer
    clearExpirationTimer(flashSaleId);
  }, [clearExpirationTimer]);

  /**
   * Load existing active flash sales for the user
   */
  const loadActiveFlashSales = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const activeFlashSales = storageService.getActiveFlashSalesForUser(userId);
      
      const validFlashSales = activeFlashSales
        .filter(sale => {
          // Check if flash sale hasn't expired
          const expiresAt = new Date(sale.expiresAt);
          const now = new Date();
          return expiresAt > now;
        })
        .map(sale => {
          // Calculate remaining time
          const expiresAt = new Date(sale.expiresAt);
          const now = new Date();
          const timeLeft = Math.max(0, expiresAt.getTime() - now.getTime());
          
          // Set up expiration timer if there's time left
          if (timeLeft > 0) {
            setupExpirationTimer(sale.id, timeLeft);
          }
          
          return {
            ...sale,
            timeLeft
          };
        })
        .filter(sale => sale.timeLeft > 0); // Only include non-expired sales

      setFlashSales(validFlashSales);
    } catch (err) {
      console.error('Error loading active flash sales:', err);
      setError('Failed to load flash sales');
    } finally {
      setLoading(false);
    }
  }, [userId, setupExpirationTimer]);

  /**
   * Clear all flash sales (useful for cleanup)
   */
  const clearAllFlashSales = useCallback(() => {
    // Clear all timers
    timersRef.current.forEach(timerId => clearTimeout(timerId));
    timersRef.current.clear();
    
    // Clear state
    setFlashSales([]);
    setError(null);
  }, []);

  /**
   * Get flash sale by ID
   */
  const getFlashSaleById = useCallback((flashSaleId) => {
    return flashSales.find(sale => sale.id === flashSaleId) || null;
  }, [flashSales]);

  // Initialize hook
  useEffect(() => {
    mountedRef.current = true;

    // Register storage event listener
    storageService.onStorageChange(handleStorageEvent);

    // Load existing active flash sales
    loadActiveFlashSales();

    // Cleanup function
    return () => {
      mountedRef.current = false;
      
      // Remove storage event listener
      storageService.removeListener(handleStorageEvent);
      
      // Clear all timers
      timersRef.current.forEach(timerId => clearTimeout(timerId));
      timersRef.current.clear();
    };
  }, [handleStorageEvent, loadActiveFlashSales]);

  // Return hook interface
  return {
    // State
    flashSales,
    loading,
    error,
    
    // Actions
    createFlashSale,
    purchaseFlashSale,
    dismissFlashSale,
    clearAllFlashSales,
    loadActiveFlashSales,
    
    // Getters
    getFlashSaleById,
    
    // Computed values
    hasActiveFlashSales: flashSales.length > 0,
    activeFlashSaleCount: flashSales.length
  };
};

export default useFlashSale;