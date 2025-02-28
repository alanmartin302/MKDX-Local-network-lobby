// /src/app/gameHandler.js
const { Server } = require("socket.io");
const { exec } = require("child_process");
const path = require("path");
const ioClient = require("socket.io-client");

const PORT = 4333;
let socketServer = null;
let playersReady = {};
let isHost = false;

function getSocketServer() {
  return socketServer;
}

/**
 * Starts the game as a host.
 * - Creates a Socket.IO server.
 * - Marks the host as a ready player.
 * - Broadcasts the player list to all connected clients (and the host UI).
 */
function startAsHost(hostName, batFilePath, win) {
  if (isHost) {
    console.log("⚠️ Host already running!");
    return;
  }

  console.log(`🌍 Creating Game as Host: ${hostName}`);
  isHost = true;
  playersReady = {};
  playersReady[hostName] = true; // Host is automatically ready

  socketServer = new Server(PORT);
  socketServer.on("connection", (socket) => {
    const clientIP = socket.handshake.address;
    console.log(`New client connected from ${clientIP}`);

    socket.on("player-joined", (playerName) => {
      console.log(`👥 Player Joined: ${playerName} (from ${clientIP})`);
      playersReady[playerName] = false;
      broadcastPlayerList(win);
    });

    socket.on("player-ready", (playerName) => {
      console.log(`✅ Player Ready: ${playerName} (from ${clientIP})`);
      playersReady[playerName] = true;
      broadcastPlayerList(win);
    });

    socket.on("request-start-game", () => {
      if (Object.values(playersReady).every((status) => status)) {
        console.log("🎮 All players are ready! Host is starting the game...");
        socketServer.emit("start-game");
        if (win) {
          win.webContents.send("host-started");
        }
        launchGame(batFilePath);
      }
    });
  });

  broadcastPlayerList(win);
  if (win) {
    win.webContents.send("host-started");
  }
}

/**
 * Broadcasts the current playersReady object to all connected clients and the host UI.
 */
function broadcastPlayerList(win) {
  console.log("Broadcasting player list:", playersReady);
  if (socketServer) {
    socketServer.emit("player-list", playersReady);
  }
  if (win) {
    win.webContents.send("player-list", playersReady);
  }
}

/**
 * Joins an existing host at the given IP address.
 * - Connects via Socket.IO.
 * - Emits 'player-joined' so the host knows a new player has joined.
 * - Listens for 'player-list' updates and 'start-game' events from the host.
 * @returns {Socket} The client socket, so events can be forwarded later.
 */
function joinHost(hostIP, playerName, win, batFilePath) {
  console.log(`👥 Joining Host at ${hostIP} as ${playerName}`);
  const socket = ioClient(`http://${hostIP}:${PORT}`);
  socket.emit("player-joined", playerName);

  if (win) {
    win.webContents.send("player-joined-game");
  }

  socket.on("player-list", (players) => {
    console.log("👥 Player List Updated (client):", players);
    if (win) {
      win.webContents.send("player-list", players);
    }
  });

  socket.on("start-game", () => {
    console.log("🚀 Game started by the host!");
    launchGame(batFilePath);
  });

  return socket;
}

/**
 * Launches the game by executing the specified BAT file.
 */
function launchGame(batFilePath) {
  if (!batFilePath) {
    console.log("❌ No BAT file selected!");
    return;
  }
  console.log(`🚀 Launching BAT file: ${batFilePath}`);
  const batDir = path.dirname(batFilePath);
  exec(`start "" "${batFilePath}"`, { cwd: batDir, shell: true }, (error) => {
    if (error) {
      console.error(`❌ Error launching BAT file: ${error.message}`);
    } else {
      console.log("✅ BAT file launched successfully!");
    }
  });
}

module.exports = {
  startAsHost,
  joinHost,
  launchGame,
  getSocketServer
};
