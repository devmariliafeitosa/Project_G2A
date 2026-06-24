import jwt
from functools import wraps
from django.http import JsonResponse
from decouple import config

JWT_SECRET = config(
    "JWT_SECRET"
)

JWT_ALGORITHM = config(
    "JWT_ALGORITHM",
    default="HS256"
)

JWT_EXPIRATION_HOURS = int(
    config(
        "JWT_EXPIRATION_HOURS",
        default=8
    )
)


def jwt_required(view_func):
    """
    Decorator: valida o Bearer Token JWT no header Authorization.
    Injeta `request.user_payload` com os dados do token.

    Uso:
        @jwt_required
        def minha_view(request):
            user_id = request.user_payload["sub"]
    """

    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JsonResponse({"detail": "Token ausente."}, status=401)

        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            return JsonResponse({"detail": "Token expirado."}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"detail": "Token inválido."}, status=401)

        request.user_payload = payload
        return view_func(request, *args, **kwargs)

    return wrapper