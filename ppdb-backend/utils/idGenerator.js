const { v4: uuidv4 } = require("uuid");

/**
 * Generate a unique ID using UUID
 * Format: Prefix + 8-character UUID substring
 * Example: generateId("A") → "A-a7f9e2b1"
 * Example: generateId("S") → "S-d4c6f1e9"
 */
function generateId(prefix = "") {
  const uuid = uuidv4().replace(/-/g, "").substring(0, 8);
  return prefix ? `${prefix}${uuid}` : uuid;
}

/**
 * Generate numeric ID with prefix (backward compatible)
 * Format: Prefix + 2-digit zero-padded number
 * Used when legacy system requires sequential numbers
 * 
 * Example: generateSequentialId("A", "akun_ppdb", "id_akun") → "A06"
 * 
 * SECURITY: Uses parameterized queries and whitelist validation
 * DEPRECATED: Use generateId() for new code (UUID-based is more secure)
 */
async function generateSequentialId(prefix, table, column, db) {
  if (!db) {
    throw new Error("Database connection required for sequential ID generation");
  }

  // Whitelist validation for table and column names
  const allowedTables = [
    'akun_ppdb', 'admin_ppdb', 'siswa', 'pendaftaran', 'dokumen', 
    'hasil_seleksi', 'sekolah_tujuan', 'jalur_ppdb', 'periode_ppdb',
    'jenis_dokumen', 'syarat', 'email_tokens', 'email_logs'
  ];
  
  const allowedColumns = [
    'id_akun', 'id_admin', 'id_siswa', 'id_pendaftaran', 'id_dokumen',
    'id_hasil', 'id_sekolah', 'id_jalur', 'id_periode', 'id_jenis_dokumen',
    'id_syarat', 'id_token', 'id_log'
  ];

  // Validate table and column names against whitelist
  if (!allowedTables.includes(table)) {
    throw new Error(`Invalid table name: ${table}`);
  }
  
  if (!allowedColumns.includes(column)) {
    throw new Error(`Invalid column name: ${column}`);
  }

  // Safe to use in query now (validated against whitelist)
  const query = `SELECT MAX(CAST(SUBSTRING(??, 2) AS UNSIGNED)) AS maxnum FROM ??`;
  
  try {
    const [rows] = await db.query(query, [column, table]);
    const maxNum = rows[0]?.maxnum || 0;
    const next = Number(maxNum) + 1;
    return `${prefix}${String(next).padStart(2, "0")}`;
  } catch (err) {
    console.error(`[ID Generator] Error generating sequential ID for ${table}.${column}:`, err.message);
    // Fallback to UUID-based ID
    console.warn(`[ID Generator] Falling back to UUID-based ID`);
    return generateId(prefix);
  }
}

module.exports = {
  generateId,
  generateSequentialId,
};
