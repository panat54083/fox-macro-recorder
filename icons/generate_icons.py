#!/usr/bin/env python3
"""Generate browser extension icons in multiple sizes from source image."""

from PIL import Image
import os

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Input and output paths
input_file = os.path.join(script_dir, "original-removebg.png")
sizes = [16, 48, 128]

# Open the source image
source_image = Image.open(input_file)
print(f"Source image: {input_file}")
print(f"Original size: {source_image.size}")

# Generate icons at each size
for size in sizes:
    # Resize with high-quality resampling
    resized = source_image.resize((size, size), Image.Resampling.LANCZOS)

    # Save the icon
    output_file = os.path.join(script_dir, f"icon{size}.png")
    resized.save(output_file, "PNG")
    print(f"Created: icon{size}.png ({size}x{size})")

print("\nAll icons generated successfully!")
