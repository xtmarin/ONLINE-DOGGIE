const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión");
    window.location.href = "Login.html";
    throw new Error("Usuario no autenticado");
}


/* CARGAR PERFIL                 */


async function cargarPerfil() {
    try {
        const respuesta = await fetch("http://localhost:3000/api/auth/perfil", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!respuesta.ok) {
            alert("Tu sesión expiró, inicia sesión nuevamente");

            localStorage.removeItem("token");
            localStorage.removeItem("usuario");

            window.location.href = "Login.html";
            return;
        }

        const usuario = await respuesta.json();

        const perfilNombre = document.getElementById("perfil-nombre");
        const perfilEmail = document.getElementById("perfil-email");
        const perfilRol = document.getElementById("perfil-rol");

        const editNombre = document.getElementById("edit-nombre");
        const editEmail = document.getElementById("edit-email");

        if (perfilNombre) perfilNombre.textContent = usuario.nombre;
        if (perfilEmail) perfilEmail.textContent = usuario.email;
        if (perfilRol) perfilRol.textContent = usuario.rol;

        if (editNombre) editNombre.value = usuario.nombre;
        if (editEmail) editEmail.value = usuario.email;

        if (usuario.direccion) {
            const direccionInput = document.getElementById("input-direccion");
            if (direccionInput) {
                direccionInput.value = usuario.direccion;
            }
        }

    } catch (error) {
        console.error("Error cargando perfil:", error);
    }
}


/* HISTORIAL DE COMPRAS          */


async function cargarHistorial() {
    try {
        const respuesta = await fetch("http://localhost:3000/api/pedidos/historial", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!respuesta.ok) {
            return;
        }

        const pedidos = await respuesta.json();
        const contenedor = document.getElementById("historial-compras");

        if (!contenedor) return;

        if (!pedidos.length) {
            contenedor.innerHTML = "<p>No tienes compras registradas.</p>";
            return;
        }

        contenedor.innerHTML = pedidos.map(pedido => `
            <div class="pedido-card">
                <p><strong>Pedido #${pedido.pedido_id}</strong></p>
                <p>Total: $${Number(pedido.total).toLocaleString("es-CO")}</p>
                <p>Fecha: ${new Date(pedido.fecha).toLocaleDateString("es-CO")}</p>
                <ul>
                    ${pedido.productos.map(producto => `
                        <li>
                            ${producto.nombre} x${producto.cantidad}
                            — $${Number(producto.precio).toLocaleString("es-CO")}
                        </li>
                    `).join("")}
                </ul>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error cargando historial:", error);
    }
}


/* EDITAR PERFIL                 */


const formEditarPerfil = document.getElementById("form-editar-perfil");

if (formEditarPerfil) {

    formEditarPerfil.addEventListener("submit", async (e) => {

        e.preventDefault();

        const nombre = document.getElementById("edit-nombre").value.trim();
        const email = document.getElementById("edit-email").value.trim();

        if (!nombre || !email) {
            alert("Todos los campos son obligatorios");
            return;
        }

        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!emailValido) {
            alert("El formato del correo no es válido");
            return;
        }

        try {

            const respuesta = await fetch("http://localhost:3000/api/auth/perfil", {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nombre, email })
            });

            const data = await respuesta.json();

            alert(data.mensaje);

            if (respuesta.ok) {
                cargarPerfil();
            }

        } catch (error) {
            console.error("Error editando perfil:", error);
        }

    });

}


/* CAMBIAR CONTRASEÑA            */


const formCambiarPassword = document.getElementById("form-cambiar-password");

if (formCambiarPassword) {

    formCambiarPassword.addEventListener("submit", async (e) => {

        e.preventDefault();

        const actual = document.getElementById("password-actual").value.trim();
        const nueva = document.getElementById("password-nueva").value.trim();
        const confirmar = document.getElementById("password-confirmar").value.trim();

        if (!actual || !nueva || !confirmar) {
            alert("Todos los campos son obligatorios");
            return;
        }

        if (nueva.length < 8) {
            alert("La nueva contraseña debe tener mínimo 8 caracteres");
            return;
        }

        if (nueva !== confirmar) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {

            const respuesta = await fetch("http://localhost:3000/api/auth/cambiar-password", {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    passwordActual: actual,
                    passwordNueva: nueva
                })
            });

            const data = await respuesta.json();

            alert(data.mensaje);

            if (respuesta.ok) {
                formCambiarPassword.reset();
            }

        } catch (error) {
            console.error("Error cambiando contraseña:", error);
        }

    });

}


/* LOGOUT  */


const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        window.location.href = "Login.html";

    });

}


/* GUARDAR DIRECCIÓN      */


async function guardarDireccion() {

    const direccion = document.getElementById("input-direccion")?.value.trim();
    const msgEl = document.getElementById("mensaje-direccion");

    if (!direccion) {

        if (msgEl) {
            msgEl.textContent = "Escribe una dirección primero";
            msgEl.style.color = "red";
        }

        return;
    }

    const nombre = document.getElementById("edit-nombre")?.value.trim();
    const email = document.getElementById("edit-email")?.value.trim();

    try {

        const respuesta = await fetch("http://localhost:3000/api/auth/perfil", {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre,
                email,
                direccion
            })
        });

        if (respuesta.ok) {

            if (msgEl) {
                msgEl.textContent = "✅ Dirección guardada correctamente.";
                msgEl.style.color = "green";
            }

        } else {

            const data = await respuesta.json();

            if (msgEl) {
                msgEl.textContent = data.mensaje || "Error al guardar";
                msgEl.style.color = "red";
            }

        }

    } catch (error) {

        if (msgEl) {
            msgEl.textContent = "Error conectando con el servidor";
            msgEl.style.color = "red";
        }

    }
}


/*  ESTADO ÚLTIMO PEDIDO   */

async function mostrarEstadoUltimoPedido() {

    const estadoEl = document.getElementById("estado-pedido");

    if (!estadoEl) return;

    try {

        const respuesta = await fetch("http://localhost:3000/api/pedidos/historial", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!respuesta.ok) {
            estadoEl.textContent = "No disponible";
            return;
        }

        const pedidos = await respuesta.json();

        if (pedidos.length === 0) {
            estadoEl.textContent = "Sin pedidos aún";
            return;
        }

        const ultimo = pedidos[0];

        estadoEl.textContent = `Pedido #${ultimo.pedido_id}: ${ultimo.estado}`;

        const colores = {
            pendiente: {
                bg: "#fff3cd",
                color: "#856404"
            },
            pagado: {
                bg: "#d1ecf1",
                color: "#0c5460"
            },
            enviado: {
                bg: "#cce5ff",
                color: "#004085"
            },
            entregado: {
                bg: "#d4edda",
                color: "#155724"
            },
            cancelado: {
                bg: "#f8d7da",
                color: "#721c24"
            }
        };

        const estilo = colores[ultimo.estado] || {
            bg: "#e0e0e0",
            color: "#333"
        };

        estadoEl.style.background = estilo.bg;
        estadoEl.style.color = estilo.color;
        estadoEl.style.padding = "8px 16px";
        estadoEl.style.borderRadius = "8px";
        estadoEl.style.fontWeight = "bold";
        estadoEl.style.display = "inline-block";

    } catch (error) {

        estadoEl.textContent = "Error cargando estado";

    }
}


/* INICIALIZACIÓN                */


document.addEventListener("DOMContentLoaded", () => {
    cargarPerfil();
    cargarHistorial();
    mostrarEstadoUltimoPedido();
});