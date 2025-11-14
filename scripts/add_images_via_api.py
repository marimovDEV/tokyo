"""
Script to add images to products via API (can run locally)
Usage: python scripts/add_images_via_api.py
"""
import requests
import time
import sys
import os

# Add parent directory to path to import from lib
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

API_URL = "https://api.tokyokafe.uz/api"  # Production API
# API_URL = "http://localhost:8000/api"  # Local API (if running locally)


def get_menu_items():
    """Get all menu items from API"""
    try:
        response = requests.get(f"{API_URL}/menu-items/?show_all=true", timeout=30)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error fetching menu items: {response.status_code}")
            return []
    except Exception as e:
        print(f"Error: {e}")
        return []


def get_image_url(search_term):
    """Get image URL from Unsplash Source API"""
    try:
        url = f"https://source.unsplash.com/800x800/?food,{search_term}"
        response = requests.head(url, allow_redirects=True, timeout=10)
        if response.status_code == 200:
            final_url = response.url
            if 'unsplash.com' in final_url:
                return final_url
    except Exception as e:
        print(f"  Warning: Error getting image for {search_term}: {e}")
    return None


def download_image(image_url):
    """Download image from URL"""
    try:
        response = requests.get(image_url, timeout=15, stream=True)
        if response.status_code == 200:
            return response.content
    except Exception as e:
        print(f"  Warning: Error downloading image: {e}")
    return None


def update_menu_item_image(item_id, image_data, filename):
    """Update menu item image via API"""
    try:
        # Use PATCH to update only the image field
        url = f"{API_URL}/menu-items/{item_id}/"
        
        # Prepare multipart form data
        files = {
            'image': (filename, image_data, 'image/jpeg')
        }
        
        response = requests.patch(url, files=files, timeout=30)
        if response.status_code == 200:
            return True
        else:
            print(f"  Error: API returned {response.status_code}")
            print(f"  Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"  Error updating image: {e}")
        return False


def get_search_term(item):
    """Get search term for image search based on item name"""
    name = item.get('name_uz') or item.get('name') or item.get('name_ru') or ""
    name = name.lower().strip()
    
    # Remove common words
    common_words = ['pitsa', 'pizza', 'katta', 'kichik', 'juda', 'large', 'small', 'big', 'little', 'taom', 'dish']
    words = name.split()
    keywords = [w for w in words if w not in common_words and len(w) > 2]
    
    if keywords:
        return "+".join(keywords[:3])
    else:
        return name.replace(" ", "+")[:50]


def main():
    print("=" * 60)
    print("Mahsulotlarga Rasmlar Qo'shish (API orqali)")
    print("=" * 60)
    print()
    
    # Get all menu items
    print("Mahsulotlarni yuklanmoqda...")
    items = get_menu_items()
    
    if not items:
        print("Xatolik: Mahsulotlar topilmadi yoki API'ga ulanishda muammo bor")
        return
    
    total = len(items)
    print(f"Jami {total} ta mahsulot topildi")
    print()
    
    updated = 0
    skipped = 0
    failed = 0
    
    for idx, item in enumerate(items, 1):
        item_id = item.get('id')
        item_name = item.get('name_uz') or item.get('name') or 'Noma\'lum'
        
        # Skip if already has image
        if item.get('image'):
            print(f"[{idx}/{total}] ⏭️  O'tkazib yuborildi: {item_name} (rasm mavjud)")
            skipped += 1
            continue
        
        print(f"[{idx}/{total}] 🔍 Qidirilmoqda: {item_name}")
        
        # Get search term
        search_term = get_search_term(item)
        print(f"  Qidiruv so'zi: {search_term}")
        
        # Get image URL
        image_url = get_image_url(search_term)
        
        if not image_url:
            print(f"  ❌ Rasm topilmadi")
            failed += 1
            time.sleep(1)  # Rate limiting
            continue
        
        print(f"  📥 Rasm yuklanmoqda...")
        
        # Download image
        image_data = download_image(image_url)
        
        if not image_data:
            print(f"  ❌ Rasm yuklab bo'lmadi")
            failed += 1
            time.sleep(1)
            continue
        
        # Generate filename
        filename = f"{item_id}_{item_name}.jpg"
        filename = "".join(c for c in filename if c.isalnum() or c in (' ', '-', '_', '.')).rstrip()
        
        # Update via API
        print(f"  💾 API orqali saqlanmoqda...")
        success = update_menu_item_image(item_id, image_data, filename)
        
        if success:
            print(f"  ✅ Muvaffaqiyatli qo'shildi!")
            updated += 1
        else:
            print(f"  ❌ Saqlashda xatolik")
            failed += 1
        
        # Rate limiting
        time.sleep(2)  # 2 seconds between requests
        print()
    
    # Summary
    print("=" * 60)
    print("Yakuniy natija:")
    print(f"  Jami: {total}")
    print(f"  ✅ Yangilandi: {updated}")
    print(f"  ⏭️  O'tkazib yuborildi: {skipped}")
    print(f"  ❌ Xatolik: {failed}")
    print("=" * 60)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  To'xtatildi (Ctrl+C)")
    except Exception as e:
        print(f"\n\n❌ Xatolik: {e}")
        import traceback
        traceback.print_exc()

