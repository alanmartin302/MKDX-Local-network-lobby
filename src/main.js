// /src/main.js
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { loadConfig, saveConfig, getConfigPath } = require("./app/configHandler");
const { broadcastHost, stopBroadcast, listenForHost, stopDiscovery } = require("./app/networkHandler");
const { startAsHost, joinHost, launchGame, getSocketServer } = require("./app/gameHandler");

let batFilePath = "";
let playerName = "";
let firstLaunch = true;
let win;
let clientSocket = null; // For storing the client socket when joining a host
let localIsHost = false;  // Flag to indicate if this instance is hosting

// Load configuration from config.ini using our helper module
function loadAppConfig() {
  const cfg = loadConfig(getConfigPath(app.isPackaged));
  playerName = cfg.playerName;
  batFilePath = cfg.batFilePath;
  firstLaunch = cfg.firstLaunch;
}

// Save configuration back to config.ini
function saveAppConfig() {
  saveConfig(getConfigPath(app.isPackaged), playerName, batFilePath, firstLaunch);
}

// Create the main application window
function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  win.maximize();
  win.loadFile("index.html");

  // Show the first-launch popup if needed
  if (firstLaunch) {
    console.log("First Launch Detected - Displaying Setup Popup");
    win.webContents.once("did-finish-load", () => {
      win.webContents.send("show-first-launch-popup");
    });
  }

  console.log("Main Process Loaded!");
  // Start listening for host broadcasts
  listenForHost(win);
}

app.whenReady().then(() => {
  loadAppConfig();
  console.log(`Loaded config -> Player="${playerName}", BAT="${batFilePath}", firstLaunch=${firstLaunch}`);
  createWindow();
});

// ---------------------------------------------------------------------
// IPC Handlers - manage communication from the renderer process
// ---------------------------------------------------------------------

ipcMain.on("select-game-path", (event) => {
  dialog.showOpenDialog(win, {
    title: "Select Mario Kart DX Launch BAT File",
    properties: ["openFile"],
    filters: [{ name: "Batch Files", extensions: ["bat"] }]
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      batFilePath = result.filePaths[0];
      saveAppConfig();
      event.sender.send("game-path-set", batFilePath);
      console.log(`BAT file selected & saved: ${batFilePath}`);
    }
  });
});

ipcMain.on("set-player-name", (event, name) => {
  playerName = name;
  saveAppConfig();
  console.log(`Player Name Saved: ${playerName}`);
});

ipcMain.on("get-config", (event) => {
  console.log("Sending config data to Renderer...");
  event.sender.send("config-data", {
    batFilePath,
    playerName,
    firstLaunch: firstLaunch ? "true" : "false"
  });
});

ipcMain.on("dismiss-first-launch", (event) => {
  console.log("Received request to dismiss first launch message.");
  firstLaunch = false;
  saveAppConfig();
  event.sender.send("config-data", { batFilePath, playerName, firstLaunch: "false" });
});

ipcMain.on("start-as-host", (event, hostName) => {
  // Mark this instance as host
  localIsHost = true;
  console.log(`Starting as host: ${hostName}`);
  // Start broadcasting host IP and initialize hosting
  broadcastHost();
  startAsHost(hostName, batFilePath, win);
});

ipcMain.on("join-host", (event, hostIP, name) => {
  // Mark this instance as a client (not hosting)
  localIsHost = false;
  console.log(`Joining host at ${hostIP} as ${name}`);
  // (Optionally, you can stop discovery here, but we're keeping it running for new joiners.)
  clientSocket = joinHost(hostIP || "127.0.0.1", name, win, batFilePath);
});

ipcMain.on("player-ready", () => {
  if (!localIsHost && clientSocket) {
    console.log(`${playerName} is Ready! (Forwarding to host)`);
    clientSocket.emit("player-ready", playerName);
  } else {
    console.log(`${playerName} is Ready! (Handled by host)`);
  }
});

ipcMain.on("start-game", () => {
  console.log("Start Game button clicked!");

  // If we're the host, emit "start-game" to all connected clients
  if (localIsHost) {
    const socketServer = getSocketServer(); // retrieve from gameHandler
    if (socketServer) {
      console.log("Host is emitting 'start-game' to clients...");
      socketServer.emit("start-game");
    }
  }

  // Also launch the game locally on the host
  launchGame(batFilePath);
});

app.on("window-all-closed", () => {
  stopBroadcast();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
