from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
import os

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"

security = HTTPBearer()

def verificarToken(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Token inválido")


def verificarAdmin(usuario=Depends(verificarToken)):
    if usuario.get("rol") != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return usuario