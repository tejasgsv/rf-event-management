-- ============================================================
-- SPEAKERS TABLE & PIVOT TABLE MIGRATION
-- Run this AFTER importing database.sql
-- ============================================================

USE `rf_event_management`;

-- ============================================================
-- SPEAKERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `speakers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255),
  `designation` VARCHAR(255),
  `organization` VARCHAR(255),
  `bio` TEXT,
  `photo` VARCHAR(500),
  `email` VARCHAR(255),
  `linkedin` VARCHAR(500),
  `twitter` VARCHAR(500),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_name` (`name`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MASTERCLASS_SPEAKERS PIVOT TABLE
-- Links speakers to masterclasses (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS `masterclass_speakers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `masterclassId` INT NOT NULL,
  `speakerId` INT NOT NULL,
  `orderIndex` INT DEFAULT 0,
  `role` VARCHAR(100) DEFAULT 'SPEAKER',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`masterclassId`) REFERENCES `masterclasses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`speakerId`) REFERENCES `speakers`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_mc_speaker` (`masterclassId`, `speakerId`),
  INDEX `idx_speakerId` (`speakerId`),
  INDEX `idx_masterclassId_order` (`masterclassId`, `orderIndex`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- OPTIONAL: Sample speaker data for testing
-- ============================================================
-- INSERT INTO `speakers` (name, title, designation, organization, bio, email) VALUES
-- ('Dr. Rajesh Kumar', 'Chief Technology Officer', 'CTO', 'Tech Innovations Ltd', 'Expert in AI and Machine Learning with 20+ years experience', 'rajesh.kumar@example.com'),
-- ('Priya Sharma', 'Senior Product Manager', 'Head of Product', 'Digital Solutions Inc', 'Product strategy and innovation leader', 'priya.sharma@example.com'),
-- ('Amit Patel', 'Data Scientist', 'Lead Data Scientist', 'Analytics Corp', 'Specializes in predictive analytics and big data', 'amit.patel@example.com');

-- ============================================================
-- END OF MIGRATION
-- ============================================================
