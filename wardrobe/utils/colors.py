import json, os
from webcolors import hex_to_rgb

# Load color name dataset once when the module is imported
with open(os.path.join(os.path.dirname(__file__), 'json_colors.json')) as f:
    COLOR_LIST = json.load(f)

def hex_to_name_extended(hex_color):
    """
    Given a hex color code like '#f9f9f9',
    return the closest matching color name from the extended dataset.
    """
    try:
        r, g, b = hex_to_rgb(hex_color)
    except ValueError:
        return "unknown"

    best_name = "unknown"
    min_dist = float('inf')

    for item in COLOR_LIST:
        try:
            r2, g2, b2 = hex_to_rgb(item['hex'])
            dist = (r - r2)**2 + (g - g2)**2 + (b - b2)**2
            if dist < min_dist:
                min_dist = dist
                best_name = item['name']
        except ValueError:
            continue

    return best_name
# Alias for compatibility
def hex_to_name(hex_code):
    return hex_to_name_extended(hex_code)
