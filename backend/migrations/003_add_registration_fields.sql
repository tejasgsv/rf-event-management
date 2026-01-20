ALTER TABLE `registrations`
  ADD COLUMN `country` VARCHAR(100) NULL,
  ADD COLUMN `postalCode` VARCHAR(20) NULL,
  ADD COLUMN `accessibilityNeeds` TEXT NULL;