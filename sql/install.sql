-- ============================================
-- LSPD MDT - Schema de base de donnees
-- Compatible ESX & QBCore (oxmysql)
-- ============================================

-- Table des profils officiers MDT
CREATE TABLE IF NOT EXISTS `mdt_officers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `identifier` VARCHAR(60) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `callsign` VARCHAR(20) DEFAULT NULL,
    `department` VARCHAR(50) DEFAULT 'LSPD',
    `badge_number` VARCHAR(20) DEFAULT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `image_url` VARCHAR(255) DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_identifier` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des notes sur les citoyens
CREATE TABLE IF NOT EXISTS `mdt_citizen_notes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `citizen_id` VARCHAR(60) NOT NULL,
    `officer_name` VARCHAR(100) NOT NULL,
    `note` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des flags sur les citoyens
CREATE TABLE IF NOT EXISTS `mdt_citizen_flags` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `citizen_id` VARCHAR(60) NOT NULL,
    `flag_type` VARCHAR(50) NOT NULL COMMENT 'wanted, armed_dangerous, mental_health, gang_member, parole, bail',
    `description` TEXT DEFAULT NULL,
    `set_by` VARCHAR(100) NOT NULL,
    `active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_citizen_flags` (`citizen_id`, `active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des mandats
CREATE TABLE IF NOT EXISTS `mdt_warrants` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `citizen_id` VARCHAR(60) NOT NULL,
    `citizen_name` VARCHAR(100) NOT NULL,
    `type` VARCHAR(30) NOT NULL COMMENT 'arrest, search, bench',
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `charges` TEXT DEFAULT NULL,
    `issued_by` VARCHAR(100) NOT NULL,
    `issued_by_id` VARCHAR(60) NOT NULL,
    `status` VARCHAR(20) DEFAULT 'active' COMMENT 'active, served, cancelled, expired',
    `served_by` VARCHAR(100) DEFAULT NULL,
    `served_at` TIMESTAMP NULL DEFAULT NULL,
    `expires_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_warrant_status` (`status`),
    INDEX `idx_warrant_citizen` (`citizen_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des BOLO (Be On the Lookout / Avis de Recherche)
CREATE TABLE IF NOT EXISTS `mdt_bolos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `type` VARCHAR(20) NOT NULL COMMENT 'person, vehicle',
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `person_name` VARCHAR(100) DEFAULT NULL,
    `person_description` TEXT DEFAULT NULL,
    `vehicle_plate` VARCHAR(20) DEFAULT NULL,
    `vehicle_model` VARCHAR(50) DEFAULT NULL,
    `vehicle_color` VARCHAR(30) DEFAULT NULL,
    `last_seen_location` VARCHAR(200) DEFAULT NULL,
    `reason` TEXT DEFAULT NULL,
    `priority` VARCHAR(20) DEFAULT 'normal' COMMENT 'low, normal, high, critical',
    `created_by` VARCHAR(100) NOT NULL,
    `created_by_id` VARCHAR(60) NOT NULL,
    `status` VARCHAR(20) DEFAULT 'active' COMMENT 'active, resolved, cancelled',
    `resolved_by` VARCHAR(100) DEFAULT NULL,
    `resolved_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_bolo_status` (`status`),
    INDEX `idx_bolo_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des rapports/incidents
CREATE TABLE IF NOT EXISTS `mdt_incidents` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `type` VARCHAR(50) NOT NULL COMMENT 'arrest, citation, investigation, accident, shooting, robbery, other',
    `location` VARCHAR(200) DEFAULT NULL,
    `description` TEXT NOT NULL,
    `evidence` TEXT DEFAULT NULL,
    `status` VARCHAR(20) DEFAULT 'open' COMMENT 'open, under_investigation, closed, archived',
    `priority` VARCHAR(20) DEFAULT 'normal' COMMENT 'low, normal, high, critical',
    `created_by` VARCHAR(100) NOT NULL,
    `created_by_id` VARCHAR(60) NOT NULL,
    `assigned_to` VARCHAR(100) DEFAULT NULL,
    `closed_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_incident_status` (`status`),
    INDEX `idx_incident_type` (`type`),
    INDEX `idx_incident_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des citoyens impliques dans les incidents
CREATE TABLE IF NOT EXISTS `mdt_incident_citizens` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `incident_id` INT NOT NULL,
    `citizen_id` VARCHAR(60) NOT NULL,
    `citizen_name` VARCHAR(100) NOT NULL,
    `role` VARCHAR(30) NOT NULL COMMENT 'suspect, victim, witness, officer',
    `charges` TEXT DEFAULT NULL,
    `fine_amount` INT DEFAULT 0,
    `jail_time` INT DEFAULT 0,
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`incident_id`) REFERENCES `mdt_incidents`(`id`) ON DELETE CASCADE,
    INDEX `idx_ic_incident` (`incident_id`),
    INDEX `idx_ic_citizen` (`citizen_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des vehicules voles
CREATE TABLE IF NOT EXISTS `mdt_stolen_vehicles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `plate` VARCHAR(20) NOT NULL,
    `model` VARCHAR(50) DEFAULT NULL,
    `color` VARCHAR(30) DEFAULT NULL,
    `owner_name` VARCHAR(100) DEFAULT NULL,
    `reported_by` VARCHAR(100) NOT NULL,
    `location` VARCHAR(200) DEFAULT NULL,
    `description` TEXT DEFAULT NULL,
    `status` VARCHAR(20) DEFAULT 'stolen' COMMENT 'stolen, recovered, not_found',
    `recovered_by` VARCHAR(100) DEFAULT NULL,
    `recovered_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_stolen_plate` (`plate`),
    INDEX `idx_stolen_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des appels dispatch / 911
CREATE TABLE IF NOT EXISTS `mdt_dispatch_calls` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `caller_name` VARCHAR(100) DEFAULT 'Anonyme',
    `phone_number` VARCHAR(20) DEFAULT NULL,
    `location` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `type` VARCHAR(50) DEFAULT 'general' COMMENT 'general, robbery, shooting, accident, domestic, suspicious, medical, fire',
    `priority` VARCHAR(20) DEFAULT 'normal' COMMENT 'low, normal, high, critical',
    `status` VARCHAR(20) DEFAULT 'pending' COMMENT 'pending, dispatched, responding, on_scene, resolved, cancelled',
    `assigned_units` TEXT DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_by` VARCHAR(100) DEFAULT 'Systeme',
    `resolved_by` VARCHAR(100) DEFAULT NULL,
    `resolved_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_call_status` (`status`),
    INDEX `idx_call_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table du casier judiciaire
CREATE TABLE IF NOT EXISTS `mdt_criminal_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `citizen_id` VARCHAR(60) NOT NULL,
    `citizen_name` VARCHAR(100) NOT NULL,
    `incident_id` INT DEFAULT NULL,
    `charge_code` VARCHAR(20) NOT NULL,
    `charge_title` VARCHAR(200) NOT NULL,
    `fine_amount` INT DEFAULT 0,
    `jail_time` INT DEFAULT 0,
    `plea` VARCHAR(20) DEFAULT 'guilty' COMMENT 'guilty, not_guilty, no_contest',
    `verdict` VARCHAR(20) DEFAULT 'convicted' COMMENT 'convicted, acquitted, dismissed, pending',
    `officer_name` VARCHAR(100) NOT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_record_citizen` (`citizen_id`),
    INDEX `idx_record_incident` (`incident_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des licences/permis
CREATE TABLE IF NOT EXISTS `mdt_licenses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `citizen_id` VARCHAR(60) NOT NULL,
    `type` VARCHAR(50) NOT NULL COMMENT 'driving, weapon, hunting, fishing, pilot, boating',
    `status` VARCHAR(20) DEFAULT 'valid' COMMENT 'valid, suspended, revoked, expired',
    `issued_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `expires_at` TIMESTAMP NULL DEFAULT NULL,
    `suspended_by` VARCHAR(100) DEFAULT NULL,
    `suspended_reason` TEXT DEFAULT NULL,
    INDEX `idx_license_citizen` (`citizen_id`),
    INDEX `idx_license_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
