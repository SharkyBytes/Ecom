import { io } from 'socket.io-client';
import { APP_CONFIG } from '../utils/constants';

let socket;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(APP_CONFIG.SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
  
  return socket;
};

export const subscribeToNotifications = (userId, callback) => {
  if (!socket) {
    initializeSocket();
  }
  
  // Subscribe to notifications for this user
  socket.emit('subscribe', userId);
  
  // Listen for notifications
  socket.on('notification', (data) => {
    console.log('Received notification:', data);
    
    // Show browser notification if available
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: '/logo192.png'
      });
      
      notification.onclick = () => {
        window.focus();
        window.location.href = `/flash-sale?id=${data.flashDealId}`;
      };
    }
    
    // Call the callback with the notification data
    if (callback) {
      callback(data);
    }
  });
  
  return () => {
    socket.off('notification');
  };
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
