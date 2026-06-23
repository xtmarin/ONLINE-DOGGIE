document.addEventListener("DOMContentLoaded", () => {
    const formRegistro = document.getElementById("form-registro");
    if (formRegistro) {
        formRegistro.addEventListener("submit", registrarUsuario);
    }

    const formVerificacion = document.getElementById("form-verificacion");
    if (formVerificacion) {
        formVerificacion.addEventListener("submit", verificarCuenta);
    }
});

async function registrarUsuario(e) {
    e.preventDefault();

    const boton = e.target.querySelector('button[type="submit"]');
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const direccion = document.getElementById("direccion").value.trim();

    // Validaciones de formulario
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

        const respuesta = await fetch("https://online-doggie-backend-production.up.railway.app/api/auth/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, password, direccion })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            
            Swal.fire('Error', data.mensaje || "No se pudo completar el registro", 'error');
            return;
        }

        
        localStorage.setItem("emailVerificacion", email);
        Swal.fire('¡Casi listo!', 'Registro exitoso. Revisa tu correo para el código de verificación.', 'success');

        document.getElementById("seccion-registro").style.display = "none";
        document.getElementById("seccion-verificacion").style.display = "block";

    } catch (error) {
        console.error("Error en registro:", error);
        Swal.fire('Error', "No se pudo conectar con el servidor.", 'error');
    } finally {
        if (boton) boton.disabled = false;
    }
}


async function verificarCuenta(e) {
    e.preventDefault();

   const boton = e.target.querySelector('button[type="submit"]');
    const codigo = document.getElementById("codigo").value.trim();
    const email = localStorage.getItem("emailVerificacion");

    if (!email) {
        Swal.fire('Error', "Sesión expirada. Por favor regístrate de nuevo.", 'error');
        window.location.reload();
        return;
    }

    try {
        if (boton) boton.disabled = true;
        const respuesta = await fetch("https://online-doggie-backend-production.up.railway.app/api/auth/verificarCuenta", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, codigo })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            Swal.fire('Error', data.mensaje || "Código incorrecto", 'error');
            return;
        }

        localStorage.removeItem("emailVerificacion");
        Swal.fire('¡Éxito!', 'Cuenta verificada correctamente', 'success');
        
        setTimeout(() => { window.location.href = "login.html"; }, 1500);

    } catch (error) {
        Swal.fire('Error', "Error al procesar la verificación", 'error');
    } finally {
        if (boton) boton.disabled = false;
    }
}