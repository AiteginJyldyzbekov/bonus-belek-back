# Тестирование AdminGuard с phoneNumber в теле запроса

Write-Host "🧪 Тестирование AdminGuard с phoneNumber в теле запроса" -ForegroundColor Cyan

# 1. Проверка здоровья подключения (без авторизации)
Write-Host "`n1. Проверка подключения к MockAPI..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/cashback/health" -Method GET
    Write-Host "✅ Подключение: $($healthResponse.message)" -ForegroundColor Green
    Write-Host "   Режим: $($healthResponse.currentMode)" -ForegroundColor Green
    Write-Host "   Статус: $($healthResponse.connected)" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка проверки здоровья: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Получение списка товаров (POST с phoneNumber в теле)
Write-Host "`n2. Получение списка товаров (POST запрос)..." -ForegroundColor Yellow
$getProductsBody = @{
    phoneNumber = "+996701234567"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $productsResponse = Invoke-RestMethod -Uri "http://localhost:8080/cashback/products" -Method POST -Body $getProductsBody -Headers $headers
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

# 3. Поиск товаров (POST с phoneNumber в теле)
Write-Host "`n3. Поиск товаров (POST запрос)..." -ForegroundColor Yellow
$searchBody = @{
    query = "iPhone"
    phoneNumber = "+996701234567"
} | ConvertTo-Json

try {
    $searchResponse = Invoke-RestMethod -Uri "http://localhost:8080/cashback/products/search" -Method POST -Body $searchBody -Headers $headers
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
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Детали: $responseBody" -ForegroundColor Red
    }
}

# 4. Тест с неправильным номером телефона (не админ)
Write-Host "`n4. Тест с неправильным номером телефона..." -ForegroundColor Yellow
$wrongPhoneBody = @{
    phoneNumber = "+996999999999"
} | ConvertTo-Json

try {
    $wrongResponse = Invoke-RestMethod -Uri "http://localhost:8080/cashback/products" -Method POST -Body $wrongPhoneBody -Headers $headers
    Write-Host "❌ ОШИБКА: Запрос прошел с неправильным номером!" -ForegroundColor Red
} catch {
    Write-Host "✅ Правильно заблокирован: $($_.Exception.Message)" -ForegroundColor Green
}

# 5. Тест без phoneNumber в теле
Write-Host "`n5. Тест без phoneNumber в теле запроса..." -ForegroundColor Yellow
$noPhoneBody = @{
    someOtherField = "test"
} | ConvertTo-Json

try {
    $noPhoneResponse = Invoke-RestMethod -Uri "http://localhost:8080/cashback/products" -Method POST -Body $noPhoneBody -Headers $headers
    Write-Host "❌ ОШИБКА: Запрос прошел без phoneNumber!" -ForegroundColor Red
} catch {
    Write-Host "✅ Правильно заблокирован: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n🎯 Тестирование AdminGuard завершено!" -ForegroundColor Cyan
