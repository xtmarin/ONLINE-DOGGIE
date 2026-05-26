let emailUsuarioTemporal = "";

// REGISTRO DE USUARIO
document.getElementById("form-registro").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre    = document.getElementById("nombre").value.trim();
    const email     = document.getElementById("email").value.trim();
    const password  = document.getElementById("password").value.trim();
    const direccion = document.getElementById("direccion").value.trim();

    if (!nombre || !email || !password || !direccion) {
        alert("Todos los campos son obligatorios");
        return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
        alert("El formato del correo no es válido");
        return;
    }

    if (password.length < 8) {
        alert("La contraseña debe tener mínimo 8 caracteres");
        return;
    }

    try {
        const respuesta = await fetch("http://127.0.0.1:3000/api/auth/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, password, direccion })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            alert(data.mensaje);
            emailUsuarioTemporal = email; 

            document.getElementById("seccion-registro").style.display = "none";
            document.getElementById("seccion-verificacion").style.display = "block";
        } else {
            alert(data.mensaje || "Error en el registro");
        }

    } catch (error) {
        console.error(error);
        alert("Error registrando usuario");
    }
});

// VERIFICACIÓN DE CÓDIGO
document.getElementById("form-verificacion").addEventListener("submit", async (e) => {
    e.preventDefault();

    const codigo = document.getElementById("codigo").value.trim();

    if (!codigo || codigo.length !== 6) {
        alert("Por favor, introduce un código válido de 6 dígitos");
        return;
    }

    try {
        // CORRECCIÓN: Cambiado de 'verificar-cuenta' a 'verificarCuenta' para que coincida con tus rutas
        const respuesta = await fetch("http://127.0.0.1:3000/api/auth/verificarCuenta", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email: emailUsuarioTemporal, 
                codigo: codigo 
            })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            alert(data.mensaje);
            window.location.href = "login.html"; 
        } else {
            alert(data.mensaje || "Código incorrecto o expirado");
        }

    } catch (error) {
        console.error(error);
        alert("Error al verificar la cuenta");
    }
});