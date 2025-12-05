complementary_colors = {
    "red": "green",
    "blue": "orange",
    "yellow": "purple",
    "green": "red",
    "orange": "blue",
    "purple": "yellow",
    "black": "white",
    "white": "black"
}

analogous_groups = [
    ["red", "orange", "yellow"],
    ["blue", "cyan", "green"],
    ["purple", "pink", "red"],
    ["green", "olive", "yellow"]
]

def get_color_relationship(color1, color2):
    if not color1 or not color2:
        return None

    c1 = color1.lower().strip()
    c2 = color2.lower().strip()

    if complementary_colors.get(c1) == c2 or complementary_colors.get(c2) == c1:
        return "complementary"

    for group in analogous_groups:
        if c1 in group and c2 in group:
            return "analogous"

    return None
