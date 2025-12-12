<#
Purpose: Locate mysql.exe and execute setup_admin_mysql.sql via SOURCE.
This avoids PowerShell redirection issues and works even if mysql.exe isn't in PATH.
#>

param(
    [string]$MysqlPath,
    [string]$SqlFile = "${PSScriptRoot}\..\setup_admin_mysql.sql",
    [string]$Host = "127.0.0.1",
    [int]$Port = 3306
)

function Find-MysqlExe {
    param([string]$Hint)
    if ($Hint -and (Test-Path $Hint)) { return (Resolve-Path $Hint).Path }
    $candidates = @(
        "$env:ProgramFiles\MySQL\MySQL Server 8.0\bin\mysql.exe",
        "$env:ProgramFiles\MySQL\MySQL Server 5.7\bin\mysql.exe",
        "$env:ProgramFiles(x86)\MySQL\MySQL Server 8.0\bin\mysql.exe",
        "$env:ProgramFiles(x86)\MySQL\MySQL Server 5.7\bin\mysql.exe",
        "$env:ProgramFiles\MySQL\MySQL Workbench\mysql.exe",
        "$env:ProgramFiles(x86)\MySQL\MySQL Workbench\mysql.exe"
    )
    $cmd = Get-Command mysql -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    foreach ($c in $candidates) { if (Test-Path $c) { return $c } }
    throw "mysql.exe not found. Provide -MysqlPath or install MySQL client."
}

try {
    $mysql = Find-MysqlExe -Hint $MysqlPath
    if (-not (Test-Path $SqlFile)) { throw "SQL file not found: $SqlFile" }
    Write-Host "Using mysql: $mysql"
    Write-Host "SQL file: $SqlFile"
    Write-Host "Connecting host=$Host port=$Port as root (prompting for password)..."
    & $mysql -u root -p -h $Host -P $Port --execute "SOURCE `"$SqlFile`";" 
}
catch {
    Write-Error $_
    exit 1
}

#!/usr/bin/env pwsh
# Script complet de creation et migration de la base de donnees MySQL
# Cree la base de donnees, l'utilisateur admin, et migre les donnees JSON

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   SETUP COMPLET BASE DE DONNEES MYSQL                     " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$dbName = "senegal_livres"
$dbUser = "papeabdoulaye"
$dbPass = "pape1982"
$dbHost = "localhost"
$dbPort = "3306"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Base: $dbName" -ForegroundColor White
Write-Host "  Utilisateur: $dbUser" -ForegroundColor White
Write-Host "  Host: $dbHost" -ForegroundColor White
Write-Host ""

# ETAPE 1: Creer la base de donnees et l'utilisateur
Write-Host "ETAPE 1: Creation de la base de donnees..." -ForegroundColor Cyan
$sql1 = @"
DROP DATABASE IF EXISTS $dbName;
CREATE DATABASE $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$dbUser'@'$dbHost' IDENTIFIED BY '$dbPass';
GRANT ALL PRIVILEGES ON $dbName.* TO '$dbUser'@'$dbHost';
FLUSH PRIVILEGES;
"@

try {
    $sql1 | mysql -u root -ppassword -e "source /dev/stdin" 2>$null
    Write-Host "[OK] Base de donnees creee avec succes" -ForegroundColor Green
}
catch {
    Write-Host "[TENTATIVE] Via mysql direct..." -ForegroundColor Yellow
    mysql -u root -ppassword -e $sql1
}

# ETAPE 2: Generer le client Prisma
Write-Host ""
Write-Host "ETAPE 2: Generation du client Prisma..." -ForegroundColor Cyan
npx prisma generate
Write-Host "[OK] Client Prisma genere" -ForegroundColor Green

# ETAPE 3: Lancer les migrations Prisma
Write-Host ""
Write-Host "ETAPE 3: Lancement des migrations Prisma..." -ForegroundColor Cyan
Write-Host "  Execution: npx prisma migrate dev --name init" -ForegroundColor Gray
npx prisma migrate dev --name init
Write-Host "[OK] Migrations completees" -ForegroundColor Green

# ETAPE 4: Migrer les donnees JSON
Write-Host ""
Write-Host "ETAPE 4: Migration des donnees JSON vers MySQL..." -ForegroundColor Cyan
Write-Host "  Lecture de data/market.json..." -ForegroundColor Gray
npx ts-node scripts/migrate-json-to-db.ts
Write-Host "[OK] Donnees migrees" -ForegroundColor Green

# ETAPE 5: Verifier
Write-Host ""
Write-Host "ETAPE 5: Verification de la base de donnees..." -ForegroundColor Cyan
$verify = mysql -u $dbUser -p$dbPass -h $dbHost -e "USE $dbName; SELECT TABLE_NAME, TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES;" 2>&1
if ($verify) {
    Write-Host "[OK] Tables creees:" -ForegroundColor Green
    Write-Host $verify -ForegroundColor Gray
}
else {
    Write-Host "[ECHEC] Impossible de verifier" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "   SETUP COMPLET!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Base de donnees prete: $dbName" -ForegroundColor White
Write-Host "Demarrez le serveur: npm run dev" -ForegroundColor Yellow
Write-Host "Accedez au dashboard: http://localhost:3000/admin/database" -ForegroundColor Yellow
Write-Host ""
