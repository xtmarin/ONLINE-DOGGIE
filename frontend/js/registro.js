document.getElementById("form-registro").addEventListener("submit", async (e) => {

    e.preventDefault();

    const nombre   = document.getElementById("nombre").value.trim();
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    /* RF11 - Validaciones */
    if (!nombre || !email || !password) {
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

        const respuesta = await fetch("http://localhost:3000/api/auth/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, password })
        });

        const data = await respuesta.json();

        alert(data.mensaje);

        if (respuesta.ok) {
            window.location.href = "Login.html";
        }

    } catch (error) {
        console.error(error);
        alert("Error registrando usuario");
    }

});