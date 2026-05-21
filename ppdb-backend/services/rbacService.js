const db = require("../config/database");

/**
 * Initialize RBAC tables (runs once on server startup)
 * Creates roles, permissions, and role_permissions tables if they don't exist
 */
async function initializeRBAC() {
  try {
    console.log("🔐 Initializing RBAC...");

    // 1. Create roles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`roles\` (
        \`id_role\` varchar(6) NOT NULL,
        \`nama_role\` varchar(50) NOT NULL UNIQUE,
        \`deskripsi\` varchar(255) DEFAULT NULL,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id_role\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    // 2. Insert default roles if they don't exist
    await db.query(`
      INSERT IGNORE INTO \`roles\` (\`id_role\`, \`nama_role\`, \`deskripsi\`) VALUES
      ('R001', 'Super Admin', 'Full access to all features'),
      ('R002', 'Verifikator', 'Verify documents only'),
      ('R003', 'Operator Hasil', 'Input and manage selection results'),
      ('R004', 'Operator Master', 'Manage master data (schools, jalur, periods)')
    `);

    // 3. Create permissions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`permissions\` (
        \`id_permission\` varchar(10) NOT NULL,
        \`nama_permission\` varchar(50) NOT NULL UNIQUE,
        \`deskripsi\` varchar(255) DEFAULT NULL,
        \`resource\` varchar(50) NOT NULL,
        \`action\` varchar(20) NOT NULL,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id_permission\`),
        UNIQUE KEY \`uq_resource_action\` (\`resource\`, \`action\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    // 4. Insert default permissions if they don't exist
    await db.query(`
      INSERT IGNORE INTO \`permissions\` (\`id_permission\`, \`nama_permission\`, \`deskripsi\`, \`resource\`, \`action\`) VALUES
      ('P001', 'Create Admin', 'Create new admin user', 'admin', 'create'),
      ('P002', 'Read Admin', 'View admin users', 'admin', 'read'),
      ('P003', 'Update Admin', 'Edit admin users', 'admin', 'update'),
      ('P004', 'Delete Admin', 'Delete admin users', 'admin', 'delete'),
      ('P005', 'Verify Documents', 'Verify student documents', 'dokumen', 'verify'),
      ('P006', 'View Documents', 'View student documents', 'dokumen', 'read'),
      ('P007', 'Create Results', 'Create selection results', 'hasil_seleksi', 'create'),
      ('P008', 'Read Results', 'View selection results', 'hasil_seleksi', 'read'),
      ('P009', 'Update Results', 'Edit selection results', 'hasil_seleksi', 'update'),
      ('P010', 'Manage Schools', 'Create/edit/delete schools', 'sekolah', 'manage'),
      ('P011', 'Manage Jalur', 'Create/edit/delete jalur', 'jalur', 'manage'),
      ('P012', 'Manage Periods', 'Create/edit/delete periods', 'periode', 'manage'),
      ('P013', 'View Master Data', 'View master data', 'master', 'read')
    `);

    // 5. Create role_permissions junction table
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`role_permissions\` (
        \`id_role\` varchar(6) NOT NULL,
        \`id_permission\` varchar(10) NOT NULL,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id_role\`, \`id_permission\`),
        FOREIGN KEY (\`id_role\`) REFERENCES \`roles\` (\`id_role\`) ON DELETE CASCADE,
        FOREIGN KEY (\`id_permission\`) REFERENCES \`permissions\` (\`id_permission\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    // 6. Assign permissions to roles
    // Super Admin: All permissions
    await db.query(`
      INSERT IGNORE INTO \`role_permissions\` (\`id_role\`, \`id_permission\`) VALUES
      ('R001', 'P001'), ('R001', 'P002'), ('R001', 'P003'), ('R001', 'P004'),
      ('R001', 'P005'), ('R001', 'P006'),
      ('R001', 'P007'), ('R001', 'P008'), ('R001', 'P009'),
      ('R001', 'P010'), ('R001', 'P011'), ('R001', 'P012'), ('R001', 'P013')
    `);

    // Verifikator: Document verification only
    await db.query(`
      INSERT IGNORE INTO \`role_permissions\` (\`id_role\`, \`id_permission\`) VALUES
      ('R002', 'P005'), ('R002', 'P006')
    `);

    // Operator Hasil: Selection results only
    await db.query(`
      INSERT IGNORE INTO \`role_permissions\` (\`id_role\`, \`id_permission\`) VALUES
      ('R003', 'P007'), ('R003', 'P008'), ('R003', 'P009')
    `);

    // Operator Master: Master data management
    await db.query(`
      INSERT IGNORE INTO \`role_permissions\` (\`id_role\`, \`id_permission\`) VALUES
      ('R004', 'P010'), ('R004', 'P011'), ('R004', 'P012'), ('R004', 'P013')
    `);

    // 7. Add id_role column to admin_ppdb if not exists
    try {
      await db.query(`
        ALTER TABLE \`admin_ppdb\` 
        ADD COLUMN \`id_role\` varchar(6) DEFAULT 'R001' AFTER \`nama_admin\`
      `);
    } catch (err) {
      // Column already exists, that's fine
      if (!err.message.includes("Duplicate column")) console.warn("  ⚠️ RBAC column warning:", err.message);
    }

    // 8. Update existing admins to Super Admin role if not assigned
    await db.query(`UPDATE \`admin_ppdb\` SET \`id_role\` = 'R001' WHERE \`id_role\` IS NULL OR \`id_role\` = ''`);

    console.log("✅ RBAC initialized successfully!");
  } catch (err) {
    console.error("❌ RBAC initialization failed:", err.message);
    throw err;
  }
}

module.exports = { initializeRBAC };
