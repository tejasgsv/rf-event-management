const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// ================= GLOBAL ERROR HANDLERS =================
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

// ================= LOAD ENV =================
dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
  process.env.JWT_SECRET = "rf-event-management-secret-key-2024";
  console.log("⚠️ Using fallback JWT_SECRET");
}

console.log("🔑 JWT_SECRET loaded:", !!process.env.JWT_SECRET);
console.log("📁 Current directory:", __dirname);

// ================= APP INIT =================
const app = express();
const db = require("./config/database");

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Basic request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

console.log("✅ Express app initialized");

// ================= BASIC ROUTES =================
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mysqlConnected: true,
    timestamp: new Date().toISOString(),
  });
});

// 🔍 Diagnostic endpoint for troubleshooting
app.get("/diagnostics", async (req, res) => {
  try {
    // Check speakers count
    const [[speakersCount]] = await db.query('SELECT COUNT(*) as count FROM speakers');
    
    // Check events count
    const [[eventsCount]] = await db.query('SELECT COUNT(*) as count FROM events');
    
    // Check masterclasses count
    const [[masterclassesCount]] = await db.query('SELECT COUNT(*) as count FROM masterclasses');

    res.json({
      status: "ok",
      database: {
        speakers: speakersCount?.count || 0,
        events: eventsCount?.count || 0,
        masterclasses: masterclassesCount?.count || 0
      },
      endpoints: {
        speakers: "/api/speakers",
        events: "/api/events",
        masterclasses: "/api/masterclasses"
      },
      frontend: {
        apiURL: "http://127.0.0.1:3000/api",
        expected: "VITE_API_URL should be http://127.0.0.1:3000/api"
      }
    });
  } catch (err) {
    res.status(500).json({ 
      status: "error", 
      message: err.message 
    });
  }
});

app.get("/test", (req, res) => {
  res.json({ message: "Backend working" });
});

// ================= ROUTES =================
console.log("📦 Loading routes...");

// ==================================================
// 🔓 PUBLIC ROUTES (NO AUTH REQUIRED)
// ==================================================

// Events (list, details)
app.use("/api", require("./routes/eventRoutes"));

// Public sessions / agenda (LIVE only)
app.use("/api", require("./routes/masterclassRoutes"));

// Public speakers
app.use("/api", require("./routes/speakersRoutes"));

// User registration and sessions
app.use("/api/sessions", require("./routes/userRegistrationRoutes"));

// Registration + QR + My Schedule
app.use("/api", require("./routes/registrationRoutes"));

// ==================================================
// 🔐 ADMIN ROUTES (AUTH REQUIRED)
// ==================================================
// 🔐 ADMIN ROUTES (AUTH REQUIRED)
// ==================================================
const authAdmin = require("./middleware/authAdmin");

// Admin login (NO auth)
app.use("/api/admin", require("./routes/adminAuthRoutes"));

// Admin dashboard
app.use("/api/admin", authAdmin, require("./routes/adminDashboardRoutes"));

// Event management (CRUD)
app.use("/api/admin", authAdmin, require("./routes/adminEventRoutes"));

// ✅ MASTERCLASS management (CRUD) — FINAL
app.use(
  "/api/admin",
  authAdmin,
  require("./routes/adminMasterclassRoutes")
);

// Speakers management (CRUD)
app.use("/api/admin", authAdmin, require("./routes/adminSpeakerRoutes"));

// Registration management (admin view)
app.use("/api/admin", authAdmin, require("./routes/adminRegistrationRoutes"));

// QR Scanner (check-in)
app.use("/api/admin", authAdmin, require("./routes/adminScannerRoutes"));

console.log("✅ All routes mounted");

// ================= GLOBAL ERROR HANDLER =================
const { globalErrorHandler } = require("./utils/errorHandler");
app.use(globalErrorHandler);

// ================= START SERVER AFTER DB =================
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    console.log("🔌 Testing database connection...");
    await db.testConnection();
    console.log("✅ MySQL connected");

    const HOST = process.env.HOST || "0.0.0.0";
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running at http://${HOST}:${PORT}`);
      console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📝 Frontend should use: VITE_API_URL=http://${HOST}:${PORT}/api`);
      console.log(`🔍 Diagnostics available at: http://${HOST}:${PORT}/diagnostics`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} already in use.`);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
})();
