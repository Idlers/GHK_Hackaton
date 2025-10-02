# authapp/views.py
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status, permissions, views
from django.conf import settings
from .serializers import UserSerializer, RegisterSerializer
from django.contrib.auth import get_user_model
from rest_framework.decorators import action, api_view, permission_classes

User = get_user_model()

# Константы cookie
REFRESH_COOKIE_NAME = "app_refresh"

class MyTokenObtainPairView(TokenObtainPairView):
    """
    По логину возвращаем access в JSON и ставим httpOnly cookie для refresh.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        # В ответе simplejwt кладёт 'refresh' и 'access'
        data = response.data
        refresh = data.get("refresh")
        access = data.get("access")
        # Стереть refresh из тела (мы не даём JS доступ)
        if "refresh" in data:
            data.pop("refresh")
        # Создать cookie
        resp = Response({"access": access}, status=response.status_code)
        if refresh:
            # cookie settings: secure=True in production, samesite as needed
            resp.set_cookie(
                REFRESH_COOKIE_NAME,
                refresh,
                httponly=True,
                secure=not settings.DEBUG,  # True в продакшн
                samesite="None" if not settings.DEBUG else "Lax",
                max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
                path="/api/token/refresh/",
            )
        return resp

class MyTokenRefreshView(TokenRefreshView):
    """
    Поддерживает refresh из cookie. Если JS прислал refresh в теле (например, тесты), используем его.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        # если refresh передан в теле, используем его; иначе берем из cookie
        if "refresh" not in request.data:
            refresh_token = request.COOKIES.get(REFRESH_COOKIE_NAME)
            if refresh_token:
                request.data._mutable = True
                request.data["refresh"] = refresh_token
        resp = super().post(request, *args, **kwargs)
        # При ротации токенов simplejwt вернёт 'access' и, возможно, 'refresh'
        data = resp.data
        refresh = data.get("refresh")
        access = data.get("access")
        # удалим refresh из тела
        if "refresh" in data:
            data.pop("refresh")
        out = Response({"access": access}, status=resp.status_code)
        if refresh:
            out.set_cookie(
                REFRESH_COOKIE_NAME,
                refresh,
                httponly=True,
                secure=not settings.DEBUG,
                samesite="None" if not settings.DEBUG else "Lax",
                max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
                path="/api/token/refresh/",
            )
        return out

class LogoutView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        # Получаем refresh token из cookie и blacklisting
        refresh_token = request.COOKIES.get(REFRESH_COOKIE_NAME)
        if not refresh_token:
            return Response(status=status.HTTP_204_NO_CONTENT)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass
        resp = Response({"detail": "Logged out"}, status=status.HTTP_200_OK)
        # удалить cookie
        resp.delete_cookie(REFRESH_COOKIE_NAME, path="/api/token/refresh/")
        return resp

# Регистрация
from rest_framework import viewsets
class RegisterViewSet(viewsets.GenericViewSet):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=201)
