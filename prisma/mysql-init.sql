-- SQL schema for senegal_livres (import via phpMyAdmin)
-- Charset and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

-- Create database if missing
CREATE DATABASE IF NOT EXISTS `senegal_livres` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `senegal_livres`;

-- Table: User
CREATE TABLE IF NOT EXISTS `User` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'client',
  `blocked` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Book
CREATE TABLE IF NOT EXISTS `Book` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(191) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `price` INT NOT NULL,
  `coverImage` VARCHAR(255) NOT NULL DEFAULT '',
  `pdfFile` VARCHAR(255) NOT NULL DEFAULT '',
  `pdfFileName` VARCHAR(255) NOT NULL DEFAULT '',
  `stock` INT NOT NULL DEFAULT 0,
  `category` VARCHAR(255) NOT NULL DEFAULT '',
  `status` VARCHAR(50) NOT NULL DEFAULT 'available',
  `eBook` TINYINT(1) NOT NULL DEFAULT 1,
  `source` VARCHAR(50) NOT NULL DEFAULT 'admin',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Book_uuid_key` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Transaction
CREATE TABLE IF NOT EXISTS `Transaction` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `userId` INT NULL,
  `amount` INT NOT NULL,
  `paymentMethod` VARCHAR(50) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `paydunyaInvoiceToken` VARCHAR(191) NOT NULL DEFAULT '',
  `paydunyaResponseCode` VARCHAR(191) NOT NULL DEFAULT '',
  `paydunyaStatus` VARCHAR(191) NOT NULL DEFAULT '',
  `providerTxId` VARCHAR(191) NOT NULL DEFAULT '',
  `bookIds` TEXT NOT NULL DEFAULT '',
  `description` VARCHAR(255) NOT NULL DEFAULT '',
  `customerEmail` VARCHAR(255) NOT NULL DEFAULT '',
  `rawPayload` LONGTEXT NOT NULL,
  `paymentConfirmedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Transaction_uuid_key` (`uuid`),
  UNIQUE KEY `Transaction_orderId_key` (`orderId`),
  KEY `Transaction_userId_fkey` (`userId`),
  CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Purchase
CREATE TABLE IF NOT EXISTS `Purchase` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(191) NOT NULL,
  `userId` INT NOT NULL,
  `bookId` INT NOT NULL,
  `transactionId` INT NULL,
  `amount` INT NOT NULL,
  `downloadCount` INT NOT NULL DEFAULT 0,
  `lastDownload` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Purchase_uuid_key` (`uuid`),
  KEY `Purchase_userId_fkey` (`userId`),
  KEY `Purchase_bookId_fkey` (`bookId`),
  KEY `Purchase_transactionId_fkey` (`transactionId`),
  CONSTRAINT `Purchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Purchase_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Book` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Purchase_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `Transaction` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: CartItem
CREATE TABLE IF NOT EXISTS `CartItem` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `bookId` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `CartItem_userId_bookId_key` (`userId`,`bookId`),
  KEY `CartItem_userId_fkey` (`userId`),
  KEY `CartItem_bookId_fkey` (`bookId`),
  CONSTRAINT `CartItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CartItem_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Book` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Submission
CREATE TABLE IF NOT EXISTS `Submission` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(191) NOT NULL,
  `userId` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `pdfFile` VARCHAR(255) NOT NULL DEFAULT '',
  `pdfFileName` VARCHAR(255) NOT NULL DEFAULT '',
  `category` VARCHAR(255) NOT NULL DEFAULT '',
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `reviewNotes` LONGTEXT NOT NULL,
  `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `reviewedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Submission_uuid_key` (`uuid`),
  KEY `Submission_userId_fkey` (`userId`),
  CONSTRAINT `Submission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: AdminStats
CREATE TABLE IF NOT EXISTS `AdminStats` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `totalUsers` INT NOT NULL DEFAULT 0,
  `totalBooks` INT NOT NULL DEFAULT 0,
  `totalTransactions` INT NOT NULL DEFAULT 0,
  `totalRevenue` INT NOT NULL DEFAULT 0,
  `lastUpdated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Done.
