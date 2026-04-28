from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.config.db import get_db
from backend.schemas.pedido_schema import PedidoCreate
from backend.controllers.pedidos_controller import crear_pedido, obtener_historial
from backend.middleware.auth_middleware import get_current_user

router = APIRouter(
    prefix="/api/pedidos",
    tags=["Pedidos"]
)

@router.post("/")
def confirmar_pedido(
    data: PedidoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crear_pedido(data, db, current_user)


@router.get("/historial")
def ver_historial(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return obtener_historial(db, current_user)