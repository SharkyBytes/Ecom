// server/queue/orderQueue.js
import Bull from 'bull';
import dotenv from 'dotenv';
import { query } from '../db/db.js';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

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
    // Query users interested in this product category in the same city or nearby
    // who have interacted with the category in the last 14 days
    const interestedUsersResult = await query(
      `SELECT DISTINCT u.id, u.name, u.city, u.push_subscription, i.category
       FROM interests i
       JOIN users u ON i.user_id = u.id
       WHERE (i.category = $1 OR i.product_id = $2)
       AND (u.city = $3 OR ABS(u.city - $3) < 100000) -- Nearby cities based on PIN code proximity
       AND i.last_seen_at > NOW() - INTERVAL '14 days'`,
      [order.category, productId, order.user_city]
    );
    
    console.log(`Found ${interestedUsersResult.rowCount} interested users`);
    
    // Step 3: Calculate pricing and create flash deals
    // Estimate return cost (in a real system, this would be from a cost model)
    const returnCost = order.price * 0.15; // Assuming 15% of price as return cost
    const costSaved = returnCost;
    const discountAmount = costSaved * 0.75; // 75% of saved cost as discount
    const discountPercent = (discountAmount / order.price) * 100;
    const discountedPrice = Math.max(order.price - discountAmount, order.price * 0.7); // Ensure not below 70% of original price
    
    console.log(`Original price: ${order.price}, Return cost: ${returnCost}`);
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
      
      // Create flash deal
      const flashDealId = uuidv4();
      await query(
        `INSERT INTO flash_deals (
          id, user_id, order_id, product_id, category, city, 
          original_price, return_cost, cost_saved, discount_amount, 
          discount_percent, discounted_price, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW() + INTERVAL '2 days')`,
        [
          flashDealId, user.id, orderId, productId, order.category, user.city,
          order.price, returnCost, costSaved, discountAmount,
          discountPercent, discountedPrice
        ]
      );
      
      console.log(`Created flash deal ${flashDealId} for user ${user.id}`);
      
      // Send notification (simulated)
      console.log(`Sending notification to user ${user.id}:`);
      console.log(`The ${order.product_name} you were watching is now available at a lower price in your city!`);
      console.log(`Original price: ${order.price}, Now: ${discountedPrice} (${Math.round(discountPercent)}% off)`);
      
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
