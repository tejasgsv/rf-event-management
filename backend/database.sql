-- RF Event Management System - MySQL Database Schema
-- Migrated from MongoDB/Mongoose to MySQL/InnoDB
-- Use phpMyAdmin to import this file or run it in MySQL client

CREATE DATABASE IF NOT EXISTS `rf_event_management` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `rf_event_management`;

-- ============================================================
-- ADMINS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('superadmin','admin','moderator') DEFAULT 'admin',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `startDate` DATETIME NOT NULL,
  `endDate` DATETIME NOT NULL,
  `venue` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `helpdeskContact` VARCHAR(255),
  `emergencyContact` VARCHAR(255),
  `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_startDate` (`startDate`),
  INDEX `idx_endDate` (`endDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MASTERCLASSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `masterclasses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `eventId` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `startTime` DATETIME NOT NULL,
  `endTime` DATETIME NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `capacity` INT NOT NULL,
  `speakerId` INT DEFAULT NULL,
  `status` ENUM('DRAFT','LIVE','CANCELLED') DEFAULT 'DRAFT',
  `bookedCount` INT DEFAULT 0,
  `registrationCloseTime` DATETIME NOT NULL,
  `waitlistCloseTime` DATETIME NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  INDEX `idx_event_status` (`eventId`, `status`),
  INDEX `idx_eventId_startTime` (`eventId`, `startTime`),
  INDEX `idx_startTime` (`startTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `photo` VARCHAR(1024),
  `email` VARCHAR(255),
  `linkedin` VARCHAR(1024),
  `twitter` VARCHAR(1024),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_name` (`name`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MASTERCLASS_SPEAKERS PIVOT TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `masterclass_speakers` (
  `masterclassId` INT NOT NULL,
  `speakerId` INT NOT NULL,
  `orderIndex` INT NOT NULL DEFAULT 0,
  `role` ENUM('SPEAKER','MODERATOR','HOST') DEFAULT 'SPEAKER',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`masterclassId`, `speakerId`),
  FOREIGN KEY (`masterclassId`) REFERENCES `masterclasses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`speakerId`) REFERENCES `speakers`(`id`) ON DELETE CASCADE,
  INDEX `idx_masterclass_order` (`masterclassId`, `orderIndex`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SESSIONS TABLE (Agenda items)
-- ============================================================
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT NOT NULL,
  `speaker_id` INT,
  `title` VARCHAR(255) NOT NULL,
  `session_type` VARCHAR(100) NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `hall` VARCHAR(255),
  `description` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`speaker_id`) REFERENCES `speakers`(`id`) ON DELETE SET NULL,
  INDEX `idx_event_start` (`event_id`, `start_time`),
  INDEX `idx_speaker` (`speaker_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- REGISTRATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `registrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `eventId` INT NOT NULL,
  `masterclassId` INT NOT NULL,
  `registrationId` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `surname` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `company` VARCHAR(255),
  `jobTitle` VARCHAR(255),
  `country` VARCHAR(100),
  `postalCode` VARCHAR(20),
  `accessibilityNeeds` TEXT,
  `status` ENUM('CONFIRMED', 'WAITLISTED', 'CANCELLED') DEFAULT 'CONFIRMED',
  `qrCode` LONGTEXT,
  `qrToken` VARCHAR(255) UNIQUE,
  `qrData` TEXT,
  `emailHash` VARCHAR(255),
  `checkedIn` BOOLEAN DEFAULT FALSE,
  `checkedInAt` DATETIME,
  `checkedInBy` INT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`masterclassId`) REFERENCES `masterclasses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`checkedInBy`) REFERENCES `admins`(`id`) ON DELETE SET NULL,
  INDEX `idx_masterclassId_email_status` (`masterclassId`, `email`, `status`),
  INDEX `idx_email_status` (`email`, `status`),
  INDEX `idx_qrToken` (`qrToken`),
  INDEX `idx_eventId_status` (`eventId`, `status`),
  INDEX `idx_email` (`email`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- WAITLIST TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `waitlists` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `masterclassId` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `position` INT NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`masterclassId`) REFERENCES `masterclasses`(`id`) ON DELETE CASCADE,
  INDEX `idx_masterclassId_position` (`masterclassId`, `position`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- END OF SCHEMA
-- Import this file in phpMyAdmin to create the database
-- ============================================================
