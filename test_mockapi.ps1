# Тестирование MockAPI интеграции

Write-Host "🧪 Тестирование MockAPI интеграции" -ForegroundColor Cyan

# 1. Проверка здоровья подключения
Write-Host "`n1. Проверка подключения к MockAPI..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/cashback/health" -Method GET
    Write-Host "✅ Подключение: $($healthResponse.message)" -ForegroundColor Green
    Write-Host "   Режим: $($healthResponse.currentMode)" -ForegroundColor Green
    Write-Host "   Статус: $($healthResponse.connected)" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка проверки здоровья: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Получение списка товаров (требует админа)
Write-Host "`n2. Получение списка товаров..." -ForegroundColor Yellow
$headers = @{
    "X-User-Phone" = "+996701234567"
}

try {
    $productsResponse = Invoke-RestMethod -Uri "http://localhost:8080/cashback/products" -Method GET -Headers $headers
    Write-Host "✅ Товары получены успешно!" -ForegroundColor Green
    Write-Host "   Количество товаров: $($productsResponse.data.Count)" -ForegroundColor Green
    
    # Показываем первые 3 товара
    Write-Host "`n   Первые товары:" -ForegroundColor Cyan
    for ($i = 0; $i -lt [Math]::Min(3, $productsResponse.data.Count); $i++) {
        $product = $productsResponse.data[$i]
        Write-Host "   - $($product.name): $($product.price) (ID: $($product.id))" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Ошибка получения товаров: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Детали: $responseBody" -ForegroundColor Red
    }
}

# 3. Поиск товаров
Write-Host "`n3. Поиск товаров..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-RestMethod -Uri "http://localhost:8080/cashback/products/search?query=iPhone" -Method GET -Headers $headers
    Write-Host "✅ Поиск выполнен!" -ForegroundColor Green
    Write-Host "   Найдено товаров: $($searchResponse.data.Count)" -ForegroundColor Green
    
    if ($searchResponse.data.Count -gt 0) {
        Write-Host "   Найденные товары:" -ForegroundColor Cyan
        foreach ($product in $searchResponse.data) {
            Write-Host "   - $($product.name): $($product.price)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Ошибка поиска: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Тестирование завершено!" -ForegroundColor Cyan
