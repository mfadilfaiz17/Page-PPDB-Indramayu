const bcrypt = require("bcryptjs");
const db = require("../config/database");

(async function run() {
  try {
    const [tables] = await db.query(
      "SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ? AND table_name = 'admin_ppdb'",
      [process.env.DB_NAME]
    );

    if (tables.length === 0) {
      await db.query(`CREATE TABLE IF NOT EXISTS admin_ppdb (
        id_admin varchar(6) NOT NULL,
        username varchar(50) NOT NULL,
        password varchar(255) NOT NULL,
        nama_admin varchar(100) DEFAULT NULL,
        PRIMARY KEY (id_admin),
        UNIQUE KEY uq_admin_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    }

    const [admins] = await db.query("SELECT id_admin FROM admin_ppdb WHERE username = ? LIMIT 1", ["admin"]);
    if (admins.length === 0) {
      const hashed = await bcrypt.hash("admin123", 10);
      await db.query(
        "INSERT INTO admin_ppdb (id_admin, username, password, nama_admin) VALUES (?, ?, ?, ?)",
        ["AD01", "admin", hashed, "Administrator PPDB"]
      );
      console.log("Migration completed: admin_ppdb created and seeded.");
    } else {
      console.log("Migration completed: admin_ppdb already exists.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
})();