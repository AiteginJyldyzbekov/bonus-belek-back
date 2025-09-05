# Cashback System API Documentation

## Overview
Система кешбека для начисления бонусов клиентам при покупке товаров.

## Аутентификация
Для доступа к админским эндпоинтам необходимо передавать номер телефона админа в заголовке:
```
X-User-Phone: +996701234567
```

## Endpoints

### 1. Проверка здоровья Supabase
**GET** `/cashback/health`

**Response:**
```json
{
  "statusCode": 200,
  "message": "Supabase connection is healthy",
  "supabaseConnected": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Получение списка товаров (только для админов)
**GET** `/cashback/products`

**Headers:**
```
X-User-Phone: +996701234567
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "uuid-from-supabase",
      "name": "iPhone 15 Pro",
      "price": 999.99,
      "description": "Latest iPhone model",
      "image": "https://example.com/iphone15.jpg",
      "category": "Smartphones"
    }
  ]
}
```

### 3. Поиск товаров (только для админов)
**GET** `/cashback/products/search?query=iPhone`

**Headers:**
```
X-User-Phone: +996701234567
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Products search completed",
  "data": [
    {
      "id": "uuid-from-supabase",
      "name": "iPhone 15 Pro",
      "price": 999.99,
      "description": "Latest iPhone model",
      "image": "https://example.com/iphone15.jpg",
      "category": "Smartphones"
    }
  ]
}
```

### 4. Начисление кешбека (только для админов)
**POST** `/cashback/process`

**Headers:**
```
X-User-Phone: +996701234567
```

**Request Body:**
```json
{
  "productId": "uuid-from-supabase",
  "phoneNumber": "+996701234567"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Cashback processed successfully",
  "data": {
    "product": {
      "id": "uuid-from-supabase",
      "name": "iPhone 15 Pro",
      "price": 999.99
    },
    "cashback": {
      "amount": 29.9997,
      "percentage": 3
    },
    "user": {
      "id": 1,
      "phoneNumber": "+996701234567",
      "name": "John Doe",
      "balance": 29.9997
    },
    "transaction": {
      "id": 1,
      "cashbackAmount": 29.9997,
      "balanceBefore": 0,
      "balanceAfter": 29.9997,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 5. Получение баланса пользователя
**GET** `/users/+996701234567/balance`

**Response:**
```json
{
  "phoneNumber": "+996701234567",
  "balance": 29.9997,
  "name": "John Doe"
}
```

### 6. Получение истории транзакций
**GET** `/users/+996701234567/transactions`

**Response:**
```json
{
  "phoneNumber": "+996701234567",
  "name": "John Doe",
  "transactions": [
    {
      "id": 1,
      "productId": "uuid-from-supabase",
      "productName": "iPhone 15 Pro",
      "productPrice": 999.99,
      "cashbackAmount": 29.9997,
      "balanceBefore": 0,
      "balanceAfter": 29.9997,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 7. Назначение роли пользователю
**POST** `/users/+996701234567/role`

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "id": 1,
  "phoneNumber": "+996701234567",
  "name": "John Doe",
  "role": "ADMIN",
  "balance": 29.9997,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Особенности

### Роли пользователей
- **CLIENT** - обычные пользователи (по умолчанию)
- **ADMIN** - администраторы, могут начислять кешбек

### Кешбек
- 3% от стоимости товара
- Начисляется автоматически при обработке
- Сохраняется полная история транзакций

### Безопасность
- Только админы могут начислять кешбек
- Проверка роли через заголовок `X-User-Phone`
- Валидация формата номера телефона

### Supabase интеграция
- Подключение к существующей таблице `products`
- Гибкая структура данных (поддерживает дополнительные поля)
- Автоматическая обработка ошибок подключения

## Пример использования

1. **Проверить подключение к Supabase:**
   ```bash
   curl -X GET http://localhost:8080/cashback/health
   ```

2. **Назначить пользователя админом:**
   ```bash
   curl -X POST http://localhost:8080/users/+996701234567/role \
     -H "Content-Type: application/json" \
     -d '{"role": "ADMIN"}'
   ```

3. **Получить список товаров:**
   ```bash
   curl -X GET http://localhost:8080/cashback/products \
     -H "X-User-Phone: +996701234567"
   ```

4. **Начислить кешбек:**
   ```bash
   curl -X POST http://localhost:8080/cashback/process \
     -H "Content-Type: application/json" \
     -H "X-User-Phone: +996701234567" \
     -d '{"productId": "uuid-from-supabase", "phoneNumber": "+996701234567"}'
   ```

5. **Проверить баланс:**
   ```bash
   curl -X GET http://localhost:8080/users/+996701234567/balance
   ```

## Ошибки

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Phone number must be in valid format (e.g., +996701234567)"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Failed to fetch products from database"
}
```
