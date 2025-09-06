# Исправление проблемы CORS

## 🚨 Проблема
`auth/login/initiate` дает ошибку CORS, хотя `auth/login/admin` работает.

## 🔍 Причина
CORS был настроен только для определенных портов (3000), а запросы приходили с других адресов.

## ✅ Решение

### 1. Обновлены настройки CORS в `src/main.ts`:

```typescript
// Настройка CORS - для разработки разрешаем все
app.enableCors({
  origin: true, // Разрешаем все origin для разработки
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-User-Phone'],
});
```

### 2. Что изменилось:
- `origin: true` - разрешает запросы с любого домена
- Добавлен заголовок `X-User-Phone` в `allowedHeaders`
- Сохранены все необходимые HTTP методы

## 🧪 Тестирование

### Проверка CORS:
```bash
powershell -ExecutionPolicy Bypass -File test_cors.ps1
```

### Ручная проверка:
```bash
curl -X POST http://localhost:8080/auth/login/initiate \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"phoneNumber": "+996555123456", "name": "Test User"}'
```

## 🔧 Альтернативные настройки CORS

### Для продакшена (более безопасно):
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://yourdomain.com',
    // Добавьте ваши домены
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-User-Phone'],
});
```

### Для разработки (менее безопасно, но удобно):
```typescript
app.enableCors({
  origin: true, // Разрешает все домены
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-User-Phone'],
});
```

## 📱 Примеры запросов с фронтенда

### JavaScript fetch:
```javascript
const response = await fetch('http://localhost:8080/auth/login/initiate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phoneNumber: '+996555123456',
    name: 'Test User'
  })
});
```

### Axios:
```javascript
const response = await axios.post('http://localhost:8080/auth/login/initiate', {
  phoneNumber: '+996555123456',
  name: 'Test User'
});
```

## ⚠️ Важные моменты

1. **Перезапуск сервера** - после изменения CORS нужно перезапустить приложение
2. **Кэширование браузера** - очистите кэш браузера или используйте режим инкогнито
3. **Проверка заголовков** - убедитесь, что отправляете правильные заголовки
4. **Preflight запросы** - браузер может отправлять OPTIONS запросы перед основным

## 🎯 Результат

После исправления все эндпоинты должны работать без ошибок CORS:
- ✅ `auth/login/initiate`
- ✅ `auth/verify-otp`
- ✅ `auth/login/admin`
- ✅ `auth/registration/admin`
- ✅ Все остальные эндпоинты
