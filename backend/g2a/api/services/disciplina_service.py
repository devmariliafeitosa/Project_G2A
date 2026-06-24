from api.models import Disciplina

class DisciplinasService:

    @staticmethod
    def get_disciplines():

        disciplinas = (
            Disciplina.objects
            .select_related(
                "id_curso",
                "id_disciplina_prereq"
            )
            .all()
        )

        return disciplinas


    @staticmethod
    def get_disciplina_by_id(id_disciplina):

        try:

            return (
                Disciplina.objects
                .select_related(
                    "id_curso",
                    "id_disciplina_prereq"
                )
                .get(
                    id_disciplina=id_disciplina
                )
            )

        except Disciplina.DoesNotExist:

            return None


    @staticmethod
    def create_disciplina(data):

        disciplina = Disciplina.objects.create(

            nome=data["nome"],

            carga_horaria=data["carga_horaria"],

            obrigatoria=data.get(
                "obrigatoria",
                True
            ),

            id_curso_id=data["id_curso"],

            id_disciplina_prereq_id=data.get(
                "id_disciplina_prereq"
            )
        )

        return disciplina


    @staticmethod
    def update_disciplina(
        id_disciplina,
        data
    ):

        disciplina = (
            DisciplinasService
            .get_disciplina_by_id(id_disciplina)
        )

        if not disciplina:

            return None

        for campo, valor in data.items():

            setattr(
                disciplina,
                campo,
                valor
            )

        disciplina.save()
        return disciplina


    @staticmethod
    def delete_disciplina(id_disciplina):

        disciplina = (
            DisciplinasService
            .get_disciplina_by_id(id_disciplina)
        )

        if not disciplina:

            return False

        disciplina.delete()

        return True