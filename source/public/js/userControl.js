function handleFetch(url, method, successMessage, errorMessage) {
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(async response => {
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        throw data.error;
      }
    })
    .then(data => {
      Swal.fire({
        position: 'top-center',
        icon: 'success',
        title: `${data.message}`,
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        location.reload();
      });
    })
    .catch(error => {
      Swal.fire({
        title: `${error}`,
        icon: 'error'
      });
    });
  }
  
  function deleteUser(uid) {
    handleFetch(`/api/session/${uid}/deleteUser`, 'DELETE', 'Usuario eliminado con éxito', 'No se pudo eliminar el usuario');
  }
  
  function changeRole(uid) {
    handleFetch(`/api/session/premium/${uid}`, 'GET', 'Rol cambiado con éxito', 'No se pudo cambiar el rol');
  }
  
  function deleteUsersWithoutActivity() {
    handleFetch(`/api/session/deleteUsers`, 'POST', 'Usuarios inactivos eliminados con éxito', 'No se pudieron eliminar usuarios inactivos');
  }
  