# Изменения в AdminGuard

## 🔄 Что изменилось

### До изменений:
- AdminGuard получал `phoneNumber` из заголовка `X-User-Phone`
- Эндпоинты использовали GET запросы
- Требовался заголовок для авторизации

### После изменений:
- AdminGuard получает `phoneNumber` из тела POST запроса
- Все защищенные эндпоинты используют POST запросы
- `phoneNumber` передается в JSON теле запроса

## 📝 Обновленные эндпоинты

### 1. Получение списка товаров
**Было:**
```bash
GET /cashback/products
Headers: X-User-Phone: +996701234567
```

**Стало:**
```bash
POST /cashback/products
Content-Type: application/json
Body: {"phoneNumber": "+996701234567"}
```

### 2. Поиск товаров
**Было:**
```bash
GET /cashback/products/search?query=iPhone
Headers: X-User-Phone: +996701234567
```

**Стало:**
```bash
POST /cashback/products/search
Content-Type: application/json
Body: {
  "query": "iPhone",
  "phoneNumber": "+996701234567"
}
```

### 3. Начисление кешбека
**Было:**
```bash
POST /cashback/process
Headers: X-User-Phone: +996701234567
Body: {"productId": "uuid", "phoneNumber": "+996701234567"}
```

**Стало:**
```bash
POST /cashback/process
Content-Type: application/json
Body: {"productId": "uuid", "phoneNumber": "+996701234567"}
```

## 🔧 Технические детали

### Обновленные файлы:

1. **`src/guards/admin.guard.ts`**
   - Изменен способ получения `phoneNumber`: `request.body?.phoneNumber`
   - Обновлено сообщение об ошибке

2. **`src/cashback/dto/cashback.dto.ts`**
   - Добавлен `GetProductsDto` с полем `phoneNumber`
   - Обновлен `SearchProductsDto` с полем `phoneNumber`

3. **`src/cashback/cashback.controller.ts`**
   - Изменены методы с GET на POST
   - Добавлены DTO для валидации тела запроса

## ✅ Преимущества изменений

1. **Единообразие** - все админские эндпоинты используют POST
2. **Безопасность** - данные передаются в теле запроса, а не в заголовках
3. **Валидация** - полная валидация входных данных через DTO
4. **Простота** - не нужно помнить про заголовки

## 🧪 Тестирование

Используйте обновленный тестовый скрипт:
```bash
powershell -ExecutionPolicy Bypass -File test_admin_guard.ps1
```

Скрипт проверяет:
- ✅ Успешную авторизацию с правильным номером
- ❌ Блокировку с неправильным номером
- ❌ Блокировку без phoneNumber в теле
- ✅ Работу всех эндпоинтов

## 🔄 Обратная совместимость

⚠️ **ВНИМАНИЕ:** Эти изменения нарушают обратную совместимость!

Если у вас есть фронтенд или клиенты, которые используют старые эндпоинты, их нужно обновить:

1. Изменить GET запросы на POST
2. Убрать заголовок `X-User-Phone`
3. Добавить `phoneNumber` в тело запроса
4. Добавить `Content-Type: application/json`

## 📋 Чек-лист для обновления клиентов

- [ ] Изменить GET `/cashback/products` на POST
- [ ] Изменить GET `/cashback/products/search` на POST
- [ ] Убрать заголовок `X-User-Phone`
- [ ] Добавить `phoneNumber` в JSON тело запроса
- [ ] Добавить `Content-Type: application/json`
- [ ] Обновить обработку ошибок (новые сообщения)
- [ ] Протестировать все сценарии
