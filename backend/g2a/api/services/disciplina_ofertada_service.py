from backend.g2a.api.models import DisciplinaOfertada


class DisciplinaOfertadaService:


    @staticmethod
    def get_all(
        semestre_id=None,
        turma_id=None
    ):

        queryset = DisciplinaOfertada.objects.select_related(
            "semestre",
            "turma",
            "disciplina"
        )


        if semestre_id:
            queryset = queryset.filter(
                semestre_id=semestre_id
            )


        if turma_id:
            queryset = queryset.filter(
                turma_id=turma_id
            )


        return queryset



    @staticmethod
    def get_by_id(id_oferta):

        return DisciplinaOfertada.objects.select_related(
            "semestre",
            "turma",
            "disciplina"
        ).filter(
            id_oferta=id_oferta
        ).first()



    @staticmethod
    def create(data):

        return DisciplinaOfertada.objects.create(
            **data
        )



    @staticmethod
    def update(
        id_oferta,
        data
    ):

        oferta = DisciplinaOfertadaService.get_by_id(
            id_oferta
        )

        if not oferta:
            return None


        for key,value in data.items():

            setattr(
                oferta,
                key,
                value
            )


        oferta.save()

        return oferta



    @staticmethod
    def delete(id_oferta):

        oferta = DisciplinaOfertadaService.get_by_id(
            id_oferta
        )

        if not oferta:
            return False


        oferta.delete()

        return True