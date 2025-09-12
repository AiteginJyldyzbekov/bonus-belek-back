# Test name validation functionality
Write-Host "=== Testing Name Validation (Fixed Logic) ===" -ForegroundColor Green

# Test 1: Create user with name "Ivan"
Write-Host "`nTest 1: Creating user with name 'Ivan' and phone +996701234567"
$body1 = @{
    phoneNumber = "+996701234567"
    name = "Ivan"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:8080/auth/login/initiate" -Method POST -ContentType "application/json" -Body $body1
    Write-Host "SUCCESS: $($response1.message)" -ForegroundColor Green
    Write-Host "User ID: $($response1.user.id), Name: $($response1.user.name)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Try login with same phone but different name (should FAIL - user exists with different name)
Write-Host "`nTest 2: Try login with same phone +996701234567 but different name 'Petr' (should FAIL)"
$body2 = @{
    phoneNumber = "+996701234567"
    name = "Petr"
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:8080/auth/login/initiate" -Method POST -ContentType "application/json" -Body $body2
    Write-Host "UNEXPECTED SUCCESS: $($response2.message)" -ForegroundColor Red
    Write-Host "Name should NOT be changed from Ivan to Petr!" -ForegroundColor Red
} catch {
    Write-Host "EXPECTED ERROR: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 3: Try login with same phone and same name but different case (should SUCCESS)
Write-Host "`nTest 3: Try login with same phone +996701234567 and name 'ivan' (lowercase, should SUCCESS)"
$body3 = @{
    phoneNumber = "+996701234567"
    name = "ivan"
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:8080/auth/login/initiate" -Method POST -ContentType "application/json" -Body $body3
    Write-Host "SUCCESS: $($response3.message)" -ForegroundColor Green
    Write-Host "User ID: $($response3.user.id), Name: $($response3.user.name)" -ForegroundColor Cyan
    Write-Host "Name should still be 'Ivan' (not changed to lowercase)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Try to create user with same name but different phone (should FAIL)
Write-Host "`nTest 4: Try to create user with name 'Ivan' but different phone +996701234568 (should FAIL)"
$body4 = @{
    phoneNumber = "+996701234568"
    name = "Ivan"
} | ConvertTo-Json

try {
    $response4 = Invoke-RestMethod -Uri "http://localhost:8080/auth/login/initiate" -Method POST -ContentType "application/json" -Body $body4
    Write-Host "UNEXPECTED SUCCESS: $($response4.message)" -ForegroundColor Red
} catch {
    Write-Host "EXPECTED ERROR: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 5: Create user with completely new name and phone (should SUCCESS)
Write-Host "`nTest 5: Create user with new name 'Maria' and new phone +996701234569 (should SUCCESS)"
$body5 = @{
    phoneNumber = "+996701234569"
    name = "Maria"
} | ConvertTo-Json

try {
    $response5 = Invoke-RestMethod -Uri "http://localhost:8080/auth/login/initiate" -Method POST -ContentType "application/json" -Body $body5
    Write-Host "SUCCESS: $($response5.message)" -ForegroundColor Green
    Write-Host "User ID: $($response5.user.id), Name: $($response5.user.name)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Verify that Ivan's name was not changed
Write-Host "`nTest 6: Verify that Ivan's name was not changed by previous attempts"
$body6 = @{
    phoneNumber = "+996701234567"
    name = "Ivan"
} | ConvertTo-Json

try {
    $response6 = Invoke-RestMethod -Uri "http://localhost:8080/auth/login/initiate" -Method POST -ContentType "application/json" -Body $body6
    Write-Host "SUCCESS: $($response6.message)" -ForegroundColor Green
    Write-Host "User ID: $($response6.user.id), Name: $($response6.user.name)" -ForegroundColor Cyan
    if ($response6.user.name -eq "Ivan") {
        Write-Host "CORRECT: Name is still 'Ivan' (not changed)" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Name was changed to '$($response6.user.name)'" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test completed! ===" -ForegroundColor Green
