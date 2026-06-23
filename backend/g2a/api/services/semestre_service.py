from api.models import Semestre


class SemestreService:

    @staticmethod
    def get_semestres(status=None):

        semestres = Semestre.objects.all()

        if status:

            semestres = semestres.filter(
                status=status
            )


        return semestres


    @staticmethod
    def get_semestre_by_id(id_semestre):

        try:

            return Semestre.objects.get(
                id_semestre=id_semestre
            )

        except Semestre.DoesNotExist:

            return None


    @staticmethod
    def create_semestre(data):

        semestre = Semestre.objects.create(

            nome=data["nome"],

            data_inicio=data["data_inicio"],

            data_fim=data["data_fim"],

            status=data.get(
                "status",
                "PLANEJAMENTO"
            )
        )

        return semestre


    @staticmethod
    def update_semestre(
        id_semestre,
        data
    ):

        semestre = (
            SemestreService
            .get_semestre_by_id(id_semestre)
        )

        if not semestre:

            return None

        campos_permitidos = [

            "nome",

            "data_inicio",

            "data_fim",

            "status"

        ]

        for campo in campos_permitidos:

            if campo in data:

                setattr(
                    semestre,
                    campo,
                    data[campo]
                )

        semestre.save()

        return semestre


    @staticmethod
    def delete_semestre(id_semestre):

        semestre = (
            SemestreService
            .get_semestre_by_id(id_semestre)
        )


        if not semestre:

            return False

        semestre.delete()

        return True