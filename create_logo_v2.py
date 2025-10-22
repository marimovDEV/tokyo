#!/usr/bin/env python3
from PIL import Image
import numpy as np

def find_color_region_bbox(image_path, target_color_rgb, tolerance=40):
    """
    Finds the bounding box of a region in an image that closely matches a target color.
    """
    img = Image.open(image_path).convert('RGB')
    data = np.array(img)

    # Create a mask for pixels close to the target color
    mask = (np.abs(data[:, :, 0] - target_color_rgb[0]) < tolerance) & \
           (np.abs(data[:, :, 1] - target_color_rgb[1]) < tolerance) & \
           (np.abs(data[:, :, 2] - target_color_rgb[2]) < tolerance)

    # Find the bounding box of the masked pixels
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    
    if not np.any(rows) or not np.any(cols):
        return None # No pixels of target color found

    ymin, ymax = np.where(rows)[0][[0, -1]]
    xmin, xmax = np.where(cols)[0][[0, -1]]

    return (xmin, ymin, xmax, ymax)

def create_resized_transparent_logo(original_screenshot_path, output_logo_path):
    """
    Extracts the red logo from the screenshot, places it on a transparent canvas
    that matches the size of the original green circle, and saves it.
    """
    # 1. Load the original screenshot
    screenshot = Image.open(original_screenshot_path).convert('RGBA')

    # Approximate colors from the image
    green_color = (102, 187, 106) 
    red_color = (239, 83, 80) 

    # 2. Find the bounding box of the green circle (this will be our new canvas size)
    green_bbox = find_color_region_bbox(original_screenshot_path, green_color, tolerance=40)
    
    if not green_bbox:
        print("Could not find green circle in the original image. Please ensure the image contains the green circle.")
        return

    print(f"Detected green circle bounding box: {green_bbox}")
    green_circle_width = green_bbox[2] - green_bbox[0]
    green_circle_height = green_bbox[3] - green_bbox[1]
    print(f"Desired canvas dimensions (from green circle): {green_circle_width}x{green_circle_height}")

    # 3. Find the bounding box of the red logo (the content we want to extract)
    red_bbox_original = find_color_region_bbox(original_screenshot_path, red_color, tolerance=40)
    
    if not red_bbox_original:
        print("Could not find red logo in the original image. Please ensure the image contains the red logo.")
        return
        
    print(f"Detected red logo bounding box (original image coordinates): {red_bbox_original}")

    # 4. Extract the red logo content from the original screenshot
    red_logo_content = screenshot.crop(red_bbox_original)

    # 5. Create a new transparent image with the dimensions of the green circle
    new_logo_canvas = Image.new('RGBA', (green_circle_width, green_circle_height), (0, 0, 0, 0))

    # 6. Paste the red logo content onto this new transparent image, centered
    red_logo_width = red_bbox_original[2] - red_bbox_original[0]
    red_logo_height = red_bbox_original[3] - red_bbox_original[1]

    paste_x = (green_circle_width - red_logo_width) // 2
    paste_y = (green_circle_height - red_logo_height) // 2
    
    new_logo_canvas.paste(red_logo_content, (paste_x, paste_y), red_logo_content)

    # Save the new logo
    new_logo_canvas.save(output_logo_path)
    print(f"New transparent logo saved to {output_logo_path}")

# Define paths
original_screenshot_path = "/Users/ogabek/Downloads/restaurantmenusystem3-5/image.png"
output_logo_path = "/Users/ogabek/Downloads/restaurantmenusystem3-5/frontend/public/logo.png"

# Execute the function
create_resized_transparent_logo(original_screenshot_path, output_logo_path)

