
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("Un joueur est connecté :", socket.id);

  socket.on("joinRoom", (roomCode, playerName) => {
    if (!roomCode || !playerName) return;

    if (!rooms[roomCode]) {
      rooms[roomCode] = [];
    }

    if (rooms[roomCode].length >= 20) {
      socket.emit("roomError", "Salon complet !");
      return;
    }

    rooms[roomCode].push({
      id: socket.id,
      name: playerName
    });

    socket.join(roomCode);
    io.to(roomCode).emit("playersUpdate", rooms[roomCode]);
  });

  socket.on("disconnect", () => {
    for (const roomCode in rooms) {
      rooms[roomCode] = rooms[roomCode].filter(
        player => player.id !== socket.id
      );

      io.to(roomCode).emit("playersUpdate", rooms[roomCode]);

      if (rooms[roomCode].length === 0) {
        delete rooms[roomCode];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("CAT KILLEUR lancé sur le port " + 
