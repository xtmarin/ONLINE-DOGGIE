document.addEventListener("DOMContentLoaded", function () {
    mostrarCarrito();
});

function mostrarCarrito() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let carritoBody = document.getElementById("carrito-body");
    let total = 0;

    carritoBody.innerHTML = "";

    carrito.forEach((producto, index) => {
        let subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        carritoBody.innerHTML += `
            <tr>
                <td>${producto.nombre}</td>
                <td>$${producto.precio}</td>
                <td>${producto.cantidad}</td>
                <td>$${subtotal}</td>
                <td><button onclick="eliminarProducto(${index})">❌</button></td>
            </tr>
        `;
    });

    document.getElementById("total").innerText = "Total: $" + total;
}

function eliminarProducto(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
}

function vaciarCarrito() {
    localStorage.removeItem("carrito");
    mostrarCarrito();
}

function abrirMiniCarrito() {
    document.getElementById("mini-carrito").classList.add("activo");
    actualizarMiniCarrito();
}

function cerrarMiniCarrito() {
    document.getElementById("mini-carrito").classList.remove("activo");
}

document.addEventListener("DOMContentLoaded", function () {
    const botonCerrar = document.getElementById("cerrar-mini");
    if (botonCerrar) {
        botonCerrar.addEventListener("click", cerrarMiniCarrito);
    }
});

function actualizarMiniCarrito() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let contenedor = document.getElementById("mini-carrito-body");
    let total = 0;

    contenedor.innerHTML = "";

    carrito.forEach(producto => {
        let subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        contenedor.innerHTML += `
    <div class="mini-item">
        <img src="${producto.imagen}" class="mini-img">
        <div class="mini-info">
            <p>${producto.nombre}</p>
            <p>x${producto.cantidad}</p>
        </div>
        <span>$${subtotal.toLocaleString()}</span>
    </div>
`;
    });

    document.getElementById("mini-total").innerText =
        "Total: $" + total.toLocaleString();
}