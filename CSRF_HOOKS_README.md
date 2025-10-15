# CSRF Hook-lar - React + Django loyihasi uchun

Bu loyiha CSRF token muammosini hal qilish uchun yaratilgan hook-larni o'z ichiga oladi.

## 🚀 **Asosiy Xususiyatlar**

- ✅ **Avtomatik CSRF token olish** - Cookie va API orqali
- ✅ **Avtomatik header qo'shish** - Barcha POST/PUT/DELETE so'rovlar uchun
- ✅ **FormData qo'llab-quvvatlash** - Fayl yuklash uchun
- ✅ **Error handling** - Batafsil xato xabarlari
- ✅ **Loading states** - CSRF token yuklanayotganda ko'rsatish
- ✅ **TypeScript qo'llab-quvvatlash** - To'liq tip xavfsizligi

## 📁 **Fayl Tuzilishi**

```
frontend/
├── hooks/
│   ├── use-csrf.ts          # Asosiy CSRF hook
│   └── use-api.ts           # API client hook
├── app/admin/
│   ├── use-admin-api.ts     # Admin API hook
│   └── page.tsx             # Admin page (yangilangan)
└── examples/
    └── csrf-usage-examples.tsx  # Ishlatish misollari
```

## 🔧 **Qanday Ishlatish**

### 1. **Asosiy CSRF Hook**

```typescript
import { useCSRF } from '@/hooks/use-csrf';

function MyComponent() {
  const { makeAuthenticatedRequest, isLoading } = useCSRF();

  const handleSubmit = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        'http://localhost:8000/api/menu-items/',
        {
          method: 'POST',
          body: JSON.stringify({ name: 'Test Item' }),
        }
      );
      
      if (response.ok) {
        console.log('Success!');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {isLoading && <p>Loading CSRF token...</p>}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

### 2. **API Client Hook**

```typescript
import { useApiClient } from '@/hooks/use-api';

function MyComponent() {
  const api = useApiClient();

  const handleCreate = async () => {
    try {
      const result = await api.post('/menu-items/', {
        name: 'Test Item',
        price: 25000,
      });
      console.log('Created:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {api.isLoading && <p>Loading...</p>}
      <button onClick={handleCreate}>Create Item</button>
    </div>
  );
}
```

### 3. **Admin API Hook**

```typescript
import { useAdminApi } from '@/app/admin/use-admin-api';

function AdminComponent() {
  const adminApi = useAdminApi();

  const handleCreateCategory = async () => {
    try {
      const category = await adminApi.createCategory({
        name: 'Test Category',
        name_uz: 'Test Kategoriya',
        name_ru: 'Тест Категория',
        icon: '🧪',
      });
      console.log('Category created:', category);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {adminApi.isLoading && <p>Loading...</p>}
      <button onClick={handleCreateCategory}>Create Category</button>
    </div>
  );
}
```

### 4. **Fayl Yuklash (FormData)**

```typescript
import { useApiClient } from '@/hooks/use-api';

function FileUploadComponent() {
  const api = useApiClient();

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('name', 'Test Item');
      formData.append('image_file', file);

      const result = await api.postFormData('/menu-items/', formData);
      console.log('Uploaded:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          handleFileUpload(file);
        }
      }}
    />
  );
}
```

## 🛠 **API Methods**

### **useCSRF Hook**
- `getCSRFToken()` - CSRF token olish
- `getCSRFHeaders()` - Header-lar tayyorlash
- `makeAuthenticatedRequest()` - Autentifikatsiya bilan so'rov yuborish

### **useApiClient Hook**
- `get<T>(endpoint)` - GET so'rov
- `post<T>(endpoint, data)` - POST so'rov
- `put<T>(endpoint, data)` - PUT so'rov
- `patch<T>(endpoint, data)` - PATCH so'rov
- `delete(endpoint)` - DELETE so'rov
- `postFormData<T>(endpoint, formData)` - FormData bilan POST
- `patchFormData<T>(endpoint, formData)` - FormData bilan PATCH

### **useAdminApi Hook**
- `getCategories()` - Kategoriyalar olish
- `createCategory(category)` - Kategoriya yaratish
- `updateCategory(id, category)` - Kategoriya yangilash
- `deleteCategory(id)` - Kategoriya o'chirish
- `getMenuItems()` - Taomlar olish
- `createMenuItem(item)` - Taom yaratish
- `updateMenuItem(id, item)` - Taom yangilash
- `deleteMenuItem(id)` - Taom o'chirish
- `getPromotions()` - Aksiyalar olish
- `createPromotion(promotion)` - Aksiya yaratish
- `updatePromotion(id, promotion)` - Aksiya yangilash
- `deletePromotion(id)` - Aksiya o'chirish

## ⚙️ **Sozlash**

### **Django Backend**
```python
# settings.py
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# views.py
@method_decorator(csrf_exempt, name='dispatch')
class CategoryListView(generics.ListCreateAPIView):
    # ... view code
```

### **Frontend Environment**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🔍 **Debugging**

### **CSRF Token Tekshirish**
```typescript
import { useCSRF } from '@/hooks/use-csrf';

function DebugComponent() {
  const { csrfToken } = useCSRF();

  return (
    <div>
      <p>CSRF Token: {csrfToken}</p>
    </div>
  );
}
```

### **Browser DevTools**
1. **Application → Cookies** - `csrftoken` cookie borligini tekshiring
2. **Network → Headers** - `X-CSRFToken` header yuborilayotganini tekshiring
3. **Console** - Xato xabarlarini ko'ring

## 🚨 **Umumiy Xatolar**

### **403 Forbidden - CSRF Failed**
- CSRF token yo'q yoki noto'g'ri
- Cookie `credentials: 'include'` bilan yuborilmayapti
- Django views-da `@csrf_exempt` yo'q

### **CORS Error**
- `CORS_ALLOW_CREDENTIALS = True` yo'q
- `CORS_ALLOWED_ORIGINS` to'g'ri sozlanmagan

### **Network Error**
- Backend server ishlamayapti
- API URL noto'g'ri

## 📝 **Misollar**

Batafsil misollar uchun `examples/csrf-usage-examples.tsx` faylini ko'ring.

## 🤝 **Yordam**

Agar muammo bo'lsa:
1. Browser DevTools-da Network va Console ni tekshiring
2. Django server loglarini ko'ring
3. CSRF token endpoint ishlayotganini tekshiring: `GET /api/csrf/`

---

**Rahmat! Endi sizning loyihangizda CSRF token muammosi yo'q! 🎉**
