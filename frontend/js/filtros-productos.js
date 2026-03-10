document.addEventListener("DOMContentLoaded", function () {

    const buscador = document.getElementById("buscador");
    const filtroCategoria = document.getElementById("filtro-categoria");

    function filtrarProductos() {

        const texto = buscador.value.toLowerCase();
        const categoria = filtroCategoria.value;

        const productos = document.querySelectorAll(".producto");

        productos.forEach(producto => {

            const nombre = producto.dataset.nombre;
            const categoriaProducto = producto.dataset.categoria;

            const coincideTexto = nombre.includes(texto);
            const coincideCategoria =
                categoria === "todos" || categoriaProducto === categoria;

            if (coincideTexto && coincideCategoria) {
                producto.style.display = "block";
            } else {
                producto.style.display = "none";
            }

        });

    }

    buscador.addEventListener("input", filtrarProductos);
    filtroCategoria.addEventListener("change", filtrarProductos);

});