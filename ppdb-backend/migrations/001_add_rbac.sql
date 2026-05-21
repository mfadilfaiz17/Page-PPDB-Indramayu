-- RBAC Enhancement SQL Migration
-- Creates roles, permissions, and role_permissions tables
-- Run this against sistem_ppdb database

-- ============================================
--  1. Create ROLES table
-- ============================================
CREATE TABLE IF NOT EXISTS `roles` (
  `id_role` varchar(6) NOT NULL,
  `nama_role` varchar(50) NOT NULL UNIQUE,
  `deskripsi` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default roles
INSERT INTO `roles` (`id_role`, `nama_role`, `deskripsi`) VALUES
('R001', 'Super Admin', 'Full access to all features'),
('R002', 'Verifikator', 'Verify documents only'),
('R003', 'Operator Hasil', 'Input and manage selection results'),
('R004', 'Operator Master', 'Manage master data (schools, jalur, periods)');

-- ============================================
--  2. Create PERMISSIONS table
-- ============================================
CREATE TABLE IF NOT EXISTS `permissions` (
  `id_permission` varchar(10) NOT NULL,
  `nama_permission` varchar(50) NOT NULL UNIQUE,
  `deskripsi` varchar(255) DEFAULT NULL,
  `resource` varchar(50) NOT NULL,
  `action` varchar(20) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_permission`),
  UNIQUE KEY `uq_resource_action` (`resource`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default permissions
INSERT INTO `permissions` (`id_permission`, `nama_permission`, `deskripsi`, `resource`, `action`) VALUES
-- Admin User Management
('P001', 'Create Admin', 'Create new admin user', 'admin', 'create'),
('P002', 'Read Admin', 'View admin users', 'admin', 'read'),
('P003', 'Update Admin', 'Edit admin users', 'admin', 'update'),
('P004', 'Delete Admin', 'Delete admin users', 'admin', 'delete'),
-- Document Verification
('P005', 'Verify Documents', 'Verify student documents', 'dokumen', 'verify'),
('P006', 'View Documents', 'View student documents', 'dokumen', 'read'),
-- Selection Results
('P007', 'Create Results', 'Create selection results', 'hasil_seleksi', 'create'),
('P008', 'Read Results', 'View selection results', 'hasil_seleksi', 'read'),
('P009', 'Update Results', 'Edit selection results', 'hasil_seleksi', 'update'),
-- Master Data
('P010', 'Manage Schools', 'Create/edit/delete schools', 'sekolah', 'manage'),
('P011', 'Manage Jalur', 'Create/edit/delete jalur', 'jalur', 'manage'),
('P012', 'Manage Periods', 'Create/edit/delete periods', 'periode', 'manage'),
('P013', 'View Master Data', 'View master data', 'master', 'read');

-- ============================================
--  3. Create ROLE_PERMISSIONS junction table
-- ============================================
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id_role` varchar(6) NOT NULL,
  `id_permission` varchar(10) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_role`, `id_permission`),
  FOREIGN KEY (`id_role`) REFERENCES `roles` (`id_role`) ON DELETE CASCADE,
  FOREIGN KEY (`id_permission`) REFERENCES `permissions` (`id_permission`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Assign permissions to roles

-- Super Admin: All permissions
INSERT INTO `role_permissions` (`id_role`, `id_permission`) VALUES
('R001', 'P001'), ('R001', 'P002'), ('R001', 'P003'), ('R001', 'P004'),
('R001', 'P005'), ('R001', 'P006'),
('R001', 'P007'), ('R001', 'P008'), ('R001', 'P009'),
('R001', 'P010'), ('R001', 'P011'), ('R001', 'P012'), ('R001', 'P013');

-- Verifikator: Document verification only
INSERT INTO `role_permissions` (`id_role`, `id_permission`) VALUES
('R002', 'P005'), ('R002', 'P006');

-- Operator Hasil: Selection results only
INSERT INTO `role_permissions` (`id_role`, `id_permission`) VALUES
('R003', 'P007'), ('R003', 'P008'), ('R003', 'P009');

-- Operator Master: Master data management only
INSERT INTO `role_permissions` (`id_role`, `id_permission`) VALUES
('R004', 'P010'), ('R004', 'P011'), ('R004', 'P012'), ('R004', 'P013');

-- ============================================
--  4. Add role_id column to admin_ppdb table
-- ============================================
ALTER TABLE `admin_ppdb` ADD COLUMN `id_role` varchar(6) DEFAULT 'R001' AFTER `password`;
ALTER TABLE `admin_ppdb` ADD FOREIGN KEY (`id_role`) REFERENCES `roles` (`id_role`) ON DELETE SET DEFAULT;

-- Update existing admins to Super Admin role
UPDATE `admin_ppdb` SET `id_role` = 'R001' WHERE `id_role` IS NULL OR `id_role` = 'R001';
