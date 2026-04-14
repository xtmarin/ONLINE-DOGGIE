from config.db import get_connection
from utils.security import hash_password, verify_password, create_token


def registrar(usuario):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM usuarios WHERE email = %s", (usuario.email,))
    existe = cursor.fetchone()

    if existe:
        return {"mensaje": "El usuario ya existe"}

    password_hash = hash_password(usuario.password)

    cursor.execute(
        "INSERT INTO usuarios (nombre, email, password) VALUES (%s, %s, %s)",
        (usuario.nombre, usuario.email, password_hash)
    )

    conn.commit()
    conn.close()

    return {"mensaje": "Usuario registrado"}


def login(datos):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM usuarios WHERE email = %s", (datos.email,))
    usuario = cursor.fetchone()

    if not usuario:
        return {"mensaje": "Usuario no encontrado"}

    if not verify_password(datos.password, usuario["password"]):
        return {"mensaje": "Contraseña incorrecta"}

    token = create_token({
        "id": usuario["id"],
        "rol": usuario["rol"]
    })

    return {
        "mensaje": "Login exitoso",
        "token": token,
        "usuario": {
            "id": usuario["id"],
            "nombre": usuario["nombre"],
            "rol": usuario["rol"]
        }
    }