import { renderHook, act } from '@testing-library/react';
import { useFlashSale } from '../useFlashSale';
import storageService from '../../services/storageService';
import { MOCK_ORDERS } from '../../services/mockData';

// Mock the storage service
jest.mock('../../services/storageService');

// Mock the mockData module
jest.mock('../../services/mockData', () => ({
  ...jest.requireActual('../../services/mockData'),
  isUserInterestedInCategory: jest.fn().mockReturnValue(true)
}));

describe('useFlashSale', () => {
  const mockUserId = 'user2';
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock storage service methods
    storageService.onStorageChange = jest.fn();
    storageService.removeListener = jest.fn();
    storageService.getActiveFlashSalesForUser = jest.fn().mockReturnValue([]);
    storageService.broadcastFlashSale = jest.fn().mockReturnValue('event_123');
    storageService.markFlashSalePurchased = jest.fn().mockReturnValue('event_456');
    storageService.markFlashSaleExpired = jest.fn().mockReturnValue('event_789');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with empty flash sales', () => {
    const { result } = renderHook(() => useFlashSale(mockUserId));
    
    expect(result.current.flashSales).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasActiveFlashSales).toBe(false);
    expect(result.current.activeFlashSaleCount).toBe(0);
  });

  it('should register storage event listener on mount', () => {
    renderHook(() => useFlashSale(mockUserId));
    
    expect(storageService.onStorageChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should load active flash sales on mount', () => {
    renderHook(() => useFlashSale(mockUserId));
    
    expect(storageService.getActiveFlashSalesForUser).toHaveBeenCalledWith(mockUserId);
  });

  it('should create flash sale successfully', async () => {
    const { result } = renderHook(() => useFlashSale(mockUserId));
    const orderData = MOCK_ORDERS.order1;
    const availableForUsers = ['user2', 'user3'];
    
    let createResult;
    await act(async () => {
      createResult = await result.current.createFlashSale(orderData, availableForUsers);
    });
    
    expect(createResult.success).toBe(true);
    expect(createResult.flashSaleId).toBeDefined();
    expect(createResult.eventId).toBe('event_123');
    expect(storageService.broadcastFlashSale).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: orderData.id,
        productName: orderData.productName,
        category: orderData.category,
        originalPrice: orderData.price,
        discountedPrice: orderData.discountedPrice,
        availableFor: availableForUsers
      })
    );
  });

  it('should purchase flash sale successfully', async () => {
    const { result } = renderHook(() => useFlashSale(mockUserId));
    
    // First add a flash sale to state
    const mockFlashSale = {
      id: 'flash_sale_123',
      orderId: 'order1',
      productName: 'Test Product',
      category: 'Electronics',
      originalPrice: 1000,
      discountedPrice: 800,
      availableFor: [mockUserId],
      timeLeft: 300000
    };
    
    act(() => {
      result.current.flashSales.push(mockFlashSale);
    });
    
    let purchaseResult;
    await act(async () => {
      purchaseResult = await result.current.purchaseFlashSale('flash_sale_123');
    });
    
    expect(purchaseResult.success).toBe(true);
    expect(purchaseResult.eventId).toBe('event_456');
    expect(storageService.markFlashSalePurchased).toHaveBeenCalledWith('flash_sale_123', mockUserId);
  });

  it('should handle flash sale expiration event', () => {
    const { result } = renderHook(() => useFlashSale(mockUserId));
    
    // Add a flash sale to state first
    act(() => {
      result.current.flashSales.push({
        id: 'flash_sale_123',
        productName: 'Test Product'
      });
    });
    
    expect(result.current.flashSales).toHaveLength(1);
    
    // Simulate expiration event from storage
    act(() => {
      const storageEventHandler = storageService.onStorageChange.mock.calls[0][0];
      storageEventHandler({
        type: 'FLASH_SALE_EXPIRED',
        data: { flashSaleId: 'flash_sale_123' }
      });
    });
    
    // Flash sale should be removed from state
    expect(result.current.flashSales).toHaveLength(0);
  });

  it('should dismiss flash sale', () => {
    const { result } = renderHook(() => useFlashSale(mockUserId));
    
    // Add a mock flash sale
    const mockFlashSale = {
      id: 'flash_sale_123',
      productName: 'Test Product'
    };
    
    act(() => {
      result.current.flashSales.push(mockFlashSale);
    });
    
    expect(result.current.flashSales).toHaveLength(1);
    
    act(() => {
      result.current.dismissFlashSale('flash_sale_123');
    });
    
    expect(result.current.flashSales).toHaveLength(0);
  });

  it('should clean up on unmount', () => {
    const { unmount } = renderHook(() => useFlashSale(mockUserId));
    
    unmount();
    
    expect(storageService.removeListener).toHaveBeenCalled();
  });

  it('should get flash sale by ID', () => {
    const { result } = renderHook(() => useFlashSale(mockUserId));
    
    const mockFlashSale = {
      id: 'flash_sale_123',
      productName: 'Test Product'
    };
    
    act(() => {
      result.current.flashSales.push(mockFlashSale);
    });
    
    const foundFlashSale = result.current.getFlashSaleById('flash_sale_123');
    expect(foundFlashSale).toEqual(mockFlashSale);
    
    const notFoundFlashSale = result.current.getFlashSaleById('nonexistent');
    expect(notFoundFlashSale).toBeNull();
  });
});