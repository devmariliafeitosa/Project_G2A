from api.models import Professor


class ProfessorService:

    @staticmethod
    def get_professores(
        status=None,
        titulacao=None,
        curso_coordenado_id=None,
        search=None
    ):

        professores = (
            Professor.objects
            .select_related(
                "id_curso_coordenado"
            )
            .all()
        )

        if status is not None:

            professores = professores.filter(
                status=status
            )

        if titulacao:

            professores = professores.filter(
                titulacao=titulacao
            )

        if curso_coordenado_id:

            professores = professores.filter(
                id_curso_coordenado=curso_coordenado_id
            )

        if search:

            professores = professores.filter(
                nome__icontains=search
            ) | professores.filter(
                email__icontains=search
            )

        return professores


    @staticmethod
    def get_professor_by_id(id_prof):

        try:

            return (
                Professor.objects
                .select_related(
                    "id_curso_coordenado"
                )
                .get(
                    id_prof=id_prof
                )
            )

        except Professor.DoesNotExist:

            return None


    @staticmethod
    def create_professor(data):

        professor = Professor.objects.create(

            nome=data["nome"],

            siape=data.get(
                "siape"
            ),

            email=data.get(
                "email"
            ),

            data_nascimento=data.get(
                "data_nascimento"
            ),

            ano_egresso=data["ano_egresso"],

            area_atuacao=data.get(
                "area_atuacao"
            ),

            status=data.get(
                "status",
                True
            ),

            senha=data["senha"],

            titulacao=data.get(
                "titulacao"
            ),

            carga_horaria_maxima=data.get(
                "carga_horaria_maxima",
                20
            ),

            is_coordenador=data.get(
                "is_coordenador",
                False
            ),

            id_curso_coordenado_id=data.get(
                "id_curso_coordenado"
            )
        )

        return professor


    @staticmethod
    def update_professor(
        id_prof,
        data
    ):

        professor = (
            ProfessorService
            .get_professor_by_id(id_prof)
        )

        if not professor:

            return None

        campos_permitidos = [

            "nome",
            "siape",
            "email",
            "data_nascimento",
            "ano_egresso",
            "area_atuacao",
            "status",
            "senha",
            "titulacao",
            "carga_horaria_maxima",
            "is_coordenador",
            "id_curso_coordenado"

        ]

        for campo in campos_permitidos:

            if campo in data:

                if campo == "id_curso_coordenado":

                    professor.id_curso_coordenado_id = (
                        data[campo]
                    )

                else:

                    setattr(
                        professor,
                        campo,
                        data[campo]
                    )

        professor.save()

        return professor


    @staticmethod
    def delete_professor(id_prof):
        professor = (
            ProfessorService
            .get_professor_by_id(id_prof)
        )

        if not professor:

            return False

        professor.delete()

        return True