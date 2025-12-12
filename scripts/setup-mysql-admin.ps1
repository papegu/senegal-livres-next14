# Simple MySQL admin setup script
param(
    [string]$mysqlPath = "c:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe",
    [string]$rootPassword = "pape1982"
)

Write-Host "Setting up MySQL admin user..." -ForegroundColor Cyan

# Create temp SQL file
$sqlFile = "$env:TEMP\setup_admin.sql"
@"
CREATE USER IF NOT EXISTS 'papeabdoulaye'@'localhost' IDENTIFIED BY 'pape1982';
GRANT ALL PRIVILEGES ON senegal_livres.* TO 'papeabdoulaye'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
"@ | Out-File -Encoding UTF8 $sqlFile

# Execute SQL
Write-Host "Creating user..." -ForegroundColor Yellow
Get-Content $sqlFile | & $mysqlPath -u root -p$rootPassword -h localhost

Write-Host ""
Write-Host "Verifying connection..." -ForegroundColor Yellow
& $mysqlPath -u papeabdoulaye -ppape1982 -h localhost -e "SELECT 1 as connected;" 2>&1 | Write-Host

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "OK MySQL admin user setup complete" -ForegroundColor Green
    Write-Host "  User: papeabdoulaye" -ForegroundColor Gray
    Write-Host "  Password: pape1982" -ForegroundColor Gray
    Write-Host "  Database: senegal_livres" -ForegroundColor Gray
} else {
    Write-Host "Setup completed with warnings" -ForegroundColor Yellow
}

# Cleanup
Remove-Item $sqlFile -Force -ErrorAction SilentlyContinue
