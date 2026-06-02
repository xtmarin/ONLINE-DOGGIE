const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}else{
    verificarSesion();
}

async function verificarSesion() {

    try {

        const respuesta = await fetch("http://localhost:3000/api/auth/perfil", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!respuesta.ok) {

            localStorage.removeItem("token");
            window.location.href = "login.html";

        }

    } catch (error) {

        localStorage.removeItem("token");
        console.error("Error verificando sesión");
        window.location.href = "login.html";

    }

}

verificarSesion();