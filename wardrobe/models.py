from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField


class ClothingItem(models.Model):
    # Link each clothing item to a user
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="clothing_items"
    )

    TYPE_CHOICES = [
        ("Top", "Top"),
        ("Bottom", "Bottom"),
        ("Shoes", "Shoes"),
        ("Outerwear", "Outerwear"),
    ]

    STYLE_CHOICES = [
        ("casual", "Casual"),
        ("formal", "Formal"),
        ("party", "Party"),
        ("sports", "Sports"),
    ]

    CATEGORY_CHOICES = [
        ("Top", "Top"),
        ("Bottom", "Bottom"),
        ("Shoes", "Shoes"),
        ("Outerwear", "Outerwear"),
    ]

    # Basic Information
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to="clothes/")

    # Temporary field (will be removed after migrating to category)
    clothing_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES
    )

    style = models.CharField(
        max_length=20,
        choices=STYLE_CHOICES
    )

    # AI Feature Vector
    feature_vector = models.TextField(
        blank=True,
        null=True
    )

    # Color Information
    primary_color = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    color_palette = ArrayField(
        models.CharField(max_length=100),
        blank=True,
        null=True
    )

    # AI Classification
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        blank=True,
        null=True
    )

    subcategory = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.name} ({self.user.username})"