const token = localStorage.getItem("token");

const inputImagen = document.getElementById("imagen");
const preview = document.getElementById("preview");
const formProducto = document.getElementById("form-producto");
const uploadBox = document.getElementById("upload-box");

let productoEditando = null;


/* ============================= */
/* CLICK EN EL CUADRO PARA ABRIR INPUT */
/* ============================= */

uploadBox.addEventListener("click", () => {
    inputImagen.click();
});


/* ============================= */
/* DRAG & DROP */
/* ============================= */

uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.classList.add("dragover");
});

uploadBox.addEventListener("dragleave", () => {
    uploadBox.classList.remove("dragover");
});

uploadBox.addEventListener("drop", (e) => {

    e.preventDefault();
    uploadBox.classList.remove("dragover");

    const archivo = e.dataTransfer.files[0];

    if (archivo) {
        inputImagen.files = e.dataTransfer.files;
        mostrarPreview(archivo);
    }

});


/* ============================= */
/* PREVIEW DE IMAGEN */
/* ============================= */

inputImagen.addEventListener("change", function () {

    const archivo = this.files[0];

    if (archivo) {
        mostrarPreview(archivo);
    }

});

function mostrarPreview(archivo) {

    const reader = new FileReader();

    reader.onload = function (e) {

        preview.src = e.target.result;
        preview.style.display = "block";

    };

    reader.readAsDataURL(archivo);

}


/* ============================= */
/* CARGAR PRODUCTOS */
/* ============================= */

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


/* ============================= */
/* CREAR O EDITAR PRODUCTO */
/* ============================= */

formProducto.addEventListener("submit", async (e) => {

    e.preventDefault();

    const formData = new FormData();

    formData.append("nombre", document.getElementById("nombre").value);
    formData.append("descripcion", document.getElementById("descripcion").value);
    formData.append("precio", document.getElementById("precio").value);
    formData.append("categoria", document.getElementById("categoria").value);
    formData.append("stock", document.getElementById("stock").value);

    const imagenInput = document.getElementById("imagen");

    if (imagenInput.files.length > 0) {
        formData.append("imagen", imagenInput.files[0]);
    }

    let url = "http://localhost:3000/api/productos";
    let metodo = "POST";

    if (productoEditando) {
        url = `http://localhost:3000/api/productos/${productoEditando}`;
        metodo = "PUT";
    }

    await fetch(url, {

        method: metodo,

        headers: {
            "Authorization": "Bearer " + token
        },

        body: formData

    });

    productoEditando = null;

    formProducto.reset();
    preview.src = "";
    preview.style.display = "none";

    document.querySelector("#form-producto button").innerText = "Crear Producto";

    cargarProductos();

});


/* ============================= */
/* ELIMINAR PRODUCTO */
/* ============================= */

async function eliminarProducto(id) {

    const confirmar = confirm("¿Seguro que deseas eliminar este producto?");

    if (!confirmar) return;

    await fetch(`http://localhost:3000/api/productos/${id}`, {

        method: "DELETE",

        headers: {
            "Authorization": "Bearer " + token
        }

    });

    cargarProductos();

}


/* ============================= */
/* EDITAR PRODUCTO */
/* ============================= */

function editarProducto(id, nombre, descripcion, precio, categoria, imagen, stock) {

    productoEditando = id;

    document.getElementById("nombre").value = nombre;
    document.getElementById("descripcion").value = descripcion;
    document.getElementById("precio").value = precio;
    document.getElementById("categoria").value = categoria;
    document.getElementById("stock").value = stock;

    document.querySelector("#form-producto button").innerText = "Actualizar Producto";

}


/* ============================= */
/* INICIAR */
/* ============================= */

cargarProductos();