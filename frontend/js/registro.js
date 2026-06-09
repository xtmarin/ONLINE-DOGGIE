// REGISTRO DE USUARIO

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
            alert("Todos los campos son obligatorios");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("El formato del correo no es válido");
            return;
        }

        if (password.length < 8) {
            alert("La contraseña debe tener mínimo 8 caracteres");
            return;
        }

        try {

            if (boton) boton.disabled = true;

            const respuesta = await fetch(
                "http://localhost:3000/api/auth/registro",
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

                alert(data.mensaje);

                document.getElementById(
                    "seccion-registro"
                ).style.display = "none";

                document.getElementById(
                    "seccion-verificacion"
                ).style.display = "block";

            } else {

                alert(
                    data.mensaje ||
                    "Error en el registro"
                );

            }

        } catch (error) {

            console.error(error);

            alert(
                "Error registrando usuario: verifica que el servidor esté encendido."
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

                alert(
                    "El código debe contener exactamente 6 dígitos"
                );

                return;
            }

            const email =
                localStorage.getItem(
                    "emailVerificacion"
                );

            if (!email) {

                alert(
                    "No se encontró el correo para verificar. Regístrate nuevamente."
                );

                return;
            }

            try {

                if (boton) boton.disabled = true;

                const respuesta = await fetch(
                    "http://localhost:3000/api/auth/verificarCuenta",
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

                    alert(
                        "✅ Cuenta verificada con éxito"
                    );

                    window.location.href =
                        "login.html";

                } else {

                    alert(
                        data.mensaje ||
                        "Código incorrecto o expirado"
                    );

                }

            } catch (error) {

                console.error(error);

                alert(
                    "Error al verificar la cuenta"
                );

            } finally {

                if (boton) boton.disabled = false;

            }

        }
    );

}