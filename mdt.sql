-- ============================================================
--  MDT FiveM - Schema de base de donnees
--  Compatble avec oxmysql / mysql-async
-- ============================================================

CREATE DATABASE IF NOT EXISTS `fivem` DEFAULT CHARACTER SET utf8mb4;
USE `fivem`;

-- ----------------------------------------------------------
--  Comptes officiers MDT
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mdt_officers` (
    `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `identifier`    VARCHAR(60)     NOT NULL,
    `firstname`     VARCHAR(50)     NOT NULL,
    `lastname`      VARCHAR(50)     NOT NULL,
    `badge`         VARCHAR(20)     NOT NULL UNIQUE,
    `rank`          VARCHAR(50)     DEFAULT 'Agent',
    `department`    VARCHAR(50)     DEFAULT 'Police',
    `status`        VARCHAR(30)     DEFAULT 'Hors service',
    `callsign`      VARCHAR(10)     DEFAULT NULL,
    `created_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_identifier` (`identifier`),
    INDEX `idx_badge` (`badge`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
--  Dossiers citoyens
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mdt_citizens` (
    `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `identifier`    VARCHAR(60)     NOT NULL UNIQUE,
    `firstname`     VARCHAR(50)     NOT NULL,
    `lastname`      VARCHAR(50)     NOT NULL,
    `dob`           DATE            DEFAULT NULL,
    `gender`        TINYINT(1)      DEFAULT 0 COMMENT '0=Homme 1=Femme',
    `phone`         VARCHAR(20)     DEFAULT NULL,
    `address`       VARCHAR(100)    DEFAULT NULL,
    `nationality`   VARCHAR(50)     DEFAULT 'Americaine',
    `height`        SMALLINT        DEFAULT NULL COMMENT 'en cm',
    `weight`        SMALLINT        DEFAULT NULL COMMENT 'en kg',
    `eye_color`     VARCHAR(30)     DEFAULT NULL,
    `hair_color`    VARCHAR(30)     DEFAULT NULL,
    `image`         TEXT            DEFAULT NULL,
    `notes`         TEXT            DEFAULT NULL,
    `is_wanted`     TINYINT(1)      DEFAULT 0,
    `created_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_identifier` (`identifier`),
    INDEX `idx_name` (`lastname`, `firstname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
--  Antecedents judiciaires
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mdt_records` (
    `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `citizen_id`    INT UNSIGNED    NOT NULL,
    `officer_id`    INT UNSIGNED    NOT NULL,
    `officer_name`  VARCHAR(100)    NOT NULL,
    `type`          ENUM('arrest','citation','warning','search') NOT NULL DEFAULT 'citation',
    `offenses`      JSON            NOT NULL COMMENT 'Liste des infractions',
    `total_fine`    INT UNSIGNED    DEFAULT 0,
    `total_jail`    INT UNSIGNED    DEFAULT 0 COMMENT 'en minutes',
    `narrative`     TEXT            DEFAULT NULL,
    `location`      VARCHAR(100)    DEFAULT NULL,
    `created_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_citizen` (`citizen_id`),
    INDEX `idx_officer` (`officer_id`),
    CONSTRAINT `fk_records_citizen` FOREIGN KEY (`citizen_id`) REFERENCES `mdt_citizens` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
--  Vehicules
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mdt_vehicles` (
    `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `plate`         VARCHAR(10)     NOT NULL UNIQUE,
    `owner_id`      INT UNSIGNED    DEFAULT NULL,
    `owner_name`    VARCHAR(100)    DEFAULT NULL,
    `model`         VARCHAR(60)     NOT NULL,
    `color`         VARCHAR(40)     DEFAULT NULL,
    `year`          SMALLINT        DEFAULT NULL,
    `vin`           VARCHAR(20)     DEFAULT NULL,
    `is_stolen`     TINYINT(1)      DEFAULT 0,
    `is_bolo`       TINYINT(1)      DEFAULT 0,
    `insurance`     TINYINT(1)      DEFAULT 1,
    `registration`  TINYINT(1)      DEFAULT 1,
    `notes`         TEXT            DEFAULT NULL,
    `created_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_plate` (`plate`),
    INDEX `idx_owner` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
--  Mandats d'arret
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mdt_warrants` (
    `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `citizen_id`    INT UNSIGNED    NOT NULL,
    `officer_id`    INT UNSIGNED    NOT NULL,
    `officer_name`  VARCHAR(100)    NOT NULL,
    `reason`        TEXT            NOT NULL,
    `charges`       JSON            NOT NULL,
    `status`        ENUM('active','executed','expired','cancelled') DEFAULT 'active',
    `expires_at`    TIMESTAMP       DEFAULT NULL,
    `executed_by`   VARCHAR(100)    DEFAULT NULL,
    `executed_at`   TIMESTAMP       DEFAULT NULL,
    `created_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_citizen` (`citizen_id`),
    INDEX `idx_status` (`status`),
    CONSTRAINT `fk_warrants_citizen` FOREIGN KEY (`citizen_id`) REFERENCES `mdt_citizens` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
--  BOLO (Be On the Look Out)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mdt_bolo` (
    `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `officer_id`    INT UNSIGNED    NOT NULL,
    `officer_name`  VARCHAR(100)    NOT NULL,
    `type`          ENUM('person','vehicle') DEFAULT 'person',
    `target`        VARCHAR(100)    NOT NULL COMMENT 'Nom ou plaque',
    `description`   TEXT            NOT NULL,
    `reason`        TEXT            NOT NULL,
    `is_armed`      TINYINT(1)      DEFAULT 0,
    `is_dangerous`  TINYINT(1)      DEFAULT 0,
    `status`        ENUM('active','resolved') DEFAULT 'active',
    `created_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
--  Rapports d'incidents
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mdt_incidents` (
    `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `title`         VARCHAR(150)    NOT NULL,
    `officer_id`    INT UNSIGNED    NOT NULL,
    `officer_name`  VARCHAR(100)    NOT NULL,
    `involved_citizens` JSON        DEFAULT NULL,
    `involved_vehicles` JSON        DEFAULT NULL,
    `narrative`     TEXT            NOT NULL,
    `location`      VARCHAR(100)    DEFAULT NULL,
    `type`          VARCHAR(50)     DEFAULT 'Incident',
    `status`        ENUM('open','closed','pending') DEFAULT 'open',
    `created_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_officer` (`officer_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
--  Appels d'urgence / Dispatches
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mdt_calls` (
    `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `caller`        VARCHAR(100)    DEFAULT 'Anonyme',
    `location`      VARCHAR(150)    NOT NULL,
    `description`   TEXT            NOT NULL,
    `type`          VARCHAR(60)     DEFAULT 'Divers',
    `priority`      TINYINT(1)      DEFAULT 2 COMMENT '1=Urgent 2=Normal 3=Faible',
    `status`        ENUM('pending','dispatched','on_scene','closed') DEFAULT 'pending',
    `assigned_to`   JSON            DEFAULT NULL COMMENT 'Liste de badges officiers',
    `coords`        JSON            DEFAULT NULL COMMENT '{x, y, z}',
    `created_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------
--  Donnees de test (optionnel)
-- ----------------------------------------------------------
INSERT IGNORE INTO `mdt_citizens`
    (`identifier`, `firstname`, `lastname`, `dob`, `gender`, `phone`, `address`, `nationality`, `height`, `weight`, `eye_color`, `hair_color`, `notes`)
VALUES
    ('char1:a1b2c3d4e5', 'Michael', 'De Santa',   '1968-03-09', 0, '555-0100', '4 Rockford Hills', 'Americaine', 182, 85, 'Marrons', 'Noirs',  'Ancien braqueur reconverti'),
    ('char1:f1e2d3c4b5', 'Franklin', 'Clinton',   '1988-09-11', 0, '555-0200', 'Strawberry Ave',   'Americaine', 178, 75, 'Marrons', 'Noirs',  'Resident de Strawberry'),
    ('char1:a9b8c7d6e5', 'Trevor',   'Philips',   '1967-11-14', 0, '555-0300', 'Sandy Shores',     'Canadienne', 188, 95, 'Bleus',   'Blonds', 'Resident de Sandy Shores. DANGEREUX');

INSERT IGNORE INTO `mdt_vehicles`
    (`plate`, `owner_name`, `model`, `color`, `year`, `is_stolen`, `insurance`, `registration`)
VALUES
    ('ABC123', 'Michael De Santa',  'Tailgater', 'Noir',    2019, 0, 1, 1),
    ('XYZ789', 'Franklin Clinton',  'Buffalo',   'Vert',    2018, 0, 1, 1),
    ('TRV000', 'Trevor Philips',    'Bodhi',     'Marron',  2010, 1, 0, 0);
