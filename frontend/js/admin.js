const token = localStorage.getItem("token");

const inputImagen = document.getElementById("imagen");
const preview = document.getElementById("preview");
const formProducto = document.getElementById("form-producto");
const uploadBox = document.getElementById("upload-box");

let productoEditando = null;


/* ============================= */
/* CLICK EN EL CUADRO            */
/* ============================= */

uploadBox.addEventListener("click", () => {
    inputImagen.click();
});


/* ============================= */
/* DRAG & DROP                   */
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
/* PREVIEW DE IMAGEN             */
/* ============================= */

inputImagen.addEventListener("change", function () {
    const archivo = this.files[0];
    if (archivo) mostrarPreview(archivo);
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
/* RF02 - ALERTAS STOCK BAJO     */
/* ============================= */

async function cargarAlertas() {

    try {

        const respuesta = await fetch("http://localhost:3000/api/productos/stock-bajo", {
            headers: { "Authorization": "Bearer " + token }
        });

        const productos = await respuesta.json();
        const contenedor = document.getElementById("lista-alertas");

        if (!productos.length) {
            contenedor.innerHTML = `<p class="sin-alertas">✅ Todos los productos tienen stock suficiente.</p>`;
            return;
        }

        contenedor.innerHTML = productos.map(p => `
            <div class="alerta-item">
                <span>⚠️ <strong>${p.nombre}</strong></span>
                <span class="alerta-stock">Stock: ${p.stock} unidades</span>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error cargando alertas:", error);
    }

}


/* ============================= */
/* RF26 / RF27 - GESTIÓN STOCK   */
/* ============================= */

async function cargarStock() {

    try {

        const respuesta = await fetch("http://localhost:3000/api/productos");
        const productos = await respuesta.json();

        const contenedor = document.getElementById("lista-stock");
        contenedor.innerHTML = "";

        productos.forEach(producto => {

            contenedor.innerHTML += `
                <div class="stock-item">

                    <div class="stock-info">
                        <span class="stock-nombre">${producto.nombre}</span>
                        <span class="stock-actual ${producto.stock <= 5 ? 'stock-bajo' : ''}">
                            Stock actual: ${producto.stock}
                        </span>
                    </div>

                    <div class="stock-acciones">
                        <input 
                            type="number" 
                            id="stock-input-${producto.id}" 
                            value="${producto.stock}" 
                            min="0" 
                            class="stock-input"
                        >
                        <button onclick="actualizarStock(${producto.id})">
                            Actualizar
                        </button>
                    </div>

                </div>
            `;

        });

    } catch (error) {
        console.error("Error cargando stock:", error);
    }

}

async function actualizarStock(id) {

    const nuevoStock = document.getElementById(`stock-input-${id}`).value;

    if (nuevoStock === "" || nuevoStock < 0) {
        alert("Ingresa un valor de stock válido");
        return;
    }

    const respuesta = await fetch(`http://localhost:3000/api/productos/${id}/stock`, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ stock: parseInt(nuevoStock) })
    });

    const data = await respuesta.json();
    alert(data.mensaje);

    cargarStock();
    cargarAlertas();
    cargarProductos();

}


/* ============================= */
/* CARGAR PRODUCTOS              */
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
                <p class="admin-stock ${producto.stock <= 5 ? 'stock-bajo' : ''}">
                    Stock: ${producto.stock}
                </p>
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
                )">Editar</button>

                <button onclick="eliminarProducto(${producto.id})">Eliminar</button>
            </div>

        </div>
        `;

    });

}


/* ============================= */
/* CREAR O EDITAR PRODUCTO       */
/* ============================= */

formProducto.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nombre      = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precio      = document.getElementById("precio").value.trim();
    const categoria   = document.getElementById("categoria").value.trim();
    const stock       = document.getElementById("stock").value.trim();

    if (!nombre || !descripcion || !precio || !categoria || !stock) {
        alert("Todos los campos son obligatorios");
        return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("precio", precio);
    formData.append("categoria", categoria);
    formData.append("stock", stock);

    const imagenInput = document.getElementById("imagen");
    if (imagenInput.files.length > 0) {
        formData.append("imagen", imagenInput.files[0]);
    }

    let url    = "http://localhost:3000/api/productos";
    let metodo = "POST";

    if (productoEditando) {
        url    = `http://localhost:3000/api/productos/${productoEditando}`;
        metodo = "PUT";
    }

    const respuesta = await fetch(url, {
        method: metodo,
        headers: { "Authorization": "Bearer " + token },
        body: formData
    });

    const data = await respuesta.json();

    if (respuesta.ok) {
        alert(data.mensaje);
    } else {
        alert("Error: " + data.error);
    }

    productoEditando = null;
    formProducto.reset();
    preview.src = "";
    preview.style.display = "none";
    document.querySelector("#form-producto button").innerText = "Crear Producto";

    cargarProductos();
    cargarStock();
    cargarAlertas();

});


/* ============================= */
/* ELIMINAR PRODUCTO             */
/* ============================= */

async function eliminarProducto(id) {

    const confirmar = confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirmar) return;

    await fetch(`http://localhost:3000/api/productos/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
    });

    cargarProductos();
    cargarStock();
    cargarAlertas();

}


/* ============================= */
/* EDITAR PRODUCTO               */
/* ============================= */

function editarProducto(id, nombre, descripcion, precio, categoria, imagen, stock) {

    productoEditando = id;

    document.getElementById("nombre").value      = nombre;
    document.getElementById("descripcion").value = descripcion;
    document.getElementById("precio").value      = precio;
    document.getElementById("categoria").value   = categoria;
    document.getElementById("stock").value       = stock;

    if (imagen) {
        preview.src           = `http://localhost:3000/assets/img/${imagen}`;
        preview.style.display = "block";
    }

    document.querySelector("#form-producto button").innerText = "Actualizar Producto";
    window.scrollTo({ top: 0, behavior: "smooth" });

}


/* ============================= */
/* INICIAR                       */
/* ============================= */

cargarAlertas();
cargarStock();
cargarProductos();