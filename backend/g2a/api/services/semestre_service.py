from api.models import Semestre, SemestreStatus


class SemestreService:
    """
    Camada de serviço para consultas relacionadas a Semestre
    (tela "lançamento de semestre"). A criação (POST) será adicionada
    em etapa futura, junto com as regras de negócio do lançamento
    (ex.: impedir mais de um semestre ATIVO simultaneamente).
    """

    @staticmethod
    def get_semestres(status=None):
        """
        Retorna queryset de Semestre, mais recente primeiro.

        Args:
            status: PLANEJAMENTO | ATIVO | ENCERRADO (opcional).
        """
        queryset = Semestre.objects.all()

        if status:
            status = status.strip().upper()
            valores_validos = {choice.value for choice in SemestreStatus}
            if status in valores_validos:
                queryset = queryset.filter(status=status)

        return queryset.order_by("-data_inicio")

    @staticmethod
    def get_semestre_ativo():
        """Retorna o semestre atualmente ATIVO, ou None se não houver."""
        return Semestre.objects.filter(status=SemestreStatus.ATIVO).first()