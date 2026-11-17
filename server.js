
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {
  console.log("Joueur connecté :", socket.id);

  socket.on("createRoom", (name, callback) => {
    name = String(name || "").trim().slice(0, 20);

    if (!name) return callback({ error: "Entre ton nom !" });

    let code;
    do {
      code = Math.random().toString(36).slice(2, 8).toUpperCase();
    } while (rooms[code]);

    rooms[code] = [];
    joinRoom(socket, code, name);
    callback({ code });
  });

  socket.on("joinRoom", (code, name, callback) => {
    code = String(code || "").trim().toUpperCase();
    name = String(name || "").trim().slice(0, 20);

    if (!name || !code)
      return callback({ error: "Entre ton nom et le code !" });

    if (!rooms[code])
      return callback({ error: "Salon introuvable !" });

    if (rooms[code].length >= 20)
      return callback({ error: "Salon complet !" });

    joinRoom(socket, code, name);
    callback({ code });
  });

  function joinRoom(player, code, name) {
    if (player.roomCode) leaveRoom(player);

    rooms[code].push({ id: player.id, name });
    player.roomCode = code;
    player.join(code);
    io.to(code).emit("playersUpdate", rooms[code]);
  }

  function leaveRoom(player) {
    const code = player.roomCode;
    if (!code || !rooms[code]) return;

    rooms[code] = rooms[code].filter(p => p.id !== player.id);
    player.leave(code);
    player.roomCode = null;

    if (rooms[code].length === 0) {
      delete rooms[code];
    } else {
      io.to(code).emit("playersUpdate", rooms[code]);
    }
  }

  socket.on("disconnect", () => leaveRoom(socket));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("CAT KILLEUR démarré !"));
