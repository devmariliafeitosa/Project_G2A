from api.models import Curso


class CursoService:


    @staticmethod
    def get_cursos():

        return Curso.objects.all()



    @staticmethod
    def get_curso(id_curso):

        try:

            return Curso.objects.get(
                id_curso=id_curso
            )

        except Curso.DoesNotExist:

            return None



    @staticmethod
    def create_curso(data):

        return Curso.objects.create(

            nome=data["nome"],

            nivel=data["nivel"],

            modalidade=data.get(
                "modalidade",
                "PRESENCIAL"
            ),

            duracao_semestres=data["duracao_semestres"],

            turno=data["turno"]

        )



    @staticmethod
    def delete_curso(id_curso):

        curso = CursoService.get_curso(
            id_curso
        )

        if not curso:
            return False


        curso.delete()

        return True