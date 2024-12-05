
const calendario = document.getElementById('calendarioConteiner');
const configuraciones = document.getElementById('configuraciones');
const reglamento = document.getElementById('reglamentoContainer');
const gastos = document.getElementById('containerGastos');
const calendarLink = document.getElementById('calendarLink');
const settingsLink = document.getElementById('settingsLink');
const reglamentoLink = document.getElementById('reglamentoLink');
const gastosLink = document.getElementById('gastosLink');
const sesionLink = document.getElementById('sesionLink');
const messageBox = document.getElementById('messageBox');
const datosInput = document.getElementById('datosConfig');
const passInput = document.getElementById('passConfig');

// Mostrar sección de calendario
calendarLink.addEventListener('click', (event) => {
    event.preventDefault();
    calendario.style.display = 'block';
    gastos.style.display = 'none';
    configuraciones.style.display = 'none';
    reglamento.style.display = 'none';
});

gastosLink.addEventListener('click', (event) => {
  event.preventDefault();
  agregarAnios();
  calendario.style.display = 'none';
  gastos.style.display = 'block';
  configuraciones.style.display = 'none';
  reglamento.style.display = 'none';
});

// Mostrar sección de configuración
settingsLink.addEventListener('click', (event) => {
    event.preventDefault();
    calendario.style.display = 'none';
    gastos.style.display = 'none';
    configuraciones.style.display = 'block';     
    reglamento.style.display = 'none';
});


reglamentoLink.addEventListener('click', (event) => {
  event.preventDefault();
  calendario.style.display = 'none';
  gastos.style.display = 'none';
  configuraciones.style.display = 'none';     
  reglamento.style.display = 'block';
});

sesionLink.addEventListener('click', () => cerrarSesion("Sesión cerrada correctamente"))

function datosUsuario(){
  const token = sessionStorage.getItem('token');
  const idUsuario = sessionStorage.getItem('id_usuario');
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
    validarSesion(response);
    return response.json()})
  .then(data => {
    const nombre = document.getElementById('usernameDisplay');
    const email = document.getElementById('emailDisplay');
    const telefono = document.getElementById('phoneDisplay');
    const dpto = document.getElementById('dptoDisplay');
    const dni = document.getElementById('dniDisplay');

    nombre.innerHTML =  `'${data.nombre}'`;
    email.innerHTML =  `'${data.email}'`;
    telefono.innerHTML =  `'${data.telefono}'`;
    dpto.innerHTML =  `'${data.departamento}'`;
    dni.innerHTML =  `'${data.dni}'`;
  })
}

function openEditar(dato){
  messageBox.style.display = 'block';
  sessionStorage.setItem('dato',dato);
  deshabilitarNavbar();
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
  const token = sessionStorage.getItem('token');
  const idUsuario = sessionStorage.getItem('id_usuario');
  const dato = sessionStorage.getItem('dato');
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
      mostrarVentanaEmergente(data.message);
      closeEditar();
      datosUsuario();
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
  datosInput.value = '';
  passInput.value = '';
  sessionStorage.removeItem('dato');
  habilitarNavbar();
}

function agregarAnios(){
  const yearSelect = document.getElementById("year-select");
  yearSelect.innerHTML = "";

  const token = sessionStorage.getItem('token');
  const idUsuario = sessionStorage.getItem('id_usuario');


  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token,
      'id': idUsuario
    }
    };
  
    fetch(`http://127.0.0.1:5000/rubro/years`, requestOptions)
    .then(response => {
      validarSesion(response);
      return response.json()})
    .then(data => {
      for (let i = 0; i < data.anios.length; i++) {
        const option = document.createElement("option");
        option.value = data.anios[i];
        option.text = data.anios[i];
        yearSelect.appendChild(option);
      }
    })
}

function generarTabla(){

  const token = sessionStorage.getItem('token');
  const idUsuario = sessionStorage.getItem('id_usuario');
  const month = document.getElementById("month-select").value;
  const year = document.getElementById("year-select").value;


  if (!month || !year) {
    mostrarVentanaEmergente("Por favor selecciona un mes y un año.");
    return;
  }

  fetch(`http://127.0.0.1:5000/rubro/${month}+${year}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token,
      'id': idUsuario,
    },
  })
  .then(response => {
    validarSesion(response);
    return response.json()}) 
  .then(data => {
    const tableContainer = document.getElementById("table-container");
    tableContainer.innerHTML = "";

    // Crear la tabla
    const table = document.createElement("table");
    table.border = "1";

    // Crear encabezado de la tabla
    const headerRow = document.createElement("tr");
    const headers = ["Rubros", "Comprobante", "Importe", "Detalle"];
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Crear filas de la tabla con los datos
    data.forEach(item => {
      const row = document.createElement("tr");

      // Rellenar las celdas, asegurando que "detalle" pueda ser vacío o nulo
      const rubrosCell = document.createElement("td");
      rubrosCell.textContent = item.nombre || "Sin datos"; // Manejar caso sin rubros
      row.appendChild(rubrosCell);

      const comprobanteCell = document.createElement("td");
      comprobanteCell.textContent = item.comprobante || "Sin datos"; // Manejar caso sin comprobante
      
      row.appendChild(comprobanteCell);

      const importeCell = document.createElement("td");
      importeCell.textContent = item.importe || "Sin datos"; // Manejar caso sin importe
      row.appendChild(importeCell);

      const detalleCell = document.createElement("td");
      detalleCell.textContent = item.descripcion ? item.descripcion : ""; // Si está vacío o nulo, no mostrar nada
      row.appendChild(detalleCell);

      table.appendChild(row);
  });

    // Añadir la tabla al contenedor
    tableContainer.appendChild(table);
    
    
    let total = 0;
    data.forEach(item => {
        total += parseFloat(item.importe) || 0;
    });

    const totalRow = document.createElement("tr");
    totalRow.id = "total-row";

    const totalLabelCell = document.createElement("td");
    totalLabelCell.colSpan = 2;
    totalLabelCell.textContent = "TOTAL 20 UF";
    totalLabelCell.style.fontWeight = "bold";
    totalLabelCell.style.textAlign = "right";

    const totalValueCell = document.createElement("td");
    totalValueCell.setAttribute("colspan", "2");
    totalValueCell.id = "total-importe";
    totalValueCell.textContent = total.toFixed(2);
    totalValueCell.style.fontWeight = "bold";

    totalRow.appendChild(totalLabelCell);
    totalRow.appendChild(totalValueCell);
    table.appendChild(totalRow);

    // Agregar la tabla al contenedor
    tableContainer.appendChild(table);

    // Crear la segunda tabla que muestra el total dividido por 20
    const tableDividida = document.createElement("tr");
    tableDividida.id = "cost-row";

    const divididoLabelCell = document.createElement("td");
    divididoLabelCell.colSpan = 2;
    divididoLabelCell.textContent = "COSTO POR UF";
    divididoLabelCell.style.fontWeight = "bold";
    divididoLabelCell.style.textAlign = "right";

    const totalDividido = total / 20;
    const divididoValueCell = document.createElement("td");
    divididoValueCell.setAttribute("colspan", "2");
    divididoValueCell.id = "total-dividido";
    divididoValueCell.textContent = totalDividido.toFixed(2);
    divididoValueCell.style.fontWeight = "bold";

    // Agregar las celdas a la fila
    tableDividida.appendChild(divididoLabelCell);
    tableDividida.appendChild(divididoValueCell);

    // Agregar la fila a la tabla
    table.appendChild(tableDividida);

    // Agregar la tabla completa al contenedor
    tableContainer.appendChild(table);
      
  })
  
}

function cerrarSesion(mensaje){
  sessionStorage.setItem('message', mensaje);
  window.location.href = "http://127.0.0.1:5000";
  return;
}

function validarSesion(response){
  if (response.status === 401 || response.status === 404) {
    // Expirar la sesión
    cerrarSesion("Sesión expirada");
  }
}

function deshabilitarNavbar(){
  navbar.disabled = true;
  navbar.style.pointerEvents = 'none';
  navbar.style.opacity = '0.5';
}

function habilitarNavbar(){
  navbar.disabled = false;
  navbar.style.pointerEvents = 'auto';
  navbar.style.opacity = '1';
}

datosUsuario();

//Botones para la edicion
document.getElementById('editUsername').addEventListener('click', () => openEditar("username"));
//document.getElementById('editEmail').addEventListener('click', () => openEditar("email"));
document.getElementById('editTelefono').addEventListener('click', () => openEditar("Telefono"));
document.getElementById('editPass').addEventListener('click', () => openEditar("password"));
document.getElementById('saveButtonConfig').addEventListener('click', editarUsuario);
document.getElementById('cancelButtonConfig').addEventListener('click', closeEditar);
document.getElementById("generate-table").addEventListener("click", generarTabla);