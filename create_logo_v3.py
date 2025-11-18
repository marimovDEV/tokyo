#!/usr/bin/env python3
from PIL import Image
import numpy as np

def analyze_image_colors(image_path):
    """Analyze the image to find the most common colors"""
    img = Image.open(image_path).convert('RGB')
    data = np.array(img)
    
    # Reshape to list of pixels
    pixels = data.reshape(-1, 3)
    
    # Find unique colors and their counts
    unique_colors, counts = np.unique(pixels.view(np.void, pixels.dtype.itemsize * pixels.shape[1]), return_counts=True)
    
    # Convert back to RGB format
    unique_colors = unique_colors.view(pixels.dtype).reshape(-1, 3)
    
    # Sort by frequency
    sorted_indices = np.argsort(counts)[::-1]
    
    print("Top 10 most common colors:")
    for i in range(min(10, len(unique_colors))):
        idx = sorted_indices[i]
        color = unique_colors[idx]
        count = counts[idx]
        print(f"RGB({color[0]:3d}, {color[1]:3d}, {color[2]:3d}) - {count:6d} pixels")
    
    return unique_colors[sorted_indices]

def find_region_by_color_range(img, min_rgb, max_rgb):
    """Find regions that fall within a color range"""
    data = np.array(img)
    
    # Create mask for pixels within the color range
    mask = (data[:, :, 0] >= min_rgb[0]) & (data[:, :, 0] <= max_rgb[0]) & \
           (data[:, :, 1] >= min_rgb[1]) & (data[:, :, 1] <= max_rgb[1]) & \
           (data[:, :, 2] >= min_rgb[2]) & (data[:, :, 2] <= max_rgb[2])
    
    # Find bounding box
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    
    if not np.any(rows) or not np.any(cols):
        return None
    
    ymin, ymax = np.where(rows)[0][[0, -1]]
    xmin, xmax = np.where(cols)[0][[0, -1]]
    
    return (xmin, ymin, xmax, ymax)

def create_logo_with_exact_size():
    image_path = "/Users/ogabek/Downloads/restaurantmenusystem3-5/image.png"
    output_path = "/Users/ogabek/Downloads/restaurantmenusystem3-5/frontend/public/logo.png"
    
    print("Analyzing image colors...")
    top_colors = analyze_image_colors(image_path)
    
    # Load the image
    img = Image.open(image_path).convert('RGBA')
    width, height = img.size
    print(f"Image dimensions: {width}x{height}")
    
    # Try to find green region (background circle)
    # Green colors typically have high green component
    green_candidates = []
    for color in top_colors[:20]:  # Check top 20 colors
        if color[1] > color[0] and color[1] > color[2] and color[1] > 100:  # Green is dominant
            green_candidates.append(color)
    
    print(f"Found {len(green_candidates)} potential green colors")
    
    green_bbox = None
    for green_color in green_candidates:
        # Create a range around this green color
        tolerance = 30
        min_green = (max(0, green_color[0] - tolerance), 
                    max(0, green_color[1] - tolerance), 
                    max(0, green_color[2] - tolerance))
        max_green = (min(255, green_color[0] + tolerance), 
                    min(255, green_color[1] + tolerance), 
                    min(255, green_color[2] + tolerance))
        
        bbox = find_region_by_color_range(img, min_green, max_green)
        if bbox:
            bbox_area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
            # Look for the largest green region (likely the background circle)
            if green_bbox is None or bbox_area > (green_bbox[2] - green_bbox[0]) * (green_bbox[3] - green_bbox[1]):
                green_bbox = bbox
                print(f"Found green region: {bbox}, area: {bbox_area}")
    
    if not green_bbox:
        print("Could not find green background circle. Creating logo with original dimensions.")
        # Fallback: use the center portion of the image
        center_x, center_y = width // 2, height // 2
        logo_size = min(width, height) // 3  # Use 1/3 of the smaller dimension
        green_bbox = (center_x - logo_size//2, center_y - logo_size//2, 
                     center_x + logo_size//2, center_y + logo_size//2)
    
    # Extract the green circle dimensions
    circle_width = green_bbox[2] - green_bbox[0]
    circle_height = green_bbox[3] - green_bbox[1]
    
    print(f"Using dimensions: {circle_width}x{circle_height}")
    
    # Create a new transparent image with the exact same dimensions as the green circle
    new_logo = Image.new('RGBA', (circle_width, circle_height), (0, 0, 0, 0))
    
    # Crop the logo area from the original image (remove green background)
    logo_area = img.crop(green_bbox)
    
    # Process each pixel to remove green background
    for x in range(circle_width):
        for y in range(circle_height):
            r, g, b, a = logo_area.getpixel((x, y))
            
            # Check if this pixel is part of the green background
            if g > r and g > b and g > 100:  # Green is dominant
                # Make transparent
                new_logo.putpixel((x, y), (0, 0, 0, 0))
            else:
                # Keep the original pixel
                new_logo.putpixel((x, y), (r, g, b, a))
    
    # Save the new logo
    new_logo.save(output_path, 'PNG')
    print(f"✅ Logo created with exact green circle dimensions: {output_path}")
    print(f"📏 Final size: {circle_width}x{circle_height}")

if __name__ == "__main__":
    create_logo_with_exact_size()

