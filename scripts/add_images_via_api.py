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


def translate_to_english(uzbek_term):
    """Simple translation mapping for common Uzbek food terms"""
    translations = {
        'pitsa': 'pizza',
        'pizza': 'pizza',
        'shashlik': 'kebab',
        'kebab': 'kebab',
        'steyk': 'steak',
        'steak': 'steak',
        'tovuq': 'chicken',
        'chicken': 'chicken',
        'pasta': 'pasta',
        'salat': 'salad',
        'salatlar': 'salad',
        'soup': 'soup',
        'sho\'rva': 'soup',
        'soup': 'soup',
        'desert': 'dessert',
        'desertlar': 'dessert',
        'ichimlik': 'drink',
        'drink': 'drink',
        'sushi': 'sushi',
        'ramen': 'ramen',
        'lagmon': 'noodles',
        'non': 'bread',
        'bread': 'bread',
        'katta': 'large',
        'kichik': 'small',
        'o\'rta': 'medium',
        'juda': 'very',
        'adana': 'adana',
        'bon': 'filet',
        'file': 'filet',
        'qanotlari': 'wings',
        'wings': 'wings',
        'lososli': 'salmon',
        'salmon': 'salmon',
        'qaymoqli': 'cream',
        'cream': 'cream',
        'pishloqli': 'cheese',
        'cheese': 'cheese',
        'vafl': 'waffle',
        'waffle': 'waffle',
        'katlet': 'cutlet',
        'cutlet': 'cutlet',
        'bog\'ir': 'lamb',
        'mol': 'beef',
        'go\'shti': 'meat',
    }
    
    words = uzbek_term.lower().split('+')
    translated = []
    for word in words:
        # Remove special characters
        clean_word = word.strip().replace("'", "").replace("(", "").replace(")", "")
        if clean_word in translations:
            translated.append(translations[clean_word])
        elif len(clean_word) > 2:
            translated.append(clean_word)
    
    return '+'.join(translated[:3]) if translated else 'food'


def get_image_url(search_term):
    """Get image URL from multiple sources"""
    # First, translate to English
    english_term = translate_to_english(search_term)
    
    # Try Foodish API first (free, no key needed, returns random food images)
    try:
        foodish_url = "https://foodish-api.herokuapp.com/images/"
        foodish_response = requests.get(foodish_url, timeout=5)
        if foodish_response.status_code == 200:
            data = foodish_response.json()
            if 'image' in data:
                return data['image']
    except Exception as e:
        pass
    
    # Try Unsplash Source with English term
    try:
        url = f"https://source.unsplash.com/800x800/?food,{english_term}"
        response = requests.head(url, allow_redirects=True, timeout=10)
        if response.status_code == 200:
            final_url = response.url
            if 'unsplash.com' in final_url and 'images.unsplash.com' in final_url:
                return final_url
    except Exception as e:
        pass
    
    # Try direct Unsplash image URLs based on food category
    food_images = {
        'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=800&fit=crop',
        'kebab': 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&h=800&fit=crop',
        'steak': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=800&fit=crop',
        'chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=800&fit=crop',
        'pasta': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=800&fit=crop',
        'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=800&fit=crop',
        'soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=800&fit=crop',
        'dessert': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=800&fit=crop',
        'drink': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=800&fit=crop',
        'sushi': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=800&fit=crop',
        'ramen': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=800&fit=crop',
        'noodles': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=800&fit=crop',
        'bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=800&fit=crop',
        'waffle': 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800&h=800&fit=crop',
        'cutlet': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=800&fit=crop',
        'lamb': 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&h=800&fit=crop',
        'beef': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=800&fit=crop',
        'salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=800&fit=crop',
    }
    
    # Check if we have a specific image for this term
    for key, url in food_images.items():
        if key in english_term.lower():
            return url
    
    # Fallback: Generic food image
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=800&fit=crop'


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
    # Try to get the best name (prefer English, then Uzbek, then Russian)
    name = item.get('name') or item.get('name_uz') or item.get('name_ru') or ""
    name = name.lower().strip()
    
    # Remove common words and size indicators
    common_words = ['pitsa', 'pizza', 'katta', 'kichik', 'juda', 'large', 'small', 'big', 'little', 
                   'taom', 'dish', 'o\'rta', 'medium', '1', '2', '3', '4', 'assorti', 'assorted',
                   'bon', 'file', 'filet', '(', ')', 'mol', 'go\'shti', 'meat']
    
    words = name.split()
    keywords = [w.replace("'", "").replace("(", "").replace(")", "") 
                for w in words if w.lower() not in common_words and len(w) > 2]
    
    if keywords:
        return "+".join(keywords[:3])
    else:
        # Fallback: use first meaningful word
        clean_name = name.replace("(", "").replace(")", "").replace("'", "")
        return clean_name.replace(" ", "+")[:50] if clean_name else "food"


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
        
        # Get image URL (try multiple times with different terms)
        image_url = None
        attempts = [
            search_term,
            translate_to_english(search_term),
            "food",  # Generic fallback
        ]
        
        for attempt_term in attempts:
            image_url = get_image_url(attempt_term)
            if image_url:
                break
        
        if not image_url:
            print(f"  ❌ Rasm topilmadi (qidiruv: {search_term})")
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

