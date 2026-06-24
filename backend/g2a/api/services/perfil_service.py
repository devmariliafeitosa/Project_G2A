from api.models import Professor


# Ao finalizar os models, ajustar aqui
class PerfilService:
    """
    Camada de serviço para GET /perfil/.

    TODO (depende do model `User`, ainda não finalizado):
    Hoje a ligação entre o usuário autenticado (User, usado no login/JWT)
    e o registro de Professor é feita por e-mail, pois ainda não existe
    uma FK direta entre os dois models. Quando o model `User` for
    finalizado, substituir `get_perfil_by_payload` por uma busca direta
    via FK (ex.: User.professor_id ou OneToOne), que é mais segura e
    evita inconsistência caso o e-mail seja alterado.

    Assumindo, por ora, que /perfil é sempre de um Professor (inclui
    coordenadores, já que Professor.is_coordenador cobre esse caso).
    Se admins puros (sem registro em Professor) também usarem esta
    rota, será necessário revisar esta busca.
    """

    @staticmethod
    def get_perfil_by_payload(user_payload):
        """
        Recupera o Professor correspondente ao usuário autenticado.

        Args:
            user_payload: dict decodificado do JWT (request.user_payload),
                contendo ao menos "email".

        Returns:
            Professor ou None se não encontrado.
        """
        email = (user_payload or {}).get("email")
        if not email:
            return None

        return (
            Professor.objects
            .select_related("curso_coordenado")
            .filter(email=email)
            .first()
        )