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
 * DEPRECATED: Use generateId() for new code
 */
async function generateSequentialId(prefix, table, column, db) {
  if (!db) {
    throw new Error("Database connection required for sequential ID generation");
  }

  // Use parameterized query to prevent SQL injection
  // Build query dynamically but safely
  let q = `SELECT MAX(CAST(SUBSTRING(\`${column.replace(/`/g, "``")}\`, 2) AS UNSIGNED)) AS maxnum FROM \`${table.replace(/`/g, "``")}\``;
  
  try {
    const [rows] = await db.query(q);
    const maxNum = rows[0]?.maxnum || 0;
    const next = Number(maxNum) + 1;
    return `${prefix}${String(next).padStart(2, "0")}`;
  } catch (err) {
    console.error(`[ID Generator] Error generating sequential ID for ${table}.${column}:`, err.message);
    // Fallback to UUID-based ID
    return generateId(prefix);
  }
}

module.exports = {
  generateId,
  generateSequentialId,
};
