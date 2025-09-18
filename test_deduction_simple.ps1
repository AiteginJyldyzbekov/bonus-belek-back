# Simple cashback deduction test
$baseUrl = "http://localhost:8080"
$testPhone = "+996701234567"

Write-Host "Testing cashback deduction..." -ForegroundColor Green

# Test deduction
$deductBody = @{
    phoneNumber = $testPhone
    amount = "5.0"
    reason = "Test deduction"
} | ConvertTo-Json -Compress

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/cashback/deduct" -Method POST -Body $deductBody -ContentType "application/json"
    Write-Host "SUCCESS: Deducted $($response.data.deduction.amount)" -ForegroundColor Green
    Write-Host "New balance: $($response.data.user.balance)" -ForegroundColor Green
    Write-Host "Transaction ID: $($response.data.transaction.id)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Check balance
try {
    $balanceResponse = Invoke-RestMethod -Uri "$baseUrl/users/$testPhone/balance" -Method GET
    Write-Host "Current balance: $($balanceResponse.data.balance)" -ForegroundColor Yellow
} catch {
    Write-Host "ERROR getting balance: $($_.Exception.Message)" -ForegroundColor Red
}
