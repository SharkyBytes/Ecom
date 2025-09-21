# Flash Deals Notification System

A scalable architecture for a cancellation-driven flash-deals notification system inspired by Meesho.

## Overview

This system enables the creation of flash deals from cancelled orders, notifying interested users in the same city about discounted products. The discount is calculated based on the saved return shipping costs.

![System Architecture](https://i.imgur.com/placeholder.png)

## Key Features

- **Order Cancellation Flow**: User cancels an order, triggering the flash deal process
- **Intelligent User Matching**: Finds users interested in the product category in the same city
- **Smart Pricing Algorithm**: Calculates discounts based on saved return shipping costs
- **Real-time Notifications**: Delivers instant notifications to interested users
- **Rate Limiting**: Prevents notification spam with Redis-based rate limiting
- **PWA Support**: Progressive Web App with push notifications and offline support
- **Meesho-inspired UI**: User interface designed to match the Meesho app

## Tech Stack

### Backend
- **Node.js/Express**: API server
- **PostgreSQL**: Persistent storage
- **Redis**: Rate limiting and caching
- **Bull MQ**: Message queue for background processing
- **Socket.IO**: Real-time notifications

### Frontend
- **React**: UI library
- **PWA**: Progressive Web App features
- **Socket.IO Client**: Real-time communication
- **Tailwind CSS**: Styling

## Project Structure

```
├── Client/               # Frontend React application
│   ├── public/           # Public assets and HTML
│   └── src/              # React source code
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page components
│       ├── services/     # API and Socket services
│       └── utils/        # Utility functions and constants
│
└── server/               # Backend Node.js application
    ├── db/               # Database scripts and models
    ├── queue/            # Bull MQ queue configuration
    ├── routes/           # API routes
    └── utils/            # Utility functions
```

## Getting Started

See [INSTRUCTIONS.md](server/INSTRUCTIONS.md) for detailed setup and running instructions.

## Workflow

See [DETAILED_WORKFLOW.md](server/DETAILED_WORKFLOW.md) for a comprehensive explanation of the system workflow.

## Current Status

See [CURRENT.md](server/CURRENT.md) for the current implementation status.

## License

MIT
