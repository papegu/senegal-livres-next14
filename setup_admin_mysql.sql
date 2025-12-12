-- ============================================================================
-- Script SQL de Configuration - Utilisateur Administrateur MySQL
-- ============================================================================
-- Nom: papeabdoulaye.gueye@uadb.edu.sn
-- Utilisateur: papeabdoulaye
-- Mot de passe: pape1982
-- Host: localhost
-- Privilèges: ALL ON *.*
-- ============================================================================

CREATE USER IF NOT EXISTS 'papeabdoulaye'@'localhost' IDENTIFIED WITH mysql_native_password BY 'pape1982';

-- 2. Attribuer tous les privilèges
-- ============================================================================
GRANT ALL PRIVILEGES ON *.* TO 'papeabdoulaye'@'localhost' WITH GRANT OPTION;

-- 3. Accorder les privilèges de gestion des utilisateurs
-- ============================================================================
GRANT SUPER ON *.* TO 'papeabdoulaye'@'localhost';
GRANT CREATE USER ON *.* TO 'papeabdoulaye'@'localhost';

FLUSH PRIVILEGES;

CREATE USER IF NOT EXISTS 'admin_root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'pape@@@@';
GRANT ALL PRIVILEGES ON *.* TO 'admin_root'@'localhost' WITH GRANT OPTION;
GRANT SUPER, CREATE USER ON *.* TO 'admin_root'@'localhost';


FLUSH PRIVILEGES;

-- Ensure local root uses mysql_native_password with requested password
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'pape1982';
FLUSH PRIVILEGES;

-- 5. Vérifier la création
-- ============================================================================
SELECT User, Host, authentication_string FROM mysql.user WHERE User='papeabdoulaye';

-- 6. Afficher les privilèges attribués
-- ============================================================================
SHOW GRANTS FOR 'papeabdoulaye'@'localhost';

-- 7. Vérifier que la base de données senegal_livres existe
-- ============================================================================
-- SHOW DATABASES;

-- 8. (Optionnel) Rendre l'utilisateur administrateur complet
-- ============================================================================
-- Les commandes ci-dessus suffisent, mais pour plus de sécurité:
-- GRANT FILE ON *.* TO 'papeabdoulaye'@'localhost';
-- GRANT RELOAD ON *.* TO 'papeabdoulaye'@'localhost';
-- GRANT SHUTDOWN ON *.* TO 'papeabdoulaye'@'localhost';

-- ============================================================================
-- Commandes Utiles pour la Gestion Ultérieure
-- ============================================================================

-- Voir tous les utilisateurs MySQL
-- SELECT User, Host FROM mysql.user;

-- Voir les privilèges d'un utilisateur
-- SHOW GRANTS FOR 'papeabdoulaye'@'localhost';

-- Changer le mot de passe
-- ALTER USER 'papeabdoulaye'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe';

-- Supprimer l'utilisateur (SI NÉCESSAIRE)
-- DROP USER 'papeabdoulaye'@'localhost';

-- Restreindre l'accès à un réseau spécifique (optionnel pour la production)
-- ALTER USER 'papeabdoulaye'@'192.168.1.%' IDENTIFIED BY 'pape1982';

-- Voir les connexions actives
-- SHOW PROCESSLIST;

-- Voir les tables de senegal_livres
-- USE senegal_livres;
-- SHOW TABLES;

-- Voir les statistiques des tables
-- SELECT 
--   TABLE_NAME,
--   TABLE_ROWS,
--   DATA_LENGTH,
--   INDEX_LENGTH
-- FROM INFORMATION_SCHEMA.TABLES
-- WHERE TABLE_SCHEMA = 'senegal_livres'
-- ORDER BY TABLE_NAME;

-- ============================================================================
-- Installation: Comment exécuter ce script
-- ============================================================================
-- 
-- Option 1: Copier-coller dans MySQL CLI
-- $ mysql -u root -p
-- mysql> [Copier les 6 premières sections, lignes 1-45]
--
-- Option 2: Exécuter le fichier
-- $ mysql -u root -p < setup_admin_mysql.sql
--
-- Option 3: Utiliser le script PowerShell
-- $ .\scripts\create-mysql-admin.ps1
--
-- ============================================================================
