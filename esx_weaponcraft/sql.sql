-- ============================================================
-- esx_weaponcraft - SQL Setup
-- ============================================================

-- Job
INSERT INTO `jobs` (`name`, `label`) VALUES ('weaponcraft', 'Armurier') ON DUPLICATE KEY UPDATE `label` = 'Armurier';

-- Grades
INSERT INTO `job_grades` (`job_name`, `grade`, `name`, `label`, `salary`, `skin_male`, `skin_female`) VALUES
    ('weaponcraft', 0, 'recruit',   'Recrue',    500,  '{}', '{}'),
    ('weaponcraft', 1, 'worker',    'Ouvrier',   800,  '{}', '{}'),
    ('weaponcraft', 2, 'craftsman', 'Artisan',   1200, '{}', '{}'),
    ('weaponcraft', 3, 'expert',    'Expert',    1800, '{}', '{}'),
    ('weaponcraft', 4, 'boss',      'Patron',    2500, '{}', '{}')
ON DUPLICATE KEY UPDATE `label` = VALUES(`label`), `salary` = VALUES(`salary`);

-- Compte societe
INSERT INTO `addon_account` (`name`, `label`, `shared`) VALUES ('society_weaponcraft', 'Armurier', 1) ON DUPLICATE KEY UPDATE `label` = 'Armurier';
INSERT INTO `addon_account_data` (`account_name`, `money`, `owner`) VALUES ('society_weaponcraft', 0, '') ON DUPLICATE KEY UPDATE `account_name` = 'society_weaponcraft';

-- Table des prix personnalises
CREATE TABLE IF NOT EXISTS `weaponcraft_prices` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `item_name` VARCHAR(100) NOT NULL UNIQUE,
    `price` INT NOT NULL DEFAULT 0,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table du stock automatique
CREATE TABLE IF NOT EXISTS `weaponcraft_autosell` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `item_name` VARCHAR(100) NOT NULL UNIQUE,
    `quantity` INT NOT NULL DEFAULT 0,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Logs PPA
CREATE TABLE IF NOT EXISTS `weaponcraft_ppa_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `giver` VARCHAR(60) NOT NULL,
    `receiver` VARCHAR(60) NOT NULL,
    `action` ENUM('give', 'remove') NOT NULL,
    `date` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Items a ajouter dans la table items (si ox_inventory ou similaire)
-- INSERT INTO `items` (`name`, `label`, `weight`, `rare`, `can_remove`) VALUES
--     ('metalbrut',         'Metal Brut',               5,  0, 1),
--     ('composantchimique', 'Composant Chimique',       3,  0, 1),
--     ('poudrearme',        'Poudre d\'Arme',           2,  0, 1),
--     ('ammo_pistol',       'Munitions Pistolet (x24)', 3,  0, 1),
--     ('ammo_rifle',        'Munitions Fusil (x30)',    4,  0, 1),
--     ('ppa_armurier',      'Permis de Port d\'Arme',   1,  0, 0)
-- ON DUPLICATE KEY UPDATE `label` = VALUES(`label`);
