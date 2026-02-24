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