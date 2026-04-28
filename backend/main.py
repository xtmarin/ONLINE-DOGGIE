from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.pedidos_routes import router as pedidos_router

from routes.auth_routes import router as authRoutes
from routes.productos_routes import router as productosRoutes

app = FastAPI()
app.include_router(pedidos_router)

# middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# rutas
app.include_router(authRoutes, prefix="/api/auth")
app.include_router(productosRoutes, prefix="/api/productos")

@app.get("/")
def root():
    return {"mensaje": "API Online Doggie funcionando 🐶"}