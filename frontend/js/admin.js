if (!window.token) {
    window.token = localStorage.getItem("token");
}
const accessToken = window.token;

// Utilidad global para mostrar notificaciones Toast
function mostrarToast(mensaje, tipo = "success") {
    if (typeof Toastify !== "undefined") {
        Toastify({
            text: mensaje,
            duration: 3500,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            className: tipo === "success" ? "toast-success" : "toast-error"
        }).showToast();
    } else {
        console.log(`[Toast] ${tipo}: ${mensaje}`);
    }
}

// Elementos del DOM del módulo de productos
const inputImagen = document.getElementById("imagen");
const preview = document.getElementById("preview");
const formProducto = document.getElementById("form-producto");
const uploadBox = document.getElementById("upload-box");

let productoEditando = null;
let productosCache = [];
let miGrafica = null;

// ==========================================================================
// GESTIÓN DE DRAG & DROP E IMÁGENES
// ==========================================================================
if (uploadBox && inputImagen) {
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
}

if (inputImagen) {
    inputImagen.addEventListener("change", function () {
        const archivo = this.files[0];
        if (archivo) mostrarPreview(archivo);
    });
}

function mostrarPreview(archivo) {
    if (!preview) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "block";
    };
    reader.readAsDataURL(archivo);
}

// ==========================================================================
// MÓDULO DE STOCK Y ALERTAS
// ==========================================================================
async function cargarAlertas() {
    try {
        const respuesta = await fetch("https://online-doggie-backend-production.up.railway.app/api/productos/stock-bajo", {
            headers: { "Authorization": "Bearer " + accessToken }
        });
        const productos = await respuesta.json();
        const contenedor = document.getElementById("lista-alertas");
        if (!contenedor) return;

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

async function cargarStock() {
    try {
        const respuesta = await fetch("https://online-doggie-backend-production.up.railway.app/api/productos");
        const productos = await respuesta.json();
        const contenedor = document.getElementById("lista-stock");

        // Protección crucial: si no existe el contenedor en el HTML, salimos sin romper el script
        if (!contenedor) return;

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
    } catch (error) {
        console.error("Error cargando stock:", error);
    }
}

async function actualizarStock(id) {
    const inputStock = document.getElementById(`stock-input-${id}`);
    if (!inputStock) return;

    const nuevoStock = inputStock.value;
    if (nuevoStock === "" || nuevoStock < 0) {
        Swal.fire('Cantidad incorrecta', "Ingresa un valor de stock válido", 'warning');
        return;
    }

    try {
        const respuesta = await fetch(`https://online-doggie-backend-production.up.railway.app/api/productos/${id}/stock`, {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer " + accessToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ stock: parseInt(nuevoStock) })
        });
        const data = await respuesta.json();

        if (respuesta.ok) {
            mostrarToast(data.mensaje || "Stock actualizado");
            cargarAlertas();
            cargarProductos();
        } else {
            Swal.fire('Error', data.error || "No se pudo actualizar el stock", 'error');
        }
    } catch (error) {
        console.error("Error actualizando stock:", error);
    }
}

// ==========================================================================
// MÓDULO DE PRODUCTOS (TABLA Y MANTENIMIENTO)
// ==========================================================================
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
        const imagenUrl = producto.imagen
            ? `https://online-doggie-backend-production.up.railway.app/uploads/${producto.imagen}`
            : 'https://online-doggie-backend-production.up.railway.app/uploads/ONLINE-DOGGIE ICO.ico';

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
    const inputNombre = document.getElementById("filtro-nombre");
    const inputCategoria = document.getElementById("filtro-categoria");

    const nombre = inputNombre ? inputNombre.value.trim().toLowerCase() : "";
    const categoria = inputCategoria ? inputCategoria.value : "";

    const filtrados = productosCache.filter(p => {
        const coincideNombre = p.nombre.toLowerCase().includes(nombre);
        const coincideCategoria = !categoria || Number(p.categoria_id) === Number(categoria);
        return coincideNombre && coincideCategoria;
    });

    renderTablaProductos(filtrados);
}

const filtroNombre = document.getElementById("filtro-nombre");
const filtroCategoria = document.getElementById("filtro-categoria");
if (filtroNombre) filtroNombre.addEventListener("input", aplicarFiltrosTabla);
if (filtroCategoria) filtroCategoria.addEventListener("change", aplicarFiltrosTabla);

if (formProducto) {
    formProducto.addEventListener("submit", async (e) => {
        e.preventDefault();

        const prefix = productoEditando ? "edit-" : "";

        const nombre = document.getElementById(prefix + "nombre").value.trim();
        const descripcion = document.getElementById(prefix + "descripcion").value.trim();
        const categoria = document.getElementById(prefix + "categoria").value;
        const precioRaw = document.getElementById(prefix + "precio").value;
        const stockRaw = document.getElementById(prefix + "stock").value;

        const precio = parseFloat(precioRaw.toString().replace(/[.,]/g, ""));
        const stock = parseInt(stockRaw.toString().replace(/[.,]/g, ""), 10);

        if (isNaN(precio) || isNaN(stock)) {
            Swal.fire('Datos inválidos', "El precio y el stock deben ser números válidos", 'warning');
            return;
        }

        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("descripcion", descripcion);
        formData.append("precio", precio);
        formData.append("categoria", categoria);
        formData.append("stock", stock);

        const imagenInput = document.getElementById(prefix + "imagen");
        if (imagenInput && imagenInput.files.length > 0) {
            formData.append("imagen", imagenInput.files[0]);
        }

        let url = "https://online-doggie-backend-production.up.railway.app/api/productos";
        let metodo = "POST";

        if (productoEditando) {
            url = `https://online-doggie-backend-production.up.railway.app/api/productos/${productoEditando}`;
            metodo = "PUT";
        }

        try {
            const respuesta = await fetch(url, {
                method: metodo,
                headers: { "Authorization": "Bearer " + accessToken },
                body: formData
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
                if (preview) {
                    preview.src = "";
                    preview.style.display = "none";
                }
                const btnSubmit = document.querySelector("#form-producto button");
                if (btnSubmit) btnSubmit.innerText = "Crear Producto";

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
}

function editarProducto(id) {
    const producto = productosCache.find(p => Number(p.id) === Number(id));
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

    const previewEdit = document.getElementById("edit-preview");
    if (previewEdit) {
        if (producto.imagen) {
            previewEdit.src = `https://online-doggie-backend-production.up.railway.app/uploads/${producto.imagen}`;
            previewEdit.style.display = "block";
        } else {
            previewEdit.src = "";
            previewEdit.style.display = "none";
        }
    }

    const editImagenInput = document.getElementById("edit-imagen");
    if (editImagenInput) editImagenInput.value = "";

    const modalEditar = document.getElementById("modal-editar");
    const overlayModal = document.getElementById("modal-editar-overlay");
    if (modalEditar) modalEditar.classList.add("activo");
    if (overlayModal) overlayModal.classList.add("activo");
}

function cerrarModalEditar() {
    const modalEditar = document.getElementById("modal-editar");
    const overlayModal = document.getElementById("modal-editar-overlay");
    if (modalEditar) modalEditar.classList.remove("activo");
    if (overlayModal) overlayModal.classList.remove("activo");
}

const btnCerrarModal = document.getElementById("cerrar-modal-editar");
const overlayModal = document.getElementById("modal-editar-overlay");
if (btnCerrarModal) btnCerrarModal.addEventListener("click", cerrarModalEditar);
if (overlayModal) overlayModal.addEventListener("click", cerrarModalEditar);

const formEditarProducto = document.getElementById("form-editar-producto");

if (formEditarProducto) {
    formEditarProducto.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("edit-nombre").value.trim();
        const descripcion = document.getElementById("edit-descripcion").value.trim();
        const categoria = document.getElementById("edit-categoria").value;


        const rawPrecio = document.getElementById("edit-precio").value;
        const precio = parseFloat(rawPrecio.toString().replace(/\./g, '').replace(',', '.'));

        const stock = parseInt(document.getElementById("edit-stock").value, 10);

        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("descripcion", descripcion);
        formData.append("precio", precio);
        formData.append("categoria", categoria);
        formData.append("stock", stock);


        const imagenInput = document.getElementById("edit-imagen");
        if (imagenInput && imagenInput.files.length > 0) {
            formData.append("imagen", imagenInput.files[0]);
        }

        try {
            const respuesta = await fetch(`https://online-doggie-backend-production.up.railway.app/api/productos/${productoEditando}`, {
                method: "PUT",
                headers: { "Authorization": "Bearer " + accessToken },
                body: formData
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                Swal.fire('¡Éxito!', 'Producto actualizado correctamente', 'success');
                cerrarModalEditar();
                cargarProductos();
                cargarMetricas();
            } else {
                throw new Error(data.error || "No se pudo actualizar");
            }
        } catch (error) {
            console.error("Error al editar:", error);
            Swal.fire('Error', error.message, 'error');
        }
    });
}

const editUploadBox = document.getElementById("edit-upload-box");
const editInputImagen = document.getElementById("edit-imagen");
const editPreview = document.getElementById("edit-preview");

if (editUploadBox && editInputImagen) {

    editUploadBox.addEventListener("click", () => {
        editInputImagen.click();
    });


    editInputImagen.addEventListener("change", function () {
        const archivo = this.files[0];
        if (archivo) {
            const reader = new FileReader();
            reader.onload = function (e) {
                editPreview.src = e.target.result;
                editPreview.style.display = "block"; n
            };
            reader.readAsDataURL(archivo);
        }
    });
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
                const respuesta = await fetch(`https://online-doggie-backend-production.up.railway.app/api/productos/${id}`, {
                    method: "DELETE",
                    headers: { "Authorization": "Bearer " + accessToken }
                });

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

async function cargarCategoriasSelect() {
    try {
        const respuesta = await fetch("https://online-doggie-backend-production.up.railway.app/api/categorias");
        const categorias = await respuesta.json();

        const select = document.getElementById("categoria");
        const selectEdit = document.getElementById("edit-categoria");
        const selectFiltro = document.getElementById("filtro-categoria");

        const opcionesHTML = `<option value="">Selecciona una categoría</option>` +
            categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join("");

        if (select) select.innerHTML = opcionesHTML;
        if (selectEdit) selectEdit.innerHTML = opcionesHTML;
        if (selectFiltro) {
            selectFiltro.innerHTML = `<option value="">Todas las categorías</option>` +
                categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join("");
        }
    } catch (error) {
        console.error("Error cargando categorías:", error);
    }
}

// ==========================================================================
// NAVEGACIÓN Y SIDEBAR (DRAWER)
// ==========================================================================
const fab = document.getElementById("admin-fab");
const drawer = document.getElementById("admin-drawer");
const overlay = document.getElementById("drawer-overlay");
const closeDrawerBtn = document.getElementById("close-drawer");
const menuItems = document.querySelectorAll(".menu-item");
const secciones = document.querySelectorAll(".vista-seccion");

if (fab && drawer && overlay) {
    fab.addEventListener("click", () => {
        drawer.classList.add("abierto");
        overlay.classList.add("activo");
    });
}

function cerrarMenu() {
    if (drawer) drawer.classList.remove("abierto");
    if (overlay) overlay.classList.remove("activo");
}

if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", cerrarMenu);
if (overlay) overlay.addEventListener("click", cerrarMenu);

menuItems.forEach(item => {
    item.addEventListener("click", function () {
        const objetivo = this.getAttribute("data-target");
        secciones.forEach(sec => sec.classList.remove("activa"));
        const seccionObjetivo = document.getElementById(objetivo);
        if (seccionObjetivo) seccionObjetivo.classList.add("activa");
        cerrarMenu();
    });
});

// ==========================================================================
// GESTIÓN DE USUARIOS Y ROLES (ADMINISTRACIÓN)
// ==========================================================================
async function cambiarRolUsuario(accion) {
    const email = document.getElementById("admin-email").value.trim();
    if (!email) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Ingrese un correo', showConfirmButton: false, timer: 3000 });
        return;
    }

    const ruta = accion === 'promover' ? '/api/admin/nuevo-admin' : '/api/admin/degradar';
    
    try {
        const respuesta = await fetch(`https://online-doggie-backend-production.up.railway.app${ruta}`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${accessToken}` 
            },
            body: JSON.stringify({ email })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            // Mensaje personalizado según la acción
            const tituloExito = accion === 'promover' 
                ? 'Usuario actualizado correctamente a admin' 
                : 'Usuario actualizado correctamente a usuario';

            // Usamos el formato Toast de SweetAlert2
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: tituloExito,
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
            
            const formAdmin = document.getElementById("form-nuevo-admin");
            if (formAdmin) formAdmin.reset();
            if (typeof cargarMetricas === 'function') cargarMetricas();
        } else {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: data.mensaje || "Error al actualizar rol",
                showConfirmButton: false,
                timer: 3000
            });
        }
    } catch (error) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Error de conexión', showConfirmButton: false, timer: 3000 });
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
                        "Authorization": "Bearer " + accessToken,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email: email })
                });
                const data = await respuesta.json();

                if (respuesta.ok) {
                    mostrarToast(data.mensaje || "Usuario eliminado correctamente");
                    const formAdmin = document.getElementById("form-nuevo-admin");
                    if (formAdmin) formAdmin.reset();
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

// Vinculación de Event Listeners para sección de usuarios
const btnPromover = document.getElementById("btn-promover");
const btnDegradar = document.getElementById("btn-degradar");
const btnEliminar = document.getElementById("btn-eliminar");

if (btnPromover) btnPromover.addEventListener("click", () => cambiarRolUsuario("promover"));
if (btnDegradar) btnDegradar.addEventListener("click", () => cambiarRolUsuario("degradar"));
if (btnEliminar) btnEliminar.addEventListener("click", eliminarUsuarioSistema);

// ==========================================================================
// MÓDULO OPTIMIZADO: HISTORIAL DE COMPRAS DE USUARIOS
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
                headers: { "Authorization": `Bearer ${accessToken}` }
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

// ==========================================================================
// DASHBOARD: MÉTRICAS Y GRÁFICOS (CHART.JS)
// ==========================================================================
async function cargarMetricas() {
    try {
        const respuesta = await fetch("https://online-doggie-backend-production.up.railway.app/api/admin/metricas", {
            headers: { "Authorization": `Bearer ${accessToken}` }
        });
        const data = await respuesta.json();

        if (respuesta.ok) {
            const metProductos = document.getElementById('met-productos');
            const metUsuarios = document.getElementById('met-usuarios');
            const metVentas = document.getElementById('met-ventas');

            if (metProductos) metProductos.textContent = data.totalProductos;
            if (metUsuarios) metUsuarios.textContent = data.totalUsuarios;
            if (metVentas) {
                metVentas.textContent = Number(data.totalVentas).toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0
                });
            }

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

// ==========================================================================
// MÓDULO DE PEDIDOS GENERALES (TABLA GLOBAL)
// ==========================================================================
async function cargarPedidos() {
    try {
        const respuesta = await fetch("https://online-doggie-backend-production.up.railway.app/api/pedidos", {
            headers: { Authorization: "Bearer " + accessToken }
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
                Authorization: "Bearer " + accessToken
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            Swal.fire('Error', data.error || "No se pudo actualizar el estado", 'error');
            return;
        }

        mostrarToast(data.mensaje || "Estado actualizado con éxito");
        cargarPedidos();
        cargarMetricas();
    } catch (error) {
        console.error("Error al actualizar estado:", error);
    }
}

// INICIALIZACIÓN (DOM READY)

document.addEventListener("DOMContentLoaded", () => {
   
    // 1. Cargas iniciales de datos
    cargarCategoriasSelect();
    cargarProductos();
    cargarMetricas();
    cargarAlertas();
    cargarPedidos();
    cargarStock();

    // 2. Módulos especializados
    inicializarHistorialCompras();

    // 3. Vinculación de botones mediante Delegación de Eventos
    // Esto funciona aunque el DOM cambie o las vistas se oculten/muestren
    document.addEventListener("click", (event) => {
        const target = event.target;

        if (target.id === "btn-promover") {
            cambiarRolUsuario("promover");
        } 
        else if (target.id === "btn-degradar") {
            cambiarRolUsuario("degradar");
        } 
        else if (target.id === "btn-eliminar") {
            // Asegúrate de tener definida la función eliminarUsuarioSistema()
            if (typeof eliminarUsuarioSistema === 'function') {
                eliminarUsuarioSistema();
            } else {
                console.error("La función eliminarUsuarioSistema no está definida.");
            }
        }
    });

    console.log("Admin Panel inicializado con delegación de eventos.");
});