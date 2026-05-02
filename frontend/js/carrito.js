document.addEventListener("DOMContentLoaded", function () {
    mostrarCarrito();
    actualizarMiniCarrito();
    actualizarContador();

    const botonCerrar = document.getElementById("cerrar-mini");
    if (botonCerrar) botonCerrar.addEventListener("click", cerrarMiniCarrito);

    const overlay = document.getElementById("overlay-mini");
    if (overlay) overlay.addEventListener("click", cerrarMiniCarrito);
});

let descuentoAplicado = 0;


/* ========================= */
/* RF07 - CARRITO PRINCIPAL  */
/* ========================= */

function mostrarCarrito() {

    let carrito  = JSON.parse(localStorage.getItem("carrito")) || [];
    let carritoBody = document.getElementById("carrito-body");
    let total    = 0;

    if (!carritoBody) return;

    carritoBody.innerHTML = "";

    if (carrito.length === 0) {
        carritoBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:20px;">
                    Tu carrito está vacío
                </td>
            </tr>
        `;
    }

    carrito.forEach((producto, index) => {
        let subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        carritoBody.innerHTML += `
            <tr>
                <td>${producto.nombre}</td>
                <td>$${producto.precio.toLocaleString()}</td>
                <td>${producto.cantidad}</td>
                <td>$${subtotal.toLocaleString()}</td>
                <td><button onclick="eliminarProducto(${index})">❌</button></td>
            </tr>
        `;
    });

    const totalConDescuento = total - (total * descuentoAplicado / 100);

    const totalElemento = document.getElementById("total");
    if (totalElemento) {
        totalElemento.innerText = descuentoAplicado > 0
            ? `Total: $${totalConDescuento.toLocaleString()} (${descuentoAplicado}% de descuento aplicado)`
            : `Total: $${total.toLocaleString()}`;
    }

}

function eliminarProducto(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
    actualizarMiniCarrito();
    actualizarContador();
}

function vaciarCarrito() {
    localStorage.removeItem("carrito");
    descuentoAplicado = 0;
    mostrarCarrito();
    actualizarMiniCarrito();
    actualizarContador();
}


/* ========================= */
/* RF30 - CUPÓN DE DESCUENTO */
/* ========================= */

const cupones = {
    "DOGGIE10": 10,
    "DOGGIE20": 20,
    "BIENVENIDO": 15
};

function aplicarCupon() {

    const codigo  = document.getElementById("input-cupon").value.trim().toUpperCase();
    const mensaje = document.getElementById("mensaje-cupon");

    if (!codigo) {
        mensaje.textContent = "Ingresa un código de cupón";
        mensaje.style.color = "red";
        return;
    }

    if (cupones[codigo]) {
        descuentoAplicado = cupones[codigo];
        mensaje.textContent = `✅ Cupón aplicado: ${descuentoAplicado}% de descuento`;
        mensaje.style.color = "green";
        mostrarCarrito();
    } else {
        descuentoAplicado = 0;
        mensaje.textContent = "❌ Código inválido";
        mensaje.style.color = "red";
    }

}


/* ========================= */
/* MINI CARRITO              */
/* ========================= */

function abrirMiniCarrito() {
    document.getElementById("mini-carrito")?.classList.add("activo");
    document.getElementById("overlay-mini")?.classList.add("activo");
    actualizarMiniCarrito();
}

function cerrarMiniCarrito() {
    document.getElementById("mini-carrito")?.classList.remove("activo");
    document.getElementById("overlay-mini")?.classList.remove("activo");
}

function actualizarMiniCarrito() {

    let carrito   = JSON.parse(localStorage.getItem("carrito")) || [];
    let contenedor = document.getElementById("mini-carrito-body");
    let total     = 0;

    if (!contenedor) return;

    contenedor.innerHTML = "";

    carrito.forEach((producto, index) => {
        let subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        contenedor.innerHTML += `
            <div class="mini-item">
                <img src="${producto.imagen}" class="mini-img">
                <div class="mini-info">
                    <h4>${producto.nombre}</h4>
                    <p>Cantidad: ${producto.cantidad}</p>
                    <p class="mini-precio">$${subtotal.toLocaleString()}</p>
                </div>
                <button class="mini-eliminar" onclick="eliminarDesdeMini(${index})">✕</button>
            </div>
        `;
    });

    const totalMini = document.getElementById("mini-total");
    if (totalMini) totalMini.innerText = "Total: $" + total.toLocaleString();

}

function eliminarDesdeMini(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarMiniCarrito();
    actualizarContador();
    mostrarCarrito();
}


/* ========================= */
/* CONTADOR FLOTANTE         */
/* ========================= */

function actualizarContador() {
    let carrito      = JSON.parse(localStorage.getItem("carrito")) || [];
    let totalCantidad = 0;
    carrito.forEach(producto => { totalCantidad += producto.cantidad; });
    const contador = document.getElementById("contador-carrito");
    if (contador) contador.innerText = totalCantidad;
}


/* ========================= */
/*  FINALIZAR COMPRA   */
/* ========================= */

async function finalizarCompra() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Debes iniciar sesión para comprar");
        window.location.href = "Login.html";
        return;
    }

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    let total = 0;
    carrito.forEach(producto => { total += producto.precio * producto.cantidad; });

    const totalConDescuento = total - (total * descuentoAplicado / 100);

    try {

        const respuesta = await fetch("http://localhost:3000/api/pedidos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ carrito, total: totalConDescuento })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            alert("✅ Pedido confirmado 🐶");
            localStorage.removeItem("carrito");
            descuentoAplicado = 0;
            mostrarCarrito();
            actualizarContador();
            actualizarMiniCarrito();
        } else {
            alert(data.error || data.mensaje || "Error al procesar la compra");
        }

    } catch (error) {
        console.error(error);
        alert("Error al procesar compra");
    }

}