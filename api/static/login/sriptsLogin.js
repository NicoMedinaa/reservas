//Ejecutando funciones
document.getElementById("btn__iniciar-sesion").addEventListener("click", iniciarSesionn);
// document.getElementById("entrar").addEventListener("click", iniciarSesion);
document.getElementById("btn__registrarse").addEventListener("click", register);
window.addEventListener("resize", anchoPage);

//Declarando variables
var formulario_login = document.querySelector(".formulario__login");
var formulario_register = document.querySelector(".formulario__register");
var contenedor_login_register = document.querySelector(".contenedor__login-register");
var caja_trasera_login = document.querySelector(".caja__trasera-login");
var caja_trasera_register = document.querySelector(".caja__trasera-register");
const spinner = document.getElementById('loading-spinner');
    //FUNCIONES

// eliminar todos los datos que no nos importan del localStorage, para que
// no quede info guardada de otro Login o al volver atras o recargar la pagina.
window.onload = function(){
    localStorage.removeItem('token');
    localStorage.removeItem('id_usuario');
    localStorage.removeItem('idCategoria');
    localStorage.removeItem('dato');
    
}
// Verificar y mostrar mensaje almacenado en localStorage
if (localStorage.getItem('message') !== null) {
    const message = localStorage.getItem('message');
    mostrarVentanaEmergente(message);
    localStorage.removeItem('message');
}

function mostrarVentanaEmergente(message) {
    const emergente = document.getElementById('emergente');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerText = message;
    emergente.style.display = 'block';
  }

// Peticion para Iniciar sesion
function iniciarSesion(){
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('id_usuario');
    const username = document.getElementById('in-email').value;
    const password = document.getElementById('in-password').value;

    spinner.style.display = 'block';
    const requestOptions = {
        method : 'POST',
        headers:{
            'Content-Type' : 'aplication/json',
            'Authorization' : 'Basic ' + btoa(username + ":" + password),// btoa se encarga de codificar el usuario y la contra
            // ojos con los espacios en autorization
        }
    
    }
    fetch('Edificio325.com.ar/login',requestOptions)
    .then(// res recoge la respuesta
        res => {
            spinner.style.display = 'none';
            return res.json()
        }
    )
    .then(
        resp => {
            if (resp.token){// si en la respuesta existe el token
                            // si es verdad redirigimos al tablero del usuario
                localStorage.setItem('token',resp.token);
                localStorage.setItem('id_usuario',resp.id);
                
                window.location.href = 'Edificio325.com.ar/calendar'
            }else{
                mostrarVentanaEmergente(resp.message)
            }

        }
    )
}
// Peticion Cargar nuevo usuario
function nuevoUsuario(){
    const nombre = document.getElementById('reg-nombre').value;
    const telefono = document.getElementById('reg-telefono').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;
    if (password != password2){
        mostrarVentanaEmergente("La contraseña no coincide")
        return
    }

    if (nombre && telefono && email && password){
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
                password: password
            })
        };

        fetch('Edificio325.com.ar/register', requestOptions)
        .then(res => {
            spinner.style.display = 'none';
            console.log(res)
            if (!res.ok){
                return res.json().then(errorData => {
                    console.log(errorData)
                    throw new Error(`${errorData.message}`);
                });
            }
            return res.json()
        })
        .then(res => {
            mostrarVentanaEmergente(res.message)
        })
        .catch(error => {
            mostrarVentanaEmergente(error)
        });
    }
    else {
        mostrarVentanaEmergente("Por favor complete los campos")
    }
}

function anchoPage(){

    if (window.innerWidth > 620){
        caja_trasera_register.style.display = "block";
        caja_trasera_login.style.display = "block";
    }else{
        caja_trasera_register.style.display = "block";
        caja_trasera_register.style.opacity = "1";
        caja_trasera_login.style.display = "none";
        formulario_login.style.display = "block";
        contenedor_login_register.style.left = "0px";
        formulario_register.style.display = "none";   
    }
}

anchoPage();

function iniciarSesionn(){
    if (window.innerWidth > 620){
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
    if (window.innerWidth > 620){
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