

const spinner = document.getElementById('loading-spinner');

window.onload = function(){
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('id_usuario');

    
}

if (sessionStorage.getItem('message') !== null) {
    const message = sessionStorage.getItem('message');
    mostrarVentanaEmergente(message);
    sessionStorage.removeItem('message');
}

function mostrarVentanaEmergente(message) {
    const emergente = document.getElementById('emergente');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerText = message;
    emergente.style.display = 'block';
}

async function iniciarSesion() {
    // Limpiar el sessionStorage antes de iniciar sesión
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('id_usuario');

    const username = document.getElementById('in-email').value;
    const password = document.getElementById('in-password').value;

    // Mostrar spinner de carga
    spinner.style.display = 'block';

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(username + ":" + password) // Codificar usuario y contraseña en Base64
        }
    };

    try {
        // Esperar que la respuesta del servidor llegue
        const res = await fetch('https://edificio325.com.ar/admin/login', requestOptions);
        spinner.style.display = 'none'; // Ocultar el spinner
        
        // Si la respuesta no es exitosa, lanzar un error
        if (!res.ok) {
            const errorResponse = await res.json();
            throw new Error(errorResponse.message);
        }

        // Parsear la respuesta a JSON
        const resp = await res.json();

        if (resp.token) {
            // Almacenar el token e id del usuario en el sessionStorage
            sessionStorage.setItem('token', resp.token);
            sessionStorage.setItem('id_usuario', resp.id);

            // Redirigir después de asegurarse de que se haya almacenado el token
            window.location.href = 'https://edificio325.com.ar/adminConfig';
        } else {
            // Mostrar mensaje de error si no se recibió un token
            mostrarVentanaEmergente(resp.message);
        }
    } catch (error) {
        // Manejar cualquier error que ocurra durante la petición
        spinner.style.display = 'none';
        mostrarVentanaEmergente(error.message || "Error al iniciar sesión. Inténtalo de nuevo.");
    }
}

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('emergente').style.display = 'none';
});