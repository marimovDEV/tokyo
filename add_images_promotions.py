import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
django.setup()

from menu.models import MenuItem, Promotion
from django.core.files import File
import requests
from io import BytesIO
from django.utils import timezone
from datetime import timedelta

def add_images_and_promotions():
    print("🖼️ Adding images to menu items...")
    
    # Menu items uchun rasmlar
    menu_images = {
        'California Roll': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        'Salmon Roll': 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
        'Dragon Roll': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        'Tonkotsu Ramen': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
        'Miso Ramen': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop',
        'Gyoza': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop',
        'Edamame': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        'Green Tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
        'Sake': 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400&h=300&fit=crop',
        'Mochi Ice Cream': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
        'Matcha Tiramisu': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop'
    }

    # Menu items'ga rasmlar qo'shish
    for item_name, image_url in menu_images.items():
        try:
            item = MenuItem.objects.get(name=item_name)
            if not item.image:
                response = requests.get(image_url, timeout=10)
                if response.status_code == 200:
                    image_file = BytesIO(response.content)
                    filename = f"{item_name.lower().replace(' ', '_')}.jpg"
                    item.image.save(filename, File(image_file), save=True)
                    print(f"✅ Added image for {item_name}")
                else:
                    print(f"❌ Failed to download image for {item_name}")
            else:
                print(f"⏭️  {item_name} already has an image")
        except MenuItem.DoesNotExist:
            print(f"❌ Menu item {item_name} not found")
        except Exception as e:
            print(f"❌ Error adding image for {item_name}: {e}")

    print("\n🎯 Adding images to promotions...")
    
    # Promotion rasmlari
    promotion_images = {
        'Sushi Combo': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        'Ramen Special': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
        'Happy Hour': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop'
    }

    for promo_name, image_url in promotion_images.items():
        try:
            promo = Promotion.objects.get(title=promo_name)
            if not promo.image:
                response = requests.get(image_url, timeout=10)
                if response.status_code == 200:
                    image_file = BytesIO(response.content)
                    filename = f"{promo_name.lower().replace(' ', '_')}.jpg"
                    promo.image.save(filename, File(image_file), save=True)
                    print(f"✅ Added image for promotion: {promo_name}")
                else:
                    print(f"❌ Failed to download image for promotion: {promo_name}")
            else:
                print(f"⏭️  Promotion {promo_name} already has an image")
        except Promotion.DoesNotExist:
            print(f"❌ Promotion {promo_name} not found")
        except Exception as e:
            print(f"❌ Error adding image for promotion {promo_name}: {e}")

    print("\n🎉 Adding new promotions...")
    
    # Yangi aksiyalar qo'shish
    new_promotions = [
        {
            'title': 'Weekend Special',
            'title_uz': 'Dam Olish Kuni Maxsus',
            'title_ru': 'Выходной Специальный',
            'description': '50% off on all sushi rolls every weekend',
            'description_uz': 'Har dam olish kunida barcha sushi rolllardan 50% chegirma',
            'description_ru': '50% скидка на все роллы каждые выходные',
            'discount_type': 'percentage',
            'discount_percentage': 50,
            'start_date': timezone.now(),
            'end_date': timezone.now() + timedelta(days=365),
            'is_active': True
        },
        {
            'title': 'Family Combo',
            'title_uz': 'Oila Kombo',
            'title_ru': 'Семейный Комбо',
            'description': '4 people meal for the price of 3',
            'description_uz': '4 kishi uchun taom 3 kishi narxida',
            'description_ru': 'Еда на 4 человек по цене за 3',
            'discount_type': 'percentage',
            'discount_percentage': 25,
            'start_date': timezone.now(),
            'end_date': timezone.now() + timedelta(days=365),
            'is_active': True
        },
        {
            'title': 'Student Discount',
            'title_uz': 'Talaba Chegirmasi',
            'title_ru': 'Студенческая Скидка',
            'description': '15% off for students with valid ID',
            'description_uz': 'Haqiqiy ID bilan talabalar uchun 15% chegirma',
            'description_ru': '15% скидка для студентов с действительным ID',
            'discount_type': 'percentage',
            'discount_percentage': 15,
            'start_date': timezone.now(),
            'end_date': timezone.now() + timedelta(days=365),
            'is_active': True
        },
        {
            'title': 'Lunch Special',
            'title_uz': 'Tushlik Maxsus',
            'title_ru': 'Обеденный Специальный',
            'description': 'Free soup with any main dish from 12-3 PM',
            'description_uz': '12:00-15:00 orasida har qanday asosiy taom bilan bepul sho\'rva',
            'description_ru': 'Бесплатный суп с любым основным блюдом с 12:00 до 15:00',
            'discount_type': 'fixed',
            'discount_amount': 15000,
            'start_date': timezone.now(),
            'end_date': timezone.now() + timedelta(days=365),
            'is_active': True
        }
    ]

    for promo_data in new_promotions:
        if not Promotion.objects.filter(title=promo_data['title']).exists():
            Promotion.objects.create(**promo_data)
            print(f"✅ Created new promotion: {promo_data['title']}")
        else:
            print(f"⏭️  Promotion {promo_data['title']} already exists")

    print("\n🎉 All images and promotions added successfully!")

if __name__ == '__main__':
    add_images_and_promotions()

