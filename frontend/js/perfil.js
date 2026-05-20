const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión");
    window.location.href = "Login.html";
}


/* ============================= */
/* CARGAR PERFIL                 */
/* ============================= */

async function cargarPerfil() {

    try {

        const respuesta = await fetch("http://localhost:3000/api/auth/perfil", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!respuesta.ok) {
            alert("Tu sesión expiró, inicia sesión nuevamente");
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.href = "Login.html";
            return;
        }

        const usuario = await respuesta.json();

        document.getElementById("perfil-nombre").textContent = usuario.nombre;
        document.getElementById("perfil-email").textContent  = usuario.email;
        document.getElementById("perfil-rol").textContent    = usuario.rol;

        document.getElementById("edit-nombre").value = usuario.nombre;
        document.getElementById("edit-email").value  = usuario.email;

        if (usuario.direccion) {
            document.getElementById("input-direccion").value = usuario.direccion;
        }

    } catch (error) {
        console.error("Error cargando perfil:", error);
    }

}

/* ============================= */
/* HISTORIAL DE COMPRAS   */
/* ============================= */

async function cargarHistorial() {

    try {

        const respuesta = await fetch("http://localhost:3000/api/pedidos/historial", {
            headers: { "Authorization": "Bearer " + token }
        });

        const pedidos = await respuesta.json();
        const contenedor = document.getElementById("historial-compras");

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
                    ${pedido.productos.map(p => `
                        <li>${p.nombre} x${p.cantidad} — $${Number(p.precio).toLocaleString("es-CO")}</li>
                    `).join("")}
                </ul>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error cargando historial:", error);
    }

}

cargarHistorial();


/* ============================= */
/* EDITAR PERFIL          */
/* ============================= */

document.getElementById("form-editar-perfil").addEventListener("submit", async (e) => {

    e.preventDefault();

    const nombre = document.getElementById("edit-nombre").value.trim();
    const email  = document.getElementById("edit-email").value.trim();

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


/* ============================= */
/* CAMBIAR CONTRASEÑA     */
/* ============================= */

document.getElementById("form-cambiar-password").addEventListener("submit", async (e) => {

    e.preventDefault();

    const actual     = document.getElementById("password-actual").value.trim();
    const nueva      = document.getElementById("password-nueva").value.trim();
    const confirmar  = document.getElementById("password-confirmar").value.trim();

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
            body: JSON.stringify({ passwordActual: actual, passwordNueva: nueva })
        });

        const data = await respuesta.json();
        alert(data.mensaje);

        if (respuesta.ok) {
            document.getElementById("form-cambiar-password").reset();
        }

    } catch (error) {
        console.error("Error cambiando contraseña:", error);
    }

});


/* ============================= */
/* LOGOUT                        */
/* ============================= */

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "Login.html";
});

/* RF21 - GUARDAR DIRECCIÓN */
async function guardarDireccion() {
    const direccion = document.getElementById("input-direccion").value.trim();
    const msgEl = document.getElementById("mensaje-direccion");

    if (!direccion) {
        msgEl.textContent = "Escribe una dirección primero";
        msgEl.style.color = "red";
        return;
    }

    const nombre = document.getElementById("edit-nombre").value.trim();
    const email  = document.getElementById("edit-email").value.trim();

    try {
        const respuesta = await fetch("http://localhost:3000/api/auth/perfil", {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nombre, email, direccion })
        });

        if (respuesta.ok) {
            msgEl.textContent = "✅ Dirección guardada correctamente.";
            msgEl.style.color = "green";
        } else {
            const data = await respuesta.json();
            msgEl.textContent = data.mensaje || "Error al guardar";
            msgEl.style.color = "red";
        }
    } catch (error) {
        msgEl.textContent = "Error conectando con el servidor";
        msgEl.style.color = "red";
    }
}

/* RF39 - ESTADO ÚLTIMO PEDIDO */
async function mostrarEstadoUltimoPedido() {
    const estadoEl = document.getElementById("estado-pedido");
    if (!estadoEl) return;

    try {
        const respuesta = await fetch("http://localhost:3000/api/pedidos/historial", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!respuesta.ok) { estadoEl.textContent = "No disponible"; return; }

        const pedidos = await respuesta.json();

        if (pedidos.length === 0) {
            estadoEl.textContent = "Sin pedidos aún";
            return;
        }

        const ultimo = pedidos[0];
        estadoEl.textContent = `Pedido #${ultimo.pedido_id}: ${ultimo.estado}`;

        const colores = {
            pendiente: { bg: "#fff3cd", color: "#856404" },
            pagado:    { bg: "#d1ecf1", color: "#0c5460" },
            enviado:   { bg: "#cce5ff", color: "#004085" },
            entregado: { bg: "#d4edda", color: "#155724" },
            cancelado: { bg: "#f8d7da", color: "#721c24" }
        };

        const estilo = colores[ultimo.estado] || { bg: "#e0e0e0", color: "#333" };
        estadoEl.style.background   = estilo.bg;
        estadoEl.style.color        = estilo.color;
        estadoEl.style.padding      = "8px 16px";
        estadoEl.style.borderRadius = "8px";
        estadoEl.style.fontWeight   = "bold";
        estadoEl.style.display      = "inline-block";

    } catch (error) {
        estadoEl.textContent = "Error cargando estado";
    }
}


cargarPerfil();
cargarHistorial();
mostrarEstadoUltimoPedido();