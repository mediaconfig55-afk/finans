import os
from PIL import Image
import shutil

# Paths
SOURCE_IMAGE = r"C:\Users\VAS6150F\.gemini\antigravity\brain\5b480ab1-5f4b-4b72-bf5f-6bd347412b13\media__1770810526907.png"
ASSETS_DIR = r"c:\Users\VAS6150F\Desktop\Finans\assets"

def process_icons():
    # 1. Backup existing icons (again, just in case)
    print("Backing up existing icons...")
    for filename in ["icon.png", "splash-icon.png", "adaptive-icon.png", "favicon.png"]:
        src = os.path.join(ASSETS_DIR, filename)
        dst = os.path.join(ASSETS_DIR, f"backup_v2_{filename}")
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"Backed up {filename}")

    # 2. Load Source Image
    if not os.path.exists(SOURCE_IMAGE):
        print(f"Error: Source image not found at {SOURCE_IMAGE}")
        return
    
    img = Image.open(SOURCE_IMAGE)
    print(f"Source Image Size: {img.size}")
    
    # 3. Resize and Save (Single image for ALL)
    
    # icon.png (1024x1024)
    icon_img = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    icon_path = os.path.join(ASSETS_DIR, "icon.png")
    icon_img.save(icon_path)
    print(f"Saved {icon_path}")

    # adaptive-icon.png (1024x1024)
    adaptive_path = os.path.join(ASSETS_DIR, "adaptive-icon.png")
    icon_img.save(adaptive_path)
    print(f"Saved {adaptive_path}")

    # splash-icon.png (1024x1024 - contain mode in app.json handles aspect ratio)
    splash_path = os.path.join(ASSETS_DIR, "splash-icon.png")
    icon_img.save(splash_path)
    print(f"Saved {splash_path}")
    
    # favicon.png (48x48)
    favicon_img = img.resize((48, 48), Image.Resampling.LANCZOS)
    favicon_path = os.path.join(ASSETS_DIR, "favicon.png")
    favicon_img.save(favicon_path)
    print(f"Saved {favicon_path}")

if __name__ == "__main__":
    process_icons()
