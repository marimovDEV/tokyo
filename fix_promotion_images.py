import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_api.settings')
django.setup()

from menu.models import Promotion
from django.core.files import File
import requests
from io import BytesIO

def fix_promotion_images():
    print("🖼️ Adding images to promotions...")
    
    # Yangi aksiyalar uchun rasmlar qo'shish
    promotion_images = {
        'Lunch Special': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
        'Student Discount': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        'Family Combo': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
        'Weekend Special': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop'
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

    print("🎉 Promotion images added successfully!")

if __name__ == '__main__':
    fix_promotion_images()

