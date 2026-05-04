const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistem_ppdb',
    port: 3306
  });

  const conn = await pool.getConnection();

  try {
    // Generate hash
    const hash = await bcrypt.hash('pass12345', 10);
    console.log('Hash generated:', hash);

    // Update password
    await conn.query('UPDATE akun_ppdb SET password = ? WHERE email = ?', [
      hash,
      'zora17@gmail.com'
    ]);

    // Verify
    const [rows] = await conn.query('SELECT email, password FROM akun_ppdb WHERE email = ?', [
      'zora17@gmail.com'
    ]);

    console.log('Updated record:', rows[0]);
    console.log('Password length:', rows[0].password.length);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    conn.release();
  }
})();