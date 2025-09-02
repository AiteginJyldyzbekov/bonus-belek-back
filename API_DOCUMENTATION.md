# API Documentation - Phone Number Authentication

## Overview
Система аутентификации по номеру телефона с использованием OTP кодов.

## Endpoints

### 1. Инициация входа (отправка OTP)
**POST** `/auth/login/initiate`

**Request Body:**
```json
{
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "OTP sent successfully",
  "phoneNumber": "+1234567890",
  "isNewUser": true,
  "otp": "123456"
}
```

### 2. Подтверждение OTP
**POST** `/auth/verify-otp`

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "otpCode": "123456"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "user": {
    "id": 1,
    "phoneNumber": "+1234567890",
    "name": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "isNewUser": true
}
```

## Особенности

### Валидация номера телефона
- Поддерживает международный формат с `+` или без
- Минимум 10 цифр, максимум 15 цифр
- Примеры: `+1234567890`, `1234567890`

### OTP Коды
- 6-значные цифровые коды
- Действительны 5 минут
- Максимум 3 попытки генерации за 5 минут
- Одноразовое использование

### Пользователи
- Автоматическое создание при первом входе
- Поле `name` опционально (может быть null)
- Пользователь считается новым, если `name` не заполнено

## Ошибки

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid phone number format"
}
```

### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Too many OTP requests. Please wait before requesting another code."
}
```

## Пример использования

1. **Отправка OTP:**
   ```bash
   curl -X POST http://localhost:8080/auth/login/initiate \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber": "+1234567890"}'
   ```

2. **Подтверждение OTP:**
   ```bash
   curl -X POST http://localhost:8080/auth/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber": "+1234567890", "otpCode": "123456"}'
   ```

## Логика работы

1. **Первый вход пользователя:**
   - Отправляется OTP на номер телефона
   - Создается новый пользователь в базе данных
   - `isNewUser: true` в ответе

2. **Повторный вход:**
   - Отправляется OTP на номер телефона
   - Находится существующий пользователь
   - `isNewUser: false` если имя заполнено, иначе `true`

3. **Подтверждение OTP:**
   - Проверяется валидность OTP кода
   - Возвращается информация о пользователе
   - OTP помечается как использованный
