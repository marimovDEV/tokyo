#!/usr/bin/env python3
from PIL import Image

def create_logo_with_original_size():
    """Create a logo with the same dimensions as the original green circle"""
    image_path = "/Users/ogabek/Downloads/restaurantmenusystem3-5/image.png"
    output_path = "/Users/ogabek/Downloads/restaurantmenusystem3-5/frontend/public/logo.png"
    
    # Load the original image
    img = Image.open(image_path).convert('RGBA')
    width, height = img.size
    print(f"Original image dimensions: {width}x{height}")
    
    # Since the green circle takes up most of the image, we'll estimate its size
    # Based on typical logo proportions, the green circle is likely circular
    # We'll use the center portion and estimate the circle size
    
    # Find the approximate center of the image
    center_x, center_y = width // 2, height // 2
    
    # Estimate the circle size (typically 70-80% of the image height)
    estimated_circle_size = int(height * 0.75)
    
    # Create bounding box for the circle
    circle_bbox = (
        center_x - estimated_circle_size // 2,  # left
        center_y - estimated_circle_size // 2,  # top
        center_x + estimated_circle_size // 2,  # right
        center_y + estimated_circle_size // 2   # bottom
    )
    
    print(f"Estimated circle dimensions: {estimated_circle_size}x{estimated_circle_size}")
    
    # Create a new transparent image with the exact same dimensions as the green circle
    new_logo = Image.new('RGBA', (estimated_circle_size, estimated_circle_size), (0, 0, 0, 0))
    
    # Extract the logo area from the original image
    logo_area = img.crop(circle_bbox)
    
    # Process each pixel to remove green background
    for x in range(estimated_circle_size):
        for y in range(estimated_circle_size):
            try:
                r, g, b, a = logo_area.getpixel((x, y))
                
                # Check if this pixel is part of the green background
                # Green background typically has high green values
                if g > r and g > b and g > 120:
                    # Make transparent
                    new_logo.putpixel((x, y), (0, 0, 0, 0))
                else:
                    # Keep the original pixel
                    new_logo.putpixel((x, y), (r, g, b, a))
            except:
                # Handle any edge cases
                new_logo.putpixel((x, y), (0, 0, 0, 0))
    
    # Save the new logo
    new_logo.save(output_path, 'PNG')
    print(f"✅ Logo created with estimated green circle dimensions: {output_path}")
    print(f"📏 Final size: {estimated_circle_size}x{estimated_circle_size}")
    
    # Also create a version that's exactly the original image size
    original_size_logo = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    
    # Paste the logo in the center
    paste_x = (width - estimated_circle_size) // 2
    paste_y = (height - estimated_circle_size) // 2
    original_size_logo.paste(new_logo, (paste_x, paste_y))
    
    # Save the full-size version
    full_size_path = "/Users/ogabek/Downloads/restaurantmenusystem3-5/frontend/public/logo_full.png"
    original_size_logo.save(full_size_path, 'PNG')
    print(f"✅ Full-size logo also created: {full_size_path}")
    print(f"📏 Full size: {width}x{height}")

if __name__ == "__main__":
    create_logo_with_original_size()

