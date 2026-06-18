const formRegistro = document.getElementById("form-registro");

if (formRegistro) {

    formRegistro.addEventListener("submit", async (e) => {

        e.preventDefault();

        const boton = e.target.querySelector('button[type="submit"]');

        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const direccion = document.getElementById("direccion").value.trim();

        if (!nombre || !email || !password || !direccion) {
            mostrarToast("Todos los campos son obligatorios", "error");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            mostrarToast("El formato del correo no es válido", "error");
            return;
        }

        if (password.length < 8) {
            mostrarToast("La contraseña debe tener mínimo 8 caracteres", "error");
            return;
        }

        try {

            if (boton) boton.disabled = true;

            const respuesta = await fetch(
                "https://online-doggie-backend-production.up.railway.app/api/auth/registro",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nombre,
                        email,
                        password,
                        direccion
                    })
                }
            );

            const data = await respuesta.json();

            if (respuesta.ok) {

                localStorage.setItem(
                    "emailVerificacion",
                    email
                );

                mostrarToast(data.mensaje);

                document.getElementById(
                    "seccion-registro"
                ).style.display = "none";

                document.getElementById(
                    "seccion-verificacion"
                ).style.display = "block";

            } else {

                mostrarToast(
                    data.mensaje || "Error en el registro",
                    "error"
                );

            }

        } catch (error) {

            console.error(error);

            mostrarToast(
                "Error registrando usuario: verifica que el servidor esté encendido.",
                "error"
            );

        } finally {

            if (boton) boton.disabled = false;

        }

    });

}


// VERIFICACIÓN DE CÓDIGO

const formVerificacion =
    document.getElementById("form-verificacion");

if (formVerificacion) {

    formVerificacion.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const boton =
                e.target.querySelector(
                    'button[type="submit"]'
                );

            const codigo =
                document.getElementById("codigo")
                    .value
                    .trim();

            if (!/^\d{6}$/.test(codigo)) {

                mostrarToast(
                    "El código debe contener exactamente 6 dígitos",
                    "error"
                );
                return;
            }

            const email =
                localStorage.getItem(
                    "emailVerificacion"
                );

            if (!email) {

                mostrarToast(
                    "No se encontró el correo para verificar. Regístrate nuevamente.",
                    "error"
                );

                return;
            }

            try {

                if (boton) boton.disabled = true;

                const respuesta = await fetch(
                    "https://online-doggie-backend-production.up.railway.app/api/auth/verificarCuenta",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email,
                            codigo
                        })
                    }
                );

                const data = await respuesta.json();

                if (respuesta.ok) {

                    localStorage.removeItem(
                        "emailVerificacion"
                    );

                    mostrarToast(
                        "✅ Cuenta verificada con éxito"
                    );

                    window.location.href =
                        "login.html";

                } else {

                    mostrarToast(
                        data.mensaje || "Código incorrecto o expirado",
                        "error"
                    );

                }

            } catch (error) {

                console.error(error);

                mostrarToast(
                    "Error al verificar la cuenta",
                    "error"
                );

            } finally {

                if (boton) boton.disabled = false;

            }

        }
    );

}