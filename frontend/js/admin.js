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

    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precio = document.getElementById("precio").value.trim();
    const categoria = document.getElementById("categoria").value.trim();
    const stock = document.getElementById("stock").value.trim();

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

    let url = "http://localhost:3000/api/productos";
    let metodo = "POST";

    if (productoEditando) {
        url = `http://localhost:3000/api/productos/${productoEditando}`;
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

    document.getElementById("nombre").value = nombre;
    document.getElementById("descripcion").value = descripcion;
    document.getElementById("precio").value = precio;
    document.getElementById("categoria").value = categoria;
    document.getElementById("stock").value = stock;

    if (imagen) {
        preview.src = `http://localhost:3000/assets/img/${imagen}`;
        preview.style.display = "block";
    }

    document.querySelector("#form-producto button").innerText = "Actualizar Producto";
    window.scrollTo({ top: 0, behavior: "smooth" });

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
    } catch (error) {
        console.error("Error cargando métricas:", error);
    }
}



async function cargarActividad() {
    try {
        const respuesta = await fetch("http://localhost:3000/api/admin/actividad", {
            headers: { "Authorization": "Bearer " + token }
        });
        const actividades = await respuesta.json();

        const tablaActividad = document.getElementById('lista-actividad');
        if (respuesta.ok && tablaActividad) {
            tablaActividad.innerHTML = actividades.map(act => `
                <tr>
                    <td>${act.nombre} <br><small>${act.email}</small></td>
                    <td>${act.accion}</td>
                    <td>${new Date(act.fecha).toLocaleString()}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error("Error cargando actividad:", error);
    }
}



const formNuevoAdmin = document.getElementById('form-nuevo-admin');

if (formNuevoAdmin) {
    formNuevoAdmin.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('admin-email').value.trim();

        try {
            const respuesta = await fetch("http://localhost:3000/api/admin/nuevo-admin", {
                method: 'POST',
                headers: {
                    "Authorization": "Bearer " + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email }) // Solo enviamos el email ahora
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                alert(data.mensaje);
                formNuevoAdmin.reset();
                cargarActividad(); // Refresca la tabla de actividad automáticamente
            } else {
                alert("Error: " + data.mensaje);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
}

/* ============================= */
/* RF40 - GESTIÓN DE PEDIDOS     */
/* ============================= */

async function cargarPedidosAdmin() {
    try {
        const respuesta = await fetch("http://localhost:3000/api/admin/pedidos", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!respuesta.ok) return;

        const pedidos = await respuesta.json();
        const contenedor = document.getElementById("lista-pedidos-admin");
        if (!contenedor) return;

        if (!pedidos.length) {
            contenedor.innerHTML = "<p>No hay pedidos registrados.</p>";
            return;
        }

        contenedor.innerHTML = pedidos.map(pedido => `
            <div class="pedido-card">
                <p><strong>Pedido #${pedido.id}</strong> — ${pedido.usuario_nombre}</p>
                <p>Total: $${Number(pedido.total).toLocaleString("es-CO")}</p>
                <p>Fecha: ${new Date(pedido.fecha).toLocaleDateString("es-CO")}</p>
                <p>Estado: <strong>${pedido.estado}</strong></p>
                <button onclick="cambiarEstadoSimulado(${pedido.id})">
                    🚚 Cambiar estado
                </button>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error cargando pedidos:", error);
    }
}

/* RF40 y RF41 - SIMULACIÓN ENVÍO */
async function cambiarEstadoSimulado(pedidoId) {
    const estados = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];
    const nuevoEstado = prompt(
        "Estado del pedido #" + pedidoId + "\n\n" +
        "Opciones: pendiente / pagado / enviado / entregado / cancelado"
    );

    if (!nuevoEstado) return;

    if (!estados.includes(nuevoEstado.toLowerCase())) {
        alert("Estado no válido.");
        return;
    }

    try {
        const respuesta = await fetch(`http://localhost:3000/api/pedidos/${pedidoId}/estado`, {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nuevoEstado: nuevoEstado.toLowerCase() })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            alert("✅ RF41: " + data.notificacion);
            cargarPedidosAdmin();
        } else {
            alert("Error: " + data.error);
        }
    } catch (error) {
        alert("Error conectando con el servidor");
    }
}





//iniciar


cargarAlertas();
cargarStock();
cargarProductos();
cargarMetricas();
cargarActividad(); 
cargarPedidosAdmin();