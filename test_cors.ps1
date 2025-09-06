# Тест CORS для auth/login/initiate

Write-Host "🧪 Тест CORS для auth/login/initiate" -ForegroundColor Cyan

$body = @{
    phoneNumber = "+996555123456"
    name = "Test User"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "Origin" = "http://localhost:3000"  # Имитируем запрос с фронтенда
}

Write-Host "Отправляем запрос на auth/login/initiate..." -ForegroundColor Yellow
Write-Host "Тело запроса: $body" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/auth/login/initiate" -Method POST -Body $body -Headers $headers
    Write-Host "✅ Успешно! CORS работает" -ForegroundColor Green
    Write-Host "Ответ: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка CORS:" -ForegroundColor Red
    Write-Host "Статус: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Сообщение: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Тело ответа: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Тест CORS завершен!" -ForegroundColor Cyan
