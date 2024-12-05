const nuevaContraseña = document.getElementById('nuevaContraseña')
const contraseñaRepetida = document.getElementById('nuevaContraseña2')

function cambiarPass(){


    const token = document.getElementById('token').innerText;

    if (nuevaContraseña.value && contraseñaRepetida.value){
        nuevaContraseña.classList.remove('error');
        contraseñaRepetida.classList.remove('error');
        if (nuevaContraseña.value != contraseñaRepetida.value){
            mostrarVentanaEmergente("Las contraseñas no coinciden")
            return
        }
        const datos = {
            password : nuevaContraseña.value,
        };
        const requestOptions = {
            method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            body: JSON.stringify(datos),
        };

        fetch(`http://127.0.0.1:5000/recuperar/${token}`, requestOptions)
        .then(response => response.json())
        .then(data => {
            mostrarVentanaEmergente(data.message)
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    else{
        nuevaContraseña.classList.add('error');
        contraseñaRepetida.classList.add('error');
    }
}

function mostrarVentanaEmergente(message){
    const emergente = document.getElementById('emergente');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerText = message;
    emergente.style.display = 'block';
}

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('emergente').style.display = 'none';
  });