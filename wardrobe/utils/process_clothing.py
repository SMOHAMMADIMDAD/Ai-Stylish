from colorthief import ColorThief
import webcolors

def get_color_name(rgb_tuple):
    try:
        return webcolors.rgb_to_name(rgb_tuple)
    except ValueError:
        return '#{:02x}{:02x}{:02x}'.format(*rgb_tuple)

def extract_color_palette(image_path, num_colors=5):
    color_thief = ColorThief(image_path)
    palette = color_thief.get_palette(color_count=num_colors)
    color_names = [get_color_name(color) for color in palette]
    return color_names
