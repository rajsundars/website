import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query, logAudit } from "../db/connection.js";
import { validateBody } from "../middleware/validation.js";
import { verifyToken } from "../middleware/auth.js";
import dotenv from "dotenv";
dotenv.config();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "guna-wines-super-secret-key-2026";
router.post("/login", validateBody([
    { field: "email", type: "email", required: true },
    { field: "password", type: "string", required: true }
]), async (req, res) => {
    const { email, password } = req.body;
    try {
        const users = await query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid email or password." });
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }
        // Sign Token
        const token = jwt.sign({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            branchId: user.branch_id
        }, JWT_SECRET, { expiresIn: "1d" });
        await logAudit(user.id, user.name, "user_login", `${user.name} (${user.role}) logged in successfully.`);
        return res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                branchId: user.branch_id,
                contact: user.contact
            }
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Internal server error during login." });
    }
});
router.post("/logout", (req, res) => {
    return res.status(200).json({ message: "Logged out successfully." });
});
router.post("/refresh", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided." });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
        // Sign a fresh token
        const newToken = jwt.sign({
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
            branchId: decoded.branchId
        }, JWT_SECRET, { expiresIn: "1d" });
        return res.status(200).json({ token: newToken });
    }
    catch (error) {
        return res.status(403).json({ message: "Invalid token structure." });
    }
});
router.post("/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }
    return res.status(200).json({ message: "Password reset link sent if email exists." });
});
router.get("/me", verifyToken, (req, res) => {
    return res.status(200).json({ user: req.user });
});
export default router;
