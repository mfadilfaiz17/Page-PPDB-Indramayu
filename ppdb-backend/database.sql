-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 02, 2026 at 08:33 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sistem_ppdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `pendaftaran`
--

DROP TABLE IF EXISTS `pendaftaran`;
CREATE TABLE IF NOT EXISTS `pendaftaran` (
  `id_pendaftaran` varchar(6) NOT NULL,
  `id_siswa` varchar(6) NOT NULL,
  `id_jalur` varchar(6) DEFAULT NULL,
  `id_sekolah` varchar(6) DEFAULT NULL,
  `nama_jalur_custom` varchar(100) DEFAULT NULL,
  `nama_sekolah_custom` varchar(100) DEFAULT NULL,
  `tahun_ajaran` varchar(10) NOT NULL,
  `tanggal_daftar` date NOT NULL,
  PRIMARY KEY (`id_pendaftaran`),
  KEY `fk_pendaftaran_ke_siswa` (`id_siswa`),
  KEY `fk_pendaftaran_ke_jalur` (`id_jalur`),
  KEY `fk_pendaftaran_ke_sekolah` (`id_sekolah`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pendaftaran`
--


--
-- Table structure for table `akun_ppdb`
--

DROP TABLE IF EXISTS `akun_ppdb`;
CREATE TABLE IF NOT EXISTS `akun_ppdb` (
  `id_akun` varchar(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id_akun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
ALTER TABLE `akun_ppdb` ADD UNIQUE KEY `uq_akun_email` (`email`);

--
-- Dumping data for table `akun_ppdb`
--

INSERT INTO `akun_ppdb` (`id_akun`, `email`, `password`) VALUES
('A01', 'arda@gmail.com', '$2a$10$yIE1fjAJsUqITt3vhzYmmujjp4EupDFv88r0AVB.S90AclEBtQ0y.'),
('A02', 'brahim@gmail.com', 'pass124'),
('A03', 'arnold@gmail.com', 'pass125'),
('A04', 'mbappe@gmail.com', 'pass126'),
('A05', 'vede@gmail.com', 'pass127'),
('A06', 'zora17@gmail.com', '$2a$10$yIE1fjAJsUqITt3vhzYmmujjp4EupDFv88r0AVB.S90AclEBtQ0y.');

-- --------------------------------------------------------

--
-- Table structure for table `admin_ppdb`
--

DROP TABLE IF EXISTS `admin_ppdb`;
CREATE TABLE IF NOT EXISTS `admin_ppdb` (
  `id_admin` varchar(6) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama_admin` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_admin`),
  UNIQUE KEY `uq_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_ppdb`
--

INSERT INTO `admin_ppdb` (`id_admin`, `username`, `password`, `nama_admin`) VALUES
('AD01', 'admin', '$2a$10$d.k79yr3kmqm.iYzxbe3d.IxI1BzbCPoMzspGTitV3hhKwBvTCvqK', 'Administrator PPDB');

-- --------------------------------------------------------

--
-- Table structure for table `dokumen`
--

DROP TABLE IF EXISTS `dokumen`;
CREATE TABLE IF NOT EXISTS `dokumen` (
  `id_dokumen` varchar(6) NOT NULL,
  `id_siswa` varchar(6) NOT NULL,
  `id_jenis_dokumen` varchar(6) NOT NULL,
  `status_dokumen` varchar(20) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  PRIMARY KEY (`id_dokumen`),
  KEY `fk_dokumen_ke_jenis` (`id_jenis_dokumen`),
  KEY `fk_dokumen_ke_siswa` (`id_siswa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dokumen`
--

INSERT INTO `dokumen` (`id_dokumen`, `id_siswa`, `id_jenis_dokumen`, `status_dokumen`, `file_path`) VALUES
('D01', 'S01', 'JD01', 'TERUPLOAD', '/uploads/S01_1234567890.pdf'),
('D02', 'S01', 'JD02', 'TERUPLOAD', '/uploads/S01_1234567891.pdf'),
('D03', 'S01', 'JD03', 'TERUPLOAD', '/uploads/S01_1234567892.pdf'),
('D04', 'S01', 'JD04', 'TERUPLOAD', '/uploads/S01_1234567893.pdf'),
('D05', 'S01', 'JD05', 'TERUPLOAD', '/uploads/S01_1234567894.pdf');

-- --------------------------------------------------------

--
-- Table structure for table `hasil_seleksi`
--

DROP TABLE IF EXISTS `hasil_seleksi`;
CREATE TABLE IF NOT EXISTS `hasil_seleksi` (
  `id_hasil` varchar(6) NOT NULL,
  `id_siswa` varchar(6) NOT NULL,
  `id_jalur` varchar(6) NOT NULL,
  `id_sekolah` varchar(6) NOT NULL,
  `status_hasil` varchar(20) NOT NULL,
  `peringkat` int(4) NOT NULL,
  `tanggal_pengumuman` date NOT NULL,
  PRIMARY KEY (`id_hasil`),
  KEY `fk_hasil_ke_siswa` (`id_siswa`),
  KEY `fk_hasil_ke_jalur` (`id_jalur`),
  KEY `fk_hasil_ke_sekolah` (`id_sekolah`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hasil_seleksi`
--

INSERT INTO `hasil_seleksi` (`id_hasil`, `id_siswa`, `id_jalur`, `id_sekolah`, `status_hasil`, `peringkat`, `tanggal_pengumuman`) VALUES
('H01', 'S01', 'J01', 'ST01', 'Cadangan', 35, '2025-06-30'),
('H02', 'S02', 'J02', 'ST02', 'Lulus', 5, '2025-06-30'),
('H03', 'S03', 'J03', 'ST03', 'Lulus', 25, '2025-06-30'),
('H04', 'S04', 'J04', 'ST04', 'Tidak Lulus', 40, '2025-06-30'),
('H05', 'S05', 'J05', 'ST05', 'Lulus', 8, '2025-06-30');

-- --------------------------------------------------------

--
-- Table structure for table `jalur_ppdb`
--

DROP TABLE IF EXISTS `jalur_ppdb`;
CREATE TABLE IF NOT EXISTS `jalur_ppdb` (
  `id_jalur` varchar(6) NOT NULL,
  `id_syarat` varchar(6) NOT NULL,
  `id_siswa` varchar(6) NOT NULL,
  `nama_jalur` varchar(30) NOT NULL,
  `persentase_kuota` int(2) NOT NULL,
  PRIMARY KEY (`id_jalur`),
  KEY `id_syarat` (`id_syarat`),
  KEY `id_siswa` (`id_siswa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jalur_ppdb`
--

INSERT INTO `jalur_ppdb` (`id_jalur`, `id_syarat`, `id_siswa`, `nama_jalur`, `persentase_kuota`) VALUES
('J01', 'SY01', 'S01', 'Zonasi', 50),
('J02', 'SY02', 'S02', 'Prestasi', 30),
('J03', 'SY03', 'S03', 'Afirmasi', 10),
('J04', 'SY04', 'S04', 'Perpindahan Orang Tua', 10),
('J05', 'SY01', 'S05', 'Zonasi', 50);

-- --------------------------------------------------------

--
-- Table structure for table `jenis_dokumen`
--

DROP TABLE IF EXISTS `jenis_dokumen`;
CREATE TABLE IF NOT EXISTS `jenis_dokumen` (
  `id_jenis_dokumen` varchar(6) NOT NULL,
  `nama_dokumen` varchar(20) NOT NULL,
  `sifat_dokumen` varchar(20) NOT NULL,
  PRIMARY KEY (`id_jenis_dokumen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jenis_dokumen`
--

INSERT INTO `jenis_dokumen` (`id_jenis_dokumen`, `nama_dokumen`, `sifat_dokumen`) VALUES
('JD01', 'KK', 'WAJIB'),
('JD02', 'Akta Kelahiran', 'WAJIB'),
('JD03', 'Ijazah/SKL', 'WAJIB'),
('JD04', 'Sertifikat', 'OPSIONAL'),
('JD05', 'Surat Keterangan Dom', 'WAJIB');

-- --------------------------------------------------------

--
-- Table structure for table `periode_ppdb`
--

DROP TABLE IF EXISTS `periode_ppdb`;
CREATE TABLE IF NOT EXISTS `periode_ppdb` (
  `id_periode` varchar(6) NOT NULL,
  `id_siswa` varchar(6) NOT NULL,
  `tahun_ajaran` varchar(10) NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  PRIMARY KEY (`id_periode`),
  KEY `fk_periode_siswa` (`id_siswa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `periode_ppdb`
--

INSERT INTO `periode_ppdb` (`id_periode`, `id_siswa`, `tahun_ajaran`, `tanggal_mulai`, `tanggal_selesai`) VALUES
('P01', 'S01', '2025/2026', '2025-06-01', '2025-06-30'),
('P02', 'S02', '2025/2026', '2025-06-01', '2025-06-30'),
('P03', 'S03', '2025/2026', '2025-06-01', '2025-06-30'),
('P04', 'S04', '2025/2026', '2025-06-01', '2025-06-30'),
('P05', 'S05', '2025/2026', '2025-06-01', '2025-06-30');

-- --------------------------------------------------------

--
-- Table structure for table `sekolah_tujuan`
--

DROP TABLE IF EXISTS `sekolah_tujuan`;
CREATE TABLE IF NOT EXISTS `sekolah_tujuan` (
  `id_sekolah` varchar(6) NOT NULL,
  `id_siswa` varchar(6) NOT NULL,
  `npsn` int(6) NOT NULL,
  `nama_sekolah` varchar(50) NOT NULL,
  `jenjang` varchar(5) NOT NULL,
  `kuota` int(11) NOT NULL,
  `alamat_sekolah` varchar(100) NOT NULL,
  PRIMARY KEY (`id_sekolah`),
  KEY `fk_sekolah_ke_siswa` (`id_siswa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sekolah_tujuan`
--

INSERT INTO `sekolah_tujuan` (`id_sekolah`, `id_siswa`, `npsn`, `nama_sekolah`, `jenjang`, `kuota`, `alamat_sekolah`) VALUES
('ST01', 'S01', 202001, 'SMA Negeri 1 Indramayu', 'SMA', 200, 'Jl. Gatot Subroto No.1 Indramayu'),
('ST02', 'S02', 202002, 'SMA Negeri 2 Indramayu', 'SMA', 180, 'Jl. Sudirman No.10 Indramayu'),
('ST03', 'S03', 202003, 'SMK Negeri 1 Indramayu', 'SMK', 220, 'Jl. Veteran No.5 Indramayu'),
('ST04', 'S04', 202004, 'SMK Negeri 2 Indramayu', 'SMK', 210, 'Jl. Diponegoro No.8 Indramayu'),
('ST05', 'S05', 202005, 'SMA Negeri 1 Indramayu', 'SMA', 200, 'Jl. Gatot Subroto No.1 Indramayu');

-- --------------------------------------------------------

--
-- Table structure for table `siswa`
--

DROP TABLE IF EXISTS `siswa`;
CREATE TABLE IF NOT EXISTS `siswa` (
  `id_siswa` varchar(6) NOT NULL,
  `id_akun` varchar(6) NOT NULL,
  `nisn` int(10) NOT NULL,
  `nama_lengkap` varchar(30) NOT NULL,
  `nik` varchar(16) NOT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `tanggal_lahir` date NOT NULL,
  `usia` int(3) NOT NULL,
  `alamat_siswa` text NOT NULL,
  `no_hp` varchar(13) NOT NULL,
  `asal_sekolah` varchar(50) NOT NULL,
  `nilai_rata` decimal(5,2) NOT NULL,
  PRIMARY KEY (`id_siswa`),
  KEY `fk_siswa_akun` (`id_akun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `siswa`
--

INSERT INTO `siswa` (`id_siswa`, `id_akun`, `nisn`, `nama_lengkap`, `nik`, `jenis_kelamin`, `tanggal_lahir`, `usia`, `alamat_siswa`, `no_hp`, `asal_sekolah`, `nilai_rata`) VALUES
('S01', 'A01', 1234567890, 'Arda Guler', '3201010101010001', 'L', '2008-01-10', 18, '081234567890', '081234567890', 'SMP Negeri 1 Indramayu', 88.50),
('S02', 'A02', 1234567891, 'Brahim Diaz', '3201010101010002', 'L', '2008-02-12', 18, '082345678901', '081234567891', 'SMP Negeri 2 Indramayu', 85.00),
('S03', 'A03', 1234567892, 'Trent Arnold', '3201010101010003', 'L', '2008-03-15', 17, '083456789012', '081234567892', 'SMP Negeri 1 Indramayu', 90.20),
('S04', 'A04', 1234567893, 'Kylian Mbappe', '3201010101010004', 'L', '2008-04-18', 17, '084567890123', '081234567893', 'SMP Negeri 2 Indramayu', 87.30),
('S05', 'A05', 1234567894, 'Fede Valverde', '3201010101010005', 'L', '2008-05-20', 17, '085678901234', '081234567894', 'SMP Negeri 3 Indramayu', 82.70);

-- --------------------------------------------------------

--
-- Table structure for table `syarat`
--

DROP TABLE IF EXISTS `syarat`;
CREATE TABLE IF NOT EXISTS `syarat` (
  `id_syarat` varchar(6) NOT NULL,
  `syarat` text NOT NULL,
  PRIMARY KEY (`id_syarat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `syarat`
--

INSERT INTO `syarat` (`id_syarat`, `syarat`) VALUES
('SY01', 'Kartu Keluarga (minimal 1 tahun), Domisili sesuai zona sekolah, Data alamat sesuai Dapodik dan Nilai rapor (jika dibutuhkan sebagai seleksi tambahan)'),
('SY02', 'Sertifikat prestasi akademik / non-akademik, Nilai rapor dan Piagam kejuaraan tingkat kabupaten/provinsi/nasional'),
('SY03', 'Kartu Indonesia Pintar (KIP), Kartu PKH / KKS dan Bukti terdaftar sebagai keluarga kurang mampu'),
('SY04', 'Surat tugas perpindahan orang tua, SK mutasi kerja dan KK terbaru sesuai alamat baru');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `dokumen`
--
ALTER TABLE `dokumen`
  ADD CONSTRAINT `fk_dokumen_ke_jenis` FOREIGN KEY (`id_jenis_dokumen`) REFERENCES `jenis_dokumen` (`id_jenis_dokumen`),
  ADD CONSTRAINT `fk_dokumen_ke_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id_siswa`);

--
-- Constraints for table `hasil_seleksi`
--
ALTER TABLE `hasil_seleksi`
  ADD CONSTRAINT `fk_hasil_ke_jalur` FOREIGN KEY (`id_jalur`) REFERENCES `jalur_ppdb` (`id_jalur`),
  ADD CONSTRAINT `fk_hasil_ke_sekolah` FOREIGN KEY (`id_sekolah`) REFERENCES `sekolah_tujuan` (`id_sekolah`),
  ADD CONSTRAINT `fk_hasil_ke_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id_siswa`);

--
-- Constraints for table `jalur_ppdb`
--
ALTER TABLE `jalur_ppdb`
  ADD CONSTRAINT `jalur_ppdb_ibfk_1` FOREIGN KEY (`id_syarat`) REFERENCES `syarat` (`id_syarat`),
  ADD CONSTRAINT `jalur_ppdb_ibfk_2` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id_siswa`);

--
-- Constraints for table `periode_ppdb`
--
ALTER TABLE `periode_ppdb`
  ADD CONSTRAINT `fk_periode_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id_siswa`);

--
-- Constraints for table `sekolah_tujuan`
--
ALTER TABLE `sekolah_tujuan`
  ADD CONSTRAINT `fk_sekolah_ke_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id_siswa`);

--
-- Constraints for table `siswa`
--
ALTER TABLE `siswa`
  ADD CONSTRAINT `fk_siswa_akun` FOREIGN KEY (`id_akun`) REFERENCES `akun_ppdb` (`id_akun`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
