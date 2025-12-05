from django.core.management.base import BaseCommand
from wardrobe.models import ClothingItem
from PIL import Image
import open_clip
import torch
import os

class Command(BaseCommand):
    help = 'Automatically generate and save feature vectors for items missing them'

    def handle(self, *args, **options):
        model, _, preprocess = open_clip.create_model_and_transforms(
            'ViT-B-32', pretrained='laion2b_s34b_b79k'
        )
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model.to(device)

        items = ClothingItem.objects.filter(feature_vector__isnull=True)

        if not items.exists():
            self.stdout.write(self.style.SUCCESS("✅ All items already have feature vectors."))
            return

        for item in items:
            try:
                image_path = item.image.path
                if not os.path.exists(image_path):
                    self.stdout.write(self.style.WARNING(f"⚠️ Image not found: {image_path}"))
                    continue

                image = Image.open(image_path).convert("RGB")
                image_input = preprocess(image).unsqueeze(0).to(device)

                with torch.no_grad():
                    features = model.encode_image(image_input)

                item.feature_vector = features.cpu().tolist()[0]
                item.save()
                self.stdout.write(self.style.SUCCESS(f"✔ Feature vector updated for: {item.name} (ID: {item.id})"))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Failed for {item.name} (ID: {item.id}): {e}"))

        self.stdout.write(self.style.SUCCESS("🎉 Auto-fix complete."))
