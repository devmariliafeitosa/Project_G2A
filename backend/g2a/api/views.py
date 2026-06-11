from django.shortcuts import render

# Create your views here.

import json
import datetime
import os 

from django.http import JsonResponse
from django.views import View
from django.contrib.auth.hashers import check_password
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework.response import Response
from rest_framework.decorators import api_view
from api.services.disciplina_service import DisciplinasService

import jwt

# from .models import User  

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM")
JWT_EXPIRATION_HOURS = int(os.environ["JWT_EXPIRATION_HOURS"])

@method_decorator(csrf_exempt, name="dispatch")
class LoginView(View):
    """
    POST /login
    Body: { "email": "...", "password": "..." }

    - Compara hash de senha armazenado com o enviado.
    - Senha padrão para primeiro acesso: definida em DEFAULT_FIRST_ACCESS_PASSWORD.
    - Retorna 403 em caso de credenciais inválidas.
    - Retorna 200 com token JWT em caso de sucesso.
    """

    DEFAULT_FIRST_ACCESS_PASSWORD = "12345678"


    def post(self, request):
        # Body Parse
        try:
            body = json.loads(request.body)
        except (json.JSONDecodeError, ValueError):
            return JsonResponse({"detail": "Payload inválido."}, status=400)

        email = body.get("email", "").strip().lower()
        password = body.get("password", "")

        if not email or not password:
            return JsonResponse(
                {"detail": "Email e senha são obrigatórios."}, status=400
            )

        # Search user on BD
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({"detail": "Credenciais inválidas."}, status=403)

        # Verify First Access Password 
        is_first_access = (
            not user.password 
            and password == self.DEFAULT_FIRST_ACCESS_PASSWORD
        )

        # Verify Password Hash
        password_valid = is_first_access or check_password(password, user.password)

        if not password_valid:
            return JsonResponse({"detail": "Credenciais inválidas."}, status=403)

        # Generate Token JWT
        now = datetime.datetime.utcnow()
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "iat": now,
            "exp": now + datetime.timedelta(hours=JWT_EXPIRATION_HOURS),
            "first_access": is_first_access,
        }

        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

        return JsonResponse(
            {
                "token": token,
                "first_access": is_first_access,
                "expires_in": JWT_EXPIRATION_HOURS * 3600,
            },
            status=200,
        )

# Cronograma    
@api_view(["GET"])
def cronograma(request):
    horarios = [
        {"horario": "07:25", },
        {"horario": "09:25", },
        {"horario": "09:50", },
        {"horario": "10:40", },
        {"horario": "11:50", },
    ]

    return Response(horarios)


# Disciplinas
@api_view(["GET"])
def get_disciplines(request):

    disciplinas = DisciplinasService.get_disciplines()

    return Response({
        "success": True,
        "data": disciplinas
    })