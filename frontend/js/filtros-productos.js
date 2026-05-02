document.addEventListener("DOMContentLoaded", function () {

    const buscador = document.getElementById("buscador");
    const filtroCategoria = document.getElementById("filtro-categoria");

    function filtrarProductos() {

        const texto = buscador.value.toLowerCase();
        const categoria = filtroCategoria.value;

        const productos = document.querySelectorAll(".producto");
        let hayResultados = false;

        productos.forEach(producto => {

            const nombre = producto.dataset.nombre;
            const categoriaProducto = producto.dataset.categoria;

            const coincideTexto = nombre.includes(texto);
            const coincideCategoria =
                categoria === "todos" || categoriaProducto === categoria;

            if (coincideTexto && coincideCategoria) {
                producto.style.display = "block";
                hayResultados = true;
            } else {
                producto.style.display = "none";
            }

        });

        // Mensaje cuando no hay resultados
        let mensaje = document.getElementById("mensaje-sin-resultados");

        if (!mensaje) {
            mensaje = document.createElement("p");
            mensaje.id = "mensaje-sin-resultados";
            mensaje.style.textAlign = "center";
            mensaje.style.color = "var(--color-text-secondary, #888)";
            mensaje.style.padding = "2rem";
            mensaje.style.width = "100%";
            document.getElementById("lista-productos").appendChild(mensaje);
        }

        if (!hayResultados) {
            if (categoria !== "todos" && texto === "") {
                mensaje.textContent = `No hay productos en la categoría seleccionada.`;
            } else {
                mensaje.textContent = `No se encontraron productos para "${buscador.value}".`;
            }
            mensaje.style.display = "block";
        } else {
            mensaje.style.display = "none";
        }

    }

    buscador.addEventListener("input", filtrarProductos);
    filtroCategoria.addEventListener("change", filtrarProductos);

});