//Links de la barra de navegación
const reservasLink = document.getElementById('reservasLink');
const documentoLink = document.getElementById('documentosLink');
const gastosLink = document.getElementById('gastosLink');
const sesionLink = document.getElementById('sesionLink');

//Contenedores los cuales estan ocultos por default

const reservaConteiner = document.getElementById('reservasContainer');
const documentoConteiner = document.getElementById('containerDocumento');
const gastosConteiner = document.getElementById('containerGastos');

const categoriaBox = document.getElementById('messageBoxCategoria')
const inputCatNombre = document.getElementById('categoriaConfigNombre');
const inputCatPrecio = document.getElementById('categoriaConfigPrecio');
const documentBox = document.getElementById('agragarDocumento');
const inputDocumento = document.getElementById('nuevoDocumento');
const rubroBox = document.getElementById('agragarRubro')
const inputRubro = document.getElementById('nombreRubro');
const inputDesc = document.getElementById('descRubro');
const editarRubroBox = document.getElementById('editarRubro')
const inputEditarRubro = document.getElementById('nombreEditarRubro');
const spinner = document.getElementById('loading-spinner');

reservasLink.addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('container').style.display = 'block';
    reservaConteiner.style.display = 'block';
    documentoConteiner.style.display = 'none';
    gastosConteiner.style.display = 'none';
    mostrarCategorias();
});

documentoLink.addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('container').style.display = 'block';
    reservaConteiner.style.display = 'none';
    documentoConteiner.style.display = 'block';
    gastosConteiner.style.display = 'none';
    mostarDni();
});

gastosLink.addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('container').style.display = 'block';
    reservaConteiner.style.display = 'none';
    documentoConteiner.style.display = 'none';
    gastosConteiner.style.display = 'block';
    agregarAnios();
});

sesionLink.addEventListener('click', () => cerrarSesion("Sesión cerrada correctamente"));

function mostrarCategorias(){
    const token = sessionStorage.getItem('token');
    const idUsuario = sessionStorage.getItem('id_usuario')
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
    sessionStorage.setItem('idCategoria',idCategoria);
    categoriaBox.style.display = 'block';
    deshabilitarNavbar();
}
  
function cerrarEditarCategoria(){
    categoriaBox.style.display = 'none';
    sessionStorage.removeItem('idCategoria');
    inputCatNombre.value = ''
    inputCatPrecio.value = ''
    habilitarNavbar();
}

function editarCategoria(){
    const token = sessionStorage.getItem('token');
    const idUsuario = sessionStorage.getItem('id_usuario')
    const id = sessionStorage.getItem('idCategoria');
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
  
function mostarDni(){
    const token = sessionStorage.getItem('token');
    const idUsuario = sessionStorage.getItem('id_usuario')
    const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token,
      'id': idUsuario
    }
    };
  
    fetch(`http://127.0.0.1:5000/documento`, requestOptions)
    .then(response => {
      validarSesion(response);
      return response.json()})
    .then(data => {
      const container = document.getElementById('containerDni'); // El div donde vas a mostrar los datos
      container.innerHTML = ''; // Limpiar la lista
      data.forEach(dato => {
          // Crear un div para cada item
          const itemDiv = document.createElement('div');
          itemDiv.classList.add('item');
          let enUso = ""
          if (dato.enUso) {
            enUso = "Si"
          }else{
            enUso = "No"
          }
  
          // Crear un párrafo o span para mostrar el contenido
          const itemContent = document.createElement('p');
          itemContent.textContent = `Dni: ${dato.numero} , Cuenta en uso: ${enUso}`;
  
          // Crear el botón de eliminar
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Eliminar';
          deleteButton.addEventListener('click', () => {
              eliminarUsuario(dato.numero);  // Eliminar el item actual
          });
  
          // Agregar el contenido y el botón al div del item
          itemDiv.appendChild(itemContent);
          itemDiv.appendChild(deleteButton);
  
          // Agregar el div al contenedor principal
          container.appendChild(itemDiv);
      });
    })
}

function openAgregarDocumento(){
    documentBox.style.display = 'block';
    deshabilitarNavbar()
}
  
function cerrarAgregarDocumento(){
    documentBox.style.display = 'none';
    inputDocumento.value = "";
    habilitarNavbar()
}

function saveDocumento(){
    const token = sessionStorage.getItem('token');
    const idUsuario = sessionStorage.getItem('id_usuario')
  
    if (inputDocumento.value) {
      spinner.style.display = 'block';
      inputDocumento.classList.remove('error');
      const newEvent = {
        numero: inputDocumento.value,
      };
  
      fetch(`http://127.0.0.1:5000/documento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
          'id': idUsuario,
        },
        body: JSON.stringify(newEvent),
      })
      .then(response => {
        validarSesion(response)
        if(!response.ok){
          return response.json().then(errorData => {
            throw new Error(`${errorData.message}`);
        });
        }
        return response.json()})
      .then(data => {
        cerrarAgregarDocumento()
        mostarDni()
        spinner.style.display = 'none';
      })
      .catch(error => {
        mostrarVentanaEmergente(error)
        spinner.style.display = 'none';
      });
    } 
    else {
      inputDocumento.classList.add('error');
    }
}

function eliminarUsuario(documento){
  
    const confirmacion = confirm('¿Está seguro que desea eliminar un usuario?');
  
    if (confirmacion) {
      spinner.style.display = 'block';
      const token = sessionStorage.getItem('token');
      const idUsuario = sessionStorage.getItem('id_usuario')
  
      fetch(`http://127.0.0.1:5000/documento/${documento}`, {
        method: 'DELETE',
        headers: {
         'Content-Type': 'application/json',
          'x-access-token': token,
          'id': idUsuario,
        }
      })
      .then(response => {
        validarSesion(response)
        return response.json()})
      .then(data => {
        mostrarVentanaEmergente(data.message);
        mostarDni();
        spinner.style.display = 'none';
      })
    }
}

function agregarAnios(){
  const yearSelect = document.getElementById("year-select");
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= 2000; i--) {
    const option = document.createElement("option");
    option.value = i;
    option.text = i;
    yearSelect.appendChild(option);
}
}

function openAgregarRubro(){
  rubroBox.style.display = 'block';
  deshabilitarNavbar();
}

function cerrarAgregarRubro(){
  rubroBox.style.display = 'none';
  inputRubro.value = "";
  habilitarNavbar();
}

function agregarRubro(){
  const token = sessionStorage.getItem('token');
  const idUsuario = sessionStorage.getItem('id_usuario');
  
  if (inputRubro.value) {
    spinner.style.display = 'block';
    inputRubro.classList.remove('error');
    const newEvent = {
      nombre: inputRubro.value,
      descripcion: inputDesc.value,
    };
  
    fetch(`http://127.0.0.1:5000/rubro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
        'id': idUsuario,
      },
      body: JSON.stringify(newEvent),
    })
    .then(response => {
      validarSesion(response);
      if(!response.ok){
        return response.json().then(errorData => {
          throw new Error(`${errorData.message}`);
      });
      }
      return response.json()})
    .then(data => {
      cerrarAgregarRubro();
      spinner.style.display = 'none';
      mostrarVentanaEmergente(data.message);
    })
    .catch(error => {
      mostrarVentanaEmergente(error);
      spinner.style.display = 'none';
    });
  } 
  else {
    inputRubro.classList.add('error');
  }
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
    validarSesion(response)
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
      comprobanteCell.contentEditable = true;
      
      row.appendChild(comprobanteCell);
      
      const importeCell = document.createElement("td");
      importeCell.textContent = item.importe || "Sin datos"; // Manejar caso sin importe
      importeCell.contentEditable = true;
      row.appendChild(importeCell);

      const detalleCell = document.createElement("td");
      detalleCell.textContent = item.descripcion ? item.descripcion : ""; // Si está vacío o nulo, no mostrar nada
      detalleCell.contentEditable = true;
      row.appendChild(detalleCell);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Eliminar rubro';
      deleteButton.addEventListener('click', () => {
        eliminarRubro(item.id);  // Eliminar el item actual
      });
      row.appendChild(deleteButton)

      const editarButton = document.createElement('button');
      editarButton.textContent = 'Editar rubro';
      editarButton.addEventListener('click', () => {
        openEditarRubro(item.id);  // Eliminar el item actual
      });
      row.appendChild(editarButton)

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

function guardarTabla(){
  const token = sessionStorage.getItem('token');
  const idUsuario = sessionStorage.getItem('id_usuario')
  
  const rows = document.querySelectorAll("table tr");
  const updatedData = [];

  const month = document.getElementById("month-select").value;
  const year = document.getElementById("year-select").value;
  // Saltar el primer row (encabezado)
  rows.forEach((row, index) => {
      if (index === 0 || index >= rows.length - 2) return; // Ignorar encabezado

      const rubros = row.cells[0].textContent;
      const comprobante = row.cells[1].textContent;
      const importe = row.cells[2].textContent;
      const detalle = row.cells[3].textContent;

      updatedData.push({ rubros, comprobante, importe, detalle });
  });

  const datos = {
    mes: month,
    anio: year,
    table: updatedData,
  };

  const requestOptions = {
    method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token,
            'id': idUsuario
        },
        body: JSON.stringify(datos),
  };
  
  // Enviar los datos actualizados al servidor
  fetch('http://127.0.0.1:5000/rubro/tabla', requestOptions)
  .then(response => {
    validarSesion(response)
    return response.json()})
  .then(data => {
    mostrarVentanaEmergente(data.message)
  })
}

function eliminarRubro(id){
  const confirmacion = confirm('¿Está seguro que desea eliminar este rubro?');
  
  if (confirmacion) {
    spinner.style.display = 'block';
    const token = sessionStorage.getItem('token');
    const idUsuario = sessionStorage.getItem('id_usuario')

    fetch(`http://127.0.0.1:5000/rubro/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
        'id': idUsuario,
      }
    })
    .then(response => {
      validarSesion(response)
      return response.json()})
    .then(data => {
      mostrarVentanaEmergente(data.message);
      generarTabla()
      spinner.style.display = 'none';
    })
  }
}

function openEditarRubro(id){
  editarRubroBox.style.display = 'block';
  sessionStorage.setItem('idRubro',id);
  deshabilitarNavbar();
}

function cerrarEditarRubro(){
  sessionStorage.removeItem('idRubro');
  editarRubroBox.style.display = 'none';
  inputEditarRubro.value = "";
  habilitarNavbar();
}

function editarRubro(){
  const token = sessionStorage.getItem('token');
  const idUsuario = sessionStorage.getItem('id_usuario')
  const idRubro = sessionStorage.getItem('idRubro')

  if (inputEditarRubro.value){
    inputEditarRubro.classList.remove('error');

    const datos = {
      idRubro: idRubro,
      nombre: inputEditarRubro.value
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

    fetch(`http://127.0.0.1:5000/rubro`, requestOptions)
    .then(response => {
      validarSesion(response)
      return response.json()})
    .then(data => {
      cerrarEditarRubro()
      generarTabla()
    })
  } else{
    inputEditarRubro.classList.add('error');
  }
}

function mostrarVentanaEmergente(error) {
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerText = error;
    errorModal.style.display = 'block';
  }
  

function validarSesion(response){
    if (response.status === 401) {
      // Expirar la sesión
      cerrarSesion("Sesión expirada");
    }
  }

function cerrarSesion(mensaje){
    sessionStorage.setItem('message', mensaje);
    window.location.href = "http://127.0.0.1:5000"
    return;
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


document.getElementById('editCategoria1').addEventListener('click', () => openEditarCategoria(1));
document.getElementById('editCategoria2').addEventListener('click', () => openEditarCategoria(2));
document.getElementById('saveButtonCategoriaConfig').addEventListener('click', editarCategoria);
document.getElementById('cancelButtonCategoriaConfig').addEventListener('click', cerrarEditarCategoria);
document.getElementById('agregarDni').addEventListener('click', openAgregarDocumento);
document.getElementById('cancelDocumento').addEventListener('click', cerrarAgregarDocumento);
document.getElementById('saveDocumento').addEventListener('click', saveDocumento);
document.getElementById('agregarRubro').addEventListener('click', openAgregarRubro);
document.getElementById('cancelRubro').addEventListener('click', cerrarAgregarRubro);
document.getElementById('saveRubro').addEventListener('click', agregarRubro);
document.getElementById("generate-table").addEventListener("click", generarTabla);
document.getElementById("saveTable").addEventListener("click", guardarTabla);
document.getElementById('cancelEditarRubro').addEventListener('click', cerrarEditarRubro);
document.getElementById('saveEditarRubro').addEventListener('click', editarRubro);
window.addEventListener('click', (event) => {
    const errorModal = document.getElementById('errorModal');
    if (event.target === errorModal) {
      errorModal.style.display = 'none';
    }
});
document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('errorModal').style.display = 'none';
});