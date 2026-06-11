from api.views import LoginView, get_disciplines
from api.views import cronograma
from django.urls import path, include

# Integrar com as telas do Frontend
urlpatterns = [
    path("login", LoginView.as_view(), name="login"), 
    path("cronograma/", cronograma),
    path("disciplinas/", get_disciplines),
]
