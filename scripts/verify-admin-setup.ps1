#!/usr/bin/env pwsh
# Script de verification - Configuration Administrateur MySQL

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "   Verification Configuration Administrateur MySQL             " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

$checks = @(
    @{ Name = "MySQL CLI disponible"; Check = { mysql --version 2>$null } },
    @{ Name = "Fichier route.ts cree"; Check = { Test-Path "app/api/admin/database/route.ts" } },
    @{ Name = "Fichier page.tsx cree"; Check = { Test-Path "app/admin/database/page.tsx" } },
    @{ Name = "Script PowerShell cree"; Check = { Test-Path "scripts/create-mysql-admin.ps1" } },
    @{ Name = "Documentation creee"; Check = { Test-Path "ADMIN_MYSQL_SETUP.md" } },
    @{ Name = "README cree"; Check = { Test-Path "MYSQL_ADMIN_README.md" } },
    @{ Name = "Script SQL cree"; Check = { Test-Path "setup_admin_mysql.sql" } }
)

$passCount = 0
$failCount = 0

Write-Host "Verification des fichiers..." -ForegroundColor Yellow
Write-Host ""

foreach ($check in $checks) {
    try {
        $result = & $check.Check
        
        if ($result -or $result -eq $true) {
            Write-Host "[OK] $($check.Name)" -ForegroundColor Green
            $passCount++
        }
        else {
            Write-Host "[FAIL] $($check.Name)" -ForegroundColor Red
            $failCount++
        }
    }
    catch {
        Write-Host "[FAIL] $($check.Name)" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Resultats:" -ForegroundColor Yellow
Write-Host "  [OK] Reussi: $passCount" -ForegroundColor Green
Write-Host "  [FAIL] Echec: $failCount" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Configuration Utilisateur MySQL:" -ForegroundColor Yellow
Write-Host "  Utilisateur: papeabdoulaye" -ForegroundColor White
Write-Host "  Email: papeabdoulaye.gueye@uadb.edu.sn" -ForegroundColor White
Write-Host "  Mot de passe: pape1982" -ForegroundColor White
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 3306" -ForegroundColor White
Write-Host "  Privileges: ALL PRIVILEGES ON *.*" -ForegroundColor White
Write-Host ""

Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "  1. Creer l'utilisateur MySQL:" -ForegroundColor White
Write-Host "     .\scripts\create-mysql-admin.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Lancer le serveur:" -ForegroundColor White
Write-Host "     npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Acceder au dashboard:" -ForegroundColor White
Write-Host "     http://localhost:3000/admin/database" -ForegroundColor Gray
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  - MYSQL_ADMIN_README.md (Rapide)" -ForegroundColor Gray
Write-Host "  - ADMIN_MYSQL_SETUP.md (Complete)" -ForegroundColor Gray
Write-Host "  - setup_admin_mysql.sql (Commandes SQL)" -ForegroundColor Gray
Write-Host ""

Write-Host "==================================================================" -ForegroundColor Green
Write-Host "Configuration prete a etre finalisee!" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
