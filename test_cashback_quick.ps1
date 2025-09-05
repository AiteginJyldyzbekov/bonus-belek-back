# Быстрый тест кешбека

Write-Host "🧪 Быстрый тест кешбека" -ForegroundColor Cyan

# Тест кешбека с известным товаром
$cashbackBody = @{
    productId = "1"
    phoneNumber = "+996701234567"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "Отправляем запрос на кешбек..." -ForegroundColor Yellow
Write-Host "Тело запроса: $cashbackBody" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/cashback/process" -Method POST -Body $cashbackBody -Headers $headers
    Write-Host "✅ Успешно!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Ошибка:" -ForegroundColor Red
    Write-Host "Статус: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Сообщение: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Тело ответа: $responseBody" -ForegroundColor Red
    }
}
