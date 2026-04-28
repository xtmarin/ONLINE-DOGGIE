from pydantic import BaseModel
from typing import List
from datetime import datetime


class ProductoPedido(BaseModel):
    producto_id: int
    cantidad: int


class Pedido(BaseModel):
    id: int
    usuario_id: int
    productos: List[ProductoPedido]
    fecha: datetime

    class Config:
        orm_mode = True