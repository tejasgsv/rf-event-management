-- ============================================================
-- P2: ADD CHECK CONSTRAINTS FOR DATA INTEGRITY
-- Run this AFTER importing database.sql and speakers migration
-- ============================================================

USE `rf_event_management`;

-- ============================================================
-- ADD CHECK CONSTRAINTS TO EVENTS TABLE
-- ============================================================
ALTER TABLE `events`
ADD CONSTRAINT `check_event_dates` 
  CHECK (`startDate` < `endDate`);

-- ============================================================
-- ADD CHECK CONSTRAINTS TO MASTERCLASSES TABLE
-- ============================================================
ALTER TABLE `masterclasses`
ADD CONSTRAINT `check_masterclass_dates` 
  CHECK (`startTime` < `endTime`);

ALTER TABLE `masterclasses`
ADD CONSTRAINT `check_masterclass_capacity` 
  CHECK (`capacity` > 0);

ALTER TABLE `masterclasses`
ADD CONSTRAINT `check_masterclass_booked_count` 
  CHECK (`bookedCount` >= 0 AND `bookedCount` <= `capacity`);

ALTER TABLE `masterclasses`
ADD CONSTRAINT `check_masterclass_close_times` 
  CHECK (`waitlistCloseTime` <= `registrationCloseTime` AND `registrationCloseTime` <= `startTime`);

-- ============================================================
-- ADD INDEX FOR BETTER QUERY PERFORMANCE
-- ============================================================
ALTER TABLE `registrations`
ADD INDEX `idx_status_createdAt` (`status`, `createdAt`);

ALTER TABLE `masterclasses`
ADD INDEX `idx_capacity_booked` (`capacity`, `bookedCount`);

-- ============================================================
-- CLEANUP: Mark waitlists table as deprecated (optional)
-- Note: Don't drop yet - verify all code references registrations table first
-- ============================================================
-- DROP TABLE IF EXISTS `waitlists`; -- UNCOMMENT AFTER VERIFICATION

-- ============================================================
-- END OF P2 MIGRATION
-- ============================================================

SELECT 'P2 constraints added successfully. Database integrity enforced.' AS result;
