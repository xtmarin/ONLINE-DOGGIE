const token = localStorage.getItem("token");
//toast
function mostrarToast(mensaje, tipo = "success") {
    Toastify({
        text: mensaje,
        duration: 3500,
        close: true,
        gravity: "top", 
        position: "right",
        stopOnFocus: true,
        className: tipo === "success" ? "toast-success" : "toast-error"
    }).showToast();
}

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

        const tbody = document.getElementById("tabla-productos-body");
        if (!tbody) return;

        tbody.innerHTML = "";

        productos.forEach(producto => {
            const imagenUrl = producto.imagen ? `http://localhost:3000/uploads/${producto.imagen}` : 'http://localhost:3000/uploads/ONLINE-DOGGIE ICO.ico';
            
            tbody.innerHTML += `
                <tr>
                    <td class="td-id">#${producto.id}</td>
                    <td class="td-img">
                        <img src="${imagenUrl}" alt="${producto.nombre}">
                    </td>
                    <td class="td-nombre">${producto.nombre}</td>
                    <td class="td-desc">${producto.descripcion || 'Sin descripción'}</td>
                    <td class="td-precio">$${Number(producto.precio).toLocaleString()}</td>
                    <td class="td-stock">
                        <span class="${producto.stock <= 5 ? 'stock-bajo' : 'stock-ok'}">
                            ${producto.stock} uds
                        </span>
                    </td>
                    <td class="td-acciones">
                        <div class="tabla-botones-container">
                            <button onclick="editarProducto(${producto.id})" class="btn-tabla-editar">Editar</button>
                            <button onclick="eliminarProducto(${producto.id})" class="btn-tabla-eliminar">Eliminar</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error cargando productos en tabla:", error);
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



const fab = document.getElementById("admin-fab");
const drawer = document.getElementById("admin-drawer");
const overlay = document.getElementById("drawer-overlay");
const closeDrawerBtn = document.getElementById("close-drawer");
const menuItems = document.querySelectorAll(".menu-item");
const secciones = document.querySelectorAll(".vista-seccion");


fab.addEventListener("click", () => {
    drawer.classList.add("abierto");
    overlay.classList.add("activo");
});


function cerrarMenu() {
    drawer.classList.remove("abierto");
    overlay.classList.remove("activo");
}

closeDrawerBtn.addEventListener("click", cerrarMenu);
overlay.addEventListener("click", cerrarMenu);


menuItems.forEach(item => {
    item.addEventListener("click", function() {
        const objetivo = this.getAttribute("data-target");

      
        secciones.forEach(sec => sec.classList.remove("activa"));


        document.getElementById(objetivo).classList.add("activa");

      

 
        cerrarMenu();
    });
});

// ==========================================
// GESTIÓN DE EDITAR USUARIOS Y ROLES
// ==========================================

async function cambiarRolUsuario(accion) {
    const email = document.getElementById("admin-email").value.trim();
    if (!email) {
        mostrarToast("Por favor, ingrese el correo electrónico", "error");
        return;
    }

    const url = accion === "promover" 
        ? "http://localhost:3000/api/admin/promover" 
        : "http://localhost:3000/api/admin/degradar";

    try {
        const respuesta = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email })
        });
        const data = await respuesta.json();

        if (respuesta.ok) {
            mostrarToast(data.mensaje || `Rol de usuario actualizado con éxito`);
            document.getElementById("form-nuevo-admin").reset();
            cargarMetricas();
        } else {
            mostrarToast(data.error || "No se pudo cambiar el rol del usuario", "error");
        }
    } catch (error) {
        console.error("Error alterando rol:", error);
        mostrarToast("Error en la conexión con el servidor", "error");
    }
}

async function eliminarUsuarioSistema() {
    const email = document.getElementById("admin-email").value.trim();
    if (!email) {
        mostrarToast("Por favor, ingrese el correo electrónico del usuario a eliminar", "error");
        return;
    }

    const confirmar = confirm(`¿Está seguro de eliminar permanentemente al usuario ${email}?`);
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`http://localhost:3000/api/admin/usuarios-eliminar`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email })
        });
        const data = await respuesta.json();

        if (respuesta.ok) {
            mostrarToast(data.mensaje || "Usuario eliminado correctamente");
            document.getElementById("form-nuevo-admin").reset();
            cargarMetricas();
        } else {
            mostrarToast(data.error || "No se pudo eliminar al usuario", "error");
        }
    } catch (error) {
        console.error("Error eliminando usuario:", error);
        mostrarToast("Error de comunicación con el servidor", "error");
    }
}

// Búsqueda del Historial de Compras por Correo
async function consultarHistorialCompras() {
    const email = document.getElementById("buscar-historial-email").value.trim();
    const contenedor = document.getElementById("resultados-historial-compras");

    if (!email) {
        mostrarToast("Por favor ingrese un correo válido", "error");
        return;
    }

    try {
        contenedor.innerHTML = "<p class='historial-vacio'>Buscando transacciones...</p>";
        
        const respuesta = await fetch(`http://localhost:3000/api/admin/pedidos?email=${email}`, {
            headers: { "Authorization": "Bearer " + token }
        });
        const pedidos = await respuesta.json();

        if (!respuesta.ok || !pedidos.length) {
            contenedor.innerHTML = `<p class="historial-error">❌ No se encontraron compras vinculadas al correo: ${email}</p>`;
            return;
        }

        contenedor.innerHTML = pedidos.map(pedido => `
            <div class="historial-item-card">
                <div class="historial-item-header">
                    <span class="historial-id">Orden #${pedido.id}</span>
                    <span class="historial-monto">$${Number(pedido.total).toLocaleString()}</span>
                </div>
                <div class="historial-item-detalles">
                    <span>📦 Estado: <strong>${pedido.estado}</strong></span>
                    <span>📅 Fecha: ${new Date(pedido.fecha).toLocaleDateString()}</span>
                </div>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error buscando historial:", error);
        contenedor.innerHTML = "<p class='historial-error'>Error al recuperar las transacciones.</p>";
    }
}

// Vinculación limpia de Event Listeners para la sección de usuarios
document.getElementById("btn-promover")?.addEventListener("click", () => cambiarRolUsuario("promover"));
document.getElementById("btn-degradar")?.addEventListener("click", () => cambiarRolUsuario("degradar"));
document.getElementById("btn-eliminar")?.addEventListener("click", eliminarUsuarioSistema);
document.getElementById("btn-buscar-historial")?.addEventListener("click", consultarHistorialCompras);

// ==========================================================================
// NUEVO ANEXO: MÓDULO INDEPENDIENTE HISTORIAL DE COMPRAS
// ==========================================================================
function inicializarHistorialCompras() {
    const btnBuscarHistorial = document.getElementById('btn-buscar-historial');
    const inputEmailHistorial = document.getElementById('buscar-historial-email');
    const contenedorHistorial = document.getElementById('resultados-historial-compras');

    if (!btnBuscarHistorial || !inputEmailHistorial || !contenedorHistorial) return;

    btnBuscarHistorial.addEventListener('click', async () => {
        const email = inputEmailHistorial.value.trim();
        if (!email) {
            mostrarToast("Por favor, ingrese un correo electrónico para buscar.", "error");
            return;
        }

        contenedorHistorial.innerHTML = '<p class="historial-vacio">🔍 Buscando transacciones...</p>';

        try {
            const respuesta = await fetch(`http://localhost:3000/api/usuarios/historial?email=${encodeURIComponent(email)}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (respuesta.status === 404) {
                contenedorHistorial.innerHTML = '<p class="historial-error">❌ El usuario no está registrado en el sistema.</p>';
                return;
            }

            const compras = await respuesta.json();

            if (!respuesta.ok) {
                contenedorHistorial.innerHTML = `<p class="historial-error">⚠️ ${compras.error || 'Error en la consulta.'}</p>`;
                return;
            }

            if (!compras || compras.length === 0) {
                contenedorHistorial.innerHTML = '<p class="historial-vacio">📦 El usuario no registra órdenes de compra.</p>';
                return;
            }

            contenedorHistorial.innerHTML = "";
            compras.forEach(compra => {
                const fechaFormateada = new Date(compra.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                // Crear los contenedores usando Vanilla JS estructurado
                const card = document.createElement('div');
                card.className = 'historial-item-card';

                const header = document.createElement('div');
                header.className = 'historial-item-header';

                const spanId = document.createElement('span');
                spanId.className = 'historial-id';
                spanId.textContent = `Orden #${compra.id}`;

                const spanMonto = document.createElement('span');
                spanMonto.className = 'historial-monto';
                spanMonto.textContent = `$${Number(compra.total).toLocaleString()}`;

                header.appendChild(spanId);
                header.appendChild(spanMonto);

                const detalles = document.createElement('div');
                detalles.className = 'historial-item-detalles';

                const spanFecha = document.createElement('span');
                spanFecha.textContent = `📅 ${fechaFormateada}`;

                const spanEstado = document.createElement('span');
                spanEstado.innerHTML = `📦 Estado: <strong>${compra.estado.toUpperCase()}</strong>`;

                detalles.appendChild(spanFecha);
                detalles.appendChild(spanEstado);

                card.appendChild(header);
                card.appendChild(detalles);

                contenedorHistorial.appendChild(card);
            });

        } catch (error) {
            console.error("Error buscando historial:", error);
            contenedorHistorial.innerHTML = '<p class="historial-error">⚠️ Conexión fallida con la API.</p>';
        }
    });
}

// Métricas y Gráficas (Mantiene tu lógica original idéntica)
let miGrafica = null;

async function cargarMetricas() {
    try {
        const respuesta = await fetch("http://localhost:3000/api/metricas", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await respuesta.json();

        if (respuesta.ok) {
            document.getElementById('met-productos').textContent = data.totalProductos;
            document.getElementById('met-usuarios').textContent = data.totalUsuarios;
            document.getElementById('met-ventas').textContent = `$${data.totalVentas.toLocaleString()}`;

            const ctx = document.getElementById('graficaMetricas')?.getContext('2d');
            if (!ctx) return;
            
            if (miGrafica) miGrafica.destroy();

            miGrafica = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Productos Activos', 'Usuarios Registrados', 'Ventas Procesadas'],
                    datasets: [{
                        label: 'Dashboard de Rendimiento',
                        data: [data.totalProductos, data.totalUsuarios, data.totalVentas / 100000],
                        backgroundColor: ['rgba(30, 60, 255, 0.75)', 'rgba(0, 180, 230, 0.75)', 'rgba(16, 185, 129, 0.75)'],
                        borderColor: ['#1E3CFF', '#00B4E6', '#10B981'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    } catch (error) {
        console.error("Error cargando métricas:", error);
    }
}

async function cargarPedidos() {

    try {

        const respuesta = await fetch(
            "http://localhost:3000/api/pedidos",
            {
                headers: {
                    Authorization: "Bearer " + token
                }
            }
        );

        const pedidos = await respuesta.json();

        const contenedor =
            document.getElementById("lista-pedidos-admin");

        contenedor.innerHTML = "";

        pedidos.forEach(pedido => {

            contenedor.innerHTML += `
                <div class="pedido-admin-card">

                    <h3>Pedido #${pedido.id}</h3>

                    <p>
                        Cliente:
                        ${pedido.nombre}
                    </p>

                    <p>
                        Correo:
                        ${pedido.email}
                    </p>

                    <p>
                        Total:
                        $${Number(pedido.total).toLocaleString()}
                    </p>

                    <p>
                        Estado:
                        <strong>${pedido.estado}</strong>
                    </p>

                    <select id="estado-${pedido.id}">
                        <option value="pendiente_pago">Pendiente de Pago</option>
                        <option value="pagado">Pagado</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>

                    <button
                        onclick="actualizarEstadoPedido(${pedido.id})">
                        Actualizar
                    </button>

                </div>
            `;

            document.getElementById(
                `estado-${pedido.id}`
            ).value = pedido.estado;

        });

    } catch (error) {

        console.error(error);

    }
}

async function actualizarEstadoPedido(id) {

    const nuevoEstado =
        document.getElementById(
            `estado-${id}`
        ).value;

    try {

        const respuesta = await fetch(
            `http://localhost:3000/api/pedidos/${id}/estado`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify({
                    nuevoEstado
                })
            }
        );

        const data = await respuesta.json();

        if (!respuesta.ok) {

            alert(data.error);

            return;
        }

        mostrarToast(
            data.mensaje
        );

        cargarPedidos();

    } catch (error) {

        console.error(error);

    }
}

// ==========================================================================
// INICIAR CARGA (DOM Ready con el nuevo llamado integrado al final)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    cargarCategoriasSelect();
    cargarProductos();
    cargarStock();
    cargarMetricas();
    cargarAlertas();

    cargarPedidos();
});