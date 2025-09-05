# Тестирование регистрации админа
$body = @{
    phoneNumber = "+996701234567"
    password = "admin123"
    name = "Test Admin"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/auth/registration/admin" -Method POST -Body $body -Headers $headers
    Write-Host "✅ Успешно! Ответ:" -ForegroundColor Green
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
