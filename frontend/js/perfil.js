const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión");
    window.location.href = "Login.html";
    throw new Error("Usuario no autenticado");
}


/* ==========================================================================
   1. CARGAR PERFIL
   ========================================================================== */

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


/* ==========================================================================
   2. TABLA HISTORIAL DE COMPRAS (INTEGRADA CON DRAWER Y BADGES)
   ========================================================================== */

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
        const tablaBody = document.getElementById("historial-compras-tabla-body");

        if (!tablaBody) return;

        if (!pedidos.length) {
            tablaBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #666; padding: 25px;">
                        No tienes compras registradas.
                    </td>
                </tr>`;
            return;
        }

        // Mapeo dinámico para asociar cada estado de la BD con una clase CSS del badge
        const clasesEstado = {
            "pendiente": "badge-pendiente",
            "pagado": "badge-enviado",
            "enviado": "badge-enviado",
            "entregado": "badge-entregado",
            "cancelado": "badge-pendiente"
        };

        let filasHtml = "";

        // Recorremos los pedidos y desglosamos sus productos en filas independientes para la tabla
        pedidos.forEach(pedido => {
            const estadoTexto = pedido.estado || "pendiente";
            const claseBadge = clasesEstado[estadoTexto.toLowerCase()] || "badge-enviado";

            pedido.productos.forEach(producto => {
                filasHtml += `
                    <tr>
                        <td style="font-weight: bold;">${producto.nombre}</td>
                        <td>$${Number(producto.precio).toLocaleString("es-CO")}</td>
                        <td style="text-align: center;">${producto.cantidad}</td>
                        <td>
                            <span class="badge-estado-tabla ${claseBadge}">
                                ${estadoTexto}
                            </span>
                        </td>
                    </tr>
                `;
            });
        });

        tablaBody.innerHTML = filasHtml;

    } catch (error) {
        console.error("Error cargando historial en tabla:", error);
        const tablaBody = document.getElementById("historial-compras-tabla-body");
        if (tablaBody) {
            tablaBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #EF4444; font-weight: bold; padding: 25px;">
                        Error cargando la información del servidor.
                    </td>
                </tr>`;
        }
    }
}


/* ==========================================================================
   3. EDITAR PERFIL
   ========================================================================== */

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


/* ==========================================================================
   4. CAMBIAR CONTRASEÑA
   ========================================================================== */

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


/* ==========================================================================
   5. CERRAR SESIÓN (LOGOUT)
   ========================================================================== */

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "Login.html";
    });
}


/* ==========================================================================
   6. GUARDAR DIRECCIÓN DE ENVÍO
   ========================================================================== */

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


/* ==========================================================================
   7. INICIALIZACIÓN DE FUNCIONES
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    cargarPerfil();
    cargarHistorial(); // Trae las compras y arma las filas estructuradas de la tabla directamente
});