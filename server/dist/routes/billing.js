import { Router } from "express";
import { query, logAudit } from "../db/connection.js";
import { verifyToken } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import PDFDocument from "pdfkit";
const router = Router();
// GET /api/billing/invoices
router.get("/invoices", async (req, res) => {
    const { branchId } = req.query;
    try {
        let sql = `
      SELECT 
        i.id,
        i.invoice_number as invoiceNumber,
        i.branch_id as branchId,
        i.cashier_name as cashierName,
        i.customer_name as customerName,
        i.subtotal,
        i.tax_amount as taxAmount,
        i.discount_amount as discountAmount,
        i.total_amount as totalAmount,
        i.payment_method as paymentMethod,
        i.date,
        i.status,
        b.name as branchName
      FROM invoices i
      JOIN branches b ON i.branch_id = b.id
      WHERE 1=1
    `;
        const params = [];
        if (branchId && branchId !== "all") {
            sql += " AND i.branch_id = ?";
            params.push(branchId);
        }
        sql += " ORDER BY i.date DESC, i.invoice_number DESC";
        const invoices = await query(sql, params);
        return res.status(200).json(invoices);
    }
    catch (error) {
        console.error("Error fetching invoices:", error);
        return res.status(500).json({ message: "Internal server error fetching invoices." });
    }
});
// GET /api/billing/discounts
router.get("/discounts", async (req, res) => {
    try {
        const rules = await query("SELECT * FROM discount_rules WHERE active = 1");
        const mapped = rules.map((r) => ({
            id: r.id,
            code: r.code,
            description: r.description,
            type: r.type,
            value: r.value,
            active: r.active === 1
        }));
        return res.status(200).json(mapped);
    }
    catch (error) {
        console.error("Error fetching discount rules:", error);
        return res.status(500).json({ message: "Internal server error fetching discount rules." });
    }
});
// POST /api/billing/checkout
router.post("/checkout", verifyToken, validateBody([
    { field: "paymentMethod", type: "string", required: true },
    { field: "items", type: "array", required: true }
]), async (req, res) => {
    const { customerName, promoCode, paymentMethod, items } = req.body;
    const branchId = req.user?.branchId;
    const cashierName = req.user?.name || "Cashier";
    if (!branchId) {
        return res.status(400).json({ message: "Cashier must be assigned to a branch to checkout." });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Shopping cart cannot be empty." });
    }
    try {
        let subtotal = 0;
        const verifiedItems = [];
        for (const item of items) {
            const { productId, quantity } = item;
            const qty = parseInt(quantity);
            if (isNaN(qty) || qty <= 0) {
                return res.status(400).json({ message: `Invalid quantity for product ${productId}.` });
            }
            const products = await query("SELECT * FROM products WHERE id = ?", [productId]);
            if (products.length === 0) {
                return res.status(404).json({ message: `Product ${productId} not found.` });
            }
            const product = products[0];
            const itemTotal = product.price * qty;
            subtotal += itemTotal;
            verifiedItems.push({
                productId,
                productName: product.name,
                quantity: qty,
                unitPrice: product.price,
                totalPrice: itemTotal
            });
        }
        let discountAmount = 0;
        if (promoCode) {
            const rules = await query("SELECT * FROM discount_rules WHERE code = ? AND active = 1", [promoCode]);
            if (rules.length > 0) {
                const rule = rules[0];
                if (rule.type === "fixed") {
                    discountAmount = rule.value;
                }
                else if (rule.type === "percent") {
                    discountAmount = (subtotal * rule.value) / 100;
                }
            }
        }
        if (discountAmount > subtotal) {
            discountAmount = subtotal;
        }
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = parseFloat((taxableAmount * 0.09).toFixed(2));
        const totalAmount = parseFloat((taxableAmount + taxAmount).toFixed(2));
        const invoiceId = "inv_" + Date.now() + "_" + Math.floor(Math.random() * 100);
        const dateCode = new Date().toISOString().split("T")[0].replace(/-/g, "").substring(2, 6);
        const randomSeq = Math.floor(100 + Math.random() * 900);
        const invoiceNum = `INV-2026-${dateCode}-${randomSeq}`;
        const dateStr = new Date().toISOString();
        await query("BEGIN");
        try {
            for (const item of verifiedItems) {
                const inventory = await query("SELECT * FROM inventory WHERE product_id = ? AND branch_id = ?", [item.productId, branchId]);
                if (inventory.length === 0) {
                    throw new Error(`Inventory record not found at this branch for product: ${item.productName}`);
                }
                const currentQty = inventory[0].quantity;
                const reservedQty = inventory[0].reserved_quantity || 0;
                const available = currentQty - reservedQty;
                if (available < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.productName}. Available: ${available}, requested: ${item.quantity}.`);
                }
                const newQty = currentQty - item.quantity;
                await query("UPDATE inventory SET quantity = ? WHERE product_id = ? AND branch_id = ?", [newQty, item.productId, branchId]);
                const adjId = "adj_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
                await query(`
          INSERT INTO inventory_adjustments (id, product_id, branch_id, quantity_change, reason, user_id, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [adjId, item.productId, branchId, -item.quantity, "POS Sale Checkout", req.user?.id || "unknown", dateStr]);
            }
            await query(`
        INSERT INTO invoices (id, invoice_number, branch_id, cashier_name, customer_name, subtotal, tax_amount, discount_amount, total_amount, payment_method, date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [invoiceId, invoiceNum, branchId, cashierName, customerName || "Walk-in Guest", subtotal, taxAmount, discountAmount, totalAmount, paymentMethod || "cash", dateStr, "paid"]);
            // Reward loyalty points [NEW]
            if (customerName && customerName !== "Walk-in Guest") {
                const matchingCustomers = await query("SELECT id, loyalty_points FROM customers WHERE UPPER(name) = ? OR UPPER(email) = ?", [customerName.toUpperCase(), customerName.toUpperCase()]);
                if (matchingCustomers.length > 0) {
                    const pointsEarned = Math.floor(totalAmount / 10);
                    if (pointsEarned > 0) {
                        const customerId = matchingCustomers[0].id;
                        await query("UPDATE customers SET loyalty_points = loyalty_points + ? WHERE id = ?", [pointsEarned, customerId]);
                    }
                }
            }
            for (const item of verifiedItems) {
                const itemId = "ii_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
                await query(`
          INSERT INTO invoice_items (id, invoice_id, product_id, product_name, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [itemId, invoiceId, item.productId, item.productName, item.quantity, item.unitPrice, item.totalPrice]);
            }
            await query("COMMIT");
            await logAudit(req.user?.id || "unknown", req.user?.name || "Cashier", "billing_checkout", `Cashier ${req.user?.name || "Cashier"} completed sales checkout ${invoiceNum} for ${customerName || "Walk-in Guest"}, total: RM ${totalAmount.toFixed(2)}.`);
        }
        catch (txErr) {
            await query("ROLLBACK");
            throw txErr;
        }
        return res.status(201).json({
            message: "Checkout successful.",
            id: invoiceId,
            invoiceNumber: invoiceNum,
            totalAmount
        });
    }
    catch (error) {
        console.error("Checkout transaction failed:", error);
        return res.status(500).json({ message: error.message || "Internal server error during checkout transaction." });
    }
});
// GET /api/billing/invoice/:id/pdf
router.get("/invoice/:id/pdf", async (req, res) => {
    const { id } = req.params;
    try {
        const invoices = await query(`
      SELECT i.*, b.name as branchName, b.location as branchLocation, b.contact as branchContact 
      FROM invoices i
      JOIN branches b ON i.branch_id = b.id
      WHERE i.id = ?
    `, [id]);
        if (invoices.length === 0) {
            return res.status(404).json({ message: "Invoice not found." });
        }
        const invoice = invoices[0];
        const items = await query("SELECT * FROM invoice_items WHERE invoice_id = ?", [id]);
        const doc = new PDFDocument({ margin: 40, size: "A4" });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Guna_Wines_Receipt_${invoice.invoice_number}.pdf`);
        doc.pipe(res);
        doc.fillColor("#1a0508").rect(0, 0, 595, 100).fill();
        doc.fillColor("#e0a96d").font("Helvetica-Bold").fontSize(20).text("GUNA WINES", 40, 25);
        doc.fillColor("#ffffff").font("Helvetica").fontSize(8).text("PREMIUM WINE CELLAR OPERATIONS", 40, 48);
        doc.fillColor("#e0a96d").font("Helvetica-Bold").fontSize(12).text("TAX INVOICE RECEIPT", 420, 25, { align: "right", width: 135 });
        doc.fillColor("#ffffff").font("Helvetica").fontSize(8).text(`No: ${invoice.invoice_number}`, 420, 45, { align: "right", width: 135 });
        doc.text(`Date: ${new Date(invoice.date).toLocaleString()}`, 420, 57, { align: "right", width: 135 });
        doc.fillColor("#333333").font("Helvetica-Bold").fontSize(9).text("STORE DETAILS", 40, 120);
        doc.font("Helvetica").fontSize(8);
        doc.text(invoice.branchName, 40, 132);
        doc.text(invoice.branchLocation, 40, 144, { width: 220 });
        doc.text(`Contact: ${invoice.branchContact}`, 40, 175);
        doc.font("Helvetica-Bold").fontSize(9).text("CUSTOMER & SALES INFO", 320, 120);
        doc.font("Helvetica").fontSize(8);
        doc.text(`Customer Name: ${invoice.customer_name}`, 320, 132);
        doc.text(`Cashier Name:   ${invoice.cashier_name}`, 320, 144);
        doc.text(`Payment Mode:   ${invoice.payment_method.toUpperCase()}`, 320, 156);
        doc.text(`Status:         ${invoice.status.toUpperCase()}`, 320, 168);
        doc.moveTo(40, 200).lineTo(555, 200).strokeColor("#cccccc").lineWidth(1).stroke();
        doc.fillColor("#1a0508").rect(40, 210, 515, 20).fill();
        doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8);
        doc.text("ITEM DESCRIPTION", 45, 216);
        doc.text("QTY", 320, 216, { width: 30, align: "center" });
        doc.text("UNIT PRICE (RM)", 370, 216, { width: 80, align: "right" });
        doc.text("TOTAL (RM)", 470, 216, { width: 80, align: "right" });
        let y = 238;
        doc.fillColor("#333333").font("Helvetica").fontSize(8);
        for (const item of items) {
            if (y > 700) {
                doc.addPage();
                y = 40;
            }
            doc.font("Helvetica-Bold").text(item.product_name, 45, y);
            doc.font("Helvetica").text(String(item.quantity), 320, y, { width: 30, align: "center" });
            doc.text(item.unit_price.toFixed(2), 370, y, { width: 80, align: "right" });
            doc.font("Helvetica-Bold").text(item.total_price.toFixed(2), 470, y, { width: 80, align: "right" });
            doc.moveTo(40, y + 15).lineTo(555, y + 15).strokeColor("#eeeeee").lineWidth(0.5).stroke();
            y += 24;
        }
        y += 10;
        doc.moveTo(320, y).lineTo(555, y).strokeColor("#999999").lineWidth(1).stroke();
        y += 10;
        doc.fillColor("#666666").font("Helvetica").fontSize(8);
        doc.text("SUBTOTAL:", 320, y, { width: 120, align: "right" });
        doc.fillColor("#333333").font("Helvetica-Bold").text(`RM ${invoice.subtotal.toFixed(2)}`, 450, y, { width: 100, align: "right" });
        y += 15;
        doc.fillColor("#666666").font("Helvetica").text("PROMO DISCOUNT:", 320, y, { width: 120, align: "right" });
        doc.fillColor("#b83232").font("Helvetica-Bold").text(`-RM ${invoice.discount_amount.toFixed(2)}`, 450, y, { width: 100, align: "right" });
        y += 15;
        doc.fillColor("#666666").font("Helvetica").text("SST TAX (9%):", 320, y, { width: 120, align: "right" });
        doc.fillColor("#333333").font("Helvetica-Bold").text(`RM ${invoice.tax_amount.toFixed(2)}`, 450, y, { width: 100, align: "right" });
        y += 15;
        doc.moveTo(320, y).lineTo(555, y).strokeColor("#e0a96d").lineWidth(1.5).stroke();
        y += 10;
        doc.fillColor("#1a0508").font("Helvetica-Bold").fontSize(11).text("TOTAL PAID:", 320, y, { width: 120, align: "right" });
        doc.fillColor("#1a0508").text(`RM ${invoice.total_amount.toFixed(2)}`, 450, y, { width: 100, align: "right" });
        doc.fillColor("#666666").font("Helvetica").fontSize(7);
        doc.text("Terms & Conditions:", 40, 720);
        doc.text("1. All sold luxury wines are non-refundable unless verified as corked/spoiled within 24 hours.", 40, 730);
        doc.text("2. Please present this invoice receipt for any quality validation or return enquiry.", 40, 740);
        doc.fillColor("#e0a96d").font("Helvetica-Bold").fontSize(8).text("THANK YOU FOR SHOPPING WITH GUNA WINES!", 40, 765, { align: "center", width: 515 });
        doc.end();
    }
    catch (error) {
        console.error("Error generating receipt PDF:", error);
        return res.status(500).json({ message: "Internal server error generating invoice PDF." });
    }
});
export default router;
