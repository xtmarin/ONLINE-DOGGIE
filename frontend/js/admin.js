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
        const respuesta = await fetch("https://online-doggie-backend-production.up.railway.app/api/productos/stock-bajo", {
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
        const respuesta = await fetch("https://online-doggie-backend-production.up.railway.app/api/productos");
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
    if (nuevoStock === "" || nuevoStock < 0) { 
        Swal.fire('Cantidad incorrecta', "Ingresa un valor de stock válido", 'warning'); 
        return; 
    }
    
    const respuesta = await fetch(`https://online-doggie-backend-production.up.railway.app/api/productos/${id}/stock`, {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ stock: parseInt(nuevoStock) })
    });
    const data = await respuesta.json();
    
    if(respuesta.ok) {
        mostrarToast(data.mensaje || "Stock actualizado"); 
        cargarAlertas(); 
        cargarProductos();
    } else {
        Swal.fire('Error', data.error || "No se pudo actualizar el stock", 'error');
    }
}

/* ... Cargar Productos  ... */
async function cargarProductos() {
    try {
        const respuesta = await fetch("https://online-doggie-backend-production.up.railway.app/api/productos");
        const productos = await respuesta.json();
        productosCache = productos;

        renderTablaProductos(productosCache);
    } catch (error) {
        console.error("Error cargando productos en tabla:", error);
    }
}

function renderTablaProductos(productos) {
    const tbody = document.getElementById("tabla-productos-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    productos.forEach(producto => {
        const imagenUrl = producto.imagen ? `https://online-doggie-backend-production.up.railway.app/uploads/${producto.imagen}` : 'https://online-doggie-backend-production.up.railway.app/uploads/ONLINE-DOGGIE ICO.ico';

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
                        <button onclick="editarProducto(${producto.id})" class="btn-tabla-editar" title="Editar">✏️</button>
                        <button onclick="eliminarProducto(${producto.id})" class="btn-tabla-eliminar" title="Eliminar">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function aplicarFiltrosTabla() {
    const nombre = document.getElementById("filtro-nombre").value.trim().toLowerCase();
    const categoria = document.getElementById("filtro-categoria").value;

    const filtrados = productosCache.filter(p => {
        const coincideNombre = p.nombre.toLowerCase().includes(nombre);
        const coincideCategoria = !categoria || Number(p.categoria_id) === Number(categoria);
        return coincideNombre && coincideCategoria;
    });

    renderTablaProductos(filtrados);
}

document.getElementById("filtro-nombre").addEventListener("input", aplicarFiltrosTabla);
document.getElementById("filtro-categoria").addEventListener("change", aplicarFiltrosTabla);

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


    if (isNaN(precio) || isNaN(stock)) {
        Swal.fire('Datos inválidos', "El precio y el stock deben ser números válidos", 'warning');
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

    let url = "https://online-doggie-backend-production.up.railway.app/api/productos";
    let metodo = "POST";

    if (productoEditando) {
        url = `https://online-doggie-backend-production.up.railway.app/api/productos/${productoEditando}`;
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
            
            Swal.fire({
                title: '¡Operación Exitosa!',
                text: data.mensaje,
                icon: 'success',
                timer: 2000, 
                showConfirmButton: false
            });

            productoEditando = null;
            formProducto.reset();
            preview.src = "";
            preview.style.display = "none";
            document.querySelector("#form-producto button").innerText = "Crear Producto";

            cargarProductos();
            cargarAlertas();
            cargarMetricas();
        } else {
            Swal.fire('Error', data.error || "No se pudo procesar la solicitud", 'error');
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

    document.getElementById("edit-nombre").value = producto.nombre;
    document.getElementById("edit-descripcion").value = producto.descripcion;
    document.getElementById("edit-precio").value = producto.precio;
    document.getElementById("edit-categoria").value = producto.categoria_id;
    document.getElementById("edit-stock").value = producto.stock;

    const preview = document.getElementById("edit-preview");

    if (producto.imagen) {

        preview.src = `https://online-doggie-backend-production.up.railway.app/uploads/${producto.imagen}`;

        preview.style.display = "block";
    } else {

        preview.src = "";
        preview.style.display = "none";
    }


    document.getElementById("edit-imagen").value = "";


    document.getElementById("modal-editar").classList.add("activo");
    document.getElementById("modal-editar-overlay").classList.add("activo");
}

const btnCerrarModal = document.getElementById("cerrar-modal-editar");
const overlayModal = document.getElementById("modal-editar-overlay");

function cerrarModalEditar() {
    document.getElementById("modal-editar").classList.remove("activo");
    document.getElementById("modal-editar-overlay").classList.remove("activo");
}

if (btnCerrarModal) {
    btnCerrarModal.addEventListener("click", cerrarModalEditar);
}


if (overlayModal) {
    overlayModal.addEventListener("click", cerrarModalEditar);
}

async function eliminarProducto(id) {

    Swal.fire({
        title: '¿Estás seguro de eliminar este producto?',
        text: "¡Esta acción no se puede deshacer en Online Doggie!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e53e3e',
        cancelButtonColor: '#718096',
        confirmButtonText: 'Sí, eliminar permanentemente',
        cancelButtonText: 'Cancelar',
        backdrop: `rgba(0, 0, 0, 0.4)`
    }).then(async (result) => {

        if (result.isConfirmed) {
            try {
                const respuesta = await fetch(
                    `https://online-doggie-backend-production.up.railway.app/api/productos/${id}`,
                    {
                        method: "DELETE",
                        headers: {
                            "Authorization": "Bearer " + token
                        }
                    }
                );

                const data = await respuesta.json();

                if (!respuesta.ok) {
                    Swal.fire('Error', data.error || "No se pudo eliminar el producto", 'error');
                    return;
                }


                mostrarToast(data.mensaje || "Producto eliminado correctamente");

                cargarProductos();
                cargarAlertas();
                cargarMetricas();

            } catch (error) {
                console.error("Error eliminando producto:", error);
                Swal.fire('Error de conexión', "No se pudo conectar con el servidor", 'error');
            }
        }
    });
}

// =============================
// CARGAR CATEGORÍAS
// =============================

async function cargarCategoriasSelect() {

    try {

        const respuesta = await fetch("https://online-doggie-backend-production.up.railway.app/api/categorias");

        const categorias = await respuesta.json();

        const select = document.getElementById("categoria");
        const selectEdit = document.getElementById("edit-categoria");
        const selectFiltro = document.getElementById("filtro-categoria");

        const opcionesHTML = `<option value="">Selecciona una categoría</option>` +
            categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join("");

        select.innerHTML = opcionesHTML;
        selectEdit.innerHTML = opcionesHTML;

        if (selectFiltro) {
            selectFiltro.innerHTML = `<option value="">Todas las categorías</option>` +
                categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join("");
        }

    } catch (error) {

        console.error("Error cargando categorías:", error);

    }

}



// Iniciar carga
cargarAlertas();
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
    item.addEventListener("click", function () {
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
        ? "https://online-doggie-backend-production.up.railway.app/api/admin/promover"
        : "https://online-doggie-backend-production.up.railway.app/api/admin/degradar";

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

    Swal.fire({
        title: '¿Confirmas la eliminación?',
        text: `¿Está seguro de eliminar permanentemente al usuario ${email}? perderá todo acceso.`,
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar usuario',
        cancelButtonText: 'Conservar usuario'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const respuesta = await fetch(`https://online-doggie-backend-production.up.railway.app/api/admin/usuarios-eliminar`, {
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
                    Swal.fire('Atención', data.error || "No se pudo eliminar al usuario", 'warning');
                }
            } catch (error) {
                console.error("Error eliminando usuario:", error);
                mostrarToast("Error de comunicación con el servidor", "error");
            }
        }
    });
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

        const respuesta = await fetch(`https://online-doggie-backend-production.up.railway.app/api/admin/pedidos?email=${email}`, {
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
// NUEVO ANEXO: MÓDULO INDEPENDIENTE HISTORIAL DE COMPRAS (CORREGIDO)
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

            const respuesta = await fetch(`https://online-doggie-backend-production.up.railway.app/api/pedidos?email=${encodeURIComponent(email)}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const datos = await respuesta.json();


            if (!respuesta.ok) {
                contenedorHistorial.innerHTML = `<p class="historial-error">❌ ${datos.error || 'Error en la consulta.'}</p>`;
                return;
            }

            if (datos.length === 0) {
                contenedorHistorial.innerHTML = '<p class="historial-vacio">📦 El usuario no registra órdenes de compra.</p>';
                return;
            }

            contenedorHistorial.innerHTML = "";

            datos.forEach(compra => {

                const fechaFormateada = new Date(compra.fecha).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });


                const card = document.createElement('div');
                card.className = 'historial-item-card';

                const header = document.createElement('div');
                header.className = 'historial-item-header';

                const spanId = document.createElement('span');
                spanId.className = 'historial-id';
                spanId.textContent = `Orden #${compra.id}`;

                const spanMonto = document.createElement('span');
                spanMonto.className = 'historial-monto';
                spanMonto.textContent = `$${Number(compra.total).toLocaleString('es-CO')}`;

                header.appendChild(spanId);
                header.appendChild(spanMonto);

                const detalles = document.createElement('div');
                detalles.className = 'historial-item-detalles';

                const spanFecha = document.createElement('span');
                spanFecha.textContent = `📅 ${fechaFormateada}`;

                const spanEstado = document.createElement('span');
                spanEstado.innerHTML = `📦 Estado: <strong class="badge-${compra.estado}">${compra.estado.toUpperCase()}</strong>`;

                detalles.appendChild(spanFecha);
                detalles.appendChild(spanEstado);


                if (compra.productos && compra.productos.length > 0) {
                    const divProductos = document.createElement('div');
                    divProductos.className = 'historial-item-productos';
                    divProductos.style.marginTop = '8px';
                    divProductos.style.fontSize = '0.85rem';
                    divProductos.style.color = '#555';

                    let textoProductos = "<strong>Artículos:</strong> ";
                    textoProductos += compra.productos.map(p => `${p.nombre} (x${p.cantidad})`).join(', ');
                    divProductos.innerHTML = textoProductos;

                    detalles.appendChild(divProductos);
                }

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
        const respuesta = await fetch("https://online-doggie-backend-production.up.railway.app/api/admin/metricas", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await respuesta.json();

        if (respuesta.ok) {
            document.getElementById('met-productos').textContent = data.totalProductos;
            document.getElementById('met-usuarios').textContent = data.totalUsuarios;
            document.getElementById('met-ventas').textContent =
                Number(data.totalVentas).toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0
                });

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
        const respuesta = await fetch("https://online-doggie-backend-production.up.railway.app/api/pedidos", {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const datosOriginales = await respuesta.json();
        const contenedor = document.getElementById("lista-pedidos-admin");
        if (!contenedor) return;

        if (datosOriginales.length === 0) {
            contenedor.innerHTML = `<p style="padding: 20px; color: #718096; text-align: center;">No hay pedidos registrados.</p>`;
            return;
        }

        const pedidosAgrupados = Object.values(datosOriginales.reduce((acumulador, item) => {
            if (!acumulador[item.id]) {
                acumulador[item.id] = {
                    id: item.id,
                    nombre: item.nombre,
                    email: item.email,
                    total: item.total,
                    estado: item.estado,
                    productos: []
                };
            }
            if (item.producto_nombre || item.producto) {
                const nombreProd = item.producto_nombre || item.producto;
                const cantProd = item.cantidad || 1;
                acumulador[item.id].productos.push(`${nombreProd} (x${cantProd})`);
            } else if (item.productos && Array.isArray(item.productos)) {
                acumulador[item.id].productos = item.productos.map(p => `${p.nombre || p.producto_nombre} (x${p.cantidad || 1})`);
            }
            return acumulador;
        }, {}));

        let html = `
            <div class="tabla-pedidos-wrapper">
                <table class="tabla-pedidos">
                    <thead>
                        <tr>
                            <th>N° Pedido</th>
                            <th>Cliente / Contacto</th>
                            <th>Productos</th>
                            <th>Total</th>
                            <th>Estado Actual</th>
                            <th>Gestión</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        pedidosAgrupados.forEach(pedido => {
            const estadoActual = pedido.estado.toLowerCase();
            const esPendiente = estadoActual === 'pendiente' || estadoActual === 'pendiente_pago';

            const listaProductos = pedido.productos.length > 0
                ? `<ul class="lista-productos-tabla">${pedido.productos.map(p => `<li>${p}</li>`).join('')}</ul>`
                : `<span style="color: #a0aec0; font-style: italic;">Sin detalles</span>`;

            html += `
                <tr>
                    <td><strong>#${pedido.id}</strong></td>
                    <td>
                        <div class="cliente-info">
                            <span class="nombre">${pedido.nombre}</span>
                            <span class="correo">${pedido.email}</span>
                        </div>
                    </td>
                    <td>${listaProductos}</td>
                    <td><span class="precio">$${Number(pedido.total).toLocaleString('es-CO')}</span></td>
                    <td>
                        <span class="badge-estado estado-${estadoActual}">
                            ${pedido.estado.replace('_', ' ').toUpperCase()}
                        </span>
                    </td>
                    <td>
                        <div class="acciones-celda">
                            <select id="estado-${pedido.id}" class="select-tabla estado-${estadoActual}">
                                <option value="pendiente_pago" ${esPendiente ? 'selected' : ''}>⏳ Pendiente de Pago</option>
                                <option value="pagado" ${estadoActual === 'pagado' ? 'selected' : ''}>💳 Pagado</option>
                                <option value="enviado" ${estadoActual === 'enviado' ? 'selected' : ''}>🚚 Enviado</option>
                                <option value="entregado" ${estadoActual === 'entregado' ? 'selected' : ''}>✅ Entregado</option>
                                <option value="cancelado" ${estadoActual === 'cancelado' ? 'selected' : ''}>❌ Cancelado</option>
                            </select>
                            
                            <button class="btn-actualizar-tabla" onclick="actualizarEstadoPedido(${pedido.id})">
                                Actualizar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        contenedor.innerHTML = html;

    } catch (error) {
        console.error("Error al cargar pedidos:", error);
    }
}

async function actualizarEstadoPedido(id) {
    const selector = document.getElementById(`estado-${id}`);
    if (!selector) return;

    const nuevoEstado = selector.value;

    try {
        const respuesta = await fetch(`https://online-doggie-backend-production.up.railway.app/api/pedidos/${id}/estado`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                estado: nuevoEstado
            })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            alert(data.error || "No se pudo actualizar");
            return;
        }

        mostrarToast(data.mensaje || "Estado actualizado con éxito");
        cargarPedidos();

    } catch (error) {
        console.error("Error al actualizar estado:", error);
    }
}

async function actualizarEstadoPedido(id) {
    const selector = document.getElementById(`estado-${id}`);
    if (!selector) return;

    const nuevoEstado = selector.value;

    try {
        const respuesta = await fetch(`https://online-doggie-backend-production.up.railway.app/api/pedidos/${id}/estado`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token // Asegúrate de tener tu token aquí
            },
            body: JSON.stringify({
                estado: nuevoEstado
            })
        });

        const data = await respuesta.json();


        if (!respuesta.ok) {
            alert(data.error || "No se pudo actualizar el estado");
            return;
        }

        alert(data.mensaje || "Estado actualizado con éxito");
        cargarPedidos(); // Recarga la lista agrupada automáticamente

    } catch (error) {
        console.error("Error al actualizar estado:", error);
    }
}



// ==========================================================================
// INICIAR CARGA (DOM Ready con el nuevo llamado integrado al final)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    cargarCategoriasSelect();
    cargarProductos();
    cargarMetricas();
    cargarAlertas();

    cargarPedidos();
});