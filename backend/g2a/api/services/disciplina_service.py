class DisciplinasService:

    # Integrar com os dados via SupaBase    
    @staticmethod
    def get_disciplines():

        # Mock Temporário
        return [
            {
                "id": 1,
                "nome": "Algoritmos",
                "professor": "Carlos Silva",
                "periodo": "1º Semestre"
            },
            {
                "id": 2,
                "nome": "Banco de Dados",
                "professor": "Ana Souza",
                "periodo": "2º Semestre"
            },
            {
                "id": 3,
                "nome": "Estrutura de Dados",
                "professor": "Fernanda Lima",
                "periodo": "3º Semestre"
            }
        ]