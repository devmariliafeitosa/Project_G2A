"""
Service de Notificações.

TODO (BANCO DE DADOS PENDENTE):
O model `Notificacao` ainda não existe em api/models.py (model em
finalização pelo outro dev). Estrutura mínima sugerida para quando ele
for criado:

    class Notificacao(models.Model):
        destinatario = models.ForeignKey(
            Professor, on_delete=models.CASCADE, related_name="notificacoes"
        )
        titulo = models.CharField(max_length=150)
        mensagem = models.TextField()
        tipo = models.CharField(max_length=20)  # ex: INFO, ALERTA, ALOCACAO
        lida = models.BooleanField(default=False)
        criado_em = models.DateTimeField(auto_now_add=True)
        referencia_id = models.IntegerField(null=True, blank=True)
        # referencia_id: id de um objeto relacionado (ex.: Alocacao),
        # usado pelo front para navegar até a origem da notificação.

Enquanto o model não existir, `get_notificacoes` retorna lista vazia,
para não quebrar o front. Quando `Notificacao` for criado, basta
descomentar o bloco indicado abaixo e remover o `return []` temporário.
"""

from api.models import Professor


class NotificacaoService:

    @staticmethod
    def get_notificacoes(user_payload, apenas_nao_lidas=False):
        """
        Retorna as notificações do usuário autenticado.

        Args:
            user_payload: request.user_payload (JWT decodificado).
            apenas_nao_lidas: se True, filtra somente as não lidas.

        Returns:
            list[dict]: vazio até o model Notificacao existir.
        """
        email = (user_payload or {}).get("email")
        if not email:
            return []

        professor = Professor.objects.filter(email=email).first()
        if professor is None:
            return []

        # --- TODO: ativar quando api.models.Notificacao existir ---
        # from api.models import Notificacao
        # from api.serializers import NotificacaoSerializer
        #
        # queryset = Notificacao.objects.filter(destinatario=professor)
        # if apenas_nao_lidas:
        #     queryset = queryset.filter(lida=False)
        # queryset = queryset.order_by("-criado_em")
        #
        # return NotificacaoSerializer(queryset, many=True).data
        # ------------------------------------------------------------

        return []  # stub temporário — sem dados até a tabela existir