const token = localStorage.getItem("token");

const loginBtn = document.querySelector(".btn-login");
const navbar = document.querySelector(".navbar ul");

async function cargarUsuario() {

    if (!token) return;

    try {

        const respuesta = await fetch("http://localhost:3000/api/auth/perfil", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!respuesta.ok) {
            localStorage.removeItem("token");
            return;
        }

        const usuario = await respuesta.json();

        /* quitar botón login */
        if (loginBtn) {
            loginBtn.remove();
        }

        /* mostrar nombre usuario */
        const liUsuario = document.createElement("li");
        liUsuario.innerHTML = `<a href="#">👤 ${usuario.nombre}</a>`;
        navbar.appendChild(liUsuario);

        /* si es admin mostrar panel */
        if (usuario.rol === "admin") {

            const liAdmin = document.createElement("li");
            liAdmin.innerHTML = `<a href="admin.html">Panel Admin</a>`;
            navbar.appendChild(liAdmin);

        }

        /* botón cerrar sesión */

        const liLogout = document.createElement("li");

        liLogout.innerHTML = `<a href="#" id="logout-btn">Cerrar sesión</a>`;

        navbar.appendChild(liLogout);

        document.getElementById("logout-btn").addEventListener("click", () => {

            localStorage.removeItem("token");
            window.location.href = "login.html";

        });

    } catch (error) {

        console.error("Error obteniendo usuario");

    }

}

cargarUsuario();