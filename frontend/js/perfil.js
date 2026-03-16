const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión");
    window.location.href = "login.html";
}

async function cargarPerfil() {

    try {

        const respuesta = await fetch("http://localhost:3000/api/auth/perfil", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (!respuesta.ok) {

            console.error("Error en la respuesta:", respuesta.status);

            alert("Tu sesión expiró, inicia sesión nuevamente");

            localStorage.removeItem("token");

            window.location.href = "login.html";

            return;

        }

        const usuario = await respuesta.json();

        console.log("Usuario recibido:", usuario);

        document.getElementById("perfil-nombre").textContent = usuario.nombre;
        document.getElementById("perfil-email").textContent = usuario.email;
        document.getElementById("perfil-rol").textContent = usuario.rol;

    } catch (error) {

        console.error("Error cargando perfil:", error);

    }

}

document.getElementById("logout-btn").addEventListener("click", () => {

    localStorage.removeItem("token");

    window.location.href = "login.html";

});

cargarPerfil();