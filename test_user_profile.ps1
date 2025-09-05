# Тест получения полного профиля пользователя

Write-Host "🧪 Тест получения полного профиля пользователя" -ForegroundColor Cyan

$phoneNumber = "+996701234567"

Write-Host "`n1. Получение профиля пользователя: $phoneNumber" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/users/$phoneNumber/profile" -Method GET
    Write-Host "✅ Профиль получен успешно!" -ForegroundColor Green
    
    # Основная информация о пользователе
    Write-Host "`n👤 Информация о пользователе:" -ForegroundColor Cyan
    Write-Host "   ID: $($response.data.user.id)" -ForegroundColor White
    Write-Host "   Имя: $($response.data.user.name)" -ForegroundColor White
    Write-Host "   Телефон: $($response.data.user.phoneNumber)" -ForegroundColor White
    Write-Host "   Роль: $($response.data.user.role)" -ForegroundColor White
    Write-Host "   Баланс: $($response.data.user.balance)" -ForegroundColor White
    Write-Host "   Дата регистрации: $($response.data.user.createdAt)" -ForegroundColor White
    
    # Статистика
    Write-Host "`n📊 Статистика:" -ForegroundColor Cyan
    Write-Host "   Всего транзакций: $($response.data.statistics.totalTransactions)" -ForegroundColor White
    Write-Host "   Всего кешбека заработано: $($response.data.statistics.totalCashbackEarned)" -ForegroundColor White
    Write-Host "   Всего потрачено: $($response.data.statistics.totalSpent)" -ForegroundColor White
    Write-Host "   Средний кешбек за транзакцию: $($response.data.statistics.averageCashbackPerTransaction)" -ForegroundColor White
    Write-Host "   Последняя транзакция: $($response.data.statistics.lastTransactionDate)" -ForegroundColor White
    
    # Топ товары
    if ($response.data.topProducts.Count -gt 0) {
        Write-Host "`n🏆 Топ товары:" -ForegroundColor Cyan
        foreach ($product in $response.data.topProducts) {
            Write-Host "   - $($product.name): $($product.count) покупок, потрачено: $($product.totalSpent), кешбек: $($product.totalCashback)" -ForegroundColor White
        }
    }
    
    # Последние транзакции
    if ($response.data.recentTransactions.Count -gt 0) {
        Write-Host "`n📝 Последние транзакции:" -ForegroundColor Cyan
        for ($i = 0; $i -lt [Math]::Min(5, $response.data.recentTransactions.Count); $i++) {
            $transaction = $response.data.recentTransactions[$i]
            Write-Host "   - $($transaction.productName): $($transaction.productPrice) → кешбек: $($transaction.cashbackAmount)" -ForegroundColor White
        }
    }
    
} catch {
    Write-Host "❌ Ошибка получения профиля: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Детали: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Тестирование профиля завершено!" -ForegroundColor Cyan
