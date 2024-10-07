// Inicializar IndexedDB
let db;
const request = indexedDB.open("SaraperitosDB", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    db.createObjectStore("players", { keyPath: "id" });
};

request.onsuccess = function(event) {
    db = event.target.result;
    loadPlayers(); // Cargar los jugadores al inicio
};

request.onerror = function(event) {
    console.error("Error al abrir la base de datos:", event.target.error);
};

// Agregar un jugador y su canción
document.getElementById('addPlayerBtn').onclick = function() {
    const playerName = document.getElementById('playerName').value;
    const songUpload = document.getElementById('songUpload').files[0];

    if (playerName && songUpload) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const songData = e.target.result;

            const newPlayer = {
                id: Date.now(),
                name: playerName,
                song: songData,
                songName: songUpload.name
            };

            const transaction = db.transaction(["players"], "readwrite");
            const store = transaction.objectStore("players");
            store.add(newPlayer);

            transaction.oncomplete = function() {
                loadPlayers();
                document.getElementById('playerName').value = '';
                document.getElementById('songUpload').value = '';
            };

            transaction.onerror = function(event) {
                console.error("Error al agregar el jugador:", event.target.error);
            };
        };

        reader.readAsDataURL(songUpload);
    }
};

// Cargar jugadores desde IndexedDB
function loadPlayers() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = ''; // Limpiar la lista

    const transaction = db.transaction(["players"], "readonly");
    const store = transaction.objectStore("players");
    const request = store.getAll();

    request.onsuccess = function(event) {
        const players = event.target.result;
        players.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            playerItem.innerHTML = `
                <span>${player.name}</span>
                <button class="play-btn" data-song="${player.song}">Reproducir</button>
                <input type="text" value="${player.name}" class="edit-name" data-id="${player.id}">
                <button class="edit-btn" data-id="${player.id}">Guardar</button>
            `;
            playerList.appendChild(playerItem);
        });

        // Agregar eventos de reproducción y edición
        const playButtons = document.querySelectorAll('.play-btn');
        playButtons.forEach(button => {
            button.onclick = function() {
                const song = this.getAttribute('data-song');
                document.getElementById('audioSource').src = song;
                document.getElementById('audioPlayer').load();
                document.getElementById('audioPlayer').play();
            };
        });

        const editButtons = document.querySelectorAll('.edit-btn');
        editButtons.forEach(button => {
            button.onclick = function() {
                const playerId = this.getAttribute('data-id');
                const newName = this.previousElementSibling.value;

                // Actualizar el nombre en la base de datos
                const transaction = db.transaction(["players"], "readwrite");
                const store = transaction.objectStore("players");
                const request = store.get(parseInt(playerId));

                request.onsuccess = function(event) {
                    const player = event.target.result;
                    player.name = newName;
                    store.put(player);
                    loadPlayers(); // Recargar la lista de jugadores
                };
            };
        });
    };
}
