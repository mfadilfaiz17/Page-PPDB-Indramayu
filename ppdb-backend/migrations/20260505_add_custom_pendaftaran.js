const db = require('../config/database');

(async function run(){
  try {
    // Check if table exists
    const [tables] = await db.query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ? AND table_name = 'pendaftaran'", [process.env.DB_NAME]);
    if (tables.length === 0) {
      // Create table with custom columns
      await db.query(`CREATE TABLE IF NOT EXISTS pendaftaran (
        id_pendaftaran varchar(6) NOT NULL,
        id_siswa varchar(6) NOT NULL,
        id_jalur varchar(6) DEFAULT NULL,
        id_sekolah varchar(6) DEFAULT NULL,
        nama_jalur_custom varchar(100) DEFAULT NULL,
        nama_sekolah_custom varchar(100) DEFAULT NULL,
        tahun_ajaran varchar(10) NOT NULL,
        tanggal_daftar date NOT NULL,
        PRIMARY KEY (id_pendaftaran)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
      console.log('Migration completed: pendaftaran table created.');
    } else {
      // Make id_jalur and id_sekolah nullable
      await db.query("ALTER TABLE pendaftaran MODIFY COLUMN id_jalur varchar(6) DEFAULT NULL");
      await db.query("ALTER TABLE pendaftaran MODIFY COLUMN id_sekolah varchar(6) DEFAULT NULL");

      // Add custom name columns if not exists
      await db.query("ALTER TABLE pendaftaran ADD COLUMN IF NOT EXISTS nama_jalur_custom varchar(100) DEFAULT NULL");
      await db.query("ALTER TABLE pendaftaran ADD COLUMN IF NOT EXISTS nama_sekolah_custom varchar(100) DEFAULT NULL");

      console.log('Migration completed: pendaftaran schema updated.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
})();
