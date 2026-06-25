from rest_framework import serializers

from api.models import (
    Curso,
    Professor,
    Disciplina,
    Turma,
    Semestre,
    CursoProfessor,
    DisciplinaProfessor,
    Afastamento,
    Alocacao,
    DisciplinaOfertada
)


class CursoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Curso

        fields = "__all__"


class ProfessorSerializer(serializers.ModelSerializer):

    curso_coordenado_nome = serializers.CharField(
        source="curso_coordenado.nome",
        read_only=True
    )

    class Meta:

        model = Professor

        fields = [
            "id_prof",
            "nome",
            "siape",
            "email",
            "data_nascimento",
            "ano_egresso",
            "area_atuacao",
            "status",
            "titulacao",
            "carga_horaria_maxima",
            "is_coordenador",
            "curso_coordenado",
            "curso_coordenado_nome",
            "created_at",
            "updated_at"
        ]


class DisciplinaSerializer(serializers.ModelSerializer):

    curso_nome = serializers.CharField(
        source="curso.nome",
        read_only=True
    )

    prerequisito_nome = serializers.CharField(
        source="disciplina_prereq.nome",
        read_only=True
    )

    class Meta:

        model = Disciplina

        fields = [
            "id_disciplina",
            "nome",
            "carga_horaria",
            "obrigatoria",
            "disciplina_prereq",
            "prerequisito_nome",
            "curso",
            "curso_nome",
            "created_at",
            "updated_at"
        ]


class TurmaSerializer(serializers.ModelSerializer):

    curso_nome = serializers.CharField(
        source="curso.nome",
        read_only=True
    )

    class Meta:

        model = Turma

        fields = [
            "id_turma",
            "nome",
            "periodo",
            "turno",
            "curso",
            "curso_nome",
            "created_at",
            "updated_at"
        ]


class SemestreSerializer(serializers.ModelSerializer):

    class Meta:

        model = Semestre

        fields = "__all__"


class CursoProfessorSerializer(serializers.ModelSerializer):

    professor_nome = serializers.CharField(
        source="professor.nome",
        read_only=True
    )

    curso_nome = serializers.CharField(
        source="curso.nome",
        read_only=True
    )

    class Meta:

        model = CursoProfessor

        fields = [
            "id",
            "curso",
            "curso_nome",
            "professor",
            "professor_nome",
            "created_at"
        ]


class DisciplinaProfessorSerializer(serializers.ModelSerializer):

    disciplina_nome = serializers.CharField(
        source="disciplina.nome",
        read_only=True
    )

    professor_nome = serializers.CharField(
        source="professor.nome",
        read_only=True
    )

    semestre_nome = serializers.CharField(
        source="semestre.nome",
        read_only=True
    )

    class Meta:

        model = DisciplinaProfessor

        fields = [
            "id",
            "disciplina",
            "disciplina_nome",
            "professor",
            "professor_nome",
            "semestre",
            "semestre_nome",
            "created_at"
        ]


class AfastamentoSerializer(serializers.ModelSerializer):

    professor_nome = serializers.CharField(
        source="professor.nome",
        read_only=True
    )

    class Meta:

        model = Afastamento

        fields = [
            "id_afastamento",
            "professor",
            "professor_nome",
            "data_inicio",
            "data_fim",
            "motivo",
            "descricao",
            "created_at"
        ]


class AlocacaoSerializer(serializers.ModelSerializer):

    professor_nome = serializers.CharField(
        source="professor.nome",
        read_only=True
    )

    disciplina_nome = serializers.CharField(
        source="disciplina.nome",
        read_only=True
    )

    turma_nome = serializers.CharField(
        source="turma.nome",
        read_only=True
    )

    semestre_nome = serializers.CharField(
        source="semestre.nome",
        read_only=True
    )

    class Meta:

        model = Alocacao

        fields = [
            "id_alocacao",

            "professor",
            "professor_nome",

            "disciplina",
            "disciplina_nome",

            "semestre",
            "semestre_nome",

            "turma",
            "turma_nome",

            "dia_semana",

            "horario_inicio",
            "horario_fim",

            "sala",

            "tipo_aula",

            "created_at",
            "updated_at"
        ]


class DisciplinaOfertadaSerializer(serializers.ModelSerializer):

    disciplina_nome = serializers.CharField(
        source="disciplina.nome",
        read_only=True
    )


    turma_nome = serializers.CharField(
        source="turma.nome",
        read_only=True
    )


    semestre_nome = serializers.CharField(
        source="semestre.nome",
        read_only=True
    )


    class Meta:

        model = DisciplinaOfertada

        fields = [

            "id_oferta",

            "semestre",
            "semestre_nome",

            "turma",
            "turma_nome",

            "disciplina",
            "disciplina_nome",

            "carga_horaria",

            "modalidade",

            "created_at",
            "updated_at"

        ]

        read_only_fields = [
            "id_oferta",
            "created_at",
            "updated_at"
        ]