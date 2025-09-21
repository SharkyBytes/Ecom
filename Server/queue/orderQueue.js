// server/queue/orderQueue.js
import Bull from 'bull';
import dotenv from 'dotenv';
import { query } from '../db/db.js';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { emitNotification } from '../socket.js';

dotenv.config();

// Create a Bull queue for order cancellations
const orderCancellationQueue = new Bull('order-cancellation', {
  redis: process.env.REDIS_URL,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: false,
    removeOnFail: false
  }
});
    
// Initialize Redis client for rate limiting
const redisClient = new Redis(process.env.REDIS_URL);

// Process the queue
orderCancellationQueue.process(async (job) => {
  try {
    const { orderId, productId, category, city, cancelledAt } = job.data;
    console.log(`Processing cancelled order: ${orderId}`);
    console.log(`Product: ${productId}, Category: ${category}, City: ${city}, Cancelled at: ${cancelledAt}`);
    
    // Step 1: Get full order and product details
    const orderResult = await query(
      `SELECT o.*, p.name as product_name, p.category, p.origin_zone, p.current_price,
              u.id as user_id, u.city as user_city
       FROM orders o
       JOIN products p ON o.product_id = p.id
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [orderId]
    );
    
    if (orderResult.rowCount === 0) {
      console.log(`Order ${orderId} not found`);
      return { success: false, reason: 'Order not found' };
    }
    
    const order = orderResult.rows[0];
    console.log('Order details:', order);
    
    // Step 2: Find interested users
    // Query users interested in this product category in the same city as the shipping pincode
    // who have interacted with the category in the last 14 days
    const interestedUsersResult = await query(
      `SELECT DISTINCT u.id, u.name, u.city, u.push_subscription, i.category
       FROM interests i
       JOIN users u ON i.user_id = u.id
       WHERE (i.category = $1 OR i.product_id = $2)
       AND (u.city = $3 OR ABS(u.city - $3) < 100000) -- Nearby cities based on PIN code proximity
       AND i.last_seen_at > NOW() - INTERVAL '14 days'`,
      [order.category, productId, order.shipping_pincode] // Use shipping_pincode instead of user_city
    );
    
    console.log(`Found ${interestedUsersResult.rowCount} interested users`);
    
    // Step 3: Calculate pricing and create flash deals
    // Use fixed delivery cost of 40 rupees + 15% of price as return cost
    const deliveryCost = 40; 
    const returnCost = deliveryCost + (order.price * 0.07);
    const costSaved = returnCost;
    const discountAmount = costSaved * 0.75; // 75% of saved cost as discount
    const discountPercent = (discountAmount / order.price) * 100;
    const discountedPrice = Math.max(order.price - discountAmount, order.price * 0.7); // Ensure not below 70% of original price
    
    console.log(`Original price: ${order.price}, Delivery cost: ${deliveryCost}, Return cost: ${returnCost}`);
    console.log(`Discount amount: ${discountAmount}, Discounted price: ${discountedPrice}`);
    
    // Step 4: Process each interested user
    for (const user of interestedUsersResult.rows) {
      // Check if we've notified this user recently (rate limiting)
      const redisKey = `notif:${user.id}:${order.category}:${user.city}`;
      const hasRecentNotification = await redisClient.exists(redisKey);
      
      if (hasRecentNotification) {
        console.log(`Skipping notification for user ${user.id} due to recent notification`);
        continue;
      }
      
      // Create flash deal with 2-day expiration
      const flashDealId = uuidv4();
      const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      
      await query(
        `INSERT INTO flash_deals (
          id, user_id, order_id, product_id, category, city, 
          original_price, return_cost, cost_saved, discount_amount, 
          discount_percent, discounted_price, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          flashDealId, user.id, orderId, productId, order.category, user.city,
          order.price, returnCost, costSaved, discountAmount,
          discountPercent, discountedPrice, expiresAt
        ]
      );
      
      // Schedule automatic cleanup of expired flash deals
      // In a real production system, this would be handled by a separate scheduled job
      setTimeout(async () => {
        try {
          await query(
            `DELETE FROM flash_deals WHERE id = $1`,
            [flashDealId]
          );
          console.log(`Flash deal ${flashDealId} expired and removed automatically`);
        } catch (err) {
          console.error(`Error removing expired flash deal ${flashDealId}:`, err);
        }
      }, 2 * 24 * 60 * 60 * 1000); // 2 days in milliseconds
      
      console.log(`Created flash deal ${flashDealId} for user ${user.id}`);
      
      // Send notification (will be implemented with PWA)
      console.log(`Sending notification to user ${user.id}:`);
      console.log(`Flash Deal! ${order.product_name} is now available at a lower price in your city!`);
      console.log(`Original price: ₹${order.price}, Now: ₹${discountedPrice.toFixed(2)} (${Math.round(discountPercent)}% off)`);
      
      // Prepare notification data for PWA
      const notificationData = {
        userId: user.id,
        title: "Flash Deal Available!",
        body: `${order.product_name} is now available at ₹${discountedPrice.toFixed(2)} (${Math.round(discountPercent)}% off)`,
        productId: order.product_id,
        flashDealId: flashDealId,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      // Send the notification via Socket.IO
      emitNotification(user.id, notificationData);
      
      // Set rate limiting in Redis (24 hour TTL)
      await redisClient.set(redisKey, '1', 'EX', 24 * 60 * 60);
    }
    
    console.log('Job completed successfully');
    return { 
      success: true,
      interestedUsers: interestedUsersResult.rowCount,
      flashDealsCreated: interestedUsersResult.rowCount
    };
  } catch (error) {
    console.error('Error processing job:', error);
    throw error; // Rethrow to let Bull handle retries
  }
});

// Log events
orderCancellationQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed for order ${job.data.orderId}`);
});

orderCancellationQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed for order ${job.data.orderId}:`, err);
});

export default orderCancellationQueue;
