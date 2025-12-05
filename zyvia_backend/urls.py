from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # This includes all your app-specific routes like /api/clothing/, /api/user/, etc.
    path('api/', include('wardrobe.urls')),

    # ✅ CORRECT: Use simplejwt's built-in views for authentication
    # The frontend will post username/password to this endpoint
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
