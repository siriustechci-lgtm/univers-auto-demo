/**
 * UNIVERS AUTO - Schéma SQL officiel pour MySQL (Hostinger, cPanel, phpMyAdmin ou VPS)
 * Compatible MySQL 5.7+ et MySQL 8.0+ / MariaDB 10.3+
 * Encodage : utf8mb4_unicode_ci
 */

export const UNIVERS_AUTO_MYSQL_SCHEMA = `-- =====================================================================
-- CRM UNIVERS AUTO - SCRIPT D'INITIALISATION DE BASE DE DONNÉES MYSQL
-- Compatible hébergement Hostinger (phpMyAdmin) et serveurs MySQL distants
-- Entreprise : UNIVERS AUTO
-- Slogan : Achat & Vente de Véhicules Neufs et d'Occasion
-- Devise officielle : FCFA
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Table des paramètres de l'entreprise
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`company_settings\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`company_name\` VARCHAR(255) NOT NULL DEFAULT 'UNIVERS AUTO',
  \`slogan\` VARCHAR(255) DEFAULT 'Achat et Vente de Véhicules Neufs et d’Occasion',
  \`logo_url\` LONGTEXT DEFAULT NULL,
  \`phone\` VARCHAR(50) DEFAULT '',
  \`whatsapp\` VARCHAR(50) DEFAULT '',
  \`email\` VARCHAR(100) DEFAULT '',
  \`address\` VARCHAR(255) DEFAULT '',
  \`city\` VARCHAR(100) DEFAULT 'Dakar',
  \`country\` VARCHAR(100) DEFAULT 'Sénégal',
  \`rccm\` VARCHAR(100) DEFAULT '',
  \`ninea\` VARCHAR(100) DEFAULT '',
  \`currency\` VARCHAR(20) NOT NULL DEFAULT 'FCFA',
  \`currency_symbol\` VARCHAR(20) NOT NULL DEFAULT 'FCFA',
  \`tax_rate\` DECIMAL(5,2) DEFAULT 0.00,
  \`tax_enabled\` TINYINT(1) DEFAULT 0,
  \`invoice_prefix\` VARCHAR(20) DEFAULT 'FAC',
  \`quote_prefix\` VARCHAR(20) DEFAULT 'DEV',
  \`receipt_prefix\` VARCHAR(20) DEFAULT 'REC',
  \`purchase_prefix\` VARCHAR(20) DEFAULT 'ACH',
  \`reservation_prefix\` VARCHAR(20) DEFAULT 'RES',
  \`vehicle_prefix\` VARCHAR(20) DEFAULT 'UA',
  \`legal_terms\` TEXT DEFAULT NULL,
  \`invoice_footer\` TEXT DEFAULT NULL,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table des utilisateurs et employés
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`username\` VARCHAR(100) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`full_name\` VARCHAR(150) NOT NULL,
  \`role\` ENUM('Administrateur', 'Directeur', 'Commercial', 'Chef de parc', 'Comptable') NOT NULL DEFAULT 'Commercial',
  \`phone\` VARCHAR(50) DEFAULT '',
  \`email\` VARCHAR(100) DEFAULT '',
  \`commission_rate\` DECIMAL(5,2) DEFAULT 0.00,
  \`monthly_target\` DECIMAL(15,2) DEFAULT 0.00,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`permissions\` JSON DEFAULT NULL,
  \`last_login\` DATETIME DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_username\` (\`username\`),
  INDEX \`idx_role\` (\`role\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table des véhicules (Parc Automobile)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`vehicles\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`reference\` VARCHAR(50) NOT NULL UNIQUE,
  \`make\` VARCHAR(100) NOT NULL,
  \`model\` VARCHAR(100) NOT NULL,
  \`version\` VARCHAR(100) DEFAULT '',
  \`year\` INT NOT NULL,
  \`mileage\` INT NOT NULL DEFAULT 0,
  \`fuel_type\` ENUM('Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL', 'Autre') NOT NULL DEFAULT 'Essence',
  \`transmission\` ENUM('Automatique', 'Manuelle') NOT NULL DEFAULT 'Automatique',
  \`color\` VARCHAR(50) DEFAULT '',
  \`vin\` VARCHAR(50) DEFAULT '',
  \`registration\` VARCHAR(50) DEFAULT '',
  \`condition_type\` ENUM('Neuf', 'Occasion') NOT NULL DEFAULT 'Occasion',
  \`supplier\` VARCHAR(150) DEFAULT '',
  \`acquisition_date\` DATE DEFAULT NULL,
  \`purchase_price\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`transit_fee\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`customs_fee\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`transport_fee\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`repair_fee\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`other_fees\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`total_cost\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`selling_price\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`profit_margin\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`margin_rate\` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  \`status\` ENUM('Disponible', 'Réservé', 'Vendu', 'En préparation') NOT NULL DEFAULT 'Disponible',
  \`photos\` JSON DEFAULT NULL,
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_vehicle_status\` (\`status\`),
  INDEX \`idx_vehicle_make_model\` (\`make\`, \`model\`),
  INDEX \`idx_vehicle_vin\` (\`vin\`),
  INDEX \`idx_vehicle_registration\` (\`registration\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table des achats & approvisionnements
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`purchases\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`purchase_number\` VARCHAR(50) NOT NULL UNIQUE,
  \`date\` DATE NOT NULL,
  \`vehicle_id\` VARCHAR(50) DEFAULT NULL,
  \`vehicle_info\` VARCHAR(255) NOT NULL,
  \`supplier_name\` VARCHAR(150) NOT NULL,
  \`invoice_number\` VARCHAR(100) DEFAULT '',
  \`purchase_price\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`customs_fee\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`shipping_fee\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`transport_fee\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`preparation_fee\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`other_charges\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`total_cost\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`status\` ENUM('Commandé', 'En transit', 'En douane', 'Arrivé / En parc', 'Clôturé') NOT NULL DEFAULT 'Arrivé / En parc',
  \`payment_status\` ENUM('Payé', 'Partiellement payé', 'En attente') NOT NULL DEFAULT 'Payé',
  \`amount_paid\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_purchase_number\` (\`purchase_number\`),
  INDEX \`idx_purchase_vehicle\` (\`vehicle_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table des clients
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`clients\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`client_number\` VARCHAR(50) NOT NULL UNIQUE,
  \`type\` ENUM('Particulier', 'Entreprise') NOT NULL DEFAULT 'Particulier',
  \`first_name\` VARCHAR(100) DEFAULT '',
  \`last_name\` VARCHAR(100) DEFAULT '',
  \`company_name\` VARCHAR(150) DEFAULT '',
  \`phone\` VARCHAR(50) NOT NULL,
  \`whatsapp\` VARCHAR(50) DEFAULT '',
  \`email\` VARCHAR(100) DEFAULT '',
  \`address\` VARCHAR(255) DEFAULT '',
  \`id_type\` VARCHAR(50) DEFAULT 'CNI',
  \`id_number\` VARCHAR(100) DEFAULT '',
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_client_phone\` (\`phone\`),
  INDEX \`idx_client_number\` (\`client_number\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table des ventes
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`sales\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`sale_number\` VARCHAR(50) NOT NULL UNIQUE,
  \`vehicle_id\` VARCHAR(50) NOT NULL,
  \`vehicle_name\` VARCHAR(255) NOT NULL,
  \`vehicle_vin\` VARCHAR(50) DEFAULT '',
  \`client_id\` VARCHAR(50) NOT NULL,
  \`client_name\` VARCHAR(150) NOT NULL,
  \`client_phone\` VARCHAR(50) DEFAULT '',
  \`seller_id\` VARCHAR(50) DEFAULT '',
  \`seller_name\` VARCHAR(150) DEFAULT '',
  \`sale_date\` DATE NOT NULL,
  \`agreed_price\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`discount\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`final_price\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`deposit\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`balance_due\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`payment_method\` VARCHAR(50) NOT NULL DEFAULT 'Espèces',
  \`payment_status\` ENUM('Payé intégralement', 'Acompte versé / Solde dû', 'En attente') NOT NULL DEFAULT 'Payé intégralement',
  \`commission_rate\` DECIMAL(5,2) DEFAULT 0.00,
  \`commission_amount\` DECIMAL(15,2) DEFAULT 0.00,
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_sale_number\` (\`sale_number\`),
  INDEX \`idx_sale_vehicle\` (\`vehicle_id\`),
  INDEX \`idx_sale_client\` (\`client_id\`),
  INDEX \`idx_sale_seller\` (\`seller_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table des réservations
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`reservations\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`reservation_number\` VARCHAR(50) NOT NULL UNIQUE,
  \`vehicle_id\` VARCHAR(50) NOT NULL,
  \`vehicle_name\` VARCHAR(255) NOT NULL,
  \`client_id\` VARCHAR(50) NOT NULL,
  \`client_name\` VARCHAR(150) NOT NULL,
  \`client_phone\` VARCHAR(50) DEFAULT '',
  \`deposit_amount\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`payment_method\` VARCHAR(50) NOT NULL DEFAULT 'Espèces',
  \`reservation_date\` DATE NOT NULL,
  \`expiry_date\` DATE NOT NULL,
  \`validity_days\` INT NOT NULL DEFAULT 7,
  \`status\` ENUM('En cours', 'Confirmée / Convertie en vente', 'Expirée', 'Annulée') NOT NULL DEFAULT 'En cours',
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_res_number\` (\`reservation_number\`),
  INDEX \`idx_res_vehicle\` (\`vehicle_id\`),
  INDEX \`idx_res_client\` (\`client_id\`),
  INDEX \`idx_res_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table des factures et devis
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`invoices\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`invoice_number\` VARCHAR(50) NOT NULL UNIQUE,
  \`type\` ENUM('Facture', 'Devis', 'Reçu') NOT NULL DEFAULT 'Facture',
  \`reference_id\` VARCHAR(50) DEFAULT NULL,
  \`date\` DATE NOT NULL,
  \`due_date\` DATE DEFAULT NULL,
  \`client_id\` VARCHAR(50) NOT NULL,
  \`client_name\` VARCHAR(150) NOT NULL,
  \`client_phone\` VARCHAR(50) DEFAULT '',
  \`vehicle_id\` VARCHAR(50) DEFAULT NULL,
  \`vehicle_name\` VARCHAR(255) DEFAULT '',
  \`subtotal\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`tax_rate\` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  \`tax_amount\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`total_amount\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`amount_paid\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`balance_due\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`status\` ENUM('Payée', 'Partiellement payée', 'En attente', 'Annulée') NOT NULL DEFAULT 'Payée',
  \`payment_method\` VARCHAR(50) DEFAULT 'Espèces',
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_invoice_number\` (\`invoice_number\`),
  INDEX \`idx_invoice_client\` (\`client_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table des règlements et encaissements
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`payments\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`payment_number\` VARCHAR(50) NOT NULL UNIQUE,
  \`reference_type\` ENUM('Vente', 'Réservation', 'Facture', 'Autre') NOT NULL DEFAULT 'Vente',
  \`reference_id\` VARCHAR(50) DEFAULT NULL,
  \`reference_title\` VARCHAR(255) NOT NULL,
  \`client_id\` VARCHAR(50) NOT NULL,
  \`client_name\` VARCHAR(150) NOT NULL,
  \`client_phone\` VARCHAR(50) DEFAULT '',
  \`amount\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`payment_date\` DATE NOT NULL,
  \`payment_method\` VARCHAR(50) NOT NULL DEFAULT 'Espèces',
  \`status\` ENUM('Validé', 'En attente', 'Annulé') NOT NULL DEFAULT 'Validé',
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_payment_number\` (\`payment_number\`),
  INDEX \`idx_payment_client\` (\`client_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table des dépenses de l'entreprise
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`expenses\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`expense_number\` VARCHAR(50) NOT NULL UNIQUE,
  \`date\` DATE NOT NULL,
  \`category\` VARCHAR(100) NOT NULL,
  \`amount\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  \`description\` VARCHAR(255) NOT NULL,
  \`payment_method\` VARCHAR(50) NOT NULL DEFAULT 'Espèces',
  \`beneficiary\` VARCHAR(150) DEFAULT '',
  \`vehicle_id\` VARCHAR(50) DEFAULT NULL,
  \`vehicle_info\` VARCHAR(255) DEFAULT '',
  \`receipt_ref\` VARCHAR(100) DEFAULT '',
  \`notes\` TEXT DEFAULT NULL,
  \`recorded_by\` VARCHAR(150) DEFAULT '',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_expense_date\` (\`date\`),
  INDEX \`idx_expense_category\` (\`category\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table des journaux d'audit et activités
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`activity_logs\` (
  \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`user_id\` VARCHAR(50) NOT NULL,
  \`user_name\` VARCHAR(150) NOT NULL,
  \`user_role\` VARCHAR(50) NOT NULL,
  \`action_type\` VARCHAR(50) NOT NULL,
  \`module\` VARCHAR(50) NOT NULL,
  \`description\` TEXT NOT NULL,
  \`timestamp\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_log_user\` (\`user_id\`),
  INDEX \`idx_log_module\` (\`module\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
`;
