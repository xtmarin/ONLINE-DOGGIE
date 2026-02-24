function agregarAlCarrito(nombre, precio) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    let productoExistente = carrito.find(p => p.nombre === nombre);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            nombre: nombre,
            precio: precio,
            cantidad: 1
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    alert("Producto agregado al carrito 🛒");
}