let nav = 0;
let clicked = null;
//let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

const navbar = document.getElementById('navbar');
const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const spinner = document.getElementById('loading-spinner');

window.onload = function(){
  
  const token = localStorage.getItem('token')//recuperar los datos al cargar la pag
  //console.log(token)
  if (token){ // buscamos en la memoria local si aparece
    const idUsuario = localStorage.getItem('id_usuario');  
  }
  else{// si alguien intenta accedder a este htlm sin pasar por la pag /login
    window.location.href = "../login/login.html";
  }
}

function mostrarVentanaEmergente(error) {
  
  const errorModal = document.getElementById('errorModal');
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.innerText = error;
  errorModal.style.display = 'block';
}

function openModal(date) {
  
  clicked = date;
  const currentDate = new Date();
  const selectedDate = new Date(clicked);
  deshabilitarNavbar()
  const eventOptions = document.getElementById('eventOptions');
  eventOptions.innerHTML = '';

  // Si la fecha seleccionada es anterior a la fecha actual
  if (selectedDate <= currentDate.setHours(0, 0, 0, 0)) {
    document.getElementById('eventTitleInput').value = 'No se pueden agregar eventos a fechas pasadas';
    document.getElementById('eventTitleInput').style.display = 'block';
    document.getElementById('saveButton').style.display = 'none';
    newEventModal.style.display = 'block';
    backDrop.style.display = 'block';
    datosModal(date)
    return;
  }

  const eventsForDay = events.filter(e => e.date === clicked);

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
  fetch(`Edificio325.com.ar/categorias`, requestOptions)
    .then(response => {
      validarSesion(response)
      return response.json()})
    .then(data => {
      data.forEach(dato => {
        const categoriaButton = document.createElement('button');
        categoriaButton.innerText = dato.nombre;

        const isCategoryUsed = eventsForDay.some(event => event.title === dato.nombre);
        
        if (isCategoryUsed) {
          categoriaButton.disabled = true;  // Deshabilitar el botón si la categoría ya está utilizada
        }

        categoriaButton.addEventListener('click', () => {
          document.getElementById('eventTitleInput').value = dato.nombre;
          document.getElementById('eventTitleInput').style.display = 'block';
          document.getElementById('saveButton').style.display = 'block';
        });
        eventOptions.appendChild(categoriaButton);
      });

      newEventModal.style.display = 'block';
      backDrop.style.display = 'block';
      datosModal(date);
    })
    .catch(error => console.error('Error:', error));

  
}

function closeModal() {
  eventTitleInput.classList.remove('error');
  newEventModal.style.display = 'none';
  backDrop.style.display = 'none';
  eventTitleInput.value = '';
  clicked = null;
  navbar.disabled = false
  habilitarNavbar()
  load();
}

function datosModal(date) {
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
  let dateremplazo = date.replace(/\//g, '.');
  fetch(`Edificio325.com.ar/calendario/${dateremplazo}`, requestOptions)
  .then(response => {
    validarSesion(response)
    return response.json()})
  .then(data => {
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = ''; // Limpiar la lista

    if (data.length > 0) {
      data.forEach(event => {
        const listItem = document.createElement('li');
        listItem.innerText = `Cliente: ${event.idUsuario}, Categoría: ${event.idCategoria}`; 
        eventList.appendChild(listItem);
      });
    } else {
      const noEventsItem = document.createElement('li');
      noEventsItem.innerText = 'No hay turnos reservados para esta fecha';
      eventList.appendChild(noEventsItem);
    }

    newEventModal.style.display = 'block';
    backDrop.style.display = 'block';
  })
  .catch(error => console.error('Error:', error));
}

function load() {
  
  const dt = new Date();

  if (nav !== 0) {
    dt.setMonth(new Date().getMonth() + nav);
  }

  const day = dt.getDate();
  const month = dt.getMonth();
  const year = dt.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

  document.getElementById('monthDisplay').innerText = 
    `${dt.toLocaleDateString(undefined, { month: 'long' })} ${year}`;

  calendar.innerHTML = '';

  for(let i = 1; i <= paddingDays + daysInMonth; i++) {
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');

    const dayString = `${month + 1}/${i - paddingDays}/${year}`;

    if (i > paddingDays) {
      daySquare.innerText = i - paddingDays;
      const eventsForDay = events.filter(e => e.date === dayString);

      if (i - paddingDays === day && nav === 0) {
        daySquare.id = 'currentDay';
      }

      if (eventsForDay.length > 0) {
        eventsForDay.forEach(event => {
          const eventDiv = document.createElement('div');
          eventDiv.classList.add('event');
          eventDiv.innerText = event.title;
          daySquare.appendChild(eventDiv);
        });
      }

      daySquare.addEventListener('click', () => openModal(dayString));
    } else {
      daySquare.classList.add('padding');
    }

    calendar.appendChild(daySquare);    
  }
}

function loadEvents() {
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
  
  fetch(`Edificio325.com.ar/calendario`, requestOptions)
    .then(response => {
      validarSesion(response)
      return response.json()})
    .then(data => {
      events = data;
      load();
      verificarTurno(idUsuario)
    })
    .catch(error => console.error('Error:', error));
}

function verificarTurno(idUsuario) {
  const token = localStorage.getItem('token');
  const currentDate = new Date();
  let formattedDate = ('0' + (currentDate.getMonth() + 1)).slice(-2) + '/' +
                    ('0' + currentDate.getDate()).slice(-2) + '/' +
                    currentDate.getFullYear();

  const datos = {
    date: formattedDate,
    id: idUsuario,
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

  fetch(`Edificio325.com.ar/calendario`, requestOptions)
  .then(response => {
    validarSesion(response)
    return response.json()})
  .then(data => modelEliminarTurno(data.Turno))
}

function modelEliminarTurno(turno){
  if (turno){
    document.getElementById("cancelarButton").style.display = "block"
    document.getElementById("cancelarButton").disabled = false
  }
  else{
    document.getElementById("cancelarButton").style.display = "none"
    document.getElementById("cancelarButton").disabled = true
  }
}




function saveEvent() {
  const token = localStorage.getItem('token');
  const idUsuario = localStorage.getItem('id_usuario')

  if (eventTitleInput.value) {
    spinner.style.display = 'block';
    eventTitleInput.classList.remove('error');
    const newEvent = {
      horario: clicked,
      title: eventTitleInput.value,
      id: idUsuario,
    };

    fetch(`Edificio325.com.ar/calendario`, {
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
    .then(horario => {
      events.push(newEvent);
      closeModal();
      loadEvents()
      spinner.style.display = 'none';
    })
    .catch(error => {
      mostrarVentanaEmergente(error)
      spinner.style.display = 'none';
    });
  } 
  else {
    eventTitleInput.classList.add('error');
  }
  
}

function cancelarEvent(){

  const confirmacion = confirm('¿Está seguro que desea cancelar se reserva altual?');

  if (confirmacion) {
    spinner.style.display = 'block';
    const token = localStorage.getItem('token');
    const idUsuario = localStorage.getItem('id_usuario')

    fetch(`Edificio325.com.ar/calendario/${idUsuario}`, {
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
      mostrarVentanaEmergente(data.message)
      loadEvents()
      spinner.style.display = 'none';
    })
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

function initButtons() {
  document.getElementById('nextButton').addEventListener('click', () => {
    nav++;
    load();
  });

  document.getElementById('backButton').addEventListener('click', () => {
    nav--;
    load();
  });

  document.getElementById('saveButton').addEventListener('click', saveEvent);
  document.getElementById('cancelButton').addEventListener('click', closeModal);
  document.getElementById('cancelarButton').addEventListener('click',cancelarEvent)
  document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('errorModal').style.display = 'none';
  });
  window.addEventListener('click', (event) => {
    const errorModal = document.getElementById('errorModal');
    if (event.target === errorModal) {
      errorModal.style.display = 'none';
    }
  });
}

initButtons();
loadEvents();

