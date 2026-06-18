let tokenTemporal = null;

document.addEventListener("DOMContentLoaded", () => {

    const formLogin = document.getElementById("form-login");
    const formRecuperar = document.getElementById("form-recuperar");
    const form2FA = document.getElementById("form-2fa");

    const btnRecuperar = document.getElementById("btn-recuperar");
    const btnVolverLogin = document.getElementById("btn-volver-login");

    if (formLogin) {
        formLogin.addEventListener("submit", loginUsuario);
    }

    if (btnRecuperar) {
        btnRecuperar.addEventListener("click", mostrarRecuperar);
    }

    if (btnVolverLogin) {
        btnVolverLogin.addEventListener("click", volverLogin);
    }

    if (formRecuperar) {
        formRecuperar.addEventListener("submit", recuperarPassword);
    }

    if (form2FA) {
        form2FA.addEventListener("submit", verificar2FA);
    }

});

/* LOGIN */

async function loginUsuario(e) {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        mostrarToast("Completa todos los campos", "error");
        return;
    }

    try {

        const respuesta = await fetch(
            "https://online-doggie-backend-production.up.railway.app/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await respuesta.json();

        if (!respuesta.ok) {
            mostrarToast(
                data.mensaje || "Error al iniciar sesión",
                "error"
            );
            return;
        }

        /* Si tiene 2FA activo */
        if (data.requiere2FA) {

            tokenTemporal = data.tokenTemporal;

            document.getElementById("form-login").style.display = "none";
            document.getElementById("form-2fa").style.display = "block";

            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem(
            "usuario",
            JSON.stringify(data.usuario)
        );

        mostrarToast("Login exitoso 🚀");

        if (data.usuario.rol === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }

    } catch (error) {

        console.error("Error en login:", error);
        mostrarToast(
            "Error conectando con el servidor",
            "error"
        );

    }
}


/* ============================= */
/* RECUPERAR CONTRASEÑA          */
/* ============================= */

function mostrarRecuperar(e) {

    e.preventDefault();

    document.getElementById("form-login").style.display = "none";
    document.getElementById("form-recuperar").style.display = "block";

}

function volverLogin(e) {

    e.preventDefault();

    document.getElementById("form-recuperar").style.display = "none";
    document.getElementById("form-login").style.display = "block";

}

async function recuperarPassword(e) {

    e.preventDefault();

    const email = document
        .getElementById("email-recuperar")
        .value
        .trim();

    if (!email) {
        mostrarToast("Ingresa tu correo", "error");
        return;
    }

    try {

        const respuesta = await fetch(
            "https://online-doggie-backend-production.up.railway.app/api/auth/recuperar",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email
                })
            }
        );

        const data = await respuesta.json();

        mostrarToast(data.mensaje);

        if (respuesta.ok) {

            document.getElementById("form-recuperar").style.display = "none";
            document.getElementById("form-login").style.display = "block";

        }

    } catch (error) {

        console.error(
            "Error recuperando contraseña:",
            error
        );

        mostrarToast(
            "Error conectando con el servidor",
            "error"
        );

    }
}

/* VERIFICAR CÓDIGO 2FA */

async function verificar2FA(e) {

    e.preventDefault();

    const codigo = document
        .getElementById("codigo-2fa")
        .value
        .trim();

    if (!codigo) {
        mostrarToast("Ingresa el código de verificación", "error");
        return;
    }

    try {

        const respuesta = await fetch(
            "https://online-doggie-backend-production.up.railway.app/api/auth/verificar-2fa",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    codigo,
                    tokenTemporal
                })
            }
        );

        const data = await respuesta.json();

        if (!respuesta.ok) {
            mostrarToast(
                data.mensaje || "Código inválido",
                "error"
            );
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem(
            "usuario",
            JSON.stringify(data.usuario)
        );

        mostrarToast("Verificación exitosa 🚀");

        if (data.usuario.rol === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }

    } catch (error) {

        console.error(
            "Error verificando 2FA:",
            error
        );

        mostrarToast(
            "Error conectando con el servidor",
            "error"
        );

    }
}