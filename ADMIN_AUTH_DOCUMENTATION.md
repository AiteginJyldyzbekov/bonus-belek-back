# Admin Authentication API Documentation

## Overview
Простая система регистрации и входа для администраторов без сложной защиты.

## Endpoints

### 1. Регистрация админа
**POST** `/auth/registration/admin`

**Request Body:**
```json
{
  "phoneNumber": "+996701234567",
  "password": "admin123",
  "name": "Admin User"
}
```

**Response:**
```json
{
  "message": "Admin successfully created",
  "user": {
    "id": 1,
    "phoneNumber": "+996701234567",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

### 2. Вход админа
**POST** `/auth/login/admin`

**Request Body:**
```json
{
  "phoneNumber": "+996701234567",
  "password": "admin123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Admin login successful",
  "user": {
    "id": 1,
    "phoneNumber": "+996701234567",
    "name": "Admin User",
    "role": "ADMIN",
    "balance": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Особенности

### Безопасность
- **Без хеширования** - пароли хранятся в открытом виде
- **Без JWT токенов** - простая проверка логин/пароль
- **Без Guards** - прямая проверка в сервисе

### Валидация
- Номер телефона должен соответствовать формату: `+996701234567`
- Пароль обязателен
- Имя пользователя обязательно

### Роли
- **ADMIN** - администраторы с доступом к системе кешбека
- **CLIENT** - обычные пользователи (по умолчанию)

## Пример использования

### 1. Создать админа:
```bash
curl -X POST http://localhost:8080/auth/registration/admin \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+996701234567",
    "password": "admin123",
    "name": "Admin User"
  }'
```

### 2. Войти как админ:
```bash
curl -X POST http://localhost:8080/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+996701234567",
    "password": "admin123"
  }'
```

### 3. Использовать админские права для кешбека:
```bash
curl -X GET http://localhost:8080/cashback/products \
  -H "X-User-Phone: +996701234567"
```

## Ошибки

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Phone number must be in valid format (e.g., +996701234567)"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User with this phone number already exists"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid phone number or password"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied. Admin role required"
}
```

## Структура базы данных

### Таблица User:
```sql
- id (Int) - уникальный идентификатор
- phoneNumber (String) - номер телефона (уникальный)
- name (String) - имя пользователя
- password (String) - пароль (для админов)
- role (UserRole) - роль: CLIENT или ADMIN
- balance (Float) - баланс бонусов
- createdAt (DateTime) - дата создания
- updatedAt (DateTime) - дата обновления
```

## Логика работы

### Регистрация админа:
1. Проверка формата номера телефона
2. Проверка, что пользователь не существует
3. Создание пользователя с ролью ADMIN
4. Возврат данных пользователя (без пароля)

### Вход админа:
1. Поиск пользователя по номеру телефона
2. Проверка, что пользователь имеет роль ADMIN
3. Проверка пароля (простое сравнение)
4. Возврат данных пользователя при успешном входе

## Примечания

- **Только для разработки** - не используйте в продакшене без дополнительной защиты
- **Пароли в открытом виде** - легко читаются в базе данных
- **Простая аутентификация** - без сессий и токенов
- **Быстрая настройка** - для MVP и тестирования
