import { Router, Response } from "express";
import { query, logAudit } from "../db/connection.js";
import { verifyToken, requireRole, AuthenticatedRequest } from "../middleware/auth.js";
import PDFDocument from "pdfkit";

const router = Router();

// GET /api/events
router.get("/", async (req, res) => {
  const { branchId, status } = req.query;
  try {
    let sql = `
      SELECT e.*, b.name as branchName
      FROM events e
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (branchId && branchId !== "all") {
      sql += " AND e.branch_id = ?";
      params.push(branchId);
    }
    if (status && status !== "all") {
      sql += " AND e.status = ?";
      params.push(status);
    }
    sql += " ORDER BY e.date ASC";
    const events = await query(sql, params);
    return res.status(200).json(events);
  } catch (error) {
    console.error("Error loading events list:", error);
    return res.status(500).json({ message: "Internal server error fetching events." });
  }
});

// GET /api/events/:id/details
router.get("/:id/details", async (req, res) => {
  const { id } = req.params;
  try {
    const events = await query("SELECT e.*, b.name as branchName FROM events e LEFT JOIN branches b ON e.branch_id = b.id WHERE e.id = ?", [id]);
    if (events.length === 0) {
      return res.status(404).json({ message: "Event booking not found." });
    }
    const event = events[0];

    // Fetch reserved wines
    const wines = await query(`
      SELECT ew.*, p.name as productName, p.price as productPrice, p.variant as productVariant, p.sku as productSku
      FROM event_wines ew
      JOIN products p ON ew.product_id = p.id
      WHERE ew.event_id = ?
    `, [id]);

    // Fetch assigned staff
    const staff = await query(`
      SELECT es.user_id as userId, u.name as userName, u.role as userRole, u.contact as userContact
      FROM event_staffing es
      JOIN users u ON es.user_id = u.id
      WHERE es.event_id = ?
    `, [id]);

    return res.status(200).json({
      ...event,
      reservedWines: wines,
      staffAssigned: staff
    });
  } catch (error) {
    console.error("Error loading event details:", error);
    return res.status(500).json({ message: "Internal server error loading event details." });
  }
});

// POST /api/events/enquire
router.post("/enquire", async (req, res) => {
  const { name, email, phone, date, eventType, guestCount, budget, notes, branchId } = req.body;
  if (!name || !email || !phone || !date || !eventType || !guestCount || !budget) {
    return res.status(400).json({ message: "Required enquiry details are missing." });
  }
  try {
    const eventId = "ev_" + Date.now();
    const targetBranch = branchId || "b1";

    await query(`
      INSERT INTO events (id, customer_name, customer_email, customer_phone, date, event_type, guest_count, budget, status, notes, branch_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'enquiry', ?, ?)
    `, [eventId, name, email, phone, date, eventType, parseInt(guestCount), parseFloat(budget), notes || "", targetBranch]);

    return res.status(201).json({ message: "Enquiry submitted successfully.", eventId });
  } catch (error) {
    console.error("Error creating enquiry:", error);
    return res.status(500).json({ message: "Internal server error creating enquiry." });
  }
});

// PATCH /api/events/:id/status
router.patch("/:id/status", verifyToken, requireRole(["super_admin", "event_coordinator"]), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "Status is required." });
  }

  try {
    // Fetch event details
    const events = await query("SELECT * FROM events WHERE id = ?", [id]);
    if (events.length === 0) {
      return res.status(404).json({ message: "Event not found." });
    }
    const event = events[0];
    const oldStatus = event.status;
    const newStatus = status;

    if (oldStatus === newStatus) {
      return res.status(200).json({ message: "Status remains unchanged." });
    }

    // Fetch reserved wines
    const reservedWines = await query("SELECT product_id, quantity FROM event_wines WHERE event_id = ?", [id]);

    // Handle stock reservation triggers
    // Shifting to booked -> check and increment reserved_quantity
    if (newStatus === "booked" && oldStatus !== "booked") {
      // Verify available stock for all wines
      for (const w of reservedWines) {
        const inv = await query("SELECT quantity, reserved_quantity FROM inventory WHERE product_id = ? AND branch_id = ?", [w.product_id, event.branch_id]);
        if (inv.length === 0) {
          return res.status(400).json({ message: `Product ${w.product_id} is not mapped in the branch inventory.` });
        }
        const available = inv[0].quantity - inv[0].reserved_quantity;
        if (available < w.quantity) {
          return res.status(400).json({ message: `Insufficient inventory. Only ${available} units available for product ID ${w.product_id}, but event requires ${w.quantity}.` });
        }
      }

      // Commit stock reserves
      for (const w of reservedWines) {
        await query("UPDATE inventory SET reserved_quantity = reserved_quantity + ? WHERE product_id = ? AND branch_id = ?", [w.quantity, w.product_id, event.branch_id]);
      }
    }

    // Shifting FROM booked to completed/cancelled -> decrement reserved_quantity
    if (oldStatus === "booked" && newStatus !== "booked") {
      // Release reserves
      for (const w of reservedWines) {
        await query("UPDATE inventory SET reserved_quantity = MAX(0, reserved_quantity - ?) WHERE product_id = ? AND branch_id = ?", [w.quantity, w.product_id, event.branch_id]);
      }
    }

    await query("UPDATE events SET status = ? WHERE id = ?", [newStatus, id]);

    await logAudit(
      req.user?.id || "unknown",
      req.user?.name || "System",
      "event_status_update",
      `User ${req.user?.name || "System"} updated event "${event.customer_name}" status from ${oldStatus} to ${newStatus}.`
    );

    return res.status(200).json({ message: `Event status updated from ${oldStatus} to ${newStatus}.` });
  } catch (error) {
    console.error("Error transitioning status:", error);
    return res.status(500).json({ message: "Internal server error updating event status." });
  }
});

// POST /api/events/:id/wines
router.post("/:id/wines", verifyToken, requireRole(["super_admin", "event_coordinator"]), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { wines } = req.body; // Array of { productId, quantity }
  if (!Array.isArray(wines)) {
    return res.status(400).json({ message: "wines must be an array." });
  }

  try {
    const events = await query("SELECT * FROM events WHERE id = ?", [id]);
    if (events.length === 0) {
      return res.status(404).json({ message: "Event not found." });
    }
    const event = events[0];

    // If event is booked, we must validate stock and update reserved_quantity
    if (event.status === "booked") {
      // 1. Release previous reservations first
      const currentWines = await query("SELECT product_id, quantity FROM event_wines WHERE event_id = ?", [id]);
      for (const w of currentWines) {
        await query("UPDATE inventory SET reserved_quantity = MAX(0, reserved_quantity - ?) WHERE product_id = ? AND branch_id = ?", [w.quantity, w.product_id, event.branch_id]);
      }

      // 2. Validate availability of new reservation requests
      for (const w of wines) {
        const inv = await query("SELECT quantity, reserved_quantity FROM inventory WHERE product_id = ? AND branch_id = ?", [w.productId, event.branch_id]);
        if (inv.length === 0) {
          // Revert old reservations on error
          for (const prev of currentWines) {
            await query("UPDATE inventory SET reserved_quantity = reserved_quantity + ? WHERE product_id = ? AND branch_id = ?", [prev.quantity, prev.product_id, event.branch_id]);
          }
          return res.status(400).json({ message: `Product ${w.productId} is not mapped in the branch inventory.` });
        }
        const available = inv[0].quantity - inv[0].reserved_quantity;
        if (available < w.quantity) {
          // Revert old reservations on error
          for (const prev of currentWines) {
            await query("UPDATE inventory SET reserved_quantity = reserved_quantity + ? WHERE product_id = ? AND branch_id = ?", [prev.quantity, prev.product_id, event.branch_id]);
          }
          return res.status(400).json({ message: `Insufficient inventory. Only ${available} units available for product ID ${w.productId}, but request asks for ${w.quantity}.` });
        }
      }

      // 3. Add new reservations
      for (const w of wines) {
        await query("UPDATE inventory SET reserved_quantity = reserved_quantity + ? WHERE product_id = ? AND branch_id = ?", [w.quantity, w.productId, event.branch_id]);
      }
    }

    // Rewrite event wines list
    await query("DELETE FROM event_wines WHERE event_id = ?", [id]);
    let counter = 1;
    for (const w of wines) {
      const ewId = `ew_${Date.now()}_${counter++}`;
      await query("INSERT INTO event_wines (id, event_id, product_id, quantity) VALUES (?, ?, ?, ?)", [ewId, id, w.productId, w.quantity]);
    }

    await logAudit(
      req.user?.id || "unknown",
      req.user?.name || "System",
      "event_wines_update",
      `User ${req.user?.name || "System"} updated wine allocations for event "${event.customer_name}" (${id}).`
    );

    return res.status(200).json({ message: "Event wine reservations updated successfully." });
  } catch (error) {
    console.error("Error updating event wines:", error);
    return res.status(500).json({ message: "Internal server error updating event wines." });
  }
});

// POST /api/events/:id/staff
router.post("/:id/staff", verifyToken, requireRole(["super_admin", "event_coordinator"]), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { staffIds } = req.body; // Array of userIds
  if (!Array.isArray(staffIds)) {
    return res.status(400).json({ message: "staffIds must be an array of user IDs." });
  }

  try {
    const events = await query("SELECT * FROM events WHERE id = ?", [id]);
    if (events.length === 0) {
      return res.status(404).json({ message: "Event not found." });
    }
    const event = events[0];

    // Check for double-bookings
    for (const sId of staffIds) {
      const conflicting = await query(`
        SELECT e.customer_name, e.date 
        FROM event_staffing es
        JOIN events e ON es.event_id = e.id
        WHERE es.user_id = ? AND e.date = ? AND e.id != ? AND e.status != 'cancelled'
      `, [sId, event.date, id]);

      if (conflicting.length > 0) {
        const u = await query("SELECT name FROM users WHERE id = ?", [sId]);
        const staffName = u[0]?.name || "Staff Member";
        return res.status(400).json({ 
          message: `Double-Booking Conflict: ${staffName} is already assigned to event "${conflicting[0].customer_name}" on ${event.date}.` 
        });
      }
    }

    // Update staffing roster
    await query("DELETE FROM event_staffing WHERE event_id = ?", [id]);
    for (const sId of staffIds) {
      const esId = `es_${Date.now()}_${sId}`;
      await query("INSERT INTO event_staffing (id, event_id, user_id) VALUES (?, ?, ?)", [esId, id, sId]);
    }

    await logAudit(
      req.user?.id || "unknown",
      req.user?.name || "System",
      "event_staffing_update",
      `User ${req.user?.name || "System"} updated staffing roster for event "${event.customer_name}" (${id}).`
    );

    return res.status(200).json({ message: "Event staffing updated successfully." });
  } catch (error) {
    console.error("Error updating event staffing:", error);
    return res.status(500).json({ message: "Internal server error updating staffing." });
  }
});

// GET /api/events/:id/quotation/pdf
router.get("/:id/quotation/pdf", async (req, res) => {
  const { id } = req.params;
  try {
    const events = await query("SELECT e.*, b.name as branchName, b.location as branchLocation FROM events e LEFT JOIN branches b ON e.branch_id = b.id WHERE e.id = ?", [id]);
    if (events.length === 0) {
      return res.status(404).json({ message: "Event booking not found." });
    }
    const event = events[0];

    // Fetch reserved wines
    const wines = await query(`
      SELECT ew.quantity, p.name, p.price, p.variant
      FROM event_wines ew
      JOIN products p ON ew.product_id = p.id
      WHERE ew.event_id = ?
    `, [id]);

    const doc = new PDFDocument({ margin: 45, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Event_Quotation_${event.customer_name.replace(/\s+/g, "_")}.pdf`);
    doc.pipe(res);

    // Decorative Header banner
    doc.fillColor("#1a0508").rect(0, 0, 595, 90).fill();
    doc.fillColor("#e0a96d").font("Helvetica-Bold").fontSize(18).text("GUNA WINES", 45, 25);
    doc.fillColor("#ffffff").font("Helvetica").fontSize(8).text("PRIVATE CELLAR EVENT QUOTATION", 45, 48);

    doc.fillColor("#e0a96d").font("Helvetica-Bold").fontSize(11).text("OFFICIAL PROPOSAL", 380, 25, { align: "right", width: 170 });
    doc.fillColor("#ffffff").font("Helvetica").fontSize(8).text(`Date: ${new Date().toISOString().split("T")[0]}`, 380, 42, { align: "right", width: 170 });
    doc.text(`Status: ${event.status.toUpperCase()}`, 380, 52, { align: "right", width: 170 });

    // Client details
    doc.fillColor("#333333").font("Helvetica-Bold").fontSize(9).text("CLIENT DETAILS", 45, 110);
    doc.moveTo(45, 122).lineTo(550, 122).strokeColor("#cccccc").lineWidth(0.5).stroke();

    doc.font("Helvetica").fontSize(8);
    doc.text(`Customer Name:  ${event.customer_name}`, 45, 130);
    doc.text(`Email Address:  ${event.customer_email}`, 45, 142);
    doc.text(`Telephone No:   ${event.customer_phone}`, 45, 154);

    doc.text(`Event Date:     ${event.date}`, 300, 130);
    doc.text(`Event Class:    ${event.event_type.replace("_", " ").toUpperCase()}`, 300, 142);
    doc.text(`Guests Count:   ${event.guest_count} guests`, 300, 154);

    // Wine pairing selections
    doc.fillColor("#333333").font("Helvetica-Bold").fontSize(9).text("CURATED BEVERAGE PAIRING LIST", 45, 185);
    doc.moveTo(45, 197).lineTo(550, 197).strokeColor("#cccccc").lineWidth(0.5).stroke();

    let yPosition = 210;
    doc.font("Helvetica-Bold").fontSize(8);
    doc.text("Wine Selection", 45, yPosition);
    doc.text("Qty", 280, yPosition, { width: 30, align: "center" });
    doc.text("Price", 350, yPosition, { width: 70, align: "right" });
    doc.text("Subtotal", 450, yPosition, { width: 100, align: "right" });

    doc.moveTo(45, yPosition + 12).lineTo(550, yPosition + 12).strokeColor("#eeeeee").lineWidth(0.5).stroke();
    yPosition += 20;

    let beverageSubtotal = 0;
    doc.font("Helvetica").fontSize(8);
    if (wines.length === 0) {
      doc.text("No wine curation has been locked for this event yet.", 45, yPosition);
      yPosition += 20;
    } else {
      for (const w of wines) {
        const itemTotal = w.quantity * w.price;
        beverageSubtotal += itemTotal;

        doc.text(`${w.name} (${w.variant})`, 45, yPosition, { width: 220 });
        doc.text(`${w.quantity}`, 280, yPosition, { width: 30, align: "center" });
        doc.text(`RM ${w.price.toFixed(2)}`, 350, yPosition, { width: 70, align: "right" });
        doc.text(`RM ${itemTotal.toFixed(2)}`, 450, yPosition, { width: 100, align: "right" });

        yPosition += 20;
      }
    }

    doc.moveTo(45, yPosition).lineTo(550, yPosition).strokeColor("#999999").lineWidth(0.5).stroke();
    yPosition += 10;

    // Financial calculations
    doc.font("Helvetica-Bold").fontSize(8);
    doc.text("CURATED BEVERAGES TOTAL:", 300, yPosition);
    doc.text(`RM ${beverageSubtotal.toFixed(2)}`, 450, yPosition, { width: 100, align: "right" });
    yPosition += 15;

    doc.text("PROPOSED LOGISTICS BUDGET:", 300, yPosition);
    doc.text(`RM ${event.budget.toFixed(2)}`, 450, yPosition, { width: 100, align: "right" });
    yPosition += 20;

    doc.moveTo(45, yPosition).lineTo(550, yPosition).strokeColor("#e0a96d").lineWidth(1).stroke();
    yPosition += 10;

    const totalEstimate = beverageSubtotal + event.budget;
    const depositDue = totalEstimate * 0.5;

    doc.fillColor("#1a0508").fontSize(10);
    doc.text("ESTIMATED GRAND TOTAL:", 45, yPosition + 2);
    doc.text(`RM ${totalEstimate.toFixed(2)}`, 450, yPosition + 2, { width: 100, align: "right" });

    yPosition += 25;
    doc.fillColor("#333333").font("Helvetica-Bold").fontSize(9).text("DEPOSIT TERMS & PAYMENTS", 45, yPosition);
    doc.moveTo(45, yPosition + 12).lineTo(550, yPosition + 12).strokeColor("#cccccc").lineWidth(0.5).stroke();
    yPosition += 20;

    doc.font("Helvetica").fontSize(8);
    doc.text("50% Confirmation Deposit Required:", 45, yPosition);
    doc.text(`RM ${depositDue.toFixed(2)}`, 220, yPosition, { align: "right", width: 80 });
    yPosition += 15;
    doc.text("Balance Due on Event Execution:", 45, yPosition);
    doc.text(`RM ${depositDue.toFixed(2)}`, 220, yPosition, { align: "right", width: 80 });

    yPosition += 40;
    doc.fillColor("#666666").font("Helvetica").fontSize(7);
    doc.text("Terms: All private cellar events require deposit confirmations at least 7 days prior to reservation. Prices are inclusive of government tax and sommelier services.", 45, yPosition);

    doc.end();
  } catch (error) {
    console.error("Error generating quotation PDF:", error);
    return res.status(500).json({ message: "Internal server error generating quotation PDF." });
  }
});

export default router;
