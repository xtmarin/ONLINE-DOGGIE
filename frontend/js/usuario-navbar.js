document.addEventListener("DOMContentLoaded", () => {
    cargarUsuario();
});


/* RENDERS Y PETICIONES PRINCIPALES */
async function cargarUsuario() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const navbar = document.querySelector(".navbar ul");
    const loginBtn = document.querySelector(".btn-login");
    if (!navbar) return;

    try {
        const respuesta = await fetch("https://online-doggie-backend-production.up.railway.app/api/auth/perfil", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        
        if (!respuesta.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            return;
        }

        const usuario = await respuesta.json();

        
        if (loginBtn) loginBtn.remove();

       
        document.querySelectorAll(".usuario-navbar-item").forEach(el => el.remove());

        
        const liUsuario = document.createElement("li");
        liUsuario.classList.add("usuario-navbar-item");
        liUsuario.innerHTML = `
            <a href="perfil.html">
                👤 ${usuario.nombre}
            </a>
        `;
        navbar.appendChild(liUsuario);

       
        if (usuario.rol === "admin") {
            const liAdmin = document.createElement("li");
            liAdmin.classList.add("usuario-navbar-item");
            liAdmin.innerHTML = `<a href="admin.html">Panel Admin</a>`;
            navbar.appendChild(liAdmin);
        }

       
        const liLogout = document.createElement("li");
        liLogout.classList.add("usuario-navbar-item");
        liLogout.innerHTML = `<a href="#" id="logout-btn">Cerrar sesión</a>`;
        navbar.appendChild(liLogout);

       
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", ejecutarLogout);
        }

    } catch (error) {
        console.error("Error obteniendo datos del usuario:", error);
    }
}


/* ACCIONES DE USUARIO */
function ejecutarLogout(e) {
    e.preventDefault();

   
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    
    if (typeof mostrarToast === "function") {
        mostrarToast("Sesión cerrada correctamente. ¡Vuelve pronto! 🐾", "success");
    }

   
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1000);
}