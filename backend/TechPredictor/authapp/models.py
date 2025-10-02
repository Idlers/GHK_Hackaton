# authapp/models.py
import uuid
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class User(AbstractUser):
    # Оставляем только две роли
    ROLE_DISPATCHER = "dispatcher"
    ROLE_OPERATOR = "operator"
    ROLE_CHOICES = [
        (ROLE_DISPATCHER, "Диспетчер"),
        (ROLE_OPERATOR, "Оператор"),
    ]

    role = models.CharField(max_length=32, choices=ROLE_CHOICES, default=ROLE_OPERATOR)

    # Переопределяем M2M поля, чтобы не было конфликта reverse accessor'ов
    groups = models.ManyToManyField(
        Group,
        verbose_name="groups",
        blank=True,
        related_name="authapp_user_set",  # <--- уникальное имя обратной связи
        help_text=(
            "The groups this user belongs to. A user will get all permissions "
            "granted to each of their groups."
        ),
    )

    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name="user permissions",
        blank=True,
        related_name="authapp_user_permissions",  # <--- уникальное имя обратной связи
        help_text="Specific permissions for this user.",
    )

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        swappable = "AUTH_USER_MODEL"

    def __str__(self):
        return self.get_username()
