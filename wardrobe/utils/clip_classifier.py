import logging
from threading import Lock
from typing import Dict, Any

import open_clip
import torch
import torch.nn.functional as F
from PIL import Image, UnidentifiedImageError

logger = logging.getLogger(__name__)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

MODEL_NAME = "ViT-B-32"
PRETRAINED = "laion2b_s34b_b79k"

CONFIDENCE_THRESHOLD = 0.45

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
    },
}

# -----------------------------------------------------
# Globals
# -----------------------------------------------------

model = None
preprocess = None
TEXT_FEATURES = None
PROMPT_METADATA = []

_model_lock = Lock()


def load_model():
    global model, preprocess, TEXT_FEATURES, PROMPT_METADATA

    if model is not None:
        return

    with _model_lock:

        if model is not None:
            return

        logger.info("Loading OpenCLIP model...")

        model_, _, preprocess_ = open_clip.create_model_and_transforms(
            MODEL_NAME,
            pretrained=PRETRAINED,
        )

        model_ = model_.to(DEVICE)
        model_.eval()

        prompts = []
        metadata = []

        for category, subcats in CATEGORY_PROMPTS.items():
            for subcategory, prompt in subcats.items():
                prompts.append(prompt)
                metadata.append(
                    {
                        "category": category,
                        "subcategory": subcategory,
                    }
                )

        tokens = open_clip.tokenize(prompts).to(DEVICE)

        with torch.no_grad():
            text_features = model_.encode_text(tokens)
            text_features = F.normalize(text_features, dim=-1)

        model = model_
        preprocess = preprocess_
        TEXT_FEATURES = text_features
        PROMPT_METADATA = metadata

        logger.info("OpenCLIP model loaded successfully.")


def analyze_clothing(image_path: str) -> Dict[str, Any]:

    load_model()

    try:
        image = Image.open(image_path).convert("RGB")

    except FileNotFoundError:
        logger.exception("Image not found.")
        raise

    except UnidentifiedImageError:
        logger.exception("Invalid image.")
        raise

    image_tensor = preprocess(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():

        image_features = model.encode_image(image_tensor)
        image_features = F.normalize(image_features, dim=-1)

        logits = model.logit_scale.exp() * (
            image_features @ TEXT_FEATURES.T
        )

        probs = logits.softmax(dim=-1)

        best = probs.argmax().item()

        confidence = float(probs[0][best])

    prediction = PROMPT_METADATA[best]

    category = prediction["category"]
    subcategory = prediction["subcategory"]

    if confidence < CONFIDENCE_THRESHOLD:
        category = None
        subcategory = None

    return {
        "feature_vector": image_features.cpu().numpy().flatten().tolist(),
        "category": category,
        "subcategory": subcategory,
        "confidence": round(confidence, 4),
    }