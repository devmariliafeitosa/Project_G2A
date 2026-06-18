from api.views import LoginView, get_disciplines, cronograma, get_docentes, get_semestres
from django.urls import path, include

# Integrar com as telas do Frontend
urlpatterns = [
    path("login", LoginView.as_view(), name="login"), 
    path("cronograma/", cronograma),
    path("disciplinas/", get_disciplines),
    path("docentes/", get_docentes),
    path("lancamento-semestre/", get_semestres),
]
