# Интеграция с MockAPI

## 🎯 Обзор

Система кешбека теперь поддерживает работу с MockAPI вместо Supabase для получения товаров. Это позволяет работать без оплаченного аккаунта Supabase.

## 🔄 Переключение между MockAPI и Supabase

### Текущий режим: MockAPI
По умолчанию система настроена на работу с MockAPI:
- URL: `https://68bb5f3d84055bce63f1cbb7.mockapi.io/products`
- Структура товара: `{ id, name, price }`

### Как переключиться на Supabase:

1. **В файле `src/supabase/supabase.service.ts`:**
   ```typescript
   // Изменить флаг
   private readonly useMockAPI = false; // true для MockAPI, false для Supabase
   
   // Раскомментировать инициализацию Supabase
   const supabaseUrl = process.env.SUPABASE_URL;
   const supabaseKey = process.env.SUPABASE_KEY;
   
   if (!supabaseUrl || !supabaseKey) {
     throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined in environment variables');
   }
   
   this.supabase = createClient(supabaseUrl, supabaseKey);
   ```

2. **Раскомментировать код Supabase в методах:**
   - `getAllProducts()`
   - `getProductById()`
   - `searchProducts()`
   - `getProductsByCategory()`
   - `getProductsInPriceRange()`
   - `testConnection()`

3. **Закомментировать код MockAPI в тех же методах**

## 📊 Структура данных

### MockAPI:
```json
{
  "id": "1",
  "name": "iPhone 15 Pro",
  "price": 999.99
}
```

### Supabase (когда будете переключаться):
```json
{
  "id": "uuid",
  "name": "iPhone 15 Pro", 
  "price": 999.99,
  "description": "Latest iPhone model",
  "image": "https://example.com/iphone15.jpg",
  "category": "Smartphones"
}
```

## 🧪 Тестирование

### Проверка подключения:
```bash
curl -X GET http://localhost:8080/cashback/health
```

**Ответ при работе с MockAPI:**
```json
{
  "statusCode": 200,
  "message": "MockAPI connection is healthy",
  "connected": true,
  "currentMode": "MockAPI",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Получение товаров:
```bash
curl -X GET http://localhost:8080/cashback/products \
  -H "X-User-Phone: +996701234567"
```

### Поиск товаров:
```bash
curl -X GET "http://localhost:8080/cashback/products/search?query=iPhone" \
  -H "X-User-Phone: +996701234567"
```

## 🔧 API методы

### Основные методы:
- `getAllProducts()` - получить все товары
- `getProductById(id)` - получить товар по ID
- `searchProducts(query)` - поиск товаров по названию

### Дополнительные методы:
- `getProductsByCategory(category)` - товары по категории (работает с MockAPI)
- `getProductsInPriceRange(min, max)` - товары по ценовому диапазону
- `testConnection()` - проверка подключения

### Управление режимом:
- `setUseMockAPI(boolean)` - переключение режима
- `getCurrentMode()` - получение текущего режима

## 🚀 Преимущества MockAPI

1. **Бесплатно** - не требует оплаченного аккаунта
2. **Быстро** - мгновенное получение данных
3. **Просто** - минимальная настройка
4. **Готово к использованию** - данные уже есть

## ⚠️ Ограничения MockAPI

1. **Только чтение** - нельзя изменять данные
2. **Ограниченная структура** - только `id`, `name`, `price`
3. **Нет фильтрации на сервере** - поиск происходит локально
4. **Нет категорий** - поле `category` отсутствует

## 🔄 Возврат к Supabase

Когда будете готовы переключиться на Supabase:

1. **Оплатите аккаунт Supabase**
2. **Создайте таблицу products** с нужной структурой
3. **Настройте переменные окружения:**
   ```env
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_KEY="your-supabase-anon-key"
   ```
4. **Измените флаг `useMockAPI = false`**
5. **Раскомментируйте код Supabase**

## 📝 Логирование

Система логирует:
- Режим работы (MockAPI/Supabase)
- Ошибки подключения
- Детали запросов
- Результаты операций

## 🎯 Заключение

MockAPI идеально подходит для:
- Разработки и тестирования
- MVP версий
- Демонстраций
- Когда Supabase недоступен

Supabase лучше для:
- Продакшена
- Сложных запросов
- Больших объемов данных
- Требований к безопасности
