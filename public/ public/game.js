
const socket = io();

let currentRoom = null;

function getPlayerName() {
  const input = document.getElementById("playerName");
  return input.value.trim();
}

function createRoom() {
  const name = getPlayerName();

  if (!name) {
    showMessage("Entre ton nom de joueur !");
    return;
  }

  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  joinRoom(roomCode, name);
}

function joinGame() {
  const name = getPlayerName();
  const roomCode = document.getElementById("roomCode").value.trim().toUpperCase();

  if (!name || !roomCode) {
    showMessage("Entre ton nom et le code du salon !");
    return;
  }

  joinRoom(roomCode, name);
}

function joinRoom(roomCode, name) {
  currentRoom = roomCode;
  socket.emit("joinRoom", roomCode, name);
  showMessage("Connexion au salon " + roomCode + "...");
}

socket.on("playersUpdate", (players) => {
  showMessage("Salon : " + currentRoom + " | " + players.length + "/20 joueurs");

  const container = document.getElementById("players");
  container.innerHTML = "<h3>Joueurs présents</h3>";

  players.forEach((player) => {
    const item = document.createElement("p");
    item.textContent = "🐱 " + player.name;
    container.appendChild(item);
  });
});

socket.on("roomError", (message) => {
  showMessage(message);
});

socket.on("connect", () => {
  showMessage("Connecté au serveur !");
});

socket.on("disconnect", () => {
  showMessage("Déconnecté du serveur...");
});

function showMessage(message) {
  document.getElementById("message").textContent = message;
}

