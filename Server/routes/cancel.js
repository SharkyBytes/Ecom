import { Router } from "express";
import { query } from "../db/db.js";
import orderCancellationQueue from "../queue/orderQueue.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Route to cancel an order
router.post("/:orderId", async (req, res) => {
  const { orderId } = req.params;
  
  try {
    console.log(`Cancelling order: ${orderId}`);
    
    // 1. Update order status in database
    const updateResult = await query(
      "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *",
      [orderId]
    );
    
    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    const order = updateResult.rows[0];
    console.log("Order cancelled in database:", order);
    
    // Get product and user details for the order
    const detailsResult = await query(
      `SELECT p.category, u.city 
       FROM orders o
       JOIN products p ON o.product_id = p.id
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [orderId]
    );
    
    const details = detailsResult.rows[0] || {};
    
    // 2. Add job to queue (outbox pattern)
    const job = await orderCancellationQueue.add({
      orderId: order.id,
      productId: order.product_id,
      category: details.category || "unknown",
      city: details.city || 0,
      cancelledAt: new Date().toISOString()
    });
    
    console.log(`Job added to queue with ID: ${job.id}`);
    
    res.json({ 
      message: "Order cancelled successfully", 
      order,
      jobId: job.id
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

// Route to get all cancelled orders
router.get("/", async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM orders WHERE status = 'cancelled' ORDER BY updated_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching cancelled orders:", error);
    res.status(500).json({ error: "Failed to fetch cancelled orders" });
  }
});

export default router;

