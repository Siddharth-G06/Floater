import sys
import os
import json

# Fix import paths
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ocr import extract_receipt_from_image

def main():
    if len(sys.argv) < 2:
        sys.stderr.write("❌ Usage: python main.py <image_path>\n")
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        sys.stderr.write(f"❌ Image not found: {image_path}\n")
        sys.exit(1)

    result = extract_receipt_from_image(image_path)

    # Output ONLY valid JSON to stdout
    print(json.dumps(result.model_dump()))

if __name__ == "__main__":
    main()
