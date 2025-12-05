from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from difflib import SequenceMatcher
from itertools import product
from PIL import Image
import open_clip
import torch
import json
from rest_framework.permissions import AllowAny, IsAuthenticated
from wardrobe.utils.colors import hex_to_name_extended
from wardrobe.utils.color_harmony import get_color_relationship
from wardrobe.utils.process_clothing import extract_color_palette
from .models import ClothingItem
from .serializers import ClothingItemSerializer
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
import jwt, datetime
from django.conf import settings
from django.http import JsonResponse # Keep this for test_api and clothing_list
import random
from django.db.models.functions import Lower

# 🎨 Color theory palette matching
COLOR_PALETTE_MAP = {
    'black': ['white', 'beige', 'gray', 'olive', 'camel', 'khaki', 'red', 'gold', 'silver', 'denim', 'lightblue'],
    'white': ['black', 'denim', 'gray', 'navy', 'khaki', 'olive', 'pastel pink', 'camel', 'mint', 'lavender'],
    'gray': ['black', 'white', 'navy', 'maroon', 'blush', 'camel', 'mint', 'peach'],
    'blue': ['white', 'tan', 'gray', 'beige', 'camel', 'mustard', 'brown', 'khaki', 'orange'],
    'lightblue': ['white', 'gray', 'navy', 'beige', 'khaki', 'tan', 'pink', 'lavender'],
    'navy': ['white', 'gray', 'red', 'khaki', 'brown', 'camel', 'yellow', 'mint', 'burgundy'],
    'red': ['black', 'white', 'denim', 'tan', 'gray', 'navy', 'pink', 'gold'],
    'burgundy': ['white', 'gray', 'navy', 'camel', 'gold', 'olive', 'beige'],
    'green': ['white', 'brown', 'beige', 'tan', 'black', 'peach', 'denim', 'khaki'],
    'olive': ['white', 'black', 'khaki', 'beige', 'camel', 'yellow', 'orange', 'blush'],
    'mint': ['white', 'gray', 'beige', 'navy', 'peach', 'camel', 'lightblue'],
    'beige': ['white', 'black', 'green', 'navy', 'brown', 'lavender', 'orange'],
    'brown': ['white', 'beige', 'green', 'blue', 'khaki', 'mustard', 'orange', 'camel'],
    'tan': ['white', 'blue', 'olive', 'burgundy', 'black', 'peach', 'camel'],
    'camel': ['white', 'black', 'gray', 'navy', 'maroon', 'olive', 'blush'],
    'maroon': ['white', 'gray', 'tan', 'camel', 'gold', 'black'],
    'yellow': ['navy', 'white', 'denim', 'gray', 'olive', 'khaki', 'camel'],
    'mustard': ['navy', 'black', 'gray', 'brown', 'denim', 'beige'],
    'pink': ['white', 'gray', 'lightblue', 'navy', 'denim', 'burgundy'],
    'blush': ['white', 'beige', 'gray', 'olive', 'camel', 'mint'],
    'peach': ['white', 'beige', 'mint', 'gray', 'tan', 'green'],
    'purple': ['white', 'gray', 'navy', 'camel', 'mint', 'gold'],
    'lavender': ['white', 'beige', 'gray', 'lightblue', 'denim', 'pink'],
    'orange': ['white', 'black', 'navy', 'olive', 'brown', 'tan'],
    'denim': ['white', 'black', 'gray', 'beige', 'red', 'mustard', 'pink'],
    'khaki': ['black', 'white', 'olive', 'blue', 'camel', 'mint'],
    'gold': ['black', 'white', 'navy', 'burgundy', 'purple', 'red'],
    'silver': ['black', 'white', 'gray', 'navy', 'lightblue'],
    'pastel pink': ['white', 'gray', 'mint', 'lavender', 'lightblue'],
}

def get_color_palette():
    return COLOR_PALETTE_MAP

def color_match_score(base_color, other_color):
    if not base_color or not other_color:
        return 0.5
    base = base_color.lower().strip()
    other = other_color.lower().strip()
    palette = get_color_palette()
    if base == other:
        return 1.0
    if base in palette and other in palette[base]:
        return 0.9
    if other in palette and base in palette[other]:
        return 0.9
    return 0.4

def color_match_score_palette(base_palette, compare_palette):
    if not base_palette or not compare_palette:
        return 0.5
    matches = 0
    for color1 in base_palette:
        for color2 in compare_palette:
            name1 = hex_to_name_extended(color1)
            name2 = hex_to_name_extended(color2)
            if color_match_score(name1, name2) >= 0.9:
                matches += 1
    # Adjusting score based on length of compare_palette to avoid disproportionate influence
    return min(matches / len(compare_palette) if compare_palette else 0, 1.0)


def style_match_score(style1, style2):
    if not style1 or not style2:
        return 0.5
    return 1.0 if style1.lower() == style2.lower() else 0.0

class ClothingItemViewSet(viewsets.ModelViewSet):
    queryset = ClothingItem.objects.all()
    serializer_class = ClothingItemSerializer
    permission_classes = [IsAuthenticated] # Changed to IsAuthenticated

    def get_queryset(self):
        """
        This view should return a list of all the clothing items
        for the currently authenticated user.
        """
        queryset = ClothingItem.objects.filter(user=self.request.user)
        color = self.request.query_params.get('primary_color')
        if color:
            queryset = queryset.filter(primary_color__iexact=color)
        return queryset

    def perform_create(self, serializer):
        """
        Save the clothing item with the current authenticated user.
        """
        instance = serializer.save(user=self.request.user) # Assign the current user

        try:
            model, _, preprocess = open_clip.create_model_and_transforms('ViT-B-32', pretrained='laion2b_s34b_b79k')
            image = Image.open(instance.image.path).convert("RGB")
            image_input = preprocess(image).unsqueeze(0)
            with torch.no_grad():
                image_features = model.encode_image(image_input)
            instance.feature_vector = json.dumps(image_features.tolist()[0])
        except Exception as e:
            print(f"⚠️ Feature extraction failed: {e}")
            instance.feature_vector = None

        try:
            if instance.image:
                palette = extract_color_palette(instance.image.path, num_colors=5)
                if palette:
                    instance.primary_color = hex_to_name_extended(palette[0])
                    instance.color_palette = palette
                else:
                    instance.primary_color = "unknown"
                    instance.color_palette = []
            else:
                instance.primary_color = "unknown"
                instance.color_palette = []
        except Exception as e:
            print(f"⚠️ Color extraction failed: {e}")
            instance.primary_color = "unknown"
            instance.color_palette = []

        instance.save() # Save again after updating feature_vector and color info

    @action(detail=True, methods=['get'])
    def palette(self, request, pk=None):
        item = self.get_object() # get_object will already filter by user
        return Response({
            "id": item.id,
            "primary_color": item.primary_color,
            "color_palette": item.color_palette
        })

    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        item = self.get_object() # get_object will already filter by user
        if not item.feature_vector:
            return Response({"error": "No feature vector found for this item."}, status=400)
        try:
            target_vector = torch.tensor(json.loads(item.feature_vector), dtype=torch.float32)
        except Exception as e:
            return Response({"error": f"Invalid feature vector: {str(e)}"}, status=400)

        similarities = []
        # Exclude current item and filter by current user's items
        for other in ClothingItem.objects.filter(user=request.user).exclude(id=item.id).exclude(feature_vector=None):
            try:
                other_vec = torch.tensor(json.loads(other.feature_vector), dtype=torch.float32)
                sim = torch.nn.functional.cosine_similarity(target_vector, other_vec, dim=0)
                sim_value = sim.item()
                if 0.65 < sim_value < 1.0: # Only consider reasonably similar items
                    similarities.append((other, sim_value))
            except Exception:
                continue

        similarities.sort(key=lambda x: x[1], reverse=True)

        return Response([
            {
                **self.get_serializer(obj).data,
                "similarity_score": round(score, 4)
            } for obj, score in similarities[:4]
        ])

    @action(detail=False, methods=['post'])
    def generate_outfit(self, request):
        base_id = request.data.get("base_item_id")
        occasion = request.data.get("occasion")

        try:
            # Ensure base_item belongs to the current user
            base_item = ClothingItem.objects.get(id=base_id, user=request.user)
        except ClothingItem.DoesNotExist:
            return Response({"error": "Base item not found or does not belong to the current user."}, status=404)

        # Filter wardrobe to only include items of the current user, excluding the base item
        wardrobe = ClothingItem.objects.filter(user=request.user).exclude(id=base_item.id)
        if occasion:
            wardrobe = wardrobe.filter(style=occasion)

        match_map = {
            "top": ["bottom", "shoes", ],
            "bottom": ["top", "shoes", ],
            "shoes": ["top", "bottom", ],
            "outwear": ["top", "bottom", "shoes"],
            # You might want to define other types, e.g., "outerwear": ["top", "bottom", "shoes"]
        }

        to_match = match_map.get(base_item.clothing_type.lower(), [])
        # Only consider categories that have at least one item for the current user
        categories = {t: list(wardrobe.filter(clothing_type__iexact=t)) for t in to_match if wardrobe.filter(clothing_type__iexact=t).exists()}


        # If no categories have items to match, return an error
        if not any(categories.values()):
            return Response({"error": "Not enough matching clothing items in your wardrobe to form an outfit for the selected base item and occasion."}, status=400)

        all_combinations = product(*categories.values())
        outfits = []

        for combo in all_combinations:
            outfit_data = {"base": ClothingItemSerializer(base_item).data}
            explanation_parts = []
            tags = []
            vectors = []
            full_items = [base_item] + list(combo)

            for item in full_items:
                if item.feature_vector:
                    try:
                        vectors.append(torch.tensor(json.loads(item.feature_vector), dtype=torch.float32))
                    except:
                        # Skip items with invalid feature vectors
                        continue

            visual_score = 0.5 # Default if no visual scores can be calculated
            if len(vectors) > 1:
                visual_scores = []
                for i in range(len(vectors)):
                    for j in range(i+1, len(vectors)):
                        try:
                            sim = torch.nn.functional.cosine_similarity(vectors[i], vectors[j], dim=0).item()
                            visual_scores.append(sim)
                        except Exception as e:
                            print(f"Error calculating visual similarity: {e}")
                            continue # Skip this pair if an error occurs

                if visual_scores:
                    visual_score = sum(visual_scores) / len(visual_scores)
                else:
                    visual_score = 0.5 # Fallback if calculation failed for all pairs

            total_score = 0
            for item in combo:
                clothing_type = item.clothing_type.lower()
                outfit_data[clothing_type] = ClothingItemSerializer(item).data

                color_score = color_match_score_palette(base_item.color_palette, item.color_palette)
                style_score = style_match_score(base_item.style, item.style)
                harmony = get_color_relationship(base_item.primary_color, item.primary_color)
                harmony_bonus = 0.1 if harmony in ["complementary", "analogous", "triadic"] else 0
                clash_penalty = 0.2 if style_score == 0 and color_score < 0.5 else 0

                weighted_score = (
                    0.25 * color_score +
                    0.15 * style_score +
                    0.6 * visual_score + # Visual score is now calculated once for the whole outfit
                    harmony_bonus -
                    clash_penalty
                )

                total_score += weighted_score

                if color_score >= 0.9:
                    tags.append("Color Harmony")
                if style_score == 1.0:
                    tags.append("Style Aligned")
                if harmony and harmony != 'no relationship': # Only add if a specific relationship exists
                    tags.append(f"{harmony.capitalize()} Colors")
                if visual_score > 0.85:
                    tags.append("Visually Cohesive")

                explanation_parts.append(
                    f"{clothing_type}: color_match={round(color_score,2)}, style_match={round(style_score,2)}, harmony={harmony or 'none'}"
                )

            # Average total_score across the number of items matched in the combo
            # This helps normalize scores for outfits with different numbers of items
            final_total_score = total_score / len(combo) if combo else 0

            outfit_data["score"] = round(final_total_score, 2)
            outfit_data["visual_similarity"] = round(visual_score, 2)
            outfit_data["explanation"] = "; ".join(explanation_parts)
            outfit_data["tags"] = list(set(tags))
            outfits.append(outfit_data)

        outfits.sort(key=lambda x: x["score"], reverse=True)
        return Response(outfits[:10])
    # Add this new action to your ClothingItemViewSet, for example, after generate_outfit

    # In your ClothingItemViewSet class in views.py

    # BEST PRACTICE: Explicitly define the url_path for clarity.
    @action(detail=False, methods=['get'], url_path='outfit-of-the-day')
    def outfit_of_the_day(self, request):
        """
        Generates a single, high-quality "Outfit of the Day" suggestion
        by finding the best-matching items.
        """
        try:
            user_wardrobe = ClothingItem.objects.filter(user=request.user)
            if not user_wardrobe.exists():
                return Response({"error": "Your wardrobe is empty. Add items to get a suggestion!"}, status=404)

            # BUG FIX: Use lowercase 'top' and 'bottom' to match the database query logic.
            base_types = ['top', 'bottom']
            potential_bases = user_wardrobe.annotate(
                clothing_type_lower=Lower('clothing_type')
            ).filter(clothing_type_lower__in=base_types)

            if not potential_bases.exists():
                 # If no tops/bottoms, fall back to any item as a base.
                 potential_bases = user_wardrobe

            # PERFORMANCE: More memory-efficient way to get one random item than loading the whole list.
            base_item = potential_bases.order_by('?').first()

            if not base_item:
                 # This can happen if the wardrobe is empty, handle it just in case.
                 return Response({"error": "Could not select a base item from your wardrobe."}, status=404)

            # Call the now-smarter helper function to build the outfit.
            outfit = self.generate_single_outfit(base_item, user_wardrobe)

            if not outfit:
                return Response({
                    "error": "We couldn't create a full outfit. Try adding more item types (tops, bottoms, shoes) to your wardrobe!",
                    "base_item_used": self.get_serializer(base_item).data
                }, status=400)

            return Response(outfit)

        except Exception as e:
            logger.error(f"Critical error in outfit_of_the_day for user {request.user.id}: {e}", exc_info=True)
            return Response({"error": "A server error occurred while preparing your outfit."}, status=500)

    def generate_single_outfit(self, base_item, user_wardrobe):
        """
        Helper function to build the BEST possible outfit around a single base item
        by scoring all potential matches for color and style.
        """
        # Step 1: Identify the components we need to find.
        needed = {'top', 'bottom', 'shoes'}
        outfit = {base_item.clothing_type.lower(): base_item}
        needed.discard(base_item.clothing_type.lower())

        # Step 2: Find the highest-scoring match for each needed component.
        for item_type in needed:
            candidates = user_wardrobe.filter(clothing_type__iexact=item_type).exclude(id=base_item.id)
            if not candidates:
                continue # Skip if there are no items of this type.

            best_match = None
            highest_score = -1

            # GREATNESS UPGRADE: Instead of random choice, we now score every candidate.
            for candidate in candidates:
                # Calculate scores based on the helper functions you already have.
                color_score = color_match_score(base_item.primary_color, candidate.primary_color)
                style_score = style_match_score(base_item.style, candidate.style)
                
                # Create a weighted total score. Here, color is slightly more important.
                total_score = (0.6 * color_score) + (0.4 * style_score)

                if total_score > highest_score:
                    highest_score = total_score
                    best_match = candidate
            
            # Add the best-scoring item to our outfit.
            if best_match:
                outfit[item_type] = best_match

        # Step 3: Check if we have a complete outfit and serialize the data.
        if 'top' in outfit and 'bottom' in outfit and 'shoes' in outfit:
            return {
                'top': self.get_serializer(outfit.get('top')).data,
                'bottom': self.get_serializer(outfit.get('bottom')).data,
                'shoes': self.get_serializer(outfit.get('shoes')).data,
                'explanation': f"A stylish look featuring your {base_item.name}, selected for its excellent color and style harmony.",
                'tags': [base_item.style, 'Outfit of the Day', 'Smart Match']
            }
        
        return None # Return None if a complete outfit could not be formed.
# Existing test and authentication views (no changes needed for multi-user here)
def test_api(request):
    return JsonResponse({'message': 'Hello from Django!'})

def clothing_list(request):
    # This might be deprecated if using ClothingItemViewSet directly for list
    return JsonResponse({"message": "Clothing endpoint working!"})

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
import jwt, datetime
from django.conf import settings

class RegisterView(APIView):
    permission_classes = [AllowAny] # Allow anyone to register
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password)
        return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny] # Allow anyone to log in
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if not user:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        payload = {
            'id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1), # Token valid for 1 day
            'iat': datetime.datetime.utcnow()
        }

        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

        # You can set the token in an HttpOnly cookie for better security in web apps
        # Or just return it in the response for API clients
        response = Response({'message': 'Login successful'})
        response.set_cookie(
            key='jwt',
            value=token,
            httponly=True,
            samesite='Lax', # Recommended for CSRF protection
            expires=(datetime.datetime.utcnow() + datetime.timedelta(days=1)).strftime("%a, %d-%b-%Y %H:%M:%S GMT")
        )
        response.data = {'token': token} # Also return in body for easier client access
        return response

class UserView(APIView):
    permission_classes = [IsAuthenticated] # Only authenticated users can access their own info
    def get(self, request):
        # The request.user object is automatically populated by DRF's authentication classes
        return Response({"username": request.user.username, "id": request.user.id})
from rest_framework_simplejwt.tokens import RefreshToken

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import logging

logger = logging.getLogger(__name__)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]



    def get(self, request):
        logger.info(f"User: {request.user}")
        if not request.user or not request.user.is_authenticated:
            logger.warning("Unauthorized access to user profile")
            return Response({'detail': 'Unauthorized'}, status=401)

        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
        })
