# serializers.py

from rest_framework import serializers
from .models import ClothingItem
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class ClothingItemSerializer(serializers.ModelSerializer):
    """
    Serializer for the ClothingItem model.
    """
    # This is the FIX:
    # It tells Django not to require the 'user' field from the frontend during uploads.
    # Instead, the user will be assigned automatically from the request on the backend.
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = ClothingItem
        # We explicitly list the fields to have better control.
        # 'user' is included so you can see who owns the item when you view it.
        # 'uploaded_at' was removed as it was causing the error.
        fields = [
            'id', 
            'user', 
            'name', 
            'clothing_type', 
            'style', 
            'image', 
            'primary_color', 
            'color_palette',
            'feature_vector',
        ]
        
        # These fields are populated by the server, not the client.
        read_only_fields = ['primary_color', 'color_palette', 'feature_vector']


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer to add extra user information to the token payload.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['user_id'] = user.id
        token['username'] = user.username
        return token
