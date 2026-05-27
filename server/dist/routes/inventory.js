import { Router } from "express";
import { query } from "../db/connection.js";
import { verifyToken } from "../middleware/auth.js";
const router = Router();
// GET /api/inventory
router.get("/", async (req, res) => {
    const { branchId, search, category, lowStock } = req.query;
    try {
        let sql = `
      SELECT 
        i.id,
        i.product_id as productId,
        i.branch_id as branchId,
        i.quantity,
        i.reserved_quantity as reservedQuantity,
        i.min_threshold as minThreshold,
        p.sku,
        p.name,
        p.category,
        p.variant,
        p.price,
        p.image,
        b.name as branchName
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN branches b ON i.branch_id = b.id
      WHERE 1=1
    `;
        const params = [];
        if (branchId && branchId !== "all") {
            sql += " AND i.branch_id = ?";
            params.push(branchId);
        }
        if (category) {
            sql += " AND p.category = ?";
            params.push(category);
        }
        if (search) {
            sql += " AND (p.name LIKE ? OR p.sku LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }
        if (lowStock === "true") {
            sql += " AND i.quantity <= i.min_threshold";
        }
        const items = await query(sql, params);
        return res.status(200).json(items);
    }
    catch (error) {
        console.error("Error fetching inventory:", error);
        return res.status(500).json({ message: "Internal server error fetching inventory." });
    }
});
// POST /api/inventory/adjust
router.post("/adjust", verifyToken, async (req, res) => {
    const { productId, branchId, quantityChange, reason } = req.body;
    if (!productId || !branchId || quantityChange === undefined || !reason) {
        return res.status(400).json({ message: "productId, branchId, quantityChange, and reason are required." });
    }
    const change = parseInt(quantityChange);
    if (isNaN(change)) {
        return res.status(400).json({ message: "quantityChange must be a valid integer." });
    }
    try {
        // 1. Fetch current inventory
        const existing = await query("SELECT * FROM inventory WHERE product_id = ? AND branch_id = ?", [productId, branchId]);
        if (existing.length === 0) {
            return res.status(404).json({ message: "Inventory record not found for this product and branch." });
        }
        const currentQty = existing[0].quantity;
        const reservedQty = existing[0].reserved_quantity || 0;
        const newQty = currentQty + change;
        if (newQty < 0) {
            return res.status(400).json({ message: `Cannot adjust stock below 0. Current stock is ${currentQty}.` });
        }
        if (newQty < reservedQty) {
            return res.status(400).json({ message: `Cannot adjust stock below reserved event holds of ${reservedQty} bottles.` });
        }
        // 2. Update quantity
        await query("UPDATE inventory SET quantity = ? WHERE product_id = ? AND branch_id = ?", [newQty, productId, branchId]);
        // 3. Log adjustment
        const adjustmentId = "adj_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        const userId = req.user?.id || "unknown";
        const timestamp = new Date().toISOString();
        await query(`
      INSERT INTO inventory_adjustments (id, product_id, branch_id, quantity_change, reason, user_id, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [adjustmentId, productId, branchId, change, reason, userId, timestamp]);
        // Retrieve and return updated inventory item
        const updated = await query(`
      SELECT 
        i.id,
        i.product_id as productId,
        i.branch_id as branchId,
        i.quantity,
        i.reserved_quantity as reservedQuantity,
        i.min_threshold as minThreshold,
        p.sku,
        p.name,
        p.category,
        p.variant,
        p.price,
        b.name as branchName
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      JOIN branches b ON i.branch_id = b.id
      WHERE i.product_id = ? AND i.branch_id = ?
    `, [productId, branchId]);
        return res.status(200).json(updated[0]);
    }
    catch (error) {
        console.error("Error adjusting inventory:", error);
        return res.status(500).json({ message: "Internal server error adjusting inventory." });
    }
});
// POST /api/inventory/transfer
router.post("/transfer", verifyToken, async (req, res) => {
    const { productId, fromBranchId, toBranchId, quantity, carrier, cost } = req.body;
    if (!productId || !fromBranchId || !toBranchId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: "productId, fromBranchId, toBranchId, and positive quantity are required." });
    }
    if (fromBranchId === toBranchId) {
        return res.status(400).json({ message: "Source and destination branches cannot be the same." });
    }
    const qty = parseInt(quantity);
    if (isNaN(qty)) {
        return res.status(400).json({ message: "quantity must be a valid integer." });
    }
    try {
        // 1. Check sending branch stock availability
        const sendingInv = await query("SELECT * FROM inventory WHERE product_id = ? AND branch_id = ?", [productId, fromBranchId]);
        if (sendingInv.length === 0) {
            return res.status(404).json({ message: "Product inventory not found at source branch." });
        }
        const available = sendingInv[0].quantity - (sendingInv[0].reserved_quantity || 0);
        if (available < qty) {
            return res.status(400).json({ message: `Insufficient available stock at source. Available: ${available}, requested: ${qty}.` });
        }
        // 2. Ensure receiving branch has an inventory record (create one if not exists)
        const receivingInv = await query("SELECT * FROM inventory WHERE product_id = ? AND branch_id = ?", [productId, toBranchId]);
        if (receivingInv.length === 0) {
            const newInvId = "i_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
            await query("INSERT INTO inventory (id, product_id, branch_id, quantity, reserved_quantity, min_threshold) VALUES (?, ?, ?, ?, ?, ?)", [
                newInvId, productId, toBranchId, 0, 0, 5
            ]);
        }
        // 3. Deduct stock immediately from source branch (virtual pending in transit)
        const newSendingQty = sendingInv[0].quantity - qty;
        await query("UPDATE inventory SET quantity = ? WHERE product_id = ? AND branch_id = ?", [newSendingQty, productId, fromBranchId]);
        // 4. Log transfer out in adjustments
        const userId = req.user?.id || "unknown";
        const timestamp = new Date().toISOString();
        const adjOutId = "adj_" + Date.now() + "_out";
        await query(`
      INSERT INTO inventory_adjustments (id, product_id, branch_id, quantity_change, reason, user_id, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [adjOutId, productId, fromBranchId, -qty, `Transfer to ${toBranchId}`, userId, timestamp]);
        // 5. Get branch names for shipment creation
        const branches = await query("SELECT id, name FROM branches WHERE id IN (?, ?)", [fromBranchId, toBranchId]);
        const fromBranchName = branches.find((b) => b.id === fromBranchId)?.name || "Source Cellar";
        const toBranchName = branches.find((b) => b.id === toBranchId)?.name || "Destination Cellar";
        // 6. Create shipment record with status 'dispatched'
        const shipmentId = "sh_" + Date.now() + "_" + Math.floor(Math.random() * 100);
        const dateStr = new Date().toISOString().split("T")[0];
        const carrierName = carrier || "Internal Transfer Courier";
        const transportCost = parseFloat(cost) || 0.0;
        await query(`
      INSERT INTO shipments (id, origin, dest, date, status, cost, carrier, notes, from_branch_id, to_branch_id, product_id, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [shipmentId, fromBranchName, toBranchName, dateStr, "dispatched", transportCost, carrierName, "Branch transfer", fromBranchId, toBranchId, productId, qty]);
        return res.status(200).json({
            message: "Transfer initiated successfully.",
            shipmentId,
            updatedSourceQuantity: newSendingQty
        });
    }
    catch (error) {
        console.error("Error in stock transfer:", error);
        return res.status(500).json({ message: "Internal server error executing transfer." });
    }
});
// GET /api/inventory/products
router.get("/products", async (req, res) => {
    try {
        const products = await query("SELECT * FROM products");
        return res.status(200).json(products);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Internal server error fetching products." });
    }
});
export default router;
