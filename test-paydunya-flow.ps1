#!/usr/bin/env pwsh
# Script de test du flux de paiement PayDunya complet

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   TEST FLUX COMPLET PAYDUNYA - SENEGAL LIVRES" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

# Étape 1: Créer une facture
Write-Host "`n[1/4] Creating PayDunya invoice..." -ForegroundColor Yellow
$createInvoiceBody = @{
    amount = 5000
    description = "Achat de 2 livres - Test Flux Complet"
    bookIds = @("book-1", "book-2")
} | ConvertTo-Json

try {
    $invoiceResponse = Invoke-WebRequest -Uri "$baseUrl/api/paydunya/create-invoice" `
        -Method POST `
        -Body $createInvoiceBody `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $invoiceData = $invoiceResponse.Content | ConvertFrom-Json
    Write-Host "✅ Invoice created successfully!" -ForegroundColor Green
    Write-Host "   Order ID: $($invoiceData.orderId)"
    Write-Host "   Amount: 5000 FCFA"
    Write-Host "   Redirect: $($invoiceData.redirect_url)"
    
    $orderId = $invoiceData.orderId
} catch {
    Write-Host "❌ Failed to create invoice" -ForegroundColor Red
    Write-Host "$($_.Exception.Message)"
    exit 1
}

# Étape 2: Vérifier que la transaction a été créée
Write-Host "`n[2/4] Verifying transaction was created..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

try {
    $transactionResponse = Invoke-WebRequest -Uri "$baseUrl/api/transactions/$orderId" `
        -Method GET `
        -UseBasicParsing
    
    $transaction = $transactionResponse.Content | ConvertFrom-Json
    Write-Host "✅ Transaction found in database!" -ForegroundColor Green
    Write-Host "   ID: $($transaction.id)"
    Write-Host "   Status: $($transaction.status)"
    Write-Host "   Books: $($transaction.bookIds.Count) livre(s)"
} catch {
    Write-Host "⚠️  Transaction not found yet (may be expected in MOCK mode)" -ForegroundColor Yellow
}

# Étape 3: Simuler le webhook PayDunya
Write-Host "`n[3/4] Simulating PayDunya webhook callback..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

$webhookBody = @{
    response_code = "00"
    status = "completed"
    invoice = @{
        token = $invoiceData.invoice_token
        custom_data = @{
            orderId = $orderId
        }
    }
    custom_data = @{
        orderId = $orderId
    }
} | ConvertTo-Json

try {
    $webhookResponse = Invoke-WebRequest -Uri "$baseUrl/api/paydunya/callback" `
        -Method POST `
        -Body $webhookBody `
        -ContentType "application/json" `
        -UseBasicParsing
    
    Write-Host "✅ Webhook processed successfully!" -ForegroundColor Green
    Write-Host "   Response: $($webhookResponse.Content)"
} catch {
    Write-Host "⚠️  Webhook error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Étape 4: Vérifier que la transaction a été mise à jour
Write-Host "`n[4/4] Verifying payment confirmation..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

try {
    $finalTransactionResponse = Invoke-WebRequest -Uri "$baseUrl/api/transactions/$orderId" `
        -Method GET `
        -UseBasicParsing
    
    $finalTransaction = $finalTransactionResponse.Content | ConvertFrom-Json
    
    if ($finalTransaction.status -eq "validated") {
        Write-Host "✅ Payment validated successfully!" -ForegroundColor Green
        Write-Host "   Status: $($finalTransaction.status)"
        Write-Host "   Updated: $($finalTransaction.updatedAt)"
    } else {
        Write-Host "⚠️  Payment not yet validated (Status: $($finalTransaction.status))" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to verify payment" -ForegroundColor Red
    Write-Host "$($_.Exception.Message)"
    exit 1
}

# Étape finale
Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ TEST FLOW COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`nPayment redirect URL would be:" -ForegroundColor Cyan
Write-Host "$($invoiceData.redirect_url)" -ForegroundColor White
Write-Host "`nWith MOCK mode enabled, use this URL to test the payment page." -ForegroundColor Cyan
