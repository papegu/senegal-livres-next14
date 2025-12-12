#!/usr/bin/env pwsh
# Script pour créer l'utilisateur administrateur MySQL
# papeabdoulaye.gueye@uadb.edu.sn avec le mot de passe pape1982

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Création d'Utilisateur Administrateur MySQL              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$mysqlUser = "papeabdoulaye"
$mysqlPassword = "pape1982"
$email = "papeabdoulaye.gueye@uadb.edu.sn"
$rootPassword = "password"  # À adapter si différent

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Utilisateur MySQL: $mysqlUser" -ForegroundColor White
Write-Host "  Email: $email" -ForegroundColor White
Write-Host "  Mot de passe: [CACHÉ]" -ForegroundColor White
Write-Host ""

# Vérifier si MySQL est installé
Write-Host "Vérification de MySQL..." -ForegroundColor Cyan
try {
    $mysqlVersion = & mysql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MySQL détecté: $mysqlVersion" -ForegroundColor Green
    }
    else {
        Write-Host "✗ MySQL n'a pas pu être localisé" -ForegroundColor Red
        Write-Host "  Assurez-vous que MySQL est installé et PATH contient le répertoire bin." -ForegroundColor Yellow
        exit 1
    }
}
catch {
    Write-Host "✗ Erreur: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Exécution des commandes SQL..." -ForegroundColor Cyan

# SQL à exécuter
$sqlCommands = @"
-- Créer l'utilisateur MySQL
CREATE USER IF NOT EXISTS '$mysqlUser'@'localhost' IDENTIFIED BY '$mysqlPassword';

-- Accorder tous les privilèges
GRANT ALL PRIVILEGES ON *.* TO '$mysqlUser'@'localhost' WITH GRANT OPTION;

-- Accorder les privilèges de gestion des utilisateurs
GRANT SUPER ON *.* TO '$mysqlUser'@'localhost';

-- Rafraîchir les privilèges
FLUSH PRIVILEGES;

-- Afficher la confirmation
SELECT User, Host FROM mysql.user WHERE User='$mysqlUser';
"@

# Exécuter les commandes SQL
try {
    $sqlOutput = $sqlCommands | & mysql -u root -p$rootPassword -e "source /dev/stdin" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Utilisateur créé avec succès!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Résultat:" -ForegroundColor Yellow
        Write-Host $sqlOutput -ForegroundColor White
    }
    else {
        Write-Host "✗ Erreur lors de la création:" -ForegroundColor Red
        Write-Host $sqlOutput -ForegroundColor Red
        
        # Essayer une autre approche
        Write-Host ""
        Write-Host "Alternative: Exécution via mysql -e" -ForegroundColor Yellow
        
        & mysql -u root -p$rootPassword -e "
            CREATE USER IF NOT EXISTS '$mysqlUser'@'localhost' IDENTIFIED BY '$mysqlPassword';
            GRANT ALL PRIVILEGES ON *.* TO '$mysqlUser'@'localhost' WITH GRANT OPTION;
            FLUSH PRIVILEGES;
            SELECT User, Host FROM mysql.user WHERE User='$mysqlUser';
        "
    }
}
catch {
    Write-Host "✗ Erreur d'exécution: $_" -ForegroundColor Red
    
    Write-Host ""
    Write-Host "Instructions manuelles:" -ForegroundColor Yellow
    Write-Host "1. Ouvrez MySQL CLI: mysql -u root -p" -ForegroundColor White
    Write-Host "2. Exécutez les commandes suivantes:" -ForegroundColor White
    Write-Host ""
    Write-Host "CREATE USER 'papeabdoulaye'@'localhost' IDENTIFIED BY 'pape1982';" -ForegroundColor Cyan
    Write-Host "GRANT ALL PRIVILEGES ON *.* TO 'papeabdoulaye'@'localhost' WITH GRANT OPTION;" -ForegroundColor Cyan
    Write-Host "FLUSH PRIVILEGES;" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✓ Configuration complétée!" -ForegroundColor Green
Write-Host ""
Write-Host "Information d'accès:" -ForegroundColor Cyan
Write-Host "  Utilisateur: $mysqlUser" -ForegroundColor White
Write-Host "  Mot de passe: pape1982" -ForegroundColor White
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host ""
Write-Host "Test de connexion:" -ForegroundColor Yellow
Write-Host "  mysql -u $mysqlUser -p -h localhost" -ForegroundColor Cyan
Write-Host ""
Write-Host "Page d'administration base de données:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000/admin/database" -ForegroundColor Cyan
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
