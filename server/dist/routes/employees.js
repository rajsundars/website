import { Router } from "express";
import { query, logAudit } from "../db/connection.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import bcrypt from "bcryptjs";
import PDFDocument from "pdfkit";
const router = Router();
// GET /api/employees
router.get("/", async (req, res) => {
    const { branchId } = req.query;
    try {
        let sql = `
      SELECT 
        u.id, u.name, u.email, u.role, u.branch_id as branchId, u.contact, u.status, u.salary, u.incentives, u.attendance_rate as attendanceRate,
        b.name as branchName
      FROM users u
      LEFT JOIN branches b ON u.branch_id = b.id
      WHERE 1=1
    `;
        const params = [];
        if (branchId && branchId !== "all") {
            sql += " AND u.branch_id = ?";
            params.push(branchId);
        }
        sql += " ORDER BY u.role, u.name";
        const employees = await query(sql, params);
        return res.status(200).json(employees);
    }
    catch (error) {
        console.error("Error loading roster:", error);
        return res.status(500).json({ message: "Internal server error fetching roster." });
    }
});
// POST /api/employees
router.post("/", verifyToken, requireRole(["super_admin"]), validateBody([
    { field: "name", type: "string", required: true },
    { field: "email", type: "email", required: true },
    { field: "role", type: "string", required: true },
    { field: "branchId", type: "string", required: true },
    { field: "contact", type: "string", required: true },
    { field: "salary", type: "number", required: true }
]), async (req, res) => {
    const { name, email, role, branchId, contact, salary, status } = req.body;
    try {
        const emailCheck = await query("SELECT id FROM users WHERE email = ?", [email]);
        if (emailCheck.length > 0) {
            return res.status(400).json({ message: "An employee with this email already exists." });
        }
        const employeeId = "emp_" + Date.now();
        const defaultHash = bcrypt.hashSync("password123", 10);
        await query(`
      INSERT INTO users (id, name, email, password_hash, role, branch_id, contact, status, salary, incentives, attendance_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 100)
    `, [employeeId, name, email, defaultHash, role, branchId, contact, status || "active", salary]);
        await logAudit(req.user?.id || "unknown", req.user?.name || "System", "employee_create", `User ${req.user?.name || "System"} registered new employee: ${name} (${role}) assigned to ${branchId}.`);
        return res.status(201).json({ message: "Employee registered successfully." });
    }
    catch (error) {
        console.error("Error creating employee:", error);
        return res.status(500).json({ message: "Internal server error creating employee." });
    }
});
// PUT /api/employees/:id
router.put("/:id", verifyToken, requireRole(["super_admin"]), validateBody([
    { field: "name", type: "string", required: true },
    { field: "email", type: "email", required: true },
    { field: "role", type: "string", required: true },
    { field: "branchId", type: "string", required: true },
    { field: "contact", type: "string", required: true },
    { field: "salary", type: "number", required: true }
]), async (req, res) => {
    const { id } = req.params;
    const { name, email, role, branchId, contact, salary, status, incentives } = req.body;
    try {
        const existing = await query("SELECT id FROM users WHERE id = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: "Employee not found." });
        }
        await query(`
      UPDATE users 
      SET name = ?, email = ?, role = ?, branch_id = ?, contact = ?, salary = ?, status = ?, incentives = ?
      WHERE id = ?
    `, [name, email, role, branchId, contact, salary, status, incentives || 0, id]);
        await logAudit(req.user?.id || "unknown", req.user?.name || "System", "employee_update", `User ${req.user?.name || "System"} updated employee record: ${name} (${id}).`);
        return res.status(200).json({ message: "Employee record updated successfully." });
    }
    catch (error) {
        console.error("Error updating employee:", error);
        return res.status(500).json({ message: "Internal server error updating employee." });
    }
});
// DELETE /api/employees/:id
router.delete("/:id", verifyToken, requireRole(["super_admin"]), async (req, res) => {
    const { id } = req.params;
    if (id === req.user?.id) {
        return res.status(400).json({ message: "Self-deletion is blocked. Super Admins cannot delete themselves." });
    }
    try {
        const existing = await query("SELECT id, name FROM users WHERE id = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: "Employee not found." });
        }
        const empName = existing[0].name;
        await query("DELETE FROM users WHERE id = ?", [id]);
        await logAudit(req.user?.id || "unknown", req.user?.name || "System", "employee_delete", `User ${req.user?.name || "System"} deleted employee: ${empName} (${id}).`);
        return res.status(200).json({ message: "Employee terminated and deleted from database." });
    }
    catch (error) {
        console.error("Error deleting employee:", error);
        return res.status(500).json({ message: "Internal server error deleting employee." });
    }
});
// GET /api/employees/shifts
router.get("/shifts", async (req, res) => {
    try {
        const shifts = await query(`
      SELECT s.*, u.name as userName, u.role as userRole 
      FROM shifts s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.date ASC, u.name ASC
    `);
        return res.status(200).json(shifts);
    }
    catch (error) {
        console.error("Error loading shifts:", error);
        return res.status(500).json({ message: "Internal server error loading shifts." });
    }
});
// POST /api/employees/shifts
router.post("/shifts", verifyToken, requireRole(["super_admin", "branch_manager"]), async (req, res) => {
    const { userId, date, shiftType } = req.body;
    if (!userId || !date || !shiftType) {
        return res.status(400).json({ message: "userId, date, and shiftType are required." });
    }
    try {
        const existing = await query("SELECT id FROM shifts WHERE user_id = ? AND date = ?", [userId, date]);
        if (existing.length > 0) {
            await query("UPDATE shifts SET shift_type = ? WHERE user_id = ? AND date = ?", [shiftType, userId, date]);
        }
        else {
            const shiftId = "sh_" + Date.now();
            await query("INSERT INTO shifts (id, user_id, date, shift_type) VALUES (?, ?, ?, ?)", [shiftId, userId, date, shiftType]);
        }
        return res.status(200).json({ message: "Shift updated successfully." });
    }
    catch (error) {
        console.error("Error saving shift:", error);
        return res.status(500).json({ message: "Internal server error saving shift." });
    }
});
// GET /api/employees/attendance
router.get("/attendance", async (req, res) => {
    try {
        const records = await query(`
      SELECT a.*, u.name as userName, u.role as userRole, b.name as branchName 
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN branches b ON a.branch_id = b.id
      ORDER BY a.date DESC, a.clock_in DESC
    `);
        return res.status(200).json(records);
    }
    catch (error) {
        console.error("Error loading attendance:", error);
        return res.status(500).json({ message: "Internal server error loading attendance." });
    }
});
// POST /api/employees/attendance/clock-in
router.post("/attendance/clock-in", verifyToken, async (req, res) => {
    const userId = req.user?.id;
    const branchId = req.user?.branchId;
    if (!userId || !branchId) {
        return res.status(400).json({ message: "User session lacks branch mapping." });
    }
    const todayStr = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    try {
        const existing = await query("SELECT id FROM attendance WHERE user_id = ? AND date = ?", [userId, todayStr]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "Already clocked-in for today." });
        }
        const attId = "att_" + Date.now();
        await query("INSERT INTO attendance (id, user_id, date, clock_in, branch_id) VALUES (?, ?, ?, ?, ?)", [attId, userId, todayStr, timeStr, branchId]);
        return res.status(201).json({ message: "Clock-in registered successfully.", clockIn: timeStr });
    }
    catch (error) {
        console.error("Clock-in error:", error);
        return res.status(500).json({ message: "Internal server error during clock-in." });
    }
});
// POST /api/employees/attendance/clock-out
router.post("/attendance/clock-out", verifyToken, async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized." });
    const todayStr = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    try {
        const existing = await query("SELECT * FROM attendance WHERE user_id = ? AND date = ? AND clock_out IS NULL", [userId, todayStr]);
        if (existing.length === 0) {
            return res.status(400).json({ message: "No active clock-in record found for today to clock-out." });
        }
        await query("UPDATE attendance SET clock_out = ? WHERE id = ?", [timeStr, existing[0].id]);
        return res.status(200).json({ message: "Clock-out registered successfully.", clockOut: timeStr });
    }
    catch (error) {
        console.error("Clock-out error:", error);
        return res.status(500).json({ message: "Internal server error during clock-out." });
    }
});
// GET /api/employees/payroll
router.get("/payroll", async (req, res) => {
    try {
        const payrolls = await query(`
      SELECT p.*, u.name as userName, u.email as userEmail, u.role as userRole, u.contact as userContact, b.name as branchName
      FROM payroll p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN branches b ON u.branch_id = b.id
      ORDER BY p.month DESC, u.name ASC
    `);
        return res.status(200).json(payrolls);
    }
    catch (error) {
        console.error("Error loading payroll:", error);
        return res.status(500).json({ message: "Internal server error loading payroll." });
    }
});
// POST /api/employees/payroll/process
router.post("/payroll/process", verifyToken, requireRole(["super_admin"]), async (req, res) => {
    const { month } = req.body;
    if (!month) {
        return res.status(400).json({ message: "Target processing month is required (YYYY-MM)." });
    }
    try {
        const employees = await query("SELECT id, salary, incentives FROM users WHERE status = 'active'");
        await query("DELETE FROM payroll WHERE month = ?", [month]);
        let idCounter = 1;
        const dateStr = new Date().toISOString().split("T")[0];
        for (const emp of employees) {
            const uId = emp.id;
            const base = emp.salary;
            const inc = emp.incentives || 0;
            const epf = base * 0.11;
            const socso = base * 0.005;
            const eis = base * 0.002;
            const ded = parseFloat((epf + socso + eis).toFixed(2));
            const net = parseFloat((base + inc - ded).toFixed(2));
            const payrollId = `pay_${Date.now()}_${idCounter++}`;
            await query(`
        INSERT INTO payroll (id, user_id, month, base_salary, incentives, deductions, net_salary, status, paid_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'paid', ?)
      `, [payrollId, uId, month, base, inc, ded, net, dateStr]);
        }
        return res.status(201).json({ message: `Payroll processing for month ${month} complete. Processed ${employees.length} employees.` });
    }
    catch (error) {
        console.error("Error processing payroll:", error);
        return res.status(500).json({ message: "Internal server error processing payroll." });
    }
});
// GET /api/employees/payroll/:id/payslip
router.get("/payroll/:id/payslip", async (req, res) => {
    const { id } = req.params;
    try {
        const records = await query(`
      SELECT p.*, u.name as userName, u.email as userEmail, u.role as userRole, u.contact as userContact, b.name as branchName
      FROM payroll p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN branches b ON u.branch_id = b.id
      WHERE p.id = ?
    `, [id]);
        if (records.length === 0) {
            return res.status(404).json({ message: "Payroll record not found." });
        }
        const pay = records[0];
        const doc = new PDFDocument({ margin: 45, size: "A4" });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Payslip_${pay.userName}_${pay.month}.pdf`);
        doc.pipe(res);
        doc.fillColor("#1a0508").rect(0, 0, 595, 90).fill();
        doc.fillColor("#e0a96d").font("Helvetica-Bold").fontSize(18).text("GUNA WINES", 45, 25);
        doc.fillColor("#ffffff").font("Helvetica").fontSize(8).text("MONTHLY SALARY SLIP (PAYSILIP)", 45, 48);
        doc.fillColor("#e0a96d").font("Helvetica-Bold").fontSize(11).text("PRIVATE & CONFIDENTIAL", 380, 25, { align: "right", width: 170 });
        doc.fillColor("#ffffff").font("Helvetica").fontSize(8).text(`Payroll Period: ${pay.month}`, 380, 42, { align: "right", width: 170 });
        doc.text(`Payment Status: ${pay.status.toUpperCase()}`, 380, 52, { align: "right", width: 170 });
        if (pay.paid_date) {
            doc.text(`Paid Date: ${pay.paid_date}`, 380, 62, { align: "right", width: 170 });
        }
        doc.fillColor("#333333").font("Helvetica-Bold").fontSize(9).text("EMPLOYEE DETAILS", 45, 110);
        doc.moveTo(45, 122).lineTo(550, 122).strokeColor("#cccccc").lineWidth(0.5).stroke();
        doc.font("Helvetica").fontSize(8);
        doc.text(`Name:           ${pay.userName}`, 45, 130);
        doc.text(`Email:          ${pay.userEmail}`, 45, 142);
        doc.text(`Contact:        ${pay.userContact}`, 45, 154);
        doc.text(`Role:           ${pay.userRole.replace("_", " ").toUpperCase()}`, 300, 130);
        doc.text(`Assigned Unit:  ${pay.branchName || "HQ Core"}`, 300, 142);
        doc.fillColor("#333333").font("Helvetica-Bold").fontSize(9).text("EARNINGS DETAILS", 45, 185);
        doc.text("DEDUCTIONS (MALAYSIAN STATUTORY)", 300, 185);
        doc.moveTo(45, 197).lineTo(550, 197).strokeColor("#cccccc").lineWidth(0.5).stroke();
        doc.font("Helvetica").fontSize(8);
        doc.text("Basic Salary", 45, 210);
        doc.text(`RM ${pay.base_salary.toFixed(2)}`, 200, 210, { align: "right", width: 70 });
        doc.text("Incentives/Bonus", 45, 225);
        doc.text(`RM ${pay.incentives.toFixed(2)}`, 200, 225, { align: "right", width: 70 });
        const base = pay.base_salary;
        const epf = base * 0.11;
        const socso = base * 0.005;
        const eis = base * 0.002;
        doc.text("EPF Contribution (11%)", 300, 210);
        doc.text(`RM ${epf.toFixed(2)}`, 480, 210, { align: "right", width: 70 });
        doc.text("SOCSO Contribution (0.5%)", 300, 225);
        doc.text(`RM ${socso.toFixed(2)}`, 480, 225, { align: "right", width: 70 });
        doc.text("EIS Contribution (0.2%)", 300, 240);
        doc.text(`RM ${eis.toFixed(2)}`, 480, 240, { align: "right", width: 70 });
        doc.moveTo(45, 280).lineTo(550, 280).strokeColor("#999999").lineWidth(0.5).stroke();
        doc.font("Helvetica-Bold").fontSize(8);
        doc.text("TOTAL GROSS PAY:", 45, 290);
        const gross = pay.base_salary + pay.incentives;
        doc.text(`RM ${gross.toFixed(2)}`, 200, 290, { align: "right", width: 70 });
        doc.text("TOTAL DEDUCTIONS:", 300, 290);
        doc.text(`RM ${pay.deductions.toFixed(2)}`, 480, 290, { align: "right", width: 70 });
        doc.moveTo(45, 310).lineTo(550, 310).strokeColor("#e0a96d").lineWidth(1).stroke();
        doc.fillColor("#1a0508").fontSize(10);
        doc.text("NET SALARY DISBURSED:", 45, 325);
        doc.text(`RM ${pay.net_salary.toFixed(2)}`, 450, 325, { align: "right", width: 100 });
        doc.fillColor("#666666").font("Helvetica").fontSize(7);
        doc.text("This is a computer-generated document. No physical signature is required.", 45, 400);
        doc.end();
    }
    catch (error) {
        console.error("Error generating payslip PDF:", error);
        return res.status(500).json({ message: "Internal server error generating payslip PDF." });
    }
});
export default router;
