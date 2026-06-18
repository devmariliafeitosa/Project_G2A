from rest_framework import serializers

from api.models import Professor, Curso


class CursoResumoSerializer(serializers.ModelSerializer):
    """Representação resumida de Curso, usada como nested field."""

    class Meta:
        model = Curso
        fields = ["id", "nome", "turno"]


class ProfessorSerializer(serializers.ModelSerializer):
    """
    Serializa dados públicos do Professor (docente).

    SEGURANÇA: o campo `senha` (Professor.senha) NUNCA é incluído aqui,
    mesmo existindo no model. Não adicionar `senha`/`password` em `fields`.
    """

    curso_coordenado = CursoResumoSerializer(read_only=True)

    class Meta:
        model = Professor
        fields = [
            "id",
            "nome",
            "siape",
            "email",
            "telefone",
            "data_nascimento",
            "ano_egresso",
            "status",
            "titulacao",
            "carga_horaria_maxima",
            "is_coordenador",
            "curso_coordenado",
        ]
        read_only_fields = fields