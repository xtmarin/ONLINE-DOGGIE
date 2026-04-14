from config.db import get_connection

def obtenerProductos():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM productos WHERE activo = TRUE")
    data = cursor.fetchall()

    conn.close()
    return data


def crearProducto(producto):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO productos (nombre, descripcion, precio, categoria, stock)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        producto.nombre,
        producto.descripcion,
        producto.precio,
        producto.categoria,
        producto.stock
    ))

    conn.commit()
    conn.close()


def eliminarProducto(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE productos SET activo = FALSE WHERE id = %s", (id,))

    conn.commit()
    conn.close()


def actualizarProducto(id, producto):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE productos 
        SET nombre=%s, descripcion=%s, precio=%s, categoria=%s, stock=%s
        WHERE id=%s
    """, (
        producto.nombre,
        producto.descripcion,
        producto.precio,
        producto.categoria,
        producto.stock,
        id
    ))

    conn.commit()
    conn.close()