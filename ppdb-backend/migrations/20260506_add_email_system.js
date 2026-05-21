/**
 * Migration: Add Email System Tables
 * Date: 2026-05-06
 * Description: Menambahkan tabel untuk email verification, password reset, dan email logs
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function up() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('🔄 Running migration: Add Email System Tables...');

    // 1. Create email_tokens table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS email_tokens (
        id_token VARCHAR(6) NOT NULL PRIMARY KEY,
        id_akun VARCHAR(6) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        type ENUM('VERIFY', 'RESET') NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_akun) REFERENCES akun_ppdb(id_akun) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_akun (id_akun),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Table email_tokens created');

    // 2. Add email verification columns to akun_ppdb
    await connection.query(`
      ALTER TABLE akun_ppdb 
      ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS email_verified_at DATETIME NULL;
    `);
    console.log('✅ Added email verification columns to akun_ppdb');

    // 3. Create email_logs table for audit trail
    await connection.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id_log VARCHAR(6) NOT NULL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        success BOOLEAN NOT NULL,
        error_message TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_recipient (recipient),
        INDEX idx_type (type),
        INDEX idx_sent_at (sent_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Table email_logs created');

    // 4. Update existing accounts to be verified (untuk backward compatibility)
    await connection.query(`
      UPDATE akun_ppdb 
      SET is_email_verified = TRUE, 
          email_verified_at = NOW() 
      WHERE is_email_verified IS NULL OR is_email_verified = FALSE;
    `);
    console.log('✅ Updated existing accounts to verified status');

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

async function down() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('🔄 Rolling back migration: Add Email System Tables...');

    // Drop tables in reverse order
    await connection.query('DROP TABLE IF EXISTS email_logs;');
    console.log('✅ Table email_logs dropped');

    await connection.query('DROP TABLE IF EXISTS email_tokens;');
    console.log('✅ Table email_tokens dropped');

    // Remove columns from akun_ppdb
    await connection.query(`
      ALTER TABLE akun_ppdb 
      DROP COLUMN IF EXISTS is_email_verified,
      DROP COLUMN IF EXISTS email_verified_at;
    `);
    console.log('✅ Removed email verification columns from akun_ppdb');

    console.log('✅ Rollback completed successfully!');
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'down') {
    down()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    up()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = { up, down };
