import json
import datetime
from decouple import config

import jwt

from django.http import JsonResponse
from django.views import View
from django.contrib.auth.hashers import check_password
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework.response import Response
from rest_framework.decorators import api_view

from api.models import Professor
from api.auth.auth_jwt import jwt_required

from api.serializers.serializers import (
    ProfessorSerializer,
    SemestreSerializer
)

from api.services.disciplina_service import DisciplinasService
from api.services.professor_service import ProfessorService
from api.services.semestre_service import SemestreService
from api.services.perfil_service import PerfilService
from api.services.notify_service import NotificacaoService


JWT_SECRET = config(
    "JWT_SECRET"
)

JWT_ALGORITHM = config(
    "JWT_ALGORITHM",
    default="HS256"
)

JWT_EXPIRATION_HOURS = int(
    config(
        "JWT_EXPIRATION_HOURS",
        default=8
    )
)


# ==========================
# LOGIN
# ==========================

@method_decorator(csrf_exempt, name="dispatch")
class LoginView(View):

    DEFAULT_FIRST_ACCESS_PASSWORD = "12345678"


    def post(self, request):

        try:
            body = json.loads(request.body)

        except (json.JSONDecodeError, ValueError):
            return JsonResponse(
                {"detail": "Payload inválido."},
                status=400
            )


        email = body.get("email", "").strip().lower()
        password = body.get("password", "")


        if not email or not password:
            return JsonResponse(
                {
                    "detail": "Email e senha são obrigatórios."
                },
                status=400
            )


        # Busca professor pelo email
        try:
            professor = Professor.objects.get(
                email=email
            )

        except Professor.DoesNotExist:

            return JsonResponse(
                {
                    "detail": "Credenciais inválidas."
                },
                status=403
            )


        # Primeiro acesso
        is_first_access = (
            not professor.senha
            and password == self.DEFAULT_FIRST_ACCESS_PASSWORD
        )


        # Validação da senha
        password_valid = (
            is_first_access
            or check_password(
                password,
                professor.senha
            )
        )


        if not password_valid:

            return JsonResponse(
                {
                    "detail": "Credenciais inválidas."
                },
                status=403
            )


        now = datetime.datetime.utcnow()


        payload = {

            "sub": str(professor.id),

            "email": professor.email,

            "iat": now,

            "exp": now + datetime.timedelta(
                hours=JWT_EXPIRATION_HOURS
            ),

            "first_access": is_first_access,
        }


        token = jwt.encode(
            payload,
            JWT_SECRET,
            algorithm=JWT_ALGORITHM
        )


        return JsonResponse(
            {
                "token": token,

                "first_access": is_first_access,

                "expires_in":
                    JWT_EXPIRATION_HOURS * 3600,
            },

            status=200
        )



# ==========================
# CRONOGRAMA
# ==========================

@api_view(["GET"])
def cronograma(request):

    horarios = [

        {"horario": "07:25"},
        {"horario": "09:25"},
        {"horario": "09:50"},
        {"horario": "10:40"},
        {"horario": "11:50"},

    ]

    return Response(horarios)



# ==========================
# DISCIPLINAS
# ==========================

@api_view(["GET"])
def get_disciplines(request):

    disciplinas = (
        DisciplinasService
        .get_disciplines()
    )


    return Response({

        "success": True,

        "data": disciplinas

    })



# ==========================
# DOCENTES
# ==========================

@api_view(["GET"])
@jwt_required
def get_docentes(request):

    params = request.query_params


    docentes = ProfessorService.get_docentes(

        status=params.get("status"),

        curso_coordenado_id=
            params.get("curso_coordenado"),

        titulacao=
            params.get("titulacao"),

        search=
            params.get("search"),

    )


    return Response({

        "success": True,

        "data":
            ProfessorSerializer(
                docentes,
                many=True
            ).data

    })



# ==========================
# SEMESTRES
# ==========================

@api_view(["GET"])
@jwt_required
def get_semestres(request):

    semestres = (
        SemestreService.get_semestres(
            status=request.query_params.get(
                "status"
            )
        )
    )


    return Response({

        "success": True,

        "data":
            SemestreSerializer(
                semestres,
                many=True
            ).data

    })



# ==========================
# PERFIL
# ==========================

@api_view(["GET"])
@jwt_required
def get_perfil(request):

    professor = (
        PerfilService
        .get_perfil_by_payload(
            request.user_payload
        )
    )


    if professor is None:

        return Response(

            {
                "success": False,
                "detail":
                    "Perfil não encontrado."
            },

            status=404

        )


    return Response({

        "success": True,

        "data":
            ProfessorSerializer(
                professor
            ).data

    })



# ==========================
# NOTIFICAÇÕES
# ==========================

@api_view(["GET"])
@jwt_required
def get_notificacoes(request):

    apenas_nao_lidas = (

        request
        .query_params
        .get(
            "nao_lidas",
            ""
        )
        .lower()

        == "true"

    )


    notificacoes = (
        NotificacaoService
        .get_notificacoes(

            request.user_payload,

            apenas_nao_lidas=

            apenas_nao_lidas

        )
    )


    return Response({

        "success": True,

        "data": notificacoes

    })