document.addEventListener("DOMContentLoaded", function () {

    // Inicializar
    mostrarCarrito();
    actualizarMiniCarrito();
    actualizarContador();

    // Botón cerrar mini carrito
    const botonCerrar = document.getElementById("cerrar-mini");
    if (botonCerrar) {
        botonCerrar.addEventListener("click", cerrarMiniCarrito);
    }

    // Cerrar al hacer click en overlay
    const overlay = document.getElementById("overlay-mini");
    if (overlay) {
        overlay.addEventListener("click", cerrarMiniCarrito);
    }
});


/* ========================= */
/* CARRITO PRINCIPAL */
/* ========================= */

function mostrarCarrito() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let carritoBody = document.getElementById("carrito-body");
    let total = 0;

    if (!carritoBody) return; // evita error si no existe

    carritoBody.innerHTML = "";

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

    const totalElemento = document.getElementById("total");
    if (totalElemento) {
        totalElemento.innerText = "Total: $" + total.toLocaleString();
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

    mostrarCarrito();
    actualizarMiniCarrito();
    actualizarContador();
}


/* ========================= */
/* MINI CARRITO */
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
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let contenedor = document.getElementById("mini-carrito-body");
    let total = 0;

    if (!contenedor) return;

    contenedor.innerHTML = "";

    carrito.forEach((producto, index) => {  // ✅ AQUI ESTÁ LA CORRECCIÓN
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

                <button class="mini-eliminar" onclick="eliminarDesdeMini(${index})">
                    ✕
                </button>
            </div>
        `;
    });

    const totalMini = document.getElementById("mini-total");
    if (totalMini) {
        totalMini.innerText = "Total: $" + total.toLocaleString();
    }
}

/* ========================= */
/* CONTADOR FLOTANTE */
/* ========================= */

function actualizarContador() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let totalCantidad = 0;

    carrito.forEach((producto, index) => {
        totalCantidad += producto.cantidad;
    });

    const contador = document.getElementById("contador-carrito");
    if (contador) {
        contador.innerText = totalCantidad;
    }
}

function agregarAlCarrito(id, nombre, precio, imagen) {

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const productoExistente = carrito.find(p => p.id === id);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            id,
            nombre,
            precio,
            imagen: "./assets/img/" + imagen,
            cantidad: 1
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    actualizarContador();
    actualizarMiniCarrito();

    alert("Producto agregado al carrito 🛒");
}

async function finalizarCompra() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Debes iniciar sesión para comprar");
        window.location.href = "login.html";
        return;
    }

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    let total = 0;

    carrito.forEach(producto => {
        total += producto.precio * producto.cantidad;
    });

    try {

        const respuesta = await fetch("http://localhost:3000/api/pedidos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                carrito,
                total
            })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {

            alert("Compra realizada con éxito 🐶");

            localStorage.removeItem("carrito");

            window.location.href = "index.html";

        } else {

            alert(data.mensaje);

        }

    } catch (error) {

        console.error(error);

        alert("Error al procesar compra");

    }

}