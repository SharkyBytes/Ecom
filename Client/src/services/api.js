import axios from 'axios';
import { APP_CONFIG } from '../utils/constants';

const api = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await api.post(`/api/cancel/${orderId}`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

export const getFlashDeals = async (userId) => {
  try {
    const response = await api.get(`/api/flash-deals/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching flash deals:', error);
    throw error;
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

export default api;
