import json
import datetime
from decouple import config

import jwt

from django.db import models
from django.http import JsonResponse
from django.views import View
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework.response import Response
from rest_framework.decorators import api_view

from api.models import (
    Professor,
    Curso,
    Disciplina,
    Turma,
    Semestre,
    SemestreStatus,
    CursoProfessor,
    DisciplinaProfessor,
    Afastamento,
    Alocacao
)
from api.auth.auth_jwt import jwt_required

from api.serializers.serializers import (
    CursoSerializer,
    ProfessorSerializer,
    DisciplinaSerializer,
    TurmaSerializer,
    SemestreSerializer,
    CursoProfessorSerializer,
    DisciplinaProfessorSerializer,
    AfastamentoSerializer,
    AlocacaoSerializer
)

from api.services.disciplina_service import DisciplinasService
from api.services.professor_service import ProfessorService
from api.services.semestre_service import SemestreService
from api.services.perfil_service import PerfilService
from api.services.notify_service import NotificacaoService
from api.services.curso_service import CursoService


JWT_SECRET = config(
    "JWT_SECRET",
    cast=str
)

JWT_ALGORITHM = config(
    "JWT_ALGORITHM",
    default="HS256",
    cast=str
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

            "sub": str(professor.id_prof),

            "email": professor.email,

            "iat": now,

            "exp": now + datetime.timedelta(
                hours=JWT_EXPIRATION_HOURS
            ),

            "first_access": is_first_access,
        }


        token = jwt.encode(
            payload,
            str(JWT_SECRET),
            algorithm=str(JWT_ALGORITHM)
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
    status = params.get("status")
    if status is not None:
        status = str(status).strip().lower() in ("1", "true", "ativo")


    docentes = ProfessorService.get_professores(

        status=status,

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

@api_view(["GET", "POST"])
@jwt_required
def lancamento_semestre(request):
    if request.method == "GET":
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

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return Response({"success": False, "detail": "Payload inválido."}, status=400)

    # Creating Semester (POST)
    nome = body.get("nome")
    data_inicio = body.get("data_inicio")
    data_fim = body.get("data_fim")
    status = body.get("status")

    if not nome or not data_inicio or not data_fim or not status:
        return Response({"success": False, "detail": "nome, data_inicio, data_fim e status são obrigatórios."}, status=400)

    try:
        data_inicio = datetime.datetime.fromisoformat(data_inicio).date()
        data_fim = datetime.datetime.fromisoformat(data_fim).date()
    except ValueError:
        return Response({"success": False, "detail": "Formato de data inválido. Use AAAA-MM-DD."}, status=400)

    status = status.strip().upper()
    if status not in {choice.value for choice in SemestreStatus}:
        return Response({"success": False, "detail": "Status inválido."}, status=400)

    if data_fim < data_inicio:
        return Response({"success": False, "detail": "data_fim deve ser posterior a data_inicio."}, status=400)

    semestre = SemestreService.create_semestre({
        "nome": nome,
        "data_inicio": data_inicio,
        "data_fim": data_fim,
        "status": status,
        "created_at": timezone.now(),
        "updated_at": timezone.now(),
    })

    return Response({
        "success": True,
        "data": SemestreSerializer(semestre).data
    })


# ==========================
# DASHBOARDS
# ==========================


@api_view(["GET"])
@jwt_required
def dashboard_coord(request):
    professor = PerfilService.get_perfil_by_payload(request.user_payload)
    if professor is None:
        return Response({"success": False, "detail": "Perfil não encontrado."}, status=404)

    if not professor.is_coordenador:
        return Response({"success": False, "detail": "Acesso negado."}, status=403)

    total_cursos = CursoService.get_cursos().count()
    total_disciplinas = Disciplina.objects.count()
    total_professores = Professor.objects.filter(curso_coordenado=professor.curso_coordenado).count()
    semestres_ativos = Semestre.objects.filter(status=SemestreStatus.ATIVO).count()

    return Response({
        "success": True,
        "data": {
            "total_cursos": total_cursos,
            "total_disciplinas": total_disciplinas,
            "total_professores_coordenados": total_professores,
            "semestres_ativos": semestres_ativos,
        }
    })


@api_view(["GET"])
@jwt_required
def dashboard_admin(request):
    total_cursos = CursoService.get_cursos().count()
    total_disciplinas = Disciplina.objects.count()
    total_professores = Professor.objects.count()
    total_alocacoes = Alocacao.objects.count()
    total_afastamentos = Afastamento.objects.count()

    return Response({
        "success": True,
        "data": {
            "total_cursos": total_cursos,
            "total_disciplinas": total_disciplinas,
            "total_professores": total_professores,
            "total_alocacoes": total_alocacoes,
            "total_afastamentos": total_afastamentos,
        }
    })


@api_view(["GET"])
@jwt_required
def dashboard_prof(request):
    professor = PerfilService.get_perfil_by_payload(request.user_payload)
    if professor is None:
        return Response({"success": False, "detail": "Perfil não encontrado."}, status=404)

    alocacoes = Alocacao.objects.filter(professor=professor).count()
    disciplinas_habilitadas = DisciplinaProfessor.objects.filter(professor=professor).count()

    return Response({
        "success": True,
        "data": {
            "professor": professor.nome,
            "alocacoes": alocacoes,
            "disciplinas_habilitadas": disciplinas_habilitadas,
            "curso_coordenado": professor.curso_coordenado.nome if professor.curso_coordenado else None,
        }
    })


# Not working yet (I think)
@api_view(["GET"])
@jwt_required
def relatorios(request):
    return Response({
        "success": True,
        "data": [
            {"id": "alocacoes", "nome": "Relatório de Alocações"},
            {"id": "docentes", "nome": "Relatório de Docentes"},
            {"id": "cursos", "nome": "Relatório de Cursos"},
        ]
    })


@api_view(["GET", "POST"])
@jwt_required
def alocacao_professores(request):
    if request.method == "GET":
        params = request.query_params
        alocacoes = Alocacao.objects.all()

        filters = {
            "professor_id": params.get("professor"),
            "disciplina_id": params.get("disciplina"),
            "semestre_id": params.get("semestre"),
            "turma_id": params.get("turma"),
            "dia_semana": params.get("dia_semana"),
        }

        alocacoes = alocacoes.filter(
            **{k: v for k, v in filters.items() if v}
        )

        return Response({
            "success": True,
            "data": AlocacaoSerializer(alocacoes, many=True).data
        })

    serializer = AlocacaoSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({
            "success": False,
            "errors": serializer.errors
        }, status=400)

    alocacao = serializer.save()

    return Response({
        "success": True,
        "data": AlocacaoSerializer(alocacao).data
    }, status=201)


@api_view(["GET"])
@jwt_required
def alocacao_professores_total_vinculacao(request):
    total_por_curso = (
        CursoProfessor.objects
        .values("curso__nome")
        .annotate(total_vinculados=models.Count("professor"))
        .order_by("curso__nome")
    )

    return Response({"success": True, "data": list(total_por_curso)})


@api_view(["GET"])
@jwt_required
def alocacao_professores_agenda_professor(request):
    professor_id = request.query_params.get("professor")
    if not professor_id:
        return Response({"success": False, "detail": "Parâmetro professor é obrigatório."}, status=400)

    alocacoes = Alocacao.objects.filter(professor_id=professor_id).order_by("dia_semana", "horario_inicio")
    return Response({"success": True, "data": AlocacaoSerializer(alocacoes, many=True).data})


@api_view(["POST"])
@jwt_required
def alocacao_professores_grade_curso(request):
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return Response({"success": False, "detail": "Payload inválido."}, status=400)

    curso_id = body.get("curso")
    if not curso_id:
        return Response({"success": False, "detail": "curso é obrigatório."}, status=400)

    disciplinas = Disciplina.objects.filter(curso_id=curso_id)
    return Response({"success": True, "data": DisciplinaSerializer(disciplinas, many=True).data})


@api_view(["GET", "POST"])
@jwt_required
def alocacao_professores_montar_grade(request):
    if request.method == "GET":
        cursos = CursoSerializer(CursoService.get_cursos(), many=True).data
        semestres = SemestreSerializer(SemestreService.get_semestres(), many=True).data
        return Response({"success": True, "data": {"cursos": cursos, "semestres": semestres}})

    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return Response({"success": False, "detail": "Payload inválido."}, status=400)

    curso_id = body.get("curso")
    semestre_id = body.get("semestre")
    if not curso_id or not semestre_id:
        return Response({"success": False, "detail": "curso e semestre são obrigatórios."}, status=400)

    disciplinas = Disciplina.objects.filter(curso_id=curso_id)
    alocacoes = Alocacao.objects.filter(semestre_id=semestre_id, disciplina__curso_id=curso_id)

    return Response({
        "success": True,
        "data": {
            "disciplinas": DisciplinaSerializer(disciplinas, many=True).data,
            "alocacoes": AlocacaoSerializer(alocacoes, many=True).data,
        }
    })


@api_view(["GET"])
@jwt_required
def grade_professor(request):
    professor_id = request.query_params.get("professor")
    if not professor_id:
        return Response({"success": False, "detail": "Parâmetro professor é obrigatório."}, status=400)

    alocacoes = Alocacao.objects.filter(professor_id=professor_id).order_by("semestre", "dia_semana", "horario_inicio")
    return Response({"success": True, "data": AlocacaoSerializer(alocacoes, many=True).data})


@api_view(["GET"])
@jwt_required
def disciplinas_professor(request):
    professor_id = request.query_params.get("professor")
    if not professor_id:
        return Response({"success": False, "detail": "Parâmetro professor é obrigatório."}, status=400)

    disciplinas = DisciplinaProfessor.objects.filter(professor_id=professor_id)
    return Response({"success": True, "data": DisciplinaProfessorSerializer(disciplinas, many=True).data})


@api_view(["GET", "POST"])
@jwt_required
def cursos_disciplinas(request):
    if request.method == "GET":
        params = request.query_params
        qs = CursoProfessor.objects.all()

        if params.get("curso"):
            qs = qs.filter(curso_id=params.get("curso"))
        if params.get("professor"):
            qs = qs.filter(professor_id=params.get("professor"))

        return Response({
            "success": True,
            "data": CursoProfessorSerializer(qs, many=True).data
        })

    serializer = CursoProfessorSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({"success": False, "errors": serializer.errors}, status=400)

    obj = serializer.save()

    return Response({
        "success": True,
        "data": CursoProfessorSerializer(obj).data
    }, status=201)


@api_view(["GET", "POST"])
@jwt_required
def ocorrencias(request):
    if request.method == "GET":
        qs = Afastamento.objects.all()

        if request.query_params.get("professor"):
            qs = qs.filter(professor_id=request.query_params.get("professor"))

        return Response({
            "success": True,
            "data": AfastamentoSerializer(qs, many=True).data
        })

    serializer = AfastamentoSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({"success": False, "errors": serializer.errors}, status=400)

    obj = serializer.save()

    return Response({
        "success": True,
        "data": AfastamentoSerializer(obj).data
    }, status=201)


@api_view(["GET"])
@jwt_required
def grade_cursos(request):
    cursos = CursoService.get_cursos()
    resultado = []
    for curso in cursos:
        disciplinas = Disciplina.objects.filter(curso=curso)
        resultado.append({
            "curso": CursoSerializer(curso).data,
            "disciplinas": DisciplinaSerializer(disciplinas, many=True).data,
        })
    return Response({"success": True, "data": resultado})


@api_view(["POST"])
@jwt_required
def preferencia_dia(request):
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return Response({"success": False, "detail": "Payload inválido."}, status=400)

    professor_id = body.get("professor")
    dia_semana = body.get("dia_semana")
    preferencia = body.get("preferencia")

    if not professor_id or not dia_semana or not preferencia:
        return Response({"success": False, "detail": "professor, dia_semana e preferencia são obrigatórios."}, status=400)

    return Response({
        "success": True,
        "data": {
            "professor": professor_id,
            "dia_semana": dia_semana,
            "preferencia": preferencia,
            "status": "registrada"
        }
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