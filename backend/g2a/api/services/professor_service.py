from django.db.models import Q

from api.models import Professor


class ProfessorService:
    """
    Camada de serviço para consultas relacionadas a Professor (docente).
    Mantém a lógica de acesso a dados fora das views, no mesmo padrão
    usado em DisciplinasService.
    """

    @staticmethod
    def get_docentes(status=None, curso_coordenado_id=None, titulacao=None, search=None):
        """
        Retorna queryset de Professor filtrado pelos parâmetros informados.
        Todos os filtros são opcionais e combinados com AND.

        Args:
            status: string vinda de query param ("true"/"false"/"1"/"0").
            curso_coordenado_id: id do Curso coordenado pelo professor.
            titulacao: uma das opções de Titulacao (ex: "MESTRE").
            search: busca parcial (case-insensitive) por nome ou e-mail.
        """
        queryset = Professor.objects.select_related("curso_coordenado").all()

        if status is not None:
            status_bool = str(status).strip().lower() in ("1", "true", "ativo")
            queryset = queryset.filter(status=status_bool)

        if curso_coordenado_id:
            queryset = queryset.filter(curso_coordenado_id=curso_coordenado_id)

        if titulacao:
            queryset = queryset.filter(titulacao=titulacao.strip().upper())

        if search:
            search = search.strip()
            queryset = queryset.filter(
                Q(nome__icontains=search) | Q(email__icontains=search)
            )

        return queryset.order_by("nome")