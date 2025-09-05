# Простое тестирование кешбека без авторизации

Write-Host "🧪 Тестирование кешбека (без авторизации)" -ForegroundColor Cyan

# 1. Проверка здоровья
Write-Host "`n1. Проверка подключения..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/cashback/health" -Method GET
    Write-Host "✅ Подключение: $($healthResponse.message)" -ForegroundColor Green
    Write-Host "   Режим: $($healthResponse.currentMode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Получение списка товаров
Write-Host "`n2. Получение товаров..." -ForegroundColor Yellow
$headers = @{
    "Content-Type" = "application/json"
}

try {
    $productsResponse = Invoke-RestMethod -Uri "http://localhost:8080/cashback/products" -Method POST -Body "{}" -Headers $headers
    Write-Host "✅ Товары получены!" -ForegroundColor Green
    Write-Host "   Количество: $($productsResponse.data.Count)" -ForegroundColor Green
    
    if ($productsResponse.data.Count -gt 0) {
        $firstProduct = $productsResponse.data[0]
        Write-Host "   Первый товар: $($firstProduct.name) - $($firstProduct.price) (ID: $($firstProduct.id))" -ForegroundColor Cyan
        
        # 3. Тест кешбека с первым товаром
        Write-Host "`n3. Тест кешбека..." -ForegroundColor Yellow
        $cashbackBody = @{
            productId = $firstProduct.id
            phoneNumber = "+996701234567"
        } | ConvertTo-Json
        
        try {
            $cashbackResponse = Invoke-RestMethod -Uri "http://localhost:8080/cashback/process" -Method POST -Body $cashbackBody -Headers $headers
            Write-Host "✅ Кешбек успешно начислен!" -ForegroundColor Green
            Write-Host "   Товар: $($cashbackResponse.data.product.name)" -ForegroundColor Green
            Write-Host "   Цена: $($cashbackResponse.data.product.price)" -ForegroundColor Green
            Write-Host "   Кешбек: $($cashbackResponse.data.cashback.amount)" -ForegroundColor Green
            Write-Host "   Новый баланс: $($cashbackResponse.data.user.balance)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Ошибка кешбека: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "   Детали: $responseBody" -ForegroundColor Red
            }
        }
    }
} catch {
    Write-Host "❌ Ошибка получения товаров: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Тестирование завершено!" -ForegroundColor Cyan
