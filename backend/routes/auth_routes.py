from fastapi import APIRouter
from controllers import auth_controller
from schemas.auth_schema import UsuarioRegistro, UsuarioLogin

router = APIRouter()


@router.post("/registro")
def registro(user: UsuarioRegistro):
    return auth_controller.registrar(user)


@router.post("/login")
def login(user: UsuarioLogin):
    return auth_controller.login(user)