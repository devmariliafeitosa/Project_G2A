from django.db import models

class TurnoCurso(models.TextChoices):
    MANHA = "MANHA", "Manhã"
    TARDE = "TARDE", "Tarde"
    NOITE = "NOITE", "Noite"
    INTEGRAL = "INTEGRAL", "Integral"


class Titulacao(models.TextChoices):
    GRADUADO = "GRADUADO", "Graduado"
    ESPECIALISTA = "ESPECIALISTA", "Especialista"
    MESTRE = "MESTRE", "Mestre"
    DOUTOR = "DOUTOR", "Doutor"


class DiaSemana(models.TextChoices):
    SEG = "SEG", "Seg"
    TER = "TER", "Ter"
    QUA = "QUA", "Qua"
    QUI = "QUI", "Qui"
    SEX = "SEX", "Sex"
    SAB = "SAB", "Sab"


class TipoAula(models.TextChoices):
    TEORICA = "TEORICA", "Teórica"
    PRATICA = "PRATICA", "Prática"
    LABORATORIO = "LABORATORIO", "Laboratório"


class StatusSemestre(models.TextChoices):
    PLANEJAMENTO = "PLANEJAMENTO", "Planejamento"
    ATIVO = "ATIVO", "Ativo"
    ENCERRADO = "ENCERRADO", "Encerrado"

# Models base

class Curso(models.Model):
    nome = models.CharField(max_length=100)
    turno = models.CharField(max_length=10, choices=TurnoCurso.choices)


class Professor(models.Model):
    nome = models.CharField(max_length=150)
    siape = models.IntegerField(unique=True, null=True, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    ano_egresso = models.IntegerField()
    status = models.BooleanField(default=True)
    senha = models.CharField(max_length=50)
    telefone = models.CharField(max_length=20, null=True, blank=True)

    titulacao = models.CharField(max_length=15, choices=Titulacao.choices)
    carga_horaria_maxima = models.IntegerField(default=40)

    is_coordenador = models.BooleanField(default=False)
    curso_coordenado = models.ForeignKey(
        Curso,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="coordenadores"
    )


class Disciplina(models.Model):
    # corrigindo: era VARCHAR no SQL
    id_disciplina = models.CharField(max_length=20, primary_key=True)
    nome = models.CharField(max_length=100)
    carga_horaria = models.IntegerField()
    curso = models.ForeignKey(Curso, on_delete=models.RESTRICT)


class Turma(models.Model):
    nome = models.CharField(max_length=25)
    periodo = models.IntegerField()
    turno = models.CharField(max_length=10, choices=DiaSemana.choices)
    curso = models.ForeignKey(Curso, on_delete=models.RESTRICT)


class Semestre(models.Model):
    nome = models.CharField(max_length=10)
    data_inicio = models.DateField()
    data_fim = models.DateField()
    status = models.CharField(
        max_length=15,
        choices=StatusSemestre.choices,
        default=StatusSemestre.PLANEJAMENTO
    )

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(data_fim__gt=models.F("data_inicio")),
                name="chk_datas"
            )
        ]

# Relação professor-disciplina

class DisciplinaProfessor(models.Model):
    disciplina = models.ForeignKey(Disciplina, on_delete=models.RESTRICT)
    professor = models.ForeignKey(Professor, on_delete=models.RESTRICT)
    semestre = models.ForeignKey(Semestre, on_delete=models.RESTRICT)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["disciplina", "professor", "semestre"],
                name="uq_disc_prof_sem"
            )
        ]

# Alocação

class Alocacao(models.Model):
    professor = models.ForeignKey(Professor, on_delete=models.RESTRICT)
    disciplina = models.ForeignKey(Disciplina, on_delete=models.RESTRICT)
    semestre = models.ForeignKey(Semestre, on_delete=models.RESTRICT)
    turma = models.ForeignKey(Turma, on_delete=models.RESTRICT)

    dia_semana = models.CharField(max_length=3, choices=DiaSemana.choices)
    horario_inicio = models.TimeField()
    horario_fim = models.TimeField()

    sala = models.CharField(max_length=20, null=True, blank=True)
    tipo_aula = models.CharField(
        max_length=15,
        choices=TipoAula.choices,
        default=TipoAula.TEORICA
    )

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(horario_fim__gt=models.F("horario_inicio")),
                name="chk_horario"
            ),
            models.UniqueConstraint(
                fields=["professor", "semestre", "dia_semana", "horario_inicio"],
                name="uq_prof_horario"
            ),
            models.UniqueConstraint(
                fields=["turma", "semestre", "dia_semana", "horario_inicio"],
                name="uq_turma_horario"
            ),
        ]
        indexes = [
            models.Index(fields=["semestre"]),
            models.Index(fields=["professor"]),
            models.Index(fields=["turma"]),
        ]