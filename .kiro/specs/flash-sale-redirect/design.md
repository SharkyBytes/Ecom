# Design Document

## Overview

The Flash Sale Redirect application is a React PWA that demonstrates Meesho's solution for reducing returns by redirecting cancelled orders to nearby interested customers. The application consists of three distinct pages accessible via different URLs, with real-time cross-tab communication to simulate the flash sale experience.

## Architecture

### Application Structure
```
src/
├── components/
│   ├── UserProfile.js          # Reusable user profile component
│   ├── OrderDetails.js         # Order display component
│   ├── FlashSaleNotification.js # Flash sale popup component
│   └── Layout.js               # Common layout wrapper
├── pages/
│   ├── User1Page.js            # Main cancellation page (/)
│   ├── User2Page.js            # Flash sale recipient (/user2)
│   └── User3Page.js            # Flash sale recipient (/user3)
├── services/
│   ├── storageService.js       # Cross-tab communication
│   └── mockData.js             # Sample user and order data
├── hooks/
│   └── useFlashSale.js         # Custom hook for flash sale state
├── utils/
│   └── constants.js            # App constants and colors
└── App.js                      # Main app with routing
```

### Technology Stack
- **React 18** with Create React App
- **React Router v6** for URL-based navigation
- **Tailwind CSS** for styling with custom color scheme
- **PWA** capabilities for mobile experience
- **localStorage** and **storage events** for cross-tab communication

## Components and Interfaces

### Core Components

#### UserProfile Component
```javascript
// Props interface
{
  user: {
    id: string,
    name: string,
    email: string,
    phone: string,
    address: string,
    avatar?: string
  }
}
```

#### OrderDetails Component
```javascript
// Props interface
{
  order: {
    id: string,
    productName: string,
    category: string,
    price: number,
    image: string,
    quantity: number,
    status: 'active' | 'cancelled'
  },
  showCancelButton: boolean,
  onCancel?: () => void
}
```

#### FlashSaleNotification Component
```javascript
// Props interface
{
  flashSale: {
    orderId: string,
    productName: string,
    originalPrice: number,
    discountedPrice: number,
    image: string,
    timeLeft: number
  } | null,
  onPurchase: () => void,
  onClose: () => void
}
```

### Page Components

#### User1Page (Cancellation Page)
- Displays User 1's profile information
- Shows active order details with product category
- Provides cancel order functionality
- Triggers flash sale notifications to other users

#### User2Page & User3Page (Flash Sale Recipients)
- Display respective user profiles
- Listen for flash sale notifications
- Handle purchase actions
- Show real-time updates when items become unavailable

## Data Models

### User Model
```javascript
const User = {
  id: string,
  name: string,
  email: string,
  phone: string,
  address: string,
  avatar: string,
  interests: string[] // Product categories of interest
}
```

### Order Model
```javascript
const Order = {
  id: string,
  userId: string,
  productName: string,
  category: string,
  price: number,
  discountedPrice: number,
  image: string,
  quantity: number,
  status: 'active' | 'cancelled' | 'sold',
  createdAt: Date,
  cancelledAt?: Date
}
```

### Flash Sale Event Model
```javascript
const FlashSaleEvent = {
  id: string,
  orderId: string,
  productName: string,
  category: string,
  originalPrice: number,
  discountedPrice: number,
  image: string,
  availableFor: string[], // User IDs who can see this sale
  createdAt: Date,
  expiresAt: Date,
  status: 'active' | 'sold' | 'expired'
}
```

## Cross-Tab Communication Strategy

### Storage Service Implementation
```javascript
// storageService.js
class StorageService {
  // Broadcast flash sale to all tabs
  broadcastFlashSale(flashSaleData)
  
  // Mark flash sale as purchased
  markFlashSalePurchased(flashSaleId, buyerId)
  
  // Listen for storage events
  onStorageChange(callback)
  
  // Clean up listeners
  removeListener(callback)
}
```

### Event Types
- `FLASH_SALE_CREATED`: When User 1 cancels an order
- `FLASH_SALE_PURCHASED`: When User 2 or 3 buys the item
- `FLASH_SALE_EXPIRED`: When time limit is reached

## Error Handling

### Flash Sale Conflicts
- **Race Condition**: When multiple users try to purchase simultaneously
  - Solution: Use timestamp-based first-come-first-served logic
  - Display "Item no longer available" message to losing user

### Storage Failures
- **localStorage Unavailable**: Fallback to in-memory state
- **Cross-tab Communication Failure**: Show warning message about potential sync issues

### Network Simulation
- **Mock API Delays**: Simulate realistic response times for cancellation and purchase actions
- **Error States**: Handle scenarios where cancellation or purchase fails

## Testing Strategy

### Unit Testing
- Test individual components with React Testing Library
- Mock storage service for isolated component testing
- Test custom hooks with React Hooks Testing Library

### Integration Testing
- Test cross-tab communication using multiple browser contexts
- Verify flash sale flow from cancellation to purchase
- Test race condition handling

### Manual Testing Scenarios
1. **Basic Flow**: Open three tabs (/, /user2, /user3), cancel order on first tab, verify notifications appear on other tabs
2. **Purchase Flow**: User 2 purchases item, verify it disappears from User 3's tab
3. **Race Condition**: Simulate simultaneous purchases from both User 2 and User 3
4. **Mobile Responsiveness**: Test on various screen sizes

### PWA Testing
- Test offline functionality
- Verify app installation on mobile devices
- Test push notification readiness (for future backend integration)

## Styling Guidelines

### Color Scheme
- **Primary Color**: #b282a4 (headings, buttons, accents)
- **Text Color**: #000000 (body text)
- **Background**: #ffffff
- **Success**: #10b981 (purchase confirmations)
- **Warning**: #f59e0b (flash sale notifications)
- **Error**: #ef4444 (cancellation, unavailable items)

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#b282a4',
        'primary-dark': '#9a6b8f',
        'primary-light': '#c299b5'
      }
    }
  }
}
```

### Component Styling Patterns
- **Cards**: Rounded corners, subtle shadows, primary color borders
- **Buttons**: Primary color background, white text, hover effects
- **Notifications**: Animated slide-in, prominent positioning, action buttons
- **User Profiles**: Avatar, clean typography, organized information layout

## Future Backend Integration Points

### API Endpoints (Planned)
- `POST /api/orders/{id}/cancel` - Cancel order
- `GET /api/users/{id}/flash-sales` - Get available flash sales
- `POST /api/flash-sales/{id}/purchase` - Purchase flash sale item
- `WebSocket /api/flash-sales/live` - Real-time notifications

### Data Synchronization
- Replace localStorage with WebSocket connections
- Implement proper user authentication
- Add real geolocation-based user matching
- Integrate with actual Meesho product catalog