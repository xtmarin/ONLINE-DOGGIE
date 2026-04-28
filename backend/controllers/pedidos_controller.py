from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend.config.db import get_db
from backend.middleware.auth_middleware import get_current_user
from sqlalchemy import text


def crear_pedido(data, db: Session, current_user):

    carrito = data.carrito

    if not carrito or len(carrito) == 0:
        raise HTTPException(status_code=400, detail="Carrito vacío")

    total = 0
    productos_db = []

    # VALIDAR PRODUCTOS
    for item in carrito:

        result = db.execute(
            text("SELECT * FROM productos WHERE id = :id"),
            {"id": item.id}
        ).fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Producto no existe")

        if result.stock < item.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para {result.nombre}"
            )

        subtotal = result.precio * item.cantidad
        total += subtotal

        productos_db.append((result, item))

    # CREAR PEDIDO
    pedido = db.execute(
        text("""
            INSERT INTO pedidos (usuario_id, total)
            VALUES (:usuario_id, :total)
        """),
        {
            "usuario_id": current_user["id"],
            "total": total
        }
    )

    db.commit()

    pedido_id = pedido.lastrowid

    
    for producto, item in productos_db:

       
        db.execute(
            text("""
                INSERT INTO pedido_detalle (pedido_id, producto_id, cantidad, precio)
                VALUES (:pedido_id, :producto_id, :cantidad, :precio)
            """),
            {
                "pedido_id": pedido_id,
                "producto_id": producto.id,
                "cantidad": item.cantidad,
                "precio": producto.precio
            }
        )

        # calcular nuevo stock
        nuevo_stock = producto.stock - item.cantidad
        activo = 1 if nuevo_stock > 5 else 0

        db.execute(
            text("""
                UPDATE productos
                SET stock = :stock, activo = :activo
                WHERE id = :id
            """),
            {
                "stock": nuevo_stock,
                "activo": activo,
                "id": producto.id
            }
        )

    db.commit()

    return {
        "mensaje": "Pedido confirmado",
        "pedido_id": pedido_id
    }



def obtener_historial(db: Session, current_user):

    result = db.execute(
        text("""
            SELECT 
                p.id AS pedido_id,
                p.total,
                p.usuario_id,
                d.producto_id,
                pr.nombre,
                d.cantidad,
                d.precio
            FROM pedidos p
            JOIN pedido_detalle d ON p.id = d.pedido_id
            JOIN productos pr ON pr.id = d.producto_id
            WHERE p.usuario_id = :usuario_id
            ORDER BY p.id DESC
        """),
        {"usuario_id": current_user["id"]}
    ).fetchall()

    if not result:
        return []

    pedidos = {}

    for row in result:
        pid = row.pedido_id

        if pid not in pedidos:
            pedidos[pid] = {
                "pedido_id": pid,
                "total": row.total,
                "productos": []
            }

        pedidos[pid]["productos"].append({
            "producto_id": row.producto_id,
            "nombre": row.nombre,
            "cantidad": row.cantidad,
            "precio": row.precio
        })

    return list(pedidos.values())