from django.db import models


class Modalidade(models.TextChoices):
    PRESENCIAL = "PRESENCIAL", "Presencial"
    EAD = "EAD", "EAD"
    HIBRIDO = "HIBRIDO", "Híbrido"


class Turno(models.TextChoices):
    MANHA = "MANHA", "Manhã"
    TARDE = "TARDE", "Tarde"
    NOITE = "NOITE", "Noite"
    INTEGRAL = "INTEGRAL", "Integral"


class Nivel(models.TextChoices):
    TECNICO = "TECNICO", "Técnico"
    GRADUACAO = "GRADUACAO", "Graduação"
    POS = "POS_GRADUACAO", "Pós-graduação"


class Titulacao(models.TextChoices):
    GRADUADO = "GRADUADO", "Graduado"
    ESPECIALISTA = "ESPECIALISTA", "Especialista"
    MESTRE = "MESTRE", "Mestre"
    DOUTOR = "DOUTOR", "Doutor"


class SemestreStatus(models.TextChoices):
    PLANEJAMENTO = "PLANEJAMENTO", "Planejamento"
    ATIVO = "ATIVO", "Ativo"
    ENCERRADO = "ENCERRADO", "Encerrado"


class DiaSemana(models.TextChoices):
    SEG = "SEG", "Segunda"
    TER = "TER", "Terça"
    QUA = "QUA", "Quarta"
    QUI = "QUI", "Quinta"
    SEX = "SEX", "Sexta"
    SAB = "SAB", "Sábado"


class TipoAula(models.TextChoices):
    TEORICA = "TEORICA", "Teórica"
    PRATICA = "PRATICA", "Prática"
    LABORATORIO = "LABORATORIO", "Laboratório"


class MotivoAfastamento(models.TextChoices):
    FERIAS = "FERIAS", "Férias"
    LICENCA_MEDICA = "LICENCA_MEDICA", "Licença Médica"
    LICENCA_MATERNIDADE = "LICENCA_MATERNIDADE", "Licença Maternidade"
    CAPACITACAO = "CAPACITACAO", "Capacitação"
    OUTRO = "OUTRO", "Outro"


class Curso(models.Model):

    id_curso = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)

    nivel = models.CharField(
        max_length=20,
        choices=Nivel.choices
    )

    modalidade = models.CharField(
        max_length=20,
        choices=Modalidade.choices,
        default=Modalidade.PRESENCIAL
    )

    duracao_semestres = models.SmallIntegerField()

    turno = models.CharField(
        max_length=10,
        choices=Turno.choices
    )

    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = "cursos"
        managed = False


class Professor(models.Model):

    id_prof = models.AutoField(
        primary_key=True
    )

    nome = models.CharField(
        max_length=150
    )

    siape = models.IntegerField(
        unique=True,
        null=True
    )

    email = models.EmailField(
        max_length=150,
        unique=True,
        null=True
    )

    data_nascimento = models.DateField(
        null=True
    )
    ano_egresso = models.DateField()

    area_atuacao = models.CharField(
        max_length=150,
        null=True
    )

    status = models.BooleanField(
        default=True
    )

    senha = models.CharField(
        max_length=255
    )

    titulacao = models.CharField(
        max_length=20,
        choices=Titulacao.choices,
        null=True
    )

    carga_horaria_maxima = models.IntegerField(
        default=20
    )

    is_coordenador = models.BooleanField(
        default=False
    )

    curso_coordenado = models.ForeignKey(
        Curso,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        db_column="id_curso_coordenado"
    )

    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = "professores"
        managed = False


class Disciplina(models.Model):

    id_disciplina = models.AutoField(
        primary_key=True
    )

    nome = models.CharField(
        max_length=150
    )

    carga_horaria = models.IntegerField()
    obrigatoria = models.BooleanField(
        default=True
    )

    disciplina_prereq = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        db_column="id_disciplina_prereq"
    )

    curso = models.ForeignKey(
        Curso,
        on_delete=models.RESTRICT,
        db_column="id_curso"
    )

    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = "disciplinas"
        managed = False


class Turma(models.Model):

    id_turma = models.AutoField(
        primary_key=True
    )
    nome = models.CharField(
        max_length=50
    )

    periodo = models.SmallIntegerField()
    turno = models.CharField(
        max_length=10,
        choices=Turno.choices
    )

    curso = models.ForeignKey(
        Curso,
        on_delete=models.RESTRICT,
        db_column="id_curso"
    )

    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = "turma"
        managed = False


class Semestre(models.Model):

    id_semestre = models.AutoField(
        primary_key=True
    )

    nome = models.CharField(
        max_length=10
    )

    data_inicio = models.DateField()
    data_fim = models.DateField()

    status = models.CharField(
        max_length=15,
        choices=SemestreStatus.choices
    )

    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()


    class Meta:
        db_table = "semestre"
        managed = False


class CursoProfessor(models.Model):

    id = models.AutoField(
        primary_key=True
    )

    curso = models.ForeignKey(
        Curso,
        on_delete=models.RESTRICT,
        db_column="id_curso",
        related_name="professores_vinculados"
    )

    professor = models.ForeignKey(
        Professor,
        on_delete=models.RESTRICT,
        db_column="id_prof",
        related_name="cursos_vinculados"
    )

    created_at = models.DateTimeField()

    class Meta:

        db_table = "cursos_professores"
        managed = False

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "curso",
                    "professor"
                ],
                name="uq_curso_professor"
            )
        ]


class DisciplinaProfessor(models.Model):

    id = models.AutoField(
        primary_key=True
    )

    disciplina = models.ForeignKey(
        Disciplina,
        on_delete=models.RESTRICT,
        db_column="id_disciplina",
        related_name="professores_habilitados"
    )

    professor = models.ForeignKey(
        Professor,
        on_delete=models.RESTRICT,
        db_column="id_prof",
        related_name="disciplinas_habilitadas"
    )

    semestre = models.ForeignKey(
        Semestre,
        on_delete=models.RESTRICT,
        db_column="id_semestre",
        related_name="disciplinas_professores"
    )

    created_at = models.DateTimeField()

    class Meta:

        db_table = "disciplina_professores"
        managed = False

        constraints = [

            models.UniqueConstraint(
                fields=[
                    "disciplina",
                    "professor",
                    "semestre"
                ],
                name="uq_disciplina_professor_semestre"
            )
        ]


class Afastamento(models.Model):

    id_afastamento = models.AutoField(
        primary_key=True
    )

    professor = models.ForeignKey(
        Professor,
        on_delete=models.RESTRICT,
        db_column="id_prof",
        related_name="afastamentos"
    )

    data_inicio = models.DateField()
    data_fim = models.DateField()

    motivo = models.CharField(
        max_length=30,
        choices=MotivoAfastamento.choices
    )

    descricao = models.TextField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField()

    class Meta:

        db_table = "afastamento"
        managed = False


class Alocacao(models.Model):

    id_alocacao = models.AutoField(
        primary_key=True
    )

    professor = models.ForeignKey(
        Professor,
        on_delete=models.RESTRICT,
        db_column="id_prof",
        related_name="alocacoes"
    )

    disciplina = models.ForeignKey(
        Disciplina,
        on_delete=models.RESTRICT,
        db_column="id_disciplina",
        related_name="alocacoes"
    )

    semestre = models.ForeignKey(
        Semestre,
        on_delete=models.RESTRICT,
        db_column="id_semestre",
        related_name="alocacoes"
    )

    turma = models.ForeignKey(
        Turma,
        on_delete=models.RESTRICT,
        db_column="id_turma",
        related_name="alocacoes"
    )

    dia_semana = models.CharField(
        max_length=3,
        choices=DiaSemana.choices
    )

    horario_inicio = models.TimeField()
    horario_fim = models.TimeField()

    sala = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    tipo_aula = models.CharField(
        max_length=15,
        choices=TipoAula.choices,
        default=TipoAula.TEORICA
    )

    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:

        db_table = "alocacao"
        managed = False

        constraints = [

            models.UniqueConstraint(
                fields=[
                    "professor",
                    "semestre",
                    "dia_semana",
                    "horario_inicio"
                ],
                name="uq_prof_semestre_horario"
            ),

            models.UniqueConstraint(
                fields=[
                    "turma",
                    "semestre",
                    "dia_semana",
                    "horario_inicio"
                ],
                name="uq_turma_semestre_horario"
            )
        ]

class DisciplinaOfertada(models.Model):

    id_oferta = models.AutoField(
        primary_key=True
    )


    semestre = models.ForeignKey(
        "Semestre",
        on_delete=models.RESTRICT,
        related_name="disciplinas_ofertadas"
    )


    turma = models.ForeignKey(
        "Turma",
        on_delete=models.RESTRICT,
        related_name="disciplinas_ofertadas"
    )


    disciplina = models.ForeignKey(
        "Disciplina",
        on_delete=models.RESTRICT,
        related_name="ofertas"
    )


    carga_horaria = models.IntegerField(
        null=False
    )


    modalidade = models.CharField(
        max_length=20,
        default="PRESENCIAL"
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    updated_at = models.DateTimeField(
        auto_now=True
    )


    class Meta:

        db_table = "disciplina_ofertada"

        constraints = [

            models.UniqueConstraint(
                fields=[
                    "semestre",
                    "turma",
                    "disciplina"
                ],
                name="uq_disciplina_turma_semestre"
            )

        ]


    def __str__(self):

        return (
            f"{self.disciplina.nome} - "
            f"{self.turma.nome} - "
            f"{self.semestre.nome}"
        )