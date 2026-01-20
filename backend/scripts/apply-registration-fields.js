const db = require("../config/database");

(async () => {
  try {
    await db.query(
      "ALTER TABLE registrations ADD COLUMN country VARCHAR(100) NULL, ADD COLUMN postalCode VARCHAR(20) NULL, ADD COLUMN accessibilityNeeds TEXT NULL"
    );
    console.log("✅ Registrations table updated");
  } catch (err) {
    console.error("❌ Update failed:", err.message);
  } finally {
    process.exit(0);
  }
})();
