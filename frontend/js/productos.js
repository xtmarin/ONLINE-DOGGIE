document.addEventListener("DOMContentLoaded", async () => {

    try {
        const respuesta = await fetch("http://localhost:3000/api/productos");
        const productos = await respuesta.json();

        const contenedor = document.getElementById("lista-productos");
        contenedor.innerHTML = "";

        productos.forEach(producto => {

            const div = document.createElement("div");
            div.classList.add("producto");

            div.setAttribute("data-nombre", producto.nombre.toLowerCase());
            div.setAttribute("data-categoria", producto.categoria.toLowerCase());

            div.innerHTML = `
                <img src="http://localhost:3000/assets/img/${producto.imagen}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p class="descripcion">${producto.descripcion}</p>
                <p class="precio">$${Number(producto.precio).toLocaleString("es-CO")}</p>
                <p class="stock">${producto.stock > 0 ? "Disponible" : "Agotado"}</p>

                <button class="btn-agregar"
                    onclick="agregarAlCarrito(${producto.id}, '${producto.nombre}', ${producto.precio}, '${producto.imagen}')">
                    Agregar al carrito
                </button>
            `;

            contenedor.appendChild(div);
        });

    } catch (error) {
        console.error("Error cargando productos:", error);
    }
});