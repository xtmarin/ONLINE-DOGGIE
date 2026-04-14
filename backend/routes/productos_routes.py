from fastapi import APIRouter, Depends
from controllers import productos_controller
from schemas.productos_schema import Producto
from middleware.auth_middleware import verificarAdmin

router = APIRouter()


@router.get("/")
def get_productos():
    return productos_controller.obtenerProductos()


@router.post("/")
def create_producto(producto: Producto, user=Depends(verificarAdmin)):
    productos_controller.crearProducto(producto)
    return {"mensaje": "Producto creado"}


@router.delete("/{id}")
def delete_producto(id: int, user=Depends(verificarAdmin)):
    productos_controller.eliminarProducto(id)
    return {"mensaje": "Producto eliminado"}


@router.put("/{id}")
def update_producto(id: int, producto: Producto, user=Depends(verificarAdmin)):
    productos_controller.actualizarProducto(id, producto)
    return {"mensaje": "Producto actualizado"}