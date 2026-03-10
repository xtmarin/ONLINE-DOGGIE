const token = localStorage.getItem("token");

async function cargarProductos() {

    const respuesta = await fetch("http://localhost:3000/api/productos");
    const productos = await respuesta.json();

    const contenedor = document.getElementById("lista-productos");
    contenedor.innerHTML = "";

    productos.forEach(producto => {

        contenedor.innerHTML += `

        <div class="admin-item">

            <div class="admin-info">
                <h3>${producto.nombre}</h3>
                <p class="admin-precio">$${Number(producto.precio).toLocaleString()}</p>
            </div>

            <div class="admin-botones">

                <button onclick="editarProducto(
                    ${producto.id},
                    '${producto.nombre}',
                    '${producto.descripcion}',
                    ${producto.precio},
                    '${producto.categoria}',
                    '${producto.imagen}',
                    ${producto.stock}
                )">
                Editar
                </button>

                <button onclick="eliminarProducto(${producto.id})">
                Eliminar
                </button>

            </div>

        </div>

        `;
    });

}


document.getElementById("form-producto").addEventListener("submit", async (e) => {

    e.preventDefault();

    const idEditando = e.target.dataset.editando;

    const producto = {

        nombre: document.getElementById("nombre").value,
        descripcion: document.getElementById("descripcion").value,
        precio: document.getElementById("precio").value,
        categoria: document.getElementById("categoria").value,
        imagen: document.getElementById("imagen").value,
        stock: document.getElementById("stock").value

    };

    if (idEditando) {

        await fetch(`http://localhost:3000/api/productos/${idEditando}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },

            body: JSON.stringify(producto)

        });

        delete e.target.dataset.editando;

        document.querySelector("#form-producto button").innerText = "Crear Producto";

    } else {

        await fetch("http://localhost:3000/api/productos", {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },

            body: JSON.stringify(producto)

        });

    }

    e.target.reset();

    cargarProductos();

});


async function eliminarProducto(id) {

    await fetch(`http://localhost:3000/api/productos/${id}`, {

        method: "DELETE",

        headers: {
            "Authorization": "Bearer " + token
        }

    });

    cargarProductos();

}


function editarProducto(id, nombre, descripcion, precio, categoria, imagen, stock) {

    document.getElementById("nombre").value = nombre;
    document.getElementById("descripcion").value = descripcion;
    document.getElementById("precio").value = precio;
    document.getElementById("categoria").value = categoria;
    document.getElementById("imagen").value = imagen;
    document.getElementById("stock").value = stock;

    document.getElementById("form-producto").dataset.editando = id;

    document.querySelector("#form-producto button").innerText = "Actualizar Producto";

}


cargarProductos();