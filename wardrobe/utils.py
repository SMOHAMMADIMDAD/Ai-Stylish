import webcolors

# 🎨 Full color name to HEX mapping (extend this list as needed)
COLOR_NAME_HEX_MAP = {
    'black': '#000000', 'white': '#FFFFFF', 'gray': '#808080', 'silver': '#C0C0C0',
    'lightgray': '#D3D3D3', 'darkgray': '#A9A9A9', 'gainsboro': '#DCDCDC',
    'ivory': '#FFFFF0', 'snow': '#FFFAFA', 'seashell': '#FFF5EE', 'linen': '#FAF0E6',
    'beige': '#F5F5DC', 'antiquewhite': '#FAEBD7', 'whitesmoke': '#F5F5F5',
    'mistyrose': '#FFE4E1', 'lightsteelblue': '#B0C4DE', 'slategray': '#708090',
    'lightblue': '#ADD8E6', 'skyblue': '#87CEEB', 'deepskyblue': '#00BFFF',
    'dodgerblue': '#1E90FF', 'cornflowerblue': '#6495ED', 'steelblue': '#4682B4',
    'royalblue': '#4169E1', 'midnightblue': '#191970', 'darkslateblue': '#483D8B',
    'navy': '#000080', 'blue': '#0000FF', 'mediumblue': '#0000CD', 'darkblue': '#00008B',
    'purple': '#800080', 'indigo': '#4B0082', 'mediumorchid': '#BA55D3',
    'darkorchid': '#9932CC', 'darkviolet': '#9400D3', 'violet': '#EE82EE',
    'plum': '#DDA0DD', 'orchid': '#DA70D6', 'magenta': '#FF00FF', 'fuchsia': '#FF00FF',
    'pink': '#FFC0CB', 'lightpink': '#FFB6C1', 'hotpink': '#FF69B4', 'deeppink': '#FF1493',
    'crimson': '#DC143C', 'red': '#FF0000', 'firebrick': '#B22222', 'darkred': '#8B0000',
    'maroon': '#800000', 'orange': '#FFA500', 'darkorange': '#FF8C00', 'coral': '#FF7F50',
    'tomato': '#FF6347', 'salmon': '#FA8072', 'lightsalmon': '#FFA07A', 'gold': '#FFD700',
    'yellow': '#FFFF00', 'lightyellow': '#FFFFE0', 'khaki': '#F0E68C', 'darkkhaki': '#BDB76B',
    'olive': '#808000', 'greenyellow': '#ADFF2F', 'chartreuse': '#7FFF00',
    'lawngreen': '#7CFC00', 'lime': '#00FF00', 'limegreen': '#32CD32',
    'forestgreen': '#228B22', 'green': '#008000', 'darkgreen': '#006400',
    'seagreen': '#2E8B57', 'mediumseagreen': '#3CB371', 'springgreen': '#00FF7F',
    'mintcream': '#F5FFFA', 'turquoise': '#40E0D0', 'mediumturquoise': '#48D1CC',
    'darkturquoise': '#00CED1', 'teal': '#008080', 'aqua': '#00FFFF', 'cyan': '#00FFFF',
    'lightcyan': '#E0FFFF', 'paleturquoise': '#AFEEEE', 'powderblue': '#B0E0E6',
    'cadetblue': '#5F9EA0', 'darkcyan': '#008B8B', 'darkslategray': '#2F4F4F',
    'slateblue': '#6A5ACD'
}

# ✅ Precompute RGB values to avoid repeated conversion
COLOR_NAME_RGB_MAP = {
    name: webcolors.hex_to_rgb(hex_code)
    for name, hex_code in COLOR_NAME_HEX_MAP.items()
}


def closest_color_name(requested_rgb):
    def distance(c1, c2):
        return sum((a - b) ** 2 for a, b in zip(c1, c2))

    min_dist = float('inf')
    closest_name = "unknown"

    for name, rgb in COLOR_NAME_RGB_MAP.items():
        d = distance(rgb, requested_rgb)
        if d < min_dist:
            min_dist = d
            closest_name = name

    return closest_name


def rgb_to_name(rgb_tuple):
    try:
        return webcolors.rgb_to_name(rgb_tuple)
    except ValueError:
        return closest_color_name(rgb_tuple)
