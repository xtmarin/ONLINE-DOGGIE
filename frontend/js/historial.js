const token = localStorage.getItem("token"); 

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        alert("Debes iniciar sesión para ver tu historial");
        window.location.href = "login.html"; // Redirigir si no está logueado
        return;
    }
    cargarPedidosDelUsuario();
});

async function cargarPedidosDelUsuario() {
    try {
        const respuesta = await fetch("http://localhost:3000/api/pedidos/mis-pedidos", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const pedidos = await respuesta.json();

        if (respuesta.ok) {
           
            renderizarHistorial(pedidos);
        } else {
            console.error("Error al traer pedidos:", pedidos.error);
        }
    } catch (error) {
        console.error("Error de red:", error);
    }
}


function renderizarHistorial(pedidos) {
    const contenedor = document.getElementById("historial-contenedor");
    contenedor.innerHTML = "";

    if (pedidos.length === 0) {
        contenedor.innerHTML = "<p>Aún no has realizado ninguna compra de Online Doggie 🐾</p>";
        return;
    }

    pedidos.forEach(pedido => {
        
        const botonConfirmar = pedido.estado === 'enviado' 
            ? `<button class="btn-confirmar-recibido" onclick="marcarComoRecibido(${pedido.id})">✅ Ya recibí mi pedido</button>`
            : '';

        contenedor.innerHTML += `
            <div class="tarjeta-pedido">
                <p><strong>Pedido #${pedido.id}</strong> - Total: $${Number(pedido.total).toLocaleString('es-CO')} COP</p>
                <p>Estado: <span class="badge-${pedido.estado}">${pedido.estado}</span></p>
                ${botonConfirmar}
            </div>
        `;
    });
}

async function marcarComoRecibido(pedidoId) {
    if (!confirm("¿Confirmas que ya tienes el pedido en tus manos?")) return;

    try {
        const respuesta = await fetch(`http://localhost:3000/api/pedidos/${pedidoId}/recibido`, {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            alert(data.error);
            return;
        }

        alert(data.mensaje);
        cargarPedidosDelUsuario(); 

    } catch (error) {
        console.error("Error al confirmar entrega:", error);
    }
}