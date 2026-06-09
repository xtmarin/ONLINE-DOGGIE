const token = localStorage.getItem("token");

const inputImagen = document.getElementById("imagen");
const preview = document.getElementById("preview");
const formProducto = document.getElementById("form-producto");
const uploadBox = document.getElementById("upload-box");

let productoEditando = null;
let productosCache = [];


uploadBox.addEventListener("click", () => {
    inputImagen.click();
});

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

/* ... (Funciones de Alertas y Stock iguales) ... */

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
    } catch (error) { console.error("Error cargando alertas:", error); }
}

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
                        <input type="number" id="stock-input-${producto.id}" value="${producto.stock}" min="0" class="stock-input">
                        <button onclick="actualizarStock(${producto.id})">Actualizar</button>
                    </div>
                </div>
            `;
        });
    } catch (error) { console.error("Error cargando stock:", error); }
}

async function actualizarStock(id) {
    const nuevoStock = document.getElementById(`stock-input-${id}`).value;
    if (nuevoStock === "" || nuevoStock < 0) { alert("Ingresa un valor de stock válido"); return; }
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
    cargarStock(); cargarAlertas(); cargarProductos();
}

/* ... Cargar Productos  ... */
async function cargarProductos() {
    try {

        const respuesta = await fetch("http://localhost:3000/api/productos");
        const productos = await respuesta.json();

        productosCache = productos;

        const contenedor = document.getElementById("lista-productos");

        if (!contenedor) return;

        contenedor.innerHTML = "";

        productos.forEach(producto => {

            contenedor.innerHTML += `
                <div class="admin-item">
                    <div class="admin-info">
                        <h3>${producto.nombre}</h3>

                        <p class="admin-precio">
                            $${Number(producto.precio).toLocaleString()}
                        </p>

                        <p class="admin-stock ${producto.stock <= 5 ? 'stock-bajo' : ''}">
                            Stock: ${producto.stock}
                        </p>
                    </div>

                    <div class="admin-botones">
                        <button onclick="editarProducto(${producto.id})">
                            Editar
                        </button>

                        <button onclick="eliminarProducto(${producto.id})">
                            Eliminar
                        </button>
                    </div>
                </div>
            `;

        });

    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

/* ... (Formulario de crear/editar) ... */
formProducto.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    
    const categoria = document.getElementById("categoria").value; 
    
    const precioRaw = document.getElementById("precio").value;
    const precio = parseFloat(precioRaw.toString().replace(/[.,]/g, "")); 
    
    const stockRaw = document.getElementById("stock").value;
    const stock = parseInt(stockRaw.toString().replace(/[.,]/g, ""), 10);

    // 3. Validar que sean números
    if (isNaN(precio) || isNaN(stock)) {
        alert("El precio y el stock deben ser números válidos");
        return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("precio", precio); // Enviamos el limpio
    formData.append("categoria", categoria);
    formData.append("stock", stock);   // Enviamos el limpio

    const imagenInput = document.getElementById("imagen");
    if (imagenInput.files.length > 0) formData.append("imagen", imagenInput.files[0]);

    let url = "http://localhost:3000/api/productos";
    let metodo = "POST";
    
    if (productoEditando) { 
        url = `http://localhost:3000/api/productos/${productoEditando}`; 
        metodo = "PUT"; 
    }

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { "Authorization": "Bearer " + token },
            body: formData // Aquí enviamos el formData que ya tiene los números limpios
        });

        const data = await respuesta.json();
        
        if (respuesta.ok) {
            alert(data.mensaje);
            // Resetear el formulario
            productoEditando = null;
            formProducto.reset();
            preview.src = "";
            preview.style.display = "none";
            document.querySelector("#form-producto button").innerText = "Crear Producto";
            
            // Recargar datos
            cargarProductos(); 
            cargarStock(); 
            cargarAlertas();
        } else {
            alert("Error: " + (data.error || "No se pudo procesar la solicitud"));
        }
    } catch (error) {
        console.error("Error en el envío:", error);
        alert("Ocurrió un error al guardar el producto");
    }
});


function editarProducto(id) {

    const producto = productosCache.find(
        p => Number(p.id) === Number(id)
    );

    if (!producto) {
        alert("Producto no encontrado");
        return;
    }

    productoEditando = producto.id;

    document.getElementById("nombre").value =
        producto.nombre;

    document.getElementById("descripcion").value =
        producto.descripcion;

    document.getElementById("precio").value =
        producto.precio;

    document.getElementById("categoria").value =
        producto.categoria_id;

    document.getElementById("stock").value =
        producto.stock;

    if (producto.imagen) {
        preview.src =
            `http://localhost:3000/uploads/${producto.imagen}`;

        preview.style.display = "block";
    }

    document.querySelector(
        "#form-producto button"
    ).innerText = "Actualizar Producto";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


async function eliminarProducto(id) {

    const confirmar = confirm(
        "¿Seguro que deseas eliminar este producto?"
    );

    if (!confirmar) return;

    try {

        const respuesta = await fetch(
            `http://localhost:3000/api/productos/${id}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const data = await respuesta.json();

        if (!respuesta.ok) {
            alert(data.error || "Error al eliminar producto");
            return;
        }

        alert(data.mensaje);

        cargarProductos();
        cargarStock();
        cargarAlertas();

    } catch (error) {

        console.error("Error eliminando producto:", error);

        alert(
            "Error al conectar con el servidor"
        );

    }
}

async function cargarMetricas() {
    try {
        const respuesta = await fetch("http://localhost:3000/api/admin/metricas", {
            headers: { "Authorization": "Bearer " + token }
        });
        const data = await respuesta.json();
        if (respuesta.ok) {
            document.getElementById('met-productos').textContent = data.totalProductos;
            document.getElementById('met-usuarios').textContent = data.totalUsuarios;
            document.getElementById('met-ventas').textContent = `$${data.totalVentas.toLocaleString()}`;
        }
    } catch (error) { console.error("Error cargando métricas:", error); }
}

// =============================
// CARGAR CATEGORÍAS
// =============================

async function cargarCategoriasSelect() {

    try {

        const respuesta = await fetch("http://localhost:3000/api/categorias");

        const categorias = await respuesta.json();

        const select = document.getElementById("categoria");

        select.innerHTML = `
            <option value="">
                Selecciona una categoría
            </option>
        `;

        categorias.forEach(categoria => {

            select.innerHTML += `
                <option value="${categoria.id}">
                    ${categoria.nombre}
                </option>
            `;

        });

    } catch (error) {

        console.error("Error cargando categorías:", error);

    }

}



// Iniciar carga
cargarAlertas();
cargarStock();
cargarProductos();
cargarMetricas();
cargarCategoriasSelect(); 