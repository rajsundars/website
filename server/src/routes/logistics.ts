import { Router, Response } from "express";
import { query } from "../db/connection.js";
import { verifyToken, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/logistics/shipments
router.get("/shipments", async (req, res) => {
  try {
    const shipments = await query(`
      SELECT 
        s.id,
        s.origin,
        s.dest,
        s.date,
        s.status,
        s.cost,
        s.carrier,
        s.notes,
        s.from_branch_id as fromBranchId,
        s.to_branch_id as toBranchId,
        s.product_id as productId,
        s.quantity,
        p.name as productName
      FROM shipments s
      LEFT JOIN products p ON s.product_id = p.id
      ORDER BY s.date DESC, s.id DESC
    `);
    return res.status(200).json(shipments);
  } catch (error) {
    console.error("Error fetching shipments:", error);
    return res.status(500).json({ message: "Internal server error fetching shipments." });
  }
});

// POST /api/logistics/shipments
router.post("/shipments", verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  const { origin, dest, date, carrier, cost, notes, toBranchId, productId, quantity } = req.body;

  if (!origin || !dest || !date || !carrier) {
    return res.status(400).json({ message: "origin, dest, date, and carrier are required." });
  }

  try {
    const shipmentId = "sh_" + Date.now() + "_" + Math.floor(Math.random() * 100);
    const transportCost = parseFloat(cost) || 0.0;
    const qty = quantity ? parseInt(quantity) : null;
    const dateStr = date || new Date().toISOString().split("T")[0];

    // If it's a restock to a branch, ensure that branch has inventory initialized
    if (toBranchId && productId && qty && qty > 0) {
      const receivingInv = await query("SELECT * FROM inventory WHERE product_id = ? AND branch_id = ?", [productId, toBranchId]);
      if (receivingInv.length === 0) {
        const newInvId = "i_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        await query("INSERT INTO inventory (id, product_id, branch_id, quantity, reserved_quantity, min_threshold) VALUES (?, ?, ?, ?, ?, ?)", [
          newInvId, productId, toBranchId, 0, 0, 5
        ]);
      }
    }

    await query(`
      INSERT INTO shipments (id, origin, dest, date, status, cost, carrier, notes, from_branch_id, to_branch_id, product_id, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [shipmentId, origin, dest, dateStr, "dispatched", transportCost, carrier, notes || "External supply delivery", null, toBranchId || null, productId || null, qty]);

    return res.status(201).json({ message: "Shipment registered successfully.", shipmentId });
  } catch (error) {
    console.error("Error creating shipment:", error);
    return res.status(500).json({ message: "Internal server error creating shipment." });
  }
});

// PUT /api/logistics/shipments/:id
router.put("/shipments/:id", verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "status is required." });
  }

  const validStatuses = ["dispatched", "delivered", "damaged", "pending"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const existing = await query("SELECT * FROM shipments WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Shipment not found." });
    }

    const shipment = existing[0];
    const previousStatus = shipment.status;

    if (previousStatus === "delivered" || previousStatus === "damaged") {
      return res.status(400).json({ message: `Shipment is already finalized as: ${previousStatus}` });
    }

    // Update status
    await query("UPDATE shipments SET status = ? WHERE id = ?", [status, id]);

    // Handle stock delivery if status transitions to 'delivered'
    if (status === "delivered" && shipment.to_branch_id && shipment.product_id && shipment.quantity > 0) {
      const productId = shipment.product_id;
      const toBranchId = shipment.to_branch_id;
      const qty = shipment.quantity;

      // Check destination inventory record
      const receivingInv = await query("SELECT * FROM inventory WHERE product_id = ? AND branch_id = ?", [productId, toBranchId]);
      
      let newQty = qty;
      if (receivingInv.length > 0) {
        newQty = receivingInv[0].quantity + qty;
        await query("UPDATE inventory SET quantity = ? WHERE product_id = ? AND branch_id = ?", [newQty, productId, toBranchId]);
      } else {
        const newInvId = "i_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        await query("INSERT INTO inventory (id, product_id, branch_id, quantity, reserved_quantity, min_threshold) VALUES (?, ?, ?, ?, ?, ?)", [
          newInvId, productId, toBranchId, qty, 0, 5
        ]);
      }

      // Log transfer in / arrival in adjustments
      const userId = req.user?.id || "unknown";
      const timestamp = new Date().toISOString();
      const adjInId = "adj_" + Date.now() + "_in";
      await query(`
        INSERT INTO inventory_adjustments (id, product_id, branch_id, quantity_change, reason, user_id, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [adjInId, productId, toBranchId, qty, `Received from ${shipment.origin}`, userId, timestamp]);
    }

    return res.status(200).json({ message: `Shipment status updated to ${status}.` });
  } catch (error) {
    console.error("Error updating shipment status:", error);
    return res.status(500).json({ message: "Internal server error updating shipment." });
  }
});

// GET /api/logistics/expenses
router.get("/expenses", async (req, res) => {
  try {
    const expenses = await query("SELECT SUM(cost) as totalExpense FROM shipments");
    const total = expenses[0]?.totalExpense || expenses[0]?.TOTALEXPENSE || 0.0;
    return res.status(200).json({ totalExpense: parseFloat(total) });
  } catch (error) {
    console.error("Error calculating logistics expenses:", error);
    return res.status(500).json({ message: "Internal server error calculating expenses." });
  }
});

export default router;
