-- Setup MySQL admin user for papeabdoulaye with database privileges
-- Run this in MySQL as root or admin user

-- Create the MySQL user (if not exists)
-- FOR LOCAL WAMP: user@localhost format
-- Replace with your actual password if different
CREATE USER IF NOT EXISTS 'papeabdoulaye'@'localhost' IDENTIFIED BY 'pape1982';

-- Grant all privileges on senegal_livres database
GRANT ALL PRIVILEGES ON senegal_livres.* TO 'papeabdoulaye'@'localhost' WITH GRANT OPTION;

-- Grant privileges for database/table operations
GRANT SHOW DATABASES, CREATE, ALTER, DROP, SELECT, INSERT, UPDATE, DELETE ON *.* TO 'papeabdoulaye'@'localhost' WITH GRANT OPTION;

-- Refresh privileges
FLUSH PRIVILEGES;

-- Verify user
SELECT User, Host FROM mysql.user WHERE User='papeabdoulaye';
SHOW GRANTS FOR 'papeabdoulaye'@'localhost';

-- Test database access
USE senegal_livres;
SHOW TABLES;
