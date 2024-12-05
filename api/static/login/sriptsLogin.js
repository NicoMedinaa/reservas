//Ejecutando funciones
document.getElementById("btn__iniciar-sesion").addEventListener("click", iniciarSesionn);
// document.getElementById("entrar").addEventListener("click", iniciarSesion);
document.getElementById("btn__registrarse").addEventListener("click", register);
document.getElementById('saveButtonEmailConfig').addEventListener('click', mailPass);
document.getElementById('cancelButtonEmailConfig').addEventListener('click', cerrarOlvidarPass);

//Declarando variables
var formulario_login = document.querySelector(".formulario__login");
var formulario_register = document.querySelector(".formulario__register");
var contenedor_login_register = document.querySelector(".contenedor__login-register");
var caja_trasera_login = document.querySelector(".caja__trasera-login");
var caja_trasera_register = document.querySelector(".caja__trasera-register");
const emailPass = document.getElementById('emailConfig');
const spinner = document.getElementById('loading-spinner');
const emailBox = document.getElementById('messageBoxEmail');
    //FUNCIONES

// eliminar todos los datos que no nos importan del sessionStorage, para que
// no quede info guardada de otro Login o al volver atras o recargar la pagina.
window.onload = function(){
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('id_usuario');
    sessionStorage.removeItem('idCategoria');
    sessionStorage.removeItem('dato');
    
}
// Verificar y mostrar mensaje almacenado en sessionStorage
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

// Peticion para Iniciar sesion
async function iniciarSesion() {
    // Limpiar el sessionStorage antes de iniciar sesión
    sessionStorage.removeItem('token');
    //sessionStorage.removeItem('email');
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
        const res = await fetch('http://127.0.0.1:5000/login', requestOptions);
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
            
            sessionStorage.setItem('id_usuario', resp.id);
            sessionStorage.setItem('token', resp.token);

            // Redirigir después de asegurarse de que se haya almacenado el token
            setTimeout(() => {
                window.location.href = 'http://127.0.0.1:5000/calendar';
            }, 100);
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

// Peticion Cargar nuevo usuario
function nuevoUsuario(){
    const nombre = document.getElementById('reg-nombre').value;
    const telefono = document.getElementById('reg-telefono').value;
    const email = document.getElementById('reg-email').value;
    const departamento = document.getElementById('reg-departamento').value;
    const dni = document.getElementById('reg-dni').value;
    const password = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;
    if (password != password2){
        mostrarVentanaEmergente("La contraseña no coincide");
        return;
    }

    if (nombre && telefono && email && password && departamento && dni){
        spinner.style.display = 'block';
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(email + ":" + password), // Si es necesario
            },
            body: JSON.stringify({
                nombre: nombre,
                telefono: telefono,
                email: email,
                departamento: departamento,
                dni: dni,
                password: password
            })
        };

        fetch('http://127.0.0.1:5000/register', requestOptions)
        .then(res => {
            spinner.style.display = 'none';
            if (!res.ok){
                return res.json().then(errorData => {
                    throw new Error(`${errorData.message}`);
                });
            }
            return res.json();
        })
        .then(res => {
            mostrarVentanaEmergente(res.message);
        })
        .catch(error => {
            mostrarVentanaEmergente(error);
        });
    }
    else {
        mostrarVentanaEmergente("Por favor complete los campos");
    }
}

function olvidarPass(){
    emailBox.style.display = 'block';
}

function cerrarOlvidarPass(){
    emailBox.style.display = 'none';
    emailPass.value = '';
}

function mailPass(){
    if(emailPass.value){
        spinner.style.display = 'block';
        emailPass.classList.remove('error');
        const datos = {
            email: emailPass.value
        };

        const requestOptions = {
        method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(datos),
        };

        fetch('http://127.0.0.1:5000/recuperar', requestOptions)
        .then(response => {
            spinner.style.display = 'none';
            if (!response.ok){
                return response.json().then(errorData => {
                    throw new Error(`${errorData.message}`);
                });
            }
            return response.json()})
        .then(data => {
            mostrarVentanaEmergente(data.message);
        })
        .catch(error => {
            mostrarVentanaEmergente(error);
        })
    }
    else{
        emailPass.classList.add('error');
    }
}

function iniciarSesionn(){
    if (window.innerWidth > 850){
        formulario_login.style.display = "block";
        contenedor_login_register.style.left = "10px";
        formulario_register.style.display = "none";
        caja_trasera_register.style.opacity = "1";
        caja_trasera_login.style.opacity = "0";
    }else{
        formulario_login.style.display = "block";
        contenedor_login_register.style.left = "0px";
        formulario_register.style.display = "none";
        caja_trasera_register.style.display = "block";
        caja_trasera_login.style.display = "none";
    }
}

function register(){
    if (window.innerWidth > 850){
        formulario_register.style.display = "block";
        contenedor_login_register.style.left = "410px";
        formulario_login.style.display = "none";
        caja_trasera_register.style.opacity = "0";
        caja_trasera_login.style.opacity = "1";
    }else{
        formulario_register.style.display = "block";
        contenedor_login_register.style.left = "0px";
        formulario_login.style.display = "none";
        caja_trasera_register.style.display = "none";
        caja_trasera_login.style.display = "block";
        caja_trasera_login.style.opacity = "1";
    }
}

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('emergente').style.display = 'none';
  });