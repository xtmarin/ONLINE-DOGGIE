document.getElementById("form-login").addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const respuesta = await fetch("http://localhost:3000/api/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await respuesta.json();

        if (data.token) {

            // guardar token
            localStorage.setItem("token", data.token);

            alert("Login exitoso");

            window.location.href = "index.html";

        } else {

            alert(data.mensaje);

        }

    } catch (error) {

        console.error("Error en login:", error);

    }

});