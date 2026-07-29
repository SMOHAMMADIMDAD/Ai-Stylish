"""
clip_classifier.py

AI-powered clothing classification using OpenCLIP.

Returns:
{
    "feature_vector": [...],
    "category": "Top",
    "subcategory": "hoodie",
    "confidence": 0.96
}
"""

import logging
from typing import Dict, Any

import open_clip
import torch
import torch.nn.functional as F
from PIL import Image, UnidentifiedImageError

# ---------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

MODEL_NAME = "ViT-B-32"
PRETRAINED = "laion2b_s34b_b79k"

CONFIDENCE_THRESHOLD = 0.45

# ---------------------------------------------------------------------
# Clothing Prompts
# ---------------------------------------------------------------------

CATEGORY_PROMPTS = {
    "Top": {
        "t-shirt": "a photo of a t-shirt",
        "shirt": "a photo of a shirt",
        "polo shirt": "a photo of a polo shirt",
        "hoodie": "a photo of a hoodie",
        "sweatshirt": "a photo of a sweatshirt",
        "sweater": "a photo of a sweater",
    },

    "Bottom": {
        "jeans": "a photo of jeans",
        "trousers": "a photo of trousers",
        "pants": "a photo of pants",
        "shorts": "a photo of shorts",
        "joggers": "a photo of joggers",
        "chinos": "a photo of chinos",
    },

    "Shoes": {
        "sneakers": "a photo of sneakers",
        "shoes": "a photo of shoes",
        "boots": "a photo of boots",
        "sandals": "a photo of sandals",
        "loafers": "a photo of loafers",
    },

    "Outerwear": {
        "jacket": "a photo of a jacket",
        "coat": "a photo of a coat",
        "blazer": "a photo of a blazer",
        "overcoat": "a photo of an overcoat",
        "rain jacket": "a photo of a rain jacket",
    }
}

# ---------------------------------------------------------------------
# Load Model Once
# ---------------------------------------------------------------------

logger.info("Loading OpenCLIP model...")

model, _, preprocess = open_clip.create_model_and_transforms(
    MODEL_NAME,
    pretrained=PRETRAINED
)

model = model.to(DEVICE)
model.eval()

logger.info("OpenCLIP model loaded successfully.")

# ---------------------------------------------------------------------
# Build Prompt Index
# ---------------------------------------------------------------------

ALL_PROMPTS = []
PROMPT_METADATA = []

for category, subcategories in CATEGORY_PROMPTS.items():
    for subcategory, prompt in subcategories.items():
        ALL_PROMPTS.append(prompt)
        PROMPT_METADATA.append(
            {
                "category": category,
                "subcategory": subcategory,
            }
        )

tokenized_text = open_clip.tokenize(ALL_PROMPTS).to(DEVICE)

with torch.no_grad():
    TEXT_FEATURES = model.encode_text(tokenized_text)
    TEXT_FEATURES = F.normalize(TEXT_FEATURES, dim=-1)

logger.info("Text embeddings generated successfully.")

# ---------------------------------------------------------------------
# Main Function
# ---------------------------------------------------------------------


def analyze_clothing(image_path: str) -> Dict[str, Any]:
    """
    Analyze a clothing image using OpenCLIP.

    Parameters
    ----------
    image_path : str
        Path to the uploaded image.

    Returns
    -------
    dict
        {
            feature_vector,
            category,
            subcategory,
            confidence
        }
    """

    try:
        image = Image.open(image_path).convert("RGB")

    except FileNotFoundError:
        logger.exception("Image not found: %s", image_path)
        raise

    except UnidentifiedImageError:
        logger.exception("Invalid image file: %s", image_path)
        raise

    except Exception:
        logger.exception("Unexpected error while opening image.")
        raise

    image_tensor = preprocess(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():

        image_features = model.encode_image(image_tensor)
        image_features = F.normalize(image_features, dim=-1)

        logits = model.logit_scale.exp() * (image_features @ TEXT_FEATURES.T)

        probabilities = logits.softmax(dim=-1)

        best_index = probabilities.argmax().item()

        confidence = float(probabilities[0][best_index])

        prediction = PROMPT_METADATA[best_index]
        print("=" * 50)
        print("=" * 50)
        print("Prediction:", prediction)
        print("Confidence:", confidence)
        print("=" * 50)

    category = prediction["category"]
    subcategory = prediction["subcategory"]

    # Optional confidence threshold
    if confidence < CONFIDENCE_THRESHOLD:

        logger.warning(
            "Low confidence prediction (%.2f) for %s",
            confidence,
            image_path
        )

        category = None
        subcategory = None

    return {
        "feature_vector": image_features.cpu().numpy().flatten().tolist(),
        "category": category,
        "subcategory": subcategory,
        "confidence": round(confidence, 4),
    }