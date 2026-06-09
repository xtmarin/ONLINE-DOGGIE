document.addEventListener("DOMContentLoaded", async () => {

    try {

        const respuesta = await fetch("http://localhost:3000/api/productos");
        const productos = await respuesta.json();

        const contenedor = document.getElementById("lista-productos");

        if (!contenedor) return;

        contenedor.innerHTML = "";

        for (const producto of productos) {

            /* Obtener valoración promedio */
            let promedio = 0;
            let total = 0;

            try {
                const valRes = await fetch(
                    `http://localhost:3000/api/productos/${producto.id}/valoracion`
                );

                const valData = await valRes.json();

                promedio = parseFloat(valData.promedio) || 0;
                total = parseInt(valData.total) || 0;

            } catch (e) {
                console.error("Error obteniendo valoración:", e);
            }

            const estrellas = generarEstrellas(promedio);

            const nombreSeguro = producto.nombre.replace(/'/g, "\\'");

            const div = document.createElement("div");
            div.classList.add("producto");

            div.setAttribute(
                "data-nombre",
                (producto.nombre || "").toLowerCase()
            );

            div.setAttribute(
                "data-categoria",
                (producto.categoria || "").toLowerCase()
            );

            div.innerHTML = `
                <img 
                    src="http://localhost:3000/uploads/${producto.imagen}" 
                    alt="${producto.nombre}"
                >

                <h3>${producto.nombre}</h3>

                <p class="descripcion">${producto.descripcion || ""}</p>

                <div class="rating" id="rating-${producto.id}">
                    <div class="estrellas-display">${estrellas}</div>
                    <span class="rating-info">
                        ${
                            promedio > 0
                                ? `${promedio} / 5 (${total} valoraciones)`
                                : "Sin valoraciones"
                        }
                    </span>
                </div>

                <div class="valorar-box" id="valorar-${producto.id}">
                    <p class="valorar-titulo">
                        ¿Ya lo compraste? Valóralo:
                    </p>

                    <div class="estrellas-input">
                        <span
                            class="estrella"
                            data-valor="1"
                            onclick="seleccionarEstrella(${producto.id}, 1)"
                        >☆</span>

                        <span
                            class="estrella"
                            data-valor="2"
                            onclick="seleccionarEstrella(${producto.id}, 2)"
                        >☆</span>

                        <span
                            class="estrella"
                            data-valor="3"
                            onclick="seleccionarEstrella(${producto.id}, 3)"
                        >☆</span>

                        <span
                            class="estrella"
                            data-valor="4"
                            onclick="seleccionarEstrella(${producto.id}, 4)"
                        >☆</span>

                        <span
                            class="estrella"
                            data-valor="5"
                            onclick="seleccionarEstrella(${producto.id}, 5)"
                        >☆</span>
                    </div>

                    <button
                        class="btn-valorar"
                        onclick="enviarValoracion(${producto.id})"
                    >
                        Enviar valoración
                    </button>
                </div>

                <p class="precio">
                    $${Number(producto.precio).toLocaleString("es-CO")}
                </p>

                <p class="stock">
                    ${producto.stock > 0 ? "Disponible" : "Agotado"}
                </p>

                <button
                    class="btn-agregar"
                    onclick="agregarAlCarrito(${producto.id}, '${nombreSeguro}', ${producto.precio}, this)"
                >
                    Agregar al carrito
                </button>
            `;

            contenedor.appendChild(div);
        }

    } catch (error) {

        console.error("Error cargando productos:", error);

    }

});


function generarEstrellas(promedio) {

    let estrellas = "";

    for (let i = 1; i <= 5; i++) {
        estrellas += i <= Math.round(promedio) ? "⭐" : "☆";
    }

    return estrellas;
}


const valoraciones = {};


function seleccionarEstrella(productoId, valor) {

    valoraciones[productoId] = valor;

    const estrellas = document.querySelectorAll(
        `#valorar-${productoId} .estrella`
    );

    estrellas.forEach((estrella, index) => {
        estrella.textContent = index < valor ? "⭐" : "☆";
    });

}


/* ENVIAR VALORACIÓN */

async function enviarValoracion(productoId) {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Debes iniciar sesión para valorar un producto");
        return;
    }

    const valor = valoraciones[productoId];

    if (!valor) {
        alert("Selecciona una valoración entre 1 y 5 estrellas");
        return;
    }

    try {

        const respuesta = await fetch(
            `http://localhost:3000/api/productos/${productoId}/valorar`,
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    valoracion: valor
                })
            }
        );

        let data = {};

        try {
            data = await respuesta.json();
        } catch (e) {
            data = {};
        }

        if (respuesta.ok) {

            alert("Valoración registrada");

            const valRes = await fetch(
                `http://localhost:3000/api/productos/${productoId}/valoracion`
            );

            const valData = await valRes.json();

            const promedio = parseFloat(valData.promedio) || 0;
            const total = parseInt(valData.total) || 0;

            const ratingDiv = document.getElementById(
                `rating-${productoId}`
            );

            if (ratingDiv) {

                ratingDiv.innerHTML = `
                    <div class="estrellas-display">
                        ${generarEstrellas(promedio)}
                    </div>

                    <span class="rating-info">
                        ${promedio} / 5 (${total} valoraciones)
                    </span>
                `;
            }

            const valorarDiv = document.getElementById(
                `valorar-${productoId}`
            );

            if (valorarDiv) {
                valorarDiv.style.display = "none";
            }

        } else {

            alert(data.error || "Error al enviar valoración");

        }

    } catch (error) {

        console.error("Error enviando valoración:", error);
        alert("Error conectando con el servidor");

    }

}