# Mahsulotlarga Rasmlar Qo'shish (SSH'siz)

Agar SSH orqali serverga ulana olmasangiz, bu scriptni lokal kompyuteringizda ishga tushirishingiz mumkin.

## Talablar

1. Python 3.7+ o'rnatilgan bo'lishi kerak
2. `requests` kutubxonasi:
```bash
pip install requests
```

## Foydalanish

### 1. Scriptni ishga tushirish:

```bash
cd tokyo
python scripts/add_images_via_api.py
```

### 2. API URL'ni o'zgartirish:

Agar lokal serverda ishlatmoqchi bo'lsangiz, `add_images_via_api.py` faylida:

```python
API_URL = "http://localhost:8000/api"  # Lokal server
```

Production uchun:
```python
API_URL = "https://api.tokyokafe.uz/api"  # Production
```

## Qanday Ishlaydi

1. Script API orqali barcha mahsulotlarni oladi
2. Har bir mahsulot uchun nom bo'yicha rasm qidiradi (Unsplash)
3. Rasmlarni yuklab oladi
4. API orqali mahsulotga rasm qo'shadi

## Eslatmalar

- Internet aloqasi kerak
- API'ga kirish huquqi kerak
- Har bir mahsulot uchun 2 soniya kutadi (rate limiting)
- Rasmsiz mahsulotlar o'tkazib yuboriladi

## Muammolar

Agar xatolik bo'lsa:
1. Internet aloqasini tekshiring
2. API URL'ni tekshiring
3. `requests` kutubxonasi o'rnatilganini tekshiring

