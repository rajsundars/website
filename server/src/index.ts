import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import dotenv from "dotenv";
import { initializeDatabase } from "./db/connection.js";
import authRouter from "./routes/auth.js";
import inventoryRouter from "./routes/inventory.js";
import logisticsRouter from "./routes/logistics.js";
import billingRouter from "./routes/billing.js";
import employeesRouter from "./routes/employees.js";
import eventsRouter from "./routes/events.js";
import customersRouter from "./routes/customers.js";
import reportsRouter from "./routes/reports.js";








dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
// Configure CORS to allow multiple frontend origins (including Vercel deployments)
const rawFrontendUrls = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "http://localhost:3000";
const allowedOrigins = rawFrontendUrls.split(",").map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server or same-origin requests
    // Allow if explicitly configured
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any vercel.app preview/deployment domains
    if (origin.endsWith(".vercel.app")) return callback(null, true);
    // Default: deny
    return callback(new Error("CORS policy: origin not allowed - " + origin));
  },
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use(limiter);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Authentication endpoints
app.use("/api/auth", authRouter);

// Inventory endpoints [NEW]
app.use("/api/inventory", inventoryRouter);

// Logistics endpoints [NEW]
app.use("/api/logistics", logisticsRouter);

// Billing endpoints [NEW]
app.use("/api/billing", billingRouter);

// Employee & HR endpoints [NEW]
app.use("/api/employees", employeesRouter);

// Event Management endpoints [NEW]
app.use("/api/events", eventsRouter);

// Customer CRM & Loyalty endpoints [NEW]
app.use("/api/customers", customersRouter);

// Reporting & Analytics endpoints [NEW]
app.use("/api/reports", reportsRouter);







// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error Handler Log:", err);
  res.status(err.status || 500).json({
    message: err.message || "An unexpected server error occurred."
  });
});

async function startServer() {
  try {
    console.log("Initializing database...");
    await initializeDatabase();
    console.log("Database initialized. Starting HTTP server...");
    
    // Bind to 0.0.0.0 (all interfaces) for cloud deployments
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✓ Guna Wines Backend Server running on http://0.0.0.0:${PORT}`);
      console.log(`  Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Fatal Server Initialization Error:", error);
    console.error("Stack:", (error as any).stack);
    process.exit(1);
  }
}

startServer();
