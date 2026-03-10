document.getElementById("form-registro").addEventListener("submit", async (e) => {

    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const respuesta = await fetch("http://localhost:3000/api/auth/registro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre,
                email,
                password
            })
        });

        const data = await respuesta.json();

        alert(data.mensaje);

        if (respuesta.ok) {
            window.location.href = "login.html";
        }

    } catch (error) {

        console.error(error);
        alert("Error registrando usuario");

    }

});