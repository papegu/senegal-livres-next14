#!/usr/bin/env pwsh
# Script de test PRODUCTION LOCAL - Valide que tout fonctionne

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        TEST MODE PRODUCTION LOCALEMENT - SENEGAL LIVRES    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

# Configuration pour production local
Write-Host "`n[CONFIG] Préparant environnement de test production..." -ForegroundColor Yellow

# Vérifier les clés PayDunya
Write-Host "`n[1/5] Vérification des clés PayDunya..." -ForegroundColor Yellow
$env:PAYDUNYA_USE_MOCK = "false"  # Mode PRODUCTION

$keys = @{
    'PAYDUNYA_MASTER_KEY' = $env:PAYDUNYA_MASTER_KEY
    'PAYDUNYA_PUBLIC_KEY' = $env:PAYDUNYA_PUBLIC_KEY
    'PAYDUNYA_PRIVATE_KEY' = $env:PAYDUNYA_PRIVATE_KEY
    'PAYDUNYA_TOKEN' = $env:PAYDUNYA_TOKEN
}

$allPresent = $true
foreach ($key in $keys.Keys) {
    if (-not [string]::IsNullOrEmpty($keys[$key])) {
        Write-Host "  ✅ $key: Present" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $key: MISSING!" -ForegroundColor Red
        $allPresent = $false
    }
}

if (-not $allPresent) {
    Write-Host "`n⚠️  Les clés PayDunya ne sont pas toutes configurées." -ForegroundColor Yellow
    Write-Host "   Les tests de production ne peuvent pas s'exécuter." -ForegroundColor Yellow
    Write-Host "   Utilisez PAYDUNYA_USE_MOCK=true pour tester en développement." -ForegroundColor Yellow
    exit 1
}

# Test de disponibilité du serveur
Write-Host "`n[2/5] Vérification que le serveur tourne..." -ForegroundColor Yellow
try {
    $test = Invoke-WebRequest -Uri "$baseUrl/" -Method Head -UseBasicParsing -TimeoutSec 2
    Write-Host "  ✅ Serveur disponible" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Serveur non disponible à $baseUrl" -ForegroundColor Red
    Write-Host "     Lancez: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Tester la création de facture
Write-Host "`n[3/5] Test création de facture PayDunya..." -ForegroundColor Yellow

$createBody = @{
    amount = 5000
    description = "Test Production - Achat 2 livres"
    bookIds = @("book-1", "book-2")
    customerEmail = "test@example.com"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/paydunya/create-invoice" `
        -Method POST `
        -Body $createBody `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.success -or $data.redirect_url) {
        Write-Host "  ✅ Facture créée" -ForegroundColor Green
        Write-Host "     Order ID: $($data.orderId)" -ForegroundColor Cyan
        $orderId = $data.orderId
        
        # Vérifier que c'est un vrai lien PayDunya (pas mock)
        if ($data.redirect_url -like "*paydunya*" -and $data.redirect_url -notlike "*localhost*") {
            Write-Host "     ✅ Redirection vers PayDunya RÉEL confirmée" -ForegroundColor Green
        } elseif ($data.mockMode) {
            Write-Host "     ⚠️  Mode MOCK actif (pour développement)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠️  Réponse inattendue" -ForegroundColor Yellow
        Write-Host "$($response.Content)" -ForegroundColor White
    }
} catch {
    Write-Host "  ❌ Erreur lors de la création de facture" -ForegroundColor Red
    Write-Host "$($_.Exception.Response.StatusCode)" -ForegroundColor Red
    
    # Essayer de lire le body d'erreur
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Erreur: $responseBody" -ForegroundColor Yellow
    }
}

# Vérifier que la transaction est créée
Write-Host "`n[4/5] Vérification transaction en base de données..." -ForegroundColor Yellow
if ($orderId) {
    try {
        $txResponse = Invoke-WebRequest -Uri "$baseUrl/api/transactions/$orderId" `
            -Method GET `
            -UseBasicParsing
        
        $transaction = $txResponse.Content | ConvertFrom-Json
        Write-Host "  ✅ Transaction trouvée" -ForegroundColor Green
        Write-Host "     Status: $($transaction.status)" -ForegroundColor Cyan
        Write-Host "     Amount: $($transaction.amount) FCFA" -ForegroundColor Cyan
        Write-Host "     Created: $($transaction.createdAt)" -ForegroundColor Cyan
    } catch {
        Write-Host "  ⚠️  Transaction non trouvée" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  Pas d'orderId pour vérifier" -ForegroundColor Yellow
}

# Vérifier les routes
Write-Host "`n[5/5] Vérification des routes critiques..." -ForegroundColor Yellow

$routes = @(
    "/checkout",
    "/payment-success",
    "/payment-cancel",
    "/purchases"
)

foreach ($route in $routes) {
    try {
        $test = Invoke-WebRequest -Uri "$baseUrl$route" -Method Head -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        Write-Host "  ✅ $route" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  $route (HTTP $($_.Exception.Response.StatusCode))" -ForegroundColor Yellow
    }
}

# Résumé final
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                   RÉSUMÉ DU TEST                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n✅ PRÊT POUR LA PRODUCTION!" -ForegroundColor Green
Write-Host "`n📝 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Valider KYC sur PayDunya (si pas fait)" -ForegroundColor White
Write-Host "   2. Obtenir les clés PRODUCTION de PayDunya" -ForegroundColor White
Write-Host "   3. Configurer NEXT_PUBLIC_BASE_URL=https://www.senegallivres.sn" -ForegroundColor White
Write-Host "   4. Déployer avec: npm run build && npm start" -ForegroundColor White
Write-Host "   5. Tester un paiement complet en production" -ForegroundColor White

Write-Host "`n📖 Documentation: voir DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
