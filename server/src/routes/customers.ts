import { Router, Response } from "express";
import { query, logAudit } from "../db/connection.js";
import { verifyToken, requireRole, AuthenticatedRequest } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";

const router = Router();

// GET /api/customers - List all customers with optional search query
router.get("/", async (req, res) => {
  const { q } = req.query;
  try {
    let sql = "SELECT * FROM customers WHERE 1=1";
    const params: any[] = [];

    if (q) {
      sql += " AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)";
      const search = `%${q}%`;
      params.push(search, search, search);
    }
    
    sql += " ORDER BY loyalty_points DESC, name ASC";
    const customers = await query(sql, params);

    // Dynamic segment tags evaluation (ensures it is up-to-date with loyalty points)
    const evaluated = customers.map((c: any) => {
      let segment = c.segment_tags;
      if (c.loyalty_points >= 1000) {
        segment = "vip";
      } else if (c.loyalty_points >= 300) {
        segment = "frequent";
      } else if (c.loyalty_points < 300 && segment !== "dormant") {
        segment = "new";
      }
      return {
        ...c,
        segment_tags: segment
      };
    });

    return res.status(200).json(evaluated);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res.status(500).json({ message: "Internal server error fetching customers." });
  }
});

// POST /api/customers - Create a new customer profile
router.post("/", verifyToken, requireRole(["super_admin", "event_coordinator"]), validateBody([
  { field: "name", type: "string", required: true },
  { field: "email", type: "email", required: true },
  { field: "phone", type: "string", required: true }
]), async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, phone, address, loyaltyPoints, segmentTags } = req.body;

  try {
    const existing = await query("SELECT id FROM customers WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "A customer with this email address already exists." });
    }

    const customerId = "c_" + Date.now();
    const regDate = new Date().toISOString().split("T")[0];
    const points = parseInt(loyaltyPoints || "0") || 0;
    
    let segment = segmentTags || "new";
    if (points >= 1000) {
      segment = "vip";
    } else if (points >= 300) {
      segment = "frequent";
    }

    await query(`
      INSERT INTO customers (id, name, email, phone, address, loyalty_points, segment_tags, registration_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [customerId, name, email, phone, address || "", points, segment, regDate]);

    await logAudit(
      req.user?.id || "unknown",
      req.user?.name || "System",
      "customer_create",
      `User ${req.user?.name || "System"} registered new customer profile: ${name} (Email: ${email}).`
    );

    return res.status(201).json({ message: "Customer created successfully.", customerId });
  } catch (error) {
    console.error("Error creating customer:", error);
    return res.status(500).json({ message: "Internal server error creating customer." });
  }
});

// PUT /api/customers/:id - Update an existing customer profile
router.put("/:id", verifyToken, requireRole(["super_admin", "event_coordinator"]), validateBody([
  { field: "name", type: "string", required: true },
  { field: "email", type: "email", required: true },
  { field: "phone", type: "string", required: true }
]), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, address, loyaltyPoints, segmentTags } = req.body;

  try {
    const existing = await query("SELECT id FROM customers WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const points = parseInt(loyaltyPoints || "0") || 0;
    let segment = segmentTags || "new";
    if (points >= 1000) {
      segment = "vip";
    } else if (points >= 300) {
      segment = "frequent";
    }

    await query(`
      UPDATE customers 
      SET name = ?, email = ?, phone = ?, address = ?, loyalty_points = ?, segment_tags = ?
      WHERE id = ?
    `, [name, email, phone, address || "", points, segment, id]);

    await logAudit(
      req.user?.id || "unknown",
      req.user?.name || "System",
      "customer_update",
      `User ${req.user?.name || "System"} updated customer profile: ${name} (${id}).`
    );

    return res.status(200).json({ message: "Customer profile updated successfully." });
  } catch (error) {
    console.error("Error updating customer:", error);
    return res.status(500).json({ message: "Internal server error updating customer." });
  }
});

// DELETE /api/customers/:id - Delete customer profile
router.delete("/:id", verifyToken, requireRole(["super_admin"]), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const existing = await query("SELECT id, name FROM customers WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }
    const customerName = existing[0].name;
    await query("DELETE FROM customers WHERE id = ?", [id]);
    
    await logAudit(
      req.user?.id || "unknown",
      req.user?.name || "System",
      "customer_delete",
      `User ${req.user?.name || "System"} deleted customer profile: ${customerName} (${id}).`
    );

    return res.status(200).json({ message: "Customer deleted successfully." });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return res.status(500).json({ message: "Internal server error deleting customer." });
  }
});

// GET /api/customers/:id/notifications - Get messaging logs for a customer
router.get("/:id/notifications", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const logs = await query("SELECT * FROM notifications WHERE customer_id = ? ORDER BY timestamp DESC", [id]);
    return res.status(200).json(logs);
  } catch (error) {
    console.error("Error loading notification logs:", error);
    return res.status(500).json({ message: "Internal server error fetching logs." });
  }
});

// POST /api/customers/:id/notify - Send/simulate notification log
router.post("/:id/notify", verifyToken, requireRole(["super_admin", "event_coordinator"]), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { channel, message } = req.body;

  if (!channel || !message) {
    return res.status(400).json({ message: "Channel and message body are required." });
  }

  try {
    const customers = await query("SELECT * FROM customers WHERE id = ?", [id]);
    if (customers.length === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }
    const customer = customers[0];

    const notifId = "n_" + Date.now();
    const timestampStr = new Date().toISOString();

    // Simulated Send Log
    const recipientContact = channel === "email" ? customer.email : customer.phone;
    console.log(`[Notification Dispatch - ${channel.toUpperCase()}] To ${customer.name} (${recipientContact}): "${message}"`);

    // Insert log to DB
    await query(`
      INSERT INTO notifications (id, customer_id, channel, message, status, timestamp)
      VALUES (?, ?, ?, ?, 'sent', ?)
    `, [notifId, id, channel, message, timestampStr]);

    return res.status(201).json({ message: `Notification successfully sent via ${channel}.`, logId: notifId });
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({ message: "Internal server error sending notification." });
  }
});

export default router;
