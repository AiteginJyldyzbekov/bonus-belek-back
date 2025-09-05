# Тестирование регистрации админа

## 🔍 Диагностика ошибки 500

### 1. Запустите приложение с логированием:
```bash
pnpm run start:dev
```

### 2. Попробуйте зарегистрировать админа:
```bash
curl -X POST http://localhost:8080/auth/registration/admin \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+996701234567",
    "password": "admin123",
    "name": "Test Admin"
  }'
```

### 3. Проверьте логи в консоли:
- Должны появиться сообщения о попытке создания пользователя
- Должны быть детали данных пользователя
- При ошибке - код ошибки базы данных и метаданные

## 🚨 Возможные причины ошибки 500:

### 1. **Проблема с enum в базе данных:**
```sql
-- Проверьте, что enum UserRole существует
SELECT enumlabel FROM pg_enum WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'userrole'
);
```

### 2. **Проблема с миграцией:**
```bash
# Проверьте статус миграций
npx prisma migrate status

# Если нужно, примените миграции заново
npx prisma migrate reset
npx prisma migrate dev
```

### 3. **Проблема с подключением к БД:**
```bash
# Проверьте подключение
npx prisma db push --preview-feature
```

## 🧪 Тестовые данные:

### Валидный запрос:
```json
{
  "phoneNumber": "+996701234567",
  "password": "admin123",
  "name": "Test Admin"
}
```

### Проверка валидации:
```json
{
  "phoneNumber": "invalid-phone",
  "password": "",
  "name": ""
}
```

## 📝 Что проверять в логах:

1. **Успешные операции:**
   - "Attempting to create admin user: +996701234567"
   - "Creating user with data: {...}"
   - "User created successfully with ID: X"

2. **Ошибки валидации:**
   - "Phone number must be in valid format"
   - "password should not be empty"
   - "name should not be empty"

3. **Ошибки базы данных:**
   - "Database error code: P2002" (уникальность)
   - "Database error code: P2000" (длина поля)
   - "Database error code: P2003" (внешний ключ)

## 🔧 Быстрое исправление:

Если проблема в enum, попробуйте:

```bash
# 1. Сбросить базу данных
npx prisma migrate reset

# 2. Применить миграции заново
npx prisma migrate dev

# 3. Перегенерировать клиент
npx prisma generate

# 4. Перезапустить приложение
pnpm run start:dev
```

## 📊 Ожидаемый результат:

При успешной регистрации:
```json
{
  "message": "Admin successfully created",
  "user": {
    "id": 1,
    "phoneNumber": "+996701234567",
    "name": "Test Admin",
    "role": "ADMIN"
  }
}
```
