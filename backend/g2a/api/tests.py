from django.test import TestCase, Client
from django.utils import timezone
from decouple import config
import jwt
import datetime

from api.models import Professor


class ApiTests(TestCase):

	def setUp(self):
		self.client = Client()
		now = timezone.now()

		# Create an in-memory Professor instance (do not save to DB)
		self.prof = Professor(
			id_prof=1,
			nome="Test Professor",
			siape=99999,
			email="test-docentes@example.com",
			data_nascimento="1980-01-01",
			ano_egresso="2005-01-01",
			area_atuacao="Teste",
			status=True,
			senha="not_hashed",
			carga_horaria_maxima=20,
			is_coordenador=False,
			created_at=now,
			updated_at=now,
		)

		jwt_secret = config("JWT_SECRET")
		jwt_alg = config("JWT_ALGORITHM", default="HS256")

		now_dt = datetime.datetime.utcnow()
		payload = {
			"sub": str(self.prof.id_prof),
			"email": self.prof.email,
			"iat": now_dt,
			"exp": now_dt + datetime.timedelta(hours=1),
		}

		self.token = jwt.encode(payload, jwt_secret, algorithm=jwt_alg)

	def test_get_docentes_requires_auth_and_returns_list(self):
		from unittest.mock import patch

		with patch("api.services.professor_service.ProfessorService.get_professores", return_value=[self.prof]):
			resp = self.client.get(
				"/api/docentes/",
				HTTP_AUTHORIZATION=f"Bearer {self.token}"
			)

		self.assertEqual(resp.status_code, 200)
		body = resp.json()
		self.assertTrue(body.get("success"))
		data = body.get("data")
		self.assertIsInstance(data, list)
		self.assertGreaterEqual(len(data), 1)
		self.assertIn("id_prof", data[0])

	def test_lancamento_semestre_get_and_post(self):
		from unittest.mock import patch

		# Prepare an in-memory Semestre-like object
		class FakeSemestre:
			def __init__(self, id_semestre, nome):
				import datetime
				now_date = datetime.date.today()
				now_dt = datetime.datetime.now()
				self.id_semestre = id_semestre
				self.nome = nome
				self.data_inicio = now_date
				self.data_fim = now_date
				self.status = "ATIVO"
				self.created_at = now_dt
				self.updated_at = now_dt

		fake_semestre = FakeSemestre(1, "2026/1")

		with patch("api.services.semestre_service.SemestreService.get_semestres", return_value=[fake_semestre]):
			resp = self.client.get(
				"/api/lancamento-semestre/",
				HTTP_AUTHORIZATION=f"Bearer {self.token}"
			)

		self.assertEqual(resp.status_code, 200)
		body = resp.json()
		self.assertTrue(body.get("success"))

		# Test POST flow: mock create_semestre to return a fake object
		fake_created = FakeSemestre(2, "2026/2")
		with patch("api.services.semestre_service.SemestreService.create_semestre", return_value=fake_created):
			post_payload = {
				"nome": "2026/2",
				"data_inicio": "2026-02-01",
				"data_fim": "2026-07-31",
				"status": "ATIVO",
			}
			resp2 = self.client.post(
				"/api/lancamento-semestre/",
				data=post_payload,
				content_type="application/json",
				HTTP_AUTHORIZATION=f"Bearer {self.token}"
			)

		self.assertEqual(resp2.status_code, 200)
		body2 = resp2.json()
		self.assertTrue(body2.get("success"))

	def test_dashboard_admin_counts(self):
		from unittest.mock import patch

		class FakeQS:
			def __init__(self, n):
				self._n = n

			def count(self):
				return self._n

		with patch("api.services.curso_service.CursoService.get_cursos", return_value=FakeQS(4)), \
			 patch("api.views.Disciplina.objects.count", return_value=10), \
			 patch("api.views.Professor.objects.count", return_value=8), \
			 patch("api.views.Alocacao.objects.count", return_value=6), \
			 patch("api.views.Afastamento.objects.count", return_value=2):

			resp = self.client.get(
				"/api/dashboard-admin",
				HTTP_AUTHORIZATION=f"Bearer {self.token}"
			)

		self.assertEqual(resp.status_code, 200)
		body = resp.json()
		self.assertTrue(body.get("success"))
		data = body.get("data")
		self.assertEqual(data.get("total_cursos"), 4)
		self.assertEqual(data.get("total_disciplinas"), 10)
		self.assertEqual(data.get("total_professores"), 8)
