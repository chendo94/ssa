document.addEventListener('DOMContentLoaded', () => {
  const registerSection = document.getElementById('register-section');
  const uploadSection = document.getElementById('upload-section');
  const listSection = document.getElementById('list-section');
  const playerForm = document.getElementById('player-form');
  const songForm = document.getElementById('song-form');
  const playerList = document.getElementById('player-list');
  const audioPlayer = document.getElementById('player');
  const audioSource = document.getElementById('audio-source');
  const viewPlayersButton = document.getElementById('view-players');
  const backToRegister = document.getElementById('back-to-register');
  const backToRegisterFromList = document.getElementById('back-to-register-from-list');
  const finishRegistrationButton = document.getElementById('finish-registration');

  // Mostrar la sección de registro al cargar la página
  registerSection.classList.add('active');

  // Manejar el envío del formulario de registro de jugador
  playerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const playerName = document.getElementById('player-name').value;
    const players = JSON.parse(localStorage.getItem('players')) || [];

    // Verificar si se ha alcanzado el límite de 100 jugadores
    if (players.length >= 100) {
      alert('Se ha alcanzado el límite de 100 jugadores.');
      return;
    }

    // Agregar el jugador a la lista
    players.push({ name: playerName, song: null }); // Inicialmente sin canción
    localStorage.setItem('players', JSON.stringify(players));
    document.getElementById('player-name').value = ''; // Limpiar el campo
    registerSection.classList.remove('active');
    uploadSection.classList.add('active');
    document.getElementById('player-name-display').textContent = playerName; // Mostrar el nombre
  });

  // Manejar el envío del formulario de carga de canción
  songForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const playerSong = document.getElementById('player-song').files[0];
    const players = JSON.parse(localStorage.getItem('players')) || [];
    const currentPlayerName = document.getElementById('player-name-display').textContent;

    if (currentPlayerName && playerSong) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedPlayers = players.map(player => {
          if (player.name === currentPlayerName) {
            return { ...player, song: e.target.result }; // Actualizar la canción
          }
          return player;
        });
        localStorage.setItem('players', JSON.stringify(updatedPlayers));
        alert('Canción registrada con éxito.'); // Notificación de éxito
        uploadSection.classList.remove('active');
        registerSection.classList.add('active');
        document.getElementById('player-name-display').textContent = ''; // Limpiar el nombre
        document.getElementById('player-song').value = ''; // Limpiar el campo de canción
      };
      reader.readAsDataURL(playerSong);
    } else {
      alert('Por favor, selecciona una canción para el jugador.');
    }
  });

  // Mostrar la lista de jugadores
  function displayPlayerList() {
    const players = JSON.parse(localStorage.getItem('players')) || [];
    playerList.innerHTML = '';
    players.forEach(player => {
      const listItem = document.createElement('li');
      const playerButton = document.createElement('button');
      playerButton.textContent = player.name;

      playerButton.addEventListener('click', () => {
        if (player.song) {
          audioSource.src = player.song;
          audioPlayer.load();
          audioPlayer.play();
        } else {
          alert('Este jugador no tiene canción registrada.');
        }
      });

      // Botón para eliminar jugador
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Eliminar';
      deleteButton.addEventListener('click', () => {
        const updatedPlayers = players.filter(p => p.name !== player.name);
        localStorage.setItem('players', JSON.stringify(updatedPlayers));
        displayPlayerList(); // Actualizar la lista
      });

      // Botón para modificar (subir canción)
      const modifyButton = document.createElement('button');
      modifyButton.textContent = 'Modificar Canción';
      modifyButton.addEventListener('click', () => {
        document.getElementById('player-name-display').textContent = player.name; // Mostrar el nombre
        uploadSection.classList.add('active');
        registerSection.classList.remove('active');
      });

      listItem.appendChild(playerButton);
      listItem.appendChild(modifyButton);
      listItem.appendChild(deleteButton);
      playerList.appendChild(listItem);
    });
  }

  // Manejar el botón de ver jugadores
  viewPlayersButton.addEventListener('click', () => {
    registerSection.classList.remove('active');
    listSection.classList.add('active');
    displayPlayerList();
  });

  // Manejar el botón de regresar
  backToRegister.addEventListener('click', () => {
    uploadSection.classList.remove('active');
    registerSection.classList.add('active');
  });

  backToRegisterFromList.addEventListener('click', () => {
    listSection.classList.remove('active');
    registerSection.classList.add('active');
  });

  // Manejar el botón de finalizar registro
  finishRegistrationButton.addEventListener('click', () => {
    uploadSection.classList.remove('active');
    listSection.classList.add('active');
    displayPlayerList();
  });
});
