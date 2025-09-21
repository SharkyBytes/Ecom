import { Router } from "express";
import { query } from "../db/db.js";

const router = Router();

// Get all flash deals for a specific user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await query(
      `SELECT fd.*, p.name as product_name, p.category 
       FROM flash_deals fd
       JOIN products p ON fd.product_id = p.id
       WHERE fd.user_id = $1 AND fd.expires_at > NOW()
       ORDER BY fd.created_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching flash deals:", error);
    res.status(500).json({ error: "Failed to fetch flash deals" });
  }
});

// Get a specific flash deal by ID
router.get("/deal/:flashDealId", async (req, res) => {
  const { flashDealId } = req.params;
  
  try {
    const result = await query(
      `SELECT fd.*, p.name as product_name, p.category, u.name as user_name, u.city as user_city
       FROM flash_deals fd
       JOIN products p ON fd.product_id = p.id
       JOIN users u ON fd.user_id = u.id
       WHERE fd.id = $1`,
      [flashDealId]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Flash deal not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching flash deal:", error);
    res.status(500).json({ error: "Failed to fetch flash deal" });
  }
});

export default router;
