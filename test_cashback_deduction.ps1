# Тест функционала списания кэшбека
# Этот скрипт тестирует все сценарии списания кэшбека

$baseUrl = "http://localhost:8080"
$testPhone = "+996701234567"

Write-Host "=== Тест функционала списания кэшбека ===" -ForegroundColor Green
Write-Host ""

# 1. Проверяем текущий баланс пользователя
Write-Host "1. Проверяем текущий баланс пользователя..." -ForegroundColor Yellow
try {
    $balanceResponse = Invoke-RestMethod -Uri "$baseUrl/users/$testPhone/balance" -Method GET
    $currentBalance = $balanceResponse.data.balance
    Write-Host "✅ Текущий баланс: $currentBalance" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка получения баланса: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Если баланс меньше 10, начислим кэшбек для тестирования
if ($currentBalance -lt 10) {
    Write-Host "2. Баланс недостаточен, начисляем тестовый кэшбек..." -ForegroundColor Yellow
    
    # Получаем список товаров
    $productsBody = @{
        phoneNumber = $testPhone
    } | ConvertTo-Json -Compress
    
    try {
        $productsResponse = Invoke-RestMethod -Uri "$baseUrl/cashback/products" -Method POST -Body $productsBody -ContentType "application/json"
        $firstProduct = $productsResponse.data[0]
        
        # Начисляем кэшбек
        $cashbackBody = @{
            productId = $firstProduct.id
            phoneNumber = $testPhone
        } | ConvertTo-Json -Compress
        
        $cashbackResponse = Invoke-RestMethod -Uri "$baseUrl/cashback/process" -Method POST -Body $cashbackBody -ContentType "application/json"
        Write-Host "✅ Начислен кэшбек: $($cashbackResponse.data.cashback.amount)" -ForegroundColor Green
        
        # Обновляем текущий баланс
        $balanceResponse = Invoke-RestMethod -Uri "$baseUrl/users/$testPhone/balance" -Method GET
        $currentBalance = $balanceResponse.data.balance
        Write-Host "✅ Новый баланс: $currentBalance" -ForegroundColor Green
    } catch {
        Write-Host "❌ Ошибка начисления тестового кэшбека: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "3. Тестируем списание кэшбека..." -ForegroundColor Yellow

# Тест 1: Успешное списание
Write-Host "   Тест 1: Успешное списание 5.0 бонусов" -ForegroundColor Cyan
$deductBody1 = @{
    phoneNumber = $testPhone
    amount = "5.0"
    reason = "Тестовое списание"
} | ConvertTo-Json -Compress

try {
    $deductResponse1 = Invoke-RestMethod -Uri "$baseUrl/cashback/deduct" -Method POST -Body $deductBody1 -ContentType "application/json"
    Write-Host "   ✅ Успешно списано: $($deductResponse1.data.deduction.amount)" -ForegroundColor Green
    Write-Host "   ✅ Причина: $($deductResponse1.data.deduction.reason)" -ForegroundColor Green
    Write-Host "   ✅ Новый баланс: $($deductResponse1.data.user.balance)" -ForegroundColor Green
    Write-Host "   ✅ ID транзакции: $($deductResponse1.data.transaction.id)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Ошибка списания: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Тест 2: Списание с недостаточным балансом
Write-Host "   Тест 2: Списание с недостаточным балансом (попытка списать 1000)" -ForegroundColor Cyan
$deductBody2 = @{
    phoneNumber = $testPhone
    amount = "1000"
    reason = "Тест недостаточного баланса"
} | ConvertTo-Json -Compress

try {
    $deductResponse2 = Invoke-RestMethod -Uri "$baseUrl/cashback/deduct" -Method POST -Body $deductBody2 -ContentType "application/json"
    Write-Host "   ❌ Неожиданно успешно списано: $($deductResponse2.data.deduction.amount)" -ForegroundColor Red
} catch {
    Write-Host "   ✅ Правильно заблокировано: недостаточный баланс" -ForegroundColor Green
}

Write-Host ""

# Тест 3: Списание отрицательной суммы
Write-Host "   Тест 3: Попытка списать отрицательную сумму" -ForegroundColor Cyan
$deductBody3 = @{
    phoneNumber = $testPhone
    amount = "-5"
    reason = "Тест отрицательной суммы"
} | ConvertTo-Json -Compress

try {
    $deductResponse3 = Invoke-RestMethod -Uri "$baseUrl/cashback/deduct" -Method POST -Body $deductBody3 -ContentType "application/json"
    Write-Host "   ❌ Неожиданно успешно списано: $($deductResponse3.data.deduction.amount)" -ForegroundColor Red
} catch {
    Write-Host "   ✅ Правильно заблокировано: отрицательная сумма" -ForegroundColor Green
}

Write-Host ""

# Тест 4: Списание с несуществующим пользователем
Write-Host "   Тест 4: Списание с несуществующим номером телефона" -ForegroundColor Cyan
$deductBody4 = @{
    phoneNumber = "+996999999999"
    amount = "1.0"
    reason = "Тест несуществующего пользователя"
} | ConvertTo-Json -Compress

try {
    $deductResponse4 = Invoke-RestMethod -Uri "$baseUrl/cashback/deduct" -Method POST -Body $deductBody4 -ContentType "application/json"
    Write-Host "   ❌ Неожиданно успешно списано: $($deductResponse4.data.deduction.amount)" -ForegroundColor Red
} catch {
    Write-Host "   ✅ Правильно заблокировано: пользователь не найден" -ForegroundColor Green
}

Write-Host ""

# 4. Проверяем историю транзакций
Write-Host "4. Проверяем историю транзакций..." -ForegroundColor Yellow
try {
    $transactionsResponse = Invoke-RestMethod -Uri "$baseUrl/users/$testPhone/transactions" -Method GET
    $transactions = $transactionsResponse.data.transactions
    
    Write-Host "✅ Всего транзакций: $($transactions.Count)" -ForegroundColor Green
    
    # Показываем последние 5 транзакций
    $recentTransactions = $transactions | Select-Object -First 5
    Write-Host "📋 Последние транзакции:" -ForegroundColor Cyan
    
    foreach ($transaction in $recentTransactions) {
        $type = if ($transaction.cashbackAmount -gt 0) { "Начисление" } else { "Списание" }
        $amount = [Math]::Abs($transaction.cashbackAmount)
        $productName = $transaction.productName
        $createdAt = $transaction.createdAt
        Write-Host "   - ${type}: ${amount} (${productName}) - ${createdAt}" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Ошибка получения истории: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 5. Проверяем финальный баланс
Write-Host "5. Проверяем финальный баланс..." -ForegroundColor Yellow
try {
    $finalBalanceResponse = Invoke-RestMethod -Uri "$baseUrl/users/$testPhone/balance" -Method GET
    Write-Host "✅ Финальный баланс: $($finalBalanceResponse.data.balance)" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка получения финального баланса: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Тестирование завершено ===" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Новый эндпоинт для списания кэшбека:" -ForegroundColor Yellow
Write-Host "POST /cashback/deduct" -ForegroundColor White
Write-Host "Body: {" -ForegroundColor White
Write-Host '  "phoneNumber": "+996701234567",' -ForegroundColor White
Write-Host '  "amount": "10.5",' -ForegroundColor White
Write-Host '  "reason": "Покупка товара"' -ForegroundColor White
Write-Host "  # reason - опционально" -ForegroundColor Gray
Write-Host "}" -ForegroundColor White
