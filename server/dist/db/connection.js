import sqlite3 from "sqlite3";
import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
dotenv.config();
// Resolve ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isPostgres = !!(process.env.DATABASE_URL || process.env.PGHOST);
let pgPool = null;
let sqliteDb = null;
if (isPostgres) {
    pgPool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false }
    });
    console.log("Database Mode: PostgreSQL Client Initialized.");
}
else {
    const dbDir = path.resolve(__dirname, "../../");
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, "guna_wines.db");
    sqliteDb = new sqlite3.Database(dbPath);
    console.log(`Database Mode: Local SQLite Initialized at ${dbPath}`);
}
// Unified query wrapper
export function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        if (isPostgres && pgPool) {
            let pgSql = sql;
            let count = 1;
            while (pgSql.includes("?")) {
                pgSql = pgSql.replace("?", `$${count++}`);
            }
            pgPool.query(pgSql, params, (err, res) => {
                if (err)
                    return reject(err);
                resolve(res.rows);
            });
        }
        else if (sqliteDb) {
            const isSelect = sql.trim().toUpperCase().startsWith("SELECT") || sql.trim().toUpperCase().startsWith("WITH");
            if (isSelect) {
                sqliteDb.all(sql, params, (err, rows) => {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            }
            else {
                sqliteDb.run(sql, params, function (err) {
                    if (err)
                        return reject(err);
                    resolve({ lastID: this.lastID, changes: this.changes });
                });
            }
        }
        else {
            reject(new Error("No active database connection found."));
        }
    });
}
// Audit logging helper
export async function logAudit(userId, userName, action, details) {
    const id = "audit_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const timestamp = new Date().toISOString();
    try {
        await query(`
      INSERT INTO audit_logs (id, user_id, user_name, action, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, userId || "system", userName || "System", action, details, timestamp]);
    }
    catch (error) {
        console.error("Failed to write audit log:", error);
    }
}
// Migration & Seeding Runner
export async function initializeDatabase() {
    console.log("Running database migrations...");
    // Table branches
    await query(`
    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      contact TEXT NOT NULL,
      manager_id TEXT,
      manager_name TEXT
    )
  `);
    // Table users
    await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      branch_id TEXT,
      contact TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      salary INTEGER NOT NULL DEFAULT 0,
      incentives INTEGER NOT NULL DEFAULT 0,
      attendance_rate INTEGER NOT NULL DEFAULT 100
    )
  `);
    // Table suppliers [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL
    )
  `);
    // Table products [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      variant TEXT NOT NULL,
      origin TEXT NOT NULL,
      bottle_size TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      supplier_id TEXT REFERENCES suppliers(id)
    )
  `);
    // Table inventory [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      branch_id TEXT NOT NULL REFERENCES branches(id),
      quantity INTEGER NOT NULL DEFAULT 0,
      reserved_quantity INTEGER NOT NULL DEFAULT 0,
      min_threshold INTEGER NOT NULL DEFAULT 5,
      UNIQUE(product_id, branch_id)
    )
  `);
    // Table shipments [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS shipments (
      id TEXT PRIMARY KEY,
      origin TEXT NOT NULL,
      dest TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      cost REAL NOT NULL DEFAULT 0.0,
      carrier TEXT NOT NULL,
      notes TEXT,
      from_branch_id TEXT REFERENCES branches(id),
      to_branch_id TEXT REFERENCES branches(id),
      product_id TEXT REFERENCES products(id),
      quantity INTEGER
    )
  `);
    // Table inventory_adjustments [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS inventory_adjustments (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      branch_id TEXT NOT NULL REFERENCES branches(id),
      quantity_change INTEGER NOT NULL,
      reason TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id),
      timestamp TEXT NOT NULL
    )
  `);
    // Table invoices [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      branch_id TEXT NOT NULL REFERENCES branches(id),
      cashier_name TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax_amount REAL NOT NULL,
      discount_amount REAL NOT NULL,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'paid'
    )
  `);
    // Table invoice_items [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL REFERENCES invoices(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL
    )
  `);
    // Table discount_rules [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS discount_rules (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      value REAL NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    )
  `);
    // Table attendance [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      clock_in TEXT NOT NULL,
      clock_out TEXT,
      branch_id TEXT NOT NULL REFERENCES branches(id)
    )
  `);
    // Table shifts [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS shifts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      shift_type TEXT NOT NULL DEFAULT 'off'
    )
  `);
    // Table payroll [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS payroll (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      month TEXT NOT NULL,
      base_salary REAL NOT NULL,
      incentives REAL NOT NULL,
      deductions REAL NOT NULL,
      net_salary REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'unpaid',
      paid_date TEXT
    )
  `);
    // Table events [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      date TEXT NOT NULL,
      event_type TEXT NOT NULL,
      guest_count INTEGER NOT NULL,
      budget REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'enquiry',
      notes TEXT,
      branch_id TEXT NOT NULL REFERENCES branches(id)
    )
  `);
    // Table event_wines [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS event_wines (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL
    )
  `);
    // Table event_staffing [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS event_staffing (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id),
      UNIQUE(event_id, user_id)
    )
  `);
    // Table customers [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      loyalty_points INTEGER NOT NULL DEFAULT 0,
      segment_tags TEXT NOT NULL DEFAULT 'new',
      registration_date TEXT NOT NULL
    )
  `);
    // Table notifications [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      channel TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'sent',
      timestamp TEXT NOT NULL
    )
  `);
    // Table audit_logs [NEW]
    await query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);
    // Performance Indexes [NEW]
    await query("CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id)");
    await query("CREATE INDEX IF NOT EXISTS idx_inventory_branch_id ON inventory(branch_id)");
    await query("CREATE INDEX IF NOT EXISTS idx_invoices_branch_id ON invoices(branch_id)");
    await query("CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number)");
    await query("CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id)");
    await query("CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id)");
    await query("CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts(user_id)");
    await query("CREATE INDEX IF NOT EXISTS idx_payroll_user_id ON payroll(user_id)");
    await query("CREATE INDEX IF NOT EXISTS idx_events_branch_id ON events(branch_id)");
    await query("CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id)");
    await query("CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)");
    // Seed default branches
    const branchesCheck = await query("SELECT COUNT(*) as count FROM branches");
    const branchCount = parseInt(branchesCheck[0]?.count || branchesCheck[0]?.COUNT || 0);
    if (branchCount === 0) {
        console.log("Seeding default branches...");
        await query("INSERT INTO branches (id, name, location, contact, manager_id, manager_name) VALUES (?, ?, ?, ?, ?, ?)", [
            "b1", "KSL City Cellar", "03-12 KSL City Mall, Jalan Seladang, Taman Abad, 80250 Johor Bahru, Johor, Malaysia", "+60 7 330 8920", "emp2", "Arun"
        ]);
        await query("INSERT INTO branches (id, name, location, contact, manager_id, manager_name) VALUES (?, ?, ?, ?, ?, ?)", [
            "b2", "Mid Valley Cellar", "Level 1-40, Mid Valley Southkey, Jalan Pantai Senibong, 80150 Johor Bahru, Johor, Malaysia", "+60 7 288 1240", "emp3", "Karthik"
        ]);
        await query("INSERT INTO branches (id, name, location, contact, manager_id, manager_name) VALUES (?, ?, ?, ?, ?, ?)", [
            "b3", "Puteri Harbour Cellar", "Lot G-15, Puteri Harbour Marina, Persiaran Puteri Selatan, 79000 Iskandar Puteri, Johor, Malaysia", "+60 7 570 4110", "emp4", "Vignesh"
        ]);
    }
    // Seed default users
    const usersCheck = await query("SELECT COUNT(*) as count FROM users");
    const userCount = parseInt(usersCheck[0]?.count || usersCheck[0]?.COUNT || 0);
    if (userCount === 0) {
        console.log("Seeding default users and employees...");
        const defaultPasswordHash = bcrypt.hashSync("password123", 10);
        const defaultUsers = [
            ["emp1", "Guna S.", "guna.s@gunawines.my", defaultPasswordHash, "super_admin", "b1", "+60 11-1234 5678", "active", 12000, 0, 100],
            ["emp2", "Arun", "arun@gunawines.my", defaultPasswordHash, "branch_manager", "b1", "+60 12-345 6789", "active", 5500, 450, 98],
            ["emp3", "Karthik", "karthik@gunawines.my", defaultPasswordHash, "branch_manager", "b2", "+60 13-456 7890", "active", 5700, 600, 97],
            ["emp4", "Vignesh", "vignesh@gunawines.my", defaultPasswordHash, "branch_manager", "b3", "+60 14-567 8901", "active", 5400, 300, 96],
            ["emp5", "Praveen", "praveen@gunawines.my", defaultPasswordHash, "cashier", "b1", "+60 16-678 9012", "active", 2800, 150, 95],
            ["emp6", "Suresh", "suresh@gunawines.my", defaultPasswordHash, "cashier", "b2", "+60 17-789 0123", "active", 2850, 200, 99],
            ["emp7", "Rajesh", "rajesh@gunawines.my", defaultPasswordHash, "inventory_staff", "b3", "+60 18-890 1234", "active", 3000, 100, 94],
            ["emp8", "Dinesh", "dinesh@gunawines.my", defaultPasswordHash, "event_coordinator", "b1", "+60 19-901 2345", "active", 4500, 500, 97],
            ["emp9", "Senthil", "senthil@gunawines.my", defaultPasswordHash, "cashier", "b1", "+60 15-567 1234", "active", 2700, 100, 96],
            ["emp10", "Murugan", "murugan@gunawines.my", defaultPasswordHash, "inventory_staff", "b2", "+60 16-789 2345", "active", 3100, 120, 95],
            ["emp11", "Saravanan", "saravanan@gunawines.my", defaultPasswordHash, "event_coordinator", "b2", "+60 17-890 3456", "active", 4600, 480, 98]
        ];
        for (const u of defaultUsers) {
            await query(`
        INSERT INTO users (id, name, email, password_hash, role, branch_id, contact, status, salary, incentives, attendance_rate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, u);
        }
    }
    // Seed default suppliers [NEW]
    const suppliersCheck = await query("SELECT COUNT(*) as count FROM suppliers");
    const supplierCount = parseInt(suppliersCheck[0]?.count || suppliersCheck[0]?.COUNT || 0);
    if (supplierCount === 0) {
        console.log("Seeding default suppliers...");
        await query("INSERT INTO suppliers (id, name, contact, email, address) VALUES (?, ?, ?, ?, ?)", [
            "s1", "Quorum Logistics HQ", "+60 3-8000 1122", "supply@quorum.my", "Lot 15, Jalan Keluli, Kawasan Perindustrian Pasir Gudang, 81700 Pasir Gudang, Johor, Malaysia"
        ]);
        await query("INSERT INTO suppliers (id, name, contact, email, address) VALUES (?, ?, ?, ?, ?)", [
            "s2", "EuroWine Distributors", "+60 3-7956 8899", "orders@eurowine.com.my", "12, Jalan Kilang, 46050 Petaling Jaya, Selangor, Malaysia"
        ]);
    }
    // Seed default products [NEW]
    const productsCheck = await query("SELECT COUNT(*) as count FROM products");
    const productCount = parseInt(productsCheck[0]?.count || productsCheck[0]?.COUNT || 0);
    if (productCount === 0) {
        console.log("Seeding default products...");
        const defaultProducts = [
            ["p1", "WN-CAB-MARG-18", "Château Margaux 2018", "Cabernet Sauvignon Blend", "Bordeaux, France", "750ml", 1250, "red", "A legendary Premier Grand Cru Classé from Bordeaux. Extremely refined, displaying complex layers of cassis, black violets, and sweet cedar wood. Excellent aging potential.", "/images/wines/margaux.png", "s1"],
            ["p2", "WN-CAB-PENF-389", "Penfolds Bin 389 2021", "Cabernet Shiraz Blend", "Barossa Valley, Australia", "750ml", 145, "red", "Often referred to as 'Baby Grange'. This bold red wine combines the structure of Cabernet Sauvignon with the richness of Shiraz. Shows dark fruits, toasted oak, and savory spices.", "/images/wines/penfolds.png", "s1"],
            ["p3", "WN-PIN-TIGN-20", "Tignanello Toscana 2020", "Sangiovese Blend", "Tuscany, Italy", "750ml", 240, "red", "An iconic Super Tuscan offering. Rich and silky, exhibiting black cherry, dark chocolate, rosemary notes, and fine-grained tannins. Ideal with roasted game or truffle dishes.", "/images/wines/tignanello.png", "s2"],
            ["p4", "WN-CHA-CLDY-22", "Cloudy Bay Sauvignon Blanc 2022", "Sauvignon Blanc", "Marlborough, New Zealand", "750ml", 68, "white", "World-famous New Zealand white. Vibrant and fresh, bursting with passionfruit, lime, kaffir lime leaf, and crisp mineral acidity. Matches fresh seafood beautifully.", "/images/wines/cloudybay.png", "s2"],
            ["p5", "WN-CHA-CHAB-21", "Louis Jadot Chablis 2021", "Chardonnay", "Burgundy, France", "750ml", 78, "white", "Classic dry white Burgundy. Stainless steel fermentation preserves pure green apple, flinty minerality, and clean citrus notes. Clean and refreshing.", "/images/wines/chablis.png", "s2"],
            ["p6", "WN-SPK-DOMP-12", "Dom Pérignon Brut 2012", "Champagne Blend", "Champagne, France", "750ml", 360, "sparkling", "A masterpiece of balance and elegance. Opens with aromas of white flowers and stone fruit, followed by toasted brioche, ginger, and saline minerality on a creamy finish.", "/images/wines/domperignon.png", "s1"],
            ["p7", "WN-SPK-MOET-NV", "Moët & Chandon Impérial NV", "Champagne Blend", "Champagne, France", "750ml", 95, "sparkling", "The house's signature Champagne since 1869. Balanced and vibrant, combining green apple, citrus, brioche, and white flowers with fine, persistent bubbles.", "/images/wines/moet.png", "s1"],
            ["p8", "WN-ROS-WHSP-22", "Whispering Angel Rosé 2022", "Grenache Cinsault Blend", "Provence, France", "750ml", 58, "rose", "The world's most popular luxury rosé. Delicate and pale pink, offering raspberry, strawberry, and fresh peach notes with a dry, mineral, and incredibly smooth finish.", "/images/wines/whisperingangel.png", "s2"]
        ];
        for (const p of defaultProducts) {
            await query(`
        INSERT INTO products (id, sku, name, variant, origin, bottle_size, price, category, description, image, supplier_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, p);
        }
    }
    // Seed default inventory [NEW]
    const inventoryCheck = await query("SELECT COUNT(*) as count FROM inventory");
    const invCount = parseInt(inventoryCheck[0]?.count || inventoryCheck[0]?.COUNT || 0);
    if (invCount === 0) {
        console.log("Seeding default inventory...");
        const defaultInventory = [
            // KSL City Cellar (b1)
            ["i1", "p1", "b1", 15, 0, 5],
            ["i2", "p2", "b1", 48, 0, 10],
            ["i3", "p3", "b1", 24, 0, 8],
            ["i4", "p4", "b1", 60, 0, 12],
            ["i5", "p5", "b1", 36, 0, 10],
            ["i6", "p6", "b1", 2, 0, 5],
            ["i7", "p7", "b1", 80, 0, 15],
            ["i8", "p8", "b1", 50, 0, 12],
            // Mid Valley Cellar (b2)
            ["i9", "p1", "b2", 8, 0, 5],
            ["i10", "p2", "b2", 5, 0, 10],
            ["i11", "p3", "b2", 18, 0, 8],
            ["i12", "p4", "b2", 42, 0, 12],
            ["i13", "p5", "b2", 20, 0, 10],
            ["i14", "p6", "b2", 12, 0, 5],
            ["i15", "p7", "b2", 55, 0, 15],
            ["i16", "p8", "b2", 35, 0, 12],
            // Puteri Harbour Cellar (b3)
            ["i17", "p1", "b3", 12, 0, 5],
            ["i18", "p2", "b3", 30, 0, 10],
            ["i19", "p3", "b3", 10, 0, 8],
            ["i20", "p4", "b3", 24, 0, 12],
            ["i21", "p5", "b3", 15, 0, 10],
            ["i22", "p6", "b3", 6, 0, 5],
            ["i23", "p7", "b3", 40, 0, 15],
            ["i24", "p8", "b3", 28, 0, 12]
        ];
        for (const item of defaultInventory) {
            await query(`
        INSERT INTO inventory (id, product_id, branch_id, quantity, reserved_quantity, min_threshold)
        VALUES (?, ?, ?, ?, ?, ?)
      `, item);
        }
    }
    // Seed default shipments [NEW]
    const shipmentsCheck = await query("SELECT COUNT(*) as count FROM shipments");
    const shipmentCount = parseInt(shipmentsCheck[0]?.count || shipmentsCheck[0]?.COUNT || 0);
    if (shipmentCount === 0) {
        console.log("Seeding default shipments...");
        const defaultShipments = [
            ["s1", "Quorum Logistics HQ", "KSL City Cellar", "2026-05-27", "dispatched", 120, "Speedy Cargo", "Restock of Dom Pérignon and Penfolds", null, "b1", "p6", 10],
            ["s2", "Quorum Logistics HQ", "Mid Valley Cellar", "2026-05-26", "delivered", 150, "Elite Logistics", "Initial inventory restock", null, "b2", "p1", 5],
            ["s3", "KSL City Cellar", "Puteri Harbour Cellar", "2026-05-25", "delivered", 80, "Local Dispatch", "Branch-to-branch stock adjustment transfer", "b1", "b3", "p3", 10]
        ];
        for (const sh of defaultShipments) {
            await query(`
        INSERT INTO shipments (id, origin, dest, date, status, cost, carrier, notes, from_branch_id, to_branch_id, product_id, quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, sh);
        }
    }
    // Seed discount rules [NEW]
    const discountCheck = await query("SELECT COUNT(*) as count FROM discount_rules");
    const discountCount = parseInt(discountCheck[0]?.count || discountCheck[0]?.COUNT || 0);
    if (discountCount === 0) {
        console.log("Seeding default discount rules...");
        await query("INSERT INTO discount_rules (id, code, description, type, value, active) VALUES (?, ?, ?, ?, ?, ?)", [
            "d1", "BIN389PROMO", "Bin 389 promo discount", "fixed", 145.0, 1
        ]);
        await query("INSERT INTO discount_rules (id, code, description, type, value, active) VALUES (?, ?, ?, ?, ?, ?)", [
            "d2", "WELCOME10", "10% Welcome discount", "percent", 10.0, 1
        ]);
        await query("INSERT INTO discount_rules (id, code, description, type, value, active) VALUES (?, ?, ?, ?, ?, ?)", [
            "d3", "WINEVIP", "15% VIP discount", "percent", 15.0, 1
        ]);
    }
    // Seed default invoices [NEW]
    const invoicesCheck = await query("SELECT COUNT(*) as count FROM invoices");
    const invoiceCount = parseInt(invoicesCheck[0]?.count || invoicesCheck[0]?.COUNT || 0);
    if (invoiceCount === 0) {
        console.log("Seeding default invoices...");
        await query(`
      INSERT INTO invoices (id, invoice_number, branch_id, cashier_name, customer_name, subtotal, tax_amount, discount_amount, total_amount, payment_method, date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ["inv1", "INV-2026-081", "b1", "Timothy Lin", "Robert Parker", 1395, 125.55, 145, 1375.55, "card", "2026-05-27T03:20:00Z", "paid"]);
        await query(`
      INSERT INTO invoice_items (id, invoice_id, product_id, product_name, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ["ii1", "inv1", "p1", "Château Margaux 2018", 1, 1250, 1250]);
        await query(`
      INSERT INTO invoice_items (id, invoice_id, product_id, product_name, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ["ii2", "inv1", "p2", "Penfolds Bin 389 2021", 1, 145, 145]);
        await query(`
      INSERT INTO invoices (id, invoice_number, branch_id, cashier_name, customer_name, subtotal, tax_amount, discount_amount, total_amount, payment_method, date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ["inv2", "INV-2026-082", "b2", "Sarah Khoo", "Timothy Lin", 2156, 194.04, 0, 2350.04, "split", "2026-05-27T04:15:00Z", "paid"]);
        await query(`
      INSERT INTO invoice_items (id, invoice_id, product_id, product_name, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ["ii3", "inv2", "p6", "Dom Pérignon Brut 2012", 5, 360, 1800]);
        await query(`
      INSERT INTO invoice_items (id, invoice_id, product_id, product_name, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ["ii4", "inv2", "p7", "Moët & Chandon Impérial NV", 3, 95, 285]);
        await query(`
      INSERT INTO invoice_items (id, invoice_id, product_id, product_name, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ["ii5", "inv2", "p8", "Whispering Angel Rosé 2022", 1, 58, 58]);
        await query(`
      INSERT INTO invoices (id, invoice_number, branch_id, cashier_name, customer_name, subtotal, tax_amount, discount_amount, total_amount, payment_method, date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ["inv3", "INV-2026-083", "b3", "Marcus Wee", "David Miller", 518, 46.62, 22.24, 542.38, "cash", "2026-05-26T09:40:00Z", "refunded"]);
        await query(`
      INSERT INTO invoice_items (id, invoice_id, product_id, product_name, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ["ii6", "inv3", "p3", "Tignanello Toscana 2020", 2, 240, 480]);
        await query(`
      INSERT INTO invoice_items (id, invoice_id, product_id, product_name, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ["ii7", "inv3", "p5", "Louis Jadot Chablis 2021", 1, 78, 78]);
    }
    // Seed default shifts calendar [NEW]
    const shiftsCheck = await query("SELECT COUNT(*) as count FROM shifts");
    const shiftCount = parseInt(shiftsCheck[0]?.count || shiftsCheck[0]?.COUNT || 0);
    if (shiftCount === 0) {
        console.log("Seeding default shifts calendar...");
        const dates = ["2026-05-23", "2026-05-24", "2026-05-25", "2026-05-26", "2026-05-27", "2026-05-28", "2026-05-29"];
        let idCounter = 1;
        for (const d of dates) {
            const isWeekend = d === "2026-05-23" || d === "2026-05-24";
            const shiftsToInsert = [
                ["emp1", isWeekend ? "off" : "full"],
                ["emp2", isWeekend ? "off" : "full"],
                ["emp3", isWeekend ? "off" : "full"],
                ["emp4", isWeekend ? "off" : "full"],
                ["emp5", isWeekend ? "off" : "morning"],
                ["emp6", isWeekend ? "morning" : "afternoon"],
                ["emp7", isWeekend ? "off" : "full"],
                ["emp8", isWeekend ? "off" : "afternoon"],
                ["emp9", isWeekend ? "off" : "morning"],
                ["emp10", isWeekend ? "off" : "full"],
                ["emp11", isWeekend ? "off" : "afternoon"]
            ];
            for (const s of shiftsToInsert) {
                await query("INSERT INTO shifts (id, user_id, date, shift_type) VALUES (?, ?, ?, ?)", [
                    `sh_${idCounter++}`, s[0], d, s[1]
                ]);
            }
        }
    }
    // Seed default attendance records [NEW]
    const attendanceCheck = await query("SELECT COUNT(*) as count FROM attendance");
    const attendanceCount = parseInt(attendanceCheck[0]?.count || attendanceCheck[0]?.COUNT || 0);
    if (attendanceCount === 0) {
        console.log("Seeding default attendance records...");
        const attendanceSeeds = [
            ["att1", "emp2", "2026-05-25", "08:55", "18:05", "b1"],
            ["att2", "emp2", "2026-05-26", "08:48", "18:02", "b1"],
            ["att3", "emp2", "2026-05-27", "08:52", null, "b1"],
            ["att4", "emp3", "2026-05-25", "08:58", "18:00", "b2"],
            ["att5", "emp3", "2026-05-26", "09:02", "18:05", "b2"],
            ["att6", "emp3", "2026-05-27", "08:50", null, "b2"],
            ["att7", "emp5", "2026-05-25", "07:55", "16:05", "b1"],
            ["att8", "emp5", "2026-05-26", "07:58", "16:02", "b1"],
            ["att9", "emp5", "2026-05-27", "08:02", null, "b1"],
            ["att10", "emp6", "2026-05-25", "13:58", "22:05", "b2"],
            ["att11", "emp6", "2026-05-26", "14:02", "22:00", "b2"],
            ["att12", "emp6", "2026-05-27", "13:50", null, "b2"]
        ];
        for (const a of attendanceSeeds) {
            await query("INSERT INTO attendance (id, user_id, date, clock_in, clock_out, branch_id) VALUES (?, ?, ?, ?, ?, ?)", a);
        }
    }
    // Seed default payroll records [NEW]
    const payrollCheck = await query("SELECT COUNT(*) as count FROM payroll");
    const payrollCount = parseInt(payrollCheck[0]?.count || payrollCheck[0]?.COUNT || 0);
    if (payrollCount === 0) {
        console.log("Seeding default payroll records...");
        const staffSalaries = [
            ["emp1", 12000, 0],
            ["emp2", 5500, 450],
            ["emp3", 5700, 600],
            ["emp4", 5400, 300],
            ["emp5", 2800, 150],
            ["emp6", 2850, 200],
            ["emp7", 3000, 100],
            ["emp8", 4500, 500],
            ["emp9", 2700, 100],
            ["emp10", 3100, 120],
            ["emp11", 4600, 480]
        ];
        let payCounter = 1;
        for (const s of staffSalaries) {
            const uId = s[0];
            const base = s[1];
            const inc = s[2];
            const epf = base * 0.11;
            const socso = base * 0.005;
            const eis = base * 0.002;
            const ded = parseFloat((epf + socso + eis).toFixed(2));
            const net = parseFloat((base + inc - ded).toFixed(2));
            await query(`
        INSERT INTO payroll (id, user_id, month, base_salary, incentives, deductions, net_salary, status, paid_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                `pay_${payCounter++}`, uId, "2026-04", base, inc, ded, net, "paid", "2026-05-02"
            ]);
        }
    }
    // Seed default events [NEW]
    const eventsCheck = await query("SELECT COUNT(*) as count FROM events");
    const eventCount = parseInt(eventsCheck[0]?.count || eventsCheck[0]?.COUNT || 0);
    if (eventCount === 0) {
        console.log("Seeding default events...");
        // Seed events
        await query(`
      INSERT INTO events (id, customer_name, customer_email, customer_phone, date, event_type, guest_count, budget, status, notes, branch_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ["ev1", "Maybank Corporate Event", "events@maybank.com.my", "+60 3-2070 8888", "2026-06-15", "corporate", 60, 8000, "booked", "Requires premium red wines and champagne. Catering organized externally.", "b1"]);
        await query(`
      INSERT INTO events (id, customer_name, customer_email, customer_phone, date, event_type, guest_count, budget, status, notes, branch_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ["ev2", "Lim's Wedding Tasting Dinner", "alvin.lim@gmail.com", "+60 12-765 4321", "2026-06-22", "wedding", 120, 15000, "quoted", "Requires wedding custom bordeaux pairings. Initial quotation sent on May 24.", "b1"]);
        await query(`
      INSERT INTO events (id, customer_name, customer_email, customer_phone, date, event_type, guest_count, budget, status, notes, branch_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ["ev3", "Private Sommelier Masterclass", "tan.jessica@yahoo.com", "+60 19-876 5432", "2026-05-30", "private_tasting", 12, 2500, "enquiry", "Birthday tasting session for a collector. Focused on French Grand Crus.", "b1"]);
        // Seed event wines
        await query("INSERT INTO event_wines (id, event_id, product_id, quantity) VALUES (?, ?, ?, ?)", ["ew1", "ev1", "p1", 5]);
        await query("INSERT INTO event_wines (id, event_id, product_id, quantity) VALUES (?, ?, ?, ?)", ["ew2", "ev1", "p6", 10]);
        await query("INSERT INTO event_wines (id, event_id, product_id, quantity) VALUES (?, ?, ?, ?)", ["ew3", "ev1", "p4", 15]);
        await query("INSERT INTO event_wines (id, event_id, product_id, quantity) VALUES (?, ?, ?, ?)", ["ew4", "ev2", "p1", 10]);
        await query("INSERT INTO event_wines (id, event_id, product_id, quantity) VALUES (?, ?, ?, ?)", ["ew5", "ev2", "p7", 20]);
        // Seed event staffing
        await query("INSERT INTO event_staffing (id, event_id, user_id) VALUES (?, ?, ?)", ["es1", "ev1", "emp8"]);
        await query("INSERT INTO event_staffing (id, event_id, user_id) VALUES (?, ?, ?)", ["es2", "ev1", "emp5"]);
        await query("INSERT INTO event_staffing (id, event_id, user_id) VALUES (?, ?, ?)", ["es3", "ev2", "emp8"]);
        // Update reserved inventory for booked event (ev1)
        await query("UPDATE inventory SET reserved_quantity = reserved_quantity + 5 WHERE product_id = 'p1' AND branch_id = 'b1'");
        await query("UPDATE inventory SET reserved_quantity = reserved_quantity + 10 WHERE product_id = 'p6' AND branch_id = 'b1'");
        await query("UPDATE inventory SET reserved_quantity = reserved_quantity + 15 WHERE product_id = 'p4' AND branch_id = 'b1'");
    }
    // Seed default customers [NEW]
    const customersCheck = await query("SELECT COUNT(*) as count FROM customers");
    const customerCount = parseInt(customersCheck[0]?.count || customersCheck[0]?.COUNT || 0);
    if (customerCount === 0) {
        console.log("Seeding default customers...");
        const defaultCustomers = [
            ["c1", "Robert Parker", "robert@parker.com", "+60 11-222 3333", "Suite 22, Level 15, Menara Maybank, Jalan Tun Perak, 50050 Kuala Lumpur", 1200, "vip", "2026-01-15"],
            ["c2", "Timothy Lin", "timothy@lin.com", "+60 12-333 4444", "45, Jalan Molek 2/1, Taman Molek, 81100 Johor Bahru, Johor", 650, "frequent", "2026-02-10"],
            ["c3", "David Miller", "david@miller.com", "+60 13-444 5555", "Block B-12-05, Puteri Harbour Condominium, Persiaran Puteri Selatan, 79000 Iskandar Puteri, Johor", 80, "dormant", "2025-11-20"],
            ["c4", "Alvin Lim", "alvin.lim@gmail.com", "+60 12-765 4321", "12, Jalan Indah 15/2, Bukit Indah, 79100 Iskandar Puteri, Johor", 400, "frequent", "2026-03-05"],
            ["c5", "Jessica Tan", "tan.jessica@yahoo.com", "+60 19-876 5432", "No. 8, Jalan Austin Heights 3/2, Taman Austin Heights, 81100 Johor Bahru, Johor", 50, "new", "2026-05-24"]
        ];
        for (const c of defaultCustomers) {
            await query(`
        INSERT INTO customers (id, name, email, phone, address, loyalty_points, segment_tags, registration_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, c);
        }
        // Seed some mock notifications
        const defaultNotifs = [
            ["n1", "c1", "email", "Exclusive Invitation: Grand Bordeaux Tasting Session at KSL Cellar.", "sent", "2026-05-20T10:00:00Z"],
            ["n2", "c1", "whatsapp", "Hello Robert, your reserved Château Margaux is ready for collection.", "sent", "2026-05-25T14:30:00Z"],
            ["n3", "c2", "sms", "Guna Wines: RM50 voucher credited to your account. Code: FREQ50.", "sent", "2026-05-18T09:15:00Z"]
        ];
        for (const n of defaultNotifs) {
            await query(`
        INSERT INTO notifications (id, customer_id, channel, message, status, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `, n);
        }
    }
    console.log("Database migrations and seeding complete.");
}
