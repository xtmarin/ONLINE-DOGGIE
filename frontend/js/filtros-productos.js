document.addEventListener("DOMContentLoaded", function () {

    const buscador = document.getElementById("buscador");
    const filtroCategoria = document.getElementById("filtro-categoria");
    const productos = document.querySelectorAll(".producto");

    function filtrarProductos() {

        const texto = buscador.value.toLowerCase();
        const categoria = filtroCategoria.value;

        let productosVisibles = 0;

        productos.forEach(producto => {

            const nombre = producto.dataset.nombre.toLowerCase();
            const categoriaProducto = producto.dataset.categoria;

            const coincideTexto = nombre.includes(texto);
            const coincideCategoria =
                categoria === "todos" || categoriaProducto === categoria;

            if (coincideTexto && coincideCategoria) {
                producto.style.display = "block";
                productosVisibles++;
            } else {
                producto.style.display = "none";
            }
        });

    }

    buscador.addEventListener("input", filtrarProductos);
    filtroCategoria.addEventListener("change", filtrarProductos);

});