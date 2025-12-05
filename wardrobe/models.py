from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField

class ClothingItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clothing_items')  # Link to user

    TYPE_CHOICES = [
        ('Top', 'Top'),
        ('Bottom', 'Bottom'),
        ('Shoes', 'Shoes'),
        ('Outerwear', 'Outerwear'),
    ]

    STYLE_CHOICES = [
        ('casual', 'Casual'),
        ('formal', 'Formal'),
        ('party', 'Party'),
        ('sports', 'Sports'),
    ]

    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='clothes/')
    clothing_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    style = models.CharField(max_length=20, choices=STYLE_CHOICES)
    feature_vector = models.TextField(blank=True, null=True)
    primary_color = models.CharField(max_length=100, blank=True, null=True)
    color_palette = ArrayField(
        models.CharField(max_length=100),
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.name} ({self.user.username})"
