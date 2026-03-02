function agregarAlCarrito(nombre, precio, boton) {

    let productoDiv = boton.closest(".producto");
    let imagen = productoDiv.querySelector("img").src;

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    let productoExistente = carrito.find(p => p.nombre === nombre);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            nombre: nombre,
            precio: precio,
            imagen: imagen,
            cantidad: 1
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));


    actualizarContador();
    abrirMiniCarrito();
}

function eliminarDesdeMini(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    carrito.splice(index, 1);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    actualizarMiniCarrito();
    mostrarCarrito();
    actualizarContador();
}

