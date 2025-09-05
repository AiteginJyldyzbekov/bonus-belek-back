# Тест округления кешбека

Write-Host "🧪 Тест округления кешбека" -ForegroundColor Cyan

# Тест с товаром, который дает дробный кешбек
$cashbackBody = @{
    productId = "1"
    phoneNumber = "+996701234567"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "Отправляем запрос на кешбек..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/cashback/process" -Method POST -Body $cashbackBody -Headers $headers
    Write-Host "✅ Успешно!" -ForegroundColor Green
    Write-Host "Кешбек: $($response.data.cashback.amount)" -ForegroundColor Cyan
    Write-Host "Процент: $($response.data.cashback.percentage)%" -ForegroundColor Cyan
    Write-Host "Цена товара: $($response.data.product.price)" -ForegroundColor Cyan
    Write-Host "Новый баланс: $($response.data.user.balance)" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка:" -ForegroundColor Red
    Write-Host "Сообщение: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Тело ответа: $responseBody" -ForegroundColor Red
    }
}
