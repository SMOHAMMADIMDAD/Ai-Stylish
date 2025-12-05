from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClothingItemViewSet, test_api, clothing_list
from .views import RegisterView, LoginView,UserProfileView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'clothing', ClothingItemViewSet)


urlpatterns = [
    path('', include(router.urls)),     
# All /clothing/ routes
    path('clothing-list/', clothing_list),            # Your custom view if needed
    path('test-api/', test_api),     
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/', UserProfileView.as_view(), name='user-profile'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
]


