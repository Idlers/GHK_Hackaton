# authapp/urls.py
from django.urls import path
from .views import MyTokenObtainPairView, MyTokenRefreshView, LogoutView, RegisterViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"register", RegisterViewSet, basename="register")

urlpatterns = [
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", MyTokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="auth_logout"),
]
urlpatterns += router.urls
