
const calendario = document.getElementById('calendarioConteiner');
const configuraciones = document.getElementById('configuraciones');
const adminConteiner = document.getElementById('adminConteiner');
const calendarLink = document.getElementById('calendarLink');
const settingsLink = document.getElementById('settingsLink');
const adminLink = document.getElementById('adminLink');
const sesionLink = document.getElementById('sesionLink');
const messageBox = document.getElementById('messageBox');
const categoriaBox = document.getElementById('messageBoxCategoria')
const datosInput = document.getElementById('datosConfig');
const passInput = document.getElementById('passConfig');
const inputCatNombre = document.getElementById('categoriaConfigNombre')
const inputCatPrecio = document.getElementById('categoriaConfigPrecio')

// Mostrar sección de calendario
calendarLink.addEventListener('click', (event) => {
    event.preventDefault();
    calendario.style.display = 'block';
    configuraciones.style.display = 'none';
    adminConteiner.style.display = 'none';    
});

// Mostrar sección de configuración
settingsLink.addEventListener('click', (event) => {
    event.preventDefault();
    calendario.style.display = 'none';
    configuraciones.style.display = 'block';
    adminConteiner.style.display = 'none';    
});

adminLink.addEventListener('click', (event) => {
  event.preventDefault();
  calendario.style.display = 'none';
  configuraciones.style.display = 'none';
  adminConteiner.style.display = 'block';
  mostrarCategorias()
})

sesionLink.addEventListener('click', () => cerrarSesion("Sesión cerrada correctamente"))

function mostarAdmin(){
  const admin = document.getElementById('adminLink');
  admin.style.display = 'block'
}

function datosUsuario(){
  const token = localStorage.getItem('token');
  const idUsuario = localStorage.getItem('id_usuario')
  const requestOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'x-access-token': token,
    'id': idUsuario
  }
  };

  fetch(`http://127.0.0.1:5000/usuario/${idUsuario}`, requestOptions)
  .then(response => {
    validarSesion(response)
    return response.json()})
  .then(data => {
    const nombre = document.getElementById('usernameDisplay');
    const email = document.getElementById('emailDisplay');
    const telefono = document.getElementById('phoneDisplay');

    nombre.innerHTML =  `'${data.nombre}'`
    email.innerHTML =  `'${data.email}'`
    telefono.innerHTML =  `'${data.telefono}'`

    if (data.super){
      mostarAdmin()
    }
  })
}

function openEditar(dato){
  messageBox.style.display = 'block';
  localStorage.setItem('dato',dato);
  deshabilitarNavbar()
  if (dato == "username"){
    datosInput.placeholder = "Ingrese su nuevo nombre de usuario"
  } else{
    if (dato == "email") {
      datosInput.placeholder = "Ingrese su nuevo correo electronico"
    } else {
      if (dato == "Telefono") {
        datosInput.placeholder = "Ingrese su nuevo numero telefonico"
      } else {
        datosInput.placeholder = "Ingrese su nueva contraseña"
      }
    }
  }
}

function editarUsuario(){
  const token = localStorage.getItem('token');
  const idUsuario = localStorage.getItem('id_usuario')
  const dato = localStorage.getItem('dato');
  if (datosInput.value && passInput.value){
    datosInput.classList.remove('error');
    passInput.classList.remove('error');
    const datos = {
      dato: dato,
      id: idUsuario,
      nuevo: datosInput.value,
      password: passInput.value
    };
    const requestOptions = {
      method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'x-access-token': token,
              'id': idUsuario
          },
          body: JSON.stringify(datos),
    };

    fetch(`http://127.0.0.1:5000/usuario`, requestOptions)
    .then(response => {
      validarSesion(response)
      if(!response.ok){
        return response.json().then(errorData => {
          throw new Error(`${errorData.message}`);
      });
      }
      return response.json()})
    .then(data => {
      mostrarVentanaEmergente(data.message)
      closeEditar()
      datosUsuario()
    })
    .catch(error => {
      mostrarVentanaEmergente(error)});
  } else{
    datosInput.classList.add('error');
    passInput.classList.add('error');
  }
}

function closeEditar(){
  messageBox.style.display = 'none';
  datosInput.value = ''
  passInput.value = ''
  localStorage.removeItem('dato');
  habilitarNavbar()
}

function mostrarCategorias(){
  const token = localStorage.getItem('token');
  const idUsuario = localStorage.getItem('id_usuario')
  const requestOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'x-access-token': token,
    'id': idUsuario
  }
  };

  fetch(`http://127.0.0.1:5000/categorias`, requestOptions)
  .then(response => {
    validarSesion(response)
    return response.json()})
  .then(data => {
    const horario1 = document.getElementById('horarioDisplay1');
    const horario2 = document.getElementById('horarioDisplay2');
    const precio1 = document.getElementById('precioDisplay1');
    const precio2 = document.getElementById('precioDisplay2');

    horario1.innerHTML =  `'${data[0].nombre}'`
    horario2.innerHTML =  `'${data[1].nombre}'`
    precio1.innerHTML =  `'${data[0].precio}'`
    precio2.innerHTML =  `'${data[1].precio}'`
  })
}

function openEditarCategoria(idCategoria){
  localStorage.setItem('idCategoria',idCategoria);
  categoriaBox.style.display = 'block';
  deshabilitarNavbar()
}

function cerrarEditarCategoria(){
  categoriaBox.style.display = 'none';
  localStorage.removeItem('idCategoria');
  inputCatNombre.value = ''
  inputCatPrecio.value = ''
  habilitarNavbar()
}

function editarCategoria(){
  const token = localStorage.getItem('token');
  const idUsuario = localStorage.getItem('id_usuario')
  const id = localStorage.getItem('idCategoria');
  if (inputCatNombre.value || inputCatPrecio.value){
    inputCatNombre.classList.remove('error');
    inputCatPrecio.classList.remove('error');
    const datos = {
      idCategoria: id,
      nombre: inputCatNombre.value,
      precio: inputCatPrecio.value
    };
    const requestOptions = {
      method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'x-access-token': token,
              'id': idUsuario
          },
          body: JSON.stringify(datos),
    };

    fetch(`http://127.0.0.1:5000/categorias`, requestOptions)
    .then(response => {
      validarSesion(response)
      return response.json()})
    .then(data => {
      cerrarEditarCategoria()
      mostrarCategorias()
    })
  } else{
    inputCatNombre.classList.add('error');
    inputCatPrecio.classList.add('error');
  }
}

function cerrarSesion(mensaje){
  localStorage.setItem('message', mensaje);
  window.location.href = "../login/login.html"
  return
}

function validarSesion(response){
  if (response.status === 401) {
    // Expirar la sesión
    cerrarSesion("Sesión expirada");
}
}

datosUsuario()

//Botones para la edicion
document.getElementById('editUsername').addEventListener('click', () => openEditar("username"));
//document.getElementById('editEmail').addEventListener('click', () => openEditar("email"));
document.getElementById('editTelefono').addEventListener('click', () => openEditar("Telefono"))
document.getElementById('editPass').addEventListener('click', () => openEditar("password"))
document.getElementById('saveButtonConfig').addEventListener('click', editarUsuario);
document.getElementById('cancelButtonConfig').addEventListener('click', closeEditar);
document.getElementById('editCategoria1').addEventListener('click', () => openEditarCategoria(1));
document.getElementById('editCategoria2').addEventListener('click', () => openEditarCategoria(2));
document.getElementById('saveButtonCategoriaConfig').addEventListener('click', editarCategoria);
document.getElementById('cancelButtonCategoriaConfig').addEventListener('click', cerrarEditarCategoria);