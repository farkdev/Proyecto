document.getElementById('registrationForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Obtener los valores de los campos manualmente
    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;
    const username = document.querySelector('input[name="username"]').value;
    const dateOfBirth = document.querySelector('input[name="date_of_birth"]').value;
    const firstName = document.querySelector('input[name="first_name"]').value;
    const lastName = document.querySelector('input[name="last_name"]').value;

    const data = {
        email,
        password,
        username,
        date_of_birth: dateOfBirth,
        first_name: firstName,
        last_name: lastName
    };

    // Enviar la solicitud con los datos manualmente obtenidos
    const response = await fetch('/api/session/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const responseData = await response.json();
    

    if (responseData.status === 'success') {
        alert('usuario creado correctamente, inicia sesion')
        window.location.href = '/api/session/login';
    } else {
        console.error(responseData.error);
    }
});