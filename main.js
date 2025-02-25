const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const dgram = require("dgram");
const { Server } = require("socket.io");
const { exec } = require("child_process");
const ioClient = require("socket.io-client");
const os = require("os");


const isPackaged = app.isPackaged;
const CONFIG_PATH = isPackaged
    ? path.join(process.resourcesPath, "config.ini")
    : path.join(__dirname, "config.ini");

const PORT = 4333;
const BROADCAST_PORT = 4444;

let batFilePath = "";
let playerName = "";
let firstLaunch = true;
let isHost = false;
let playersReady = {};
let socketServer = null;
let udpServer = null;
let win;

function loadConfig() {
    console.log(`🔍 Checking for config.ini at: ${CONFIG_PATH}`);

    if (!fs.existsSync(CONFIG_PATH)) {
        console.log("⚙️ Creating default config.ini...");
        const defaultConfig = `[Settings]
playerName=Player1
batFilePath=C:\\path\\to\\your\\game.bat
firstLaunch=true

# Edit values above and restart the app to apply changes.
`;
        fs.writeFileSync(CONFIG_PATH, defaultConfig, "utf-8");
    }

    const configData = fs.readFileSync(CONFIG_PATH, "utf-8");
    const lines = configData.split("\n");

    lines.forEach(line => {
        if (line.startsWith("playerName=")) {
            playerName = line.replace("playerName=", "").trim();
        } else if (line.startsWith("batFilePath=")) {
            batFilePath = line.replace("batFilePath=", "").trim();
        } else if (line.startsWith("firstLaunch=")) {
            firstLaunch = line.replace("firstLaunch=", "").trim() === "true"; // ✅ Convert to Boolean
        }
    });

    console.log(`✅ Loaded Config: Player = "${playerName}", BAT File = "${batFilePath}", First Launch = ${firstLaunch}`);
}


function saveConfig() {
    console.log("💾 Saving config.ini...");
    const newConfig = `[Settings]
playerName=${playerName}
batFilePath=${batFilePath}
firstLaunch=${firstLaunch ? "true" : "false"}

# Edit values above and restart the app to apply changes.
`;
    fs.writeFileSync(CONFIG_PATH, newConfig, "utf-8");
    console.log("✅ Config successfully saved!");
}

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (let iface in interfaces) {
        for (let alias of interfaces[iface]) {
            if (alias.family === "IPv4" && !alias.internal) {
                return alias.address;
            }
        }
    }
    return "127.0.0.1";
}

function broadcastHost() {
    udpServer = dgram.createSocket("udp4");

    udpServer.bind(() => {
        udpServer.setBroadcast(true);
        console.log("📡 Broadcasting host IP...");

        setInterval(() => {
            const message = JSON.stringify({
                type: "host-broadcast",
                hostIP: getLocalIP()
            });
            udpServer.send(message, BROADCAST_PORT, "255.255.255.255");
        }, 2000);
    });
}

function listenForHost() {
    const udpClient = dgram.createSocket("udp4");

    udpClient.on("message", (msg) => {
        const data = JSON.parse(msg.toString());
        if (data.type === "host-broadcast" && data.hostIP) {
            console.log(`🔍 Found Host at ${data.hostIP}`);
            win.webContents.send("host-found", data.hostIP);
        }
    });

    udpClient.bind(BROADCAST_PORT);
}

ipcMain.on("select-game-path", (event) => {
    dialog.showOpenDialog(win, {
        title: "Select Mario Kart DX Launch BAT File",
        properties: ["openFile"],
        filters: [{ name: "Batch Files", extensions: ["bat"] }]
    }).then(result => {
        if (!result.canceled) {
            batFilePath = result.filePaths[0];
            saveConfig();
            event.sender.send("game-path-set", batFilePath);
            console.log(`✅ BAT file selected & saved: ${batFilePath}`);
        }
    });
});

ipcMain.on("set-player-name", (event, name) => {
    playerName = name;
    saveConfig();
    console.log(`✅ Player Name Saved: ${playerName}`);
});

ipcMain.on("get-config", (event) => {
    console.log("📤 Sending config data to Renderer...");
    event.sender.send("config-data", { batFilePath, playerName, firstLaunch });
});

ipcMain.on("save-settings", () => {
    firstLaunch = false;  
    saveConfig();
    console.log("✅ First Launch disabled after saving settings.");
});

ipcMain.on("start-as-host", (event, hostName) => {
    if (isHost) {
        console.log("⚠️ Host already running!");
        return;
    }

    console.log(`🌍 Creating Game as Host: ${hostName}`);
    isHost = true;
    playerName = hostName;

    playersReady[playerName] = true; 
    console.log(`🎮 ${playerName} (Host) is automatically marked as Ready!`);

    socketServer = new Server(PORT);

    socketServer.on("connection", (socket) => {
        socket.on("player-joined", (name) => {
            console.log(`👥 Player Joined: ${name}`);
            playersReady[name] = false;
            socketServer.emit("player-list", playersReady);
            win.webContents.send("player-list", playersReady);
        });

        socket.on("player-ready", (name) => {
            console.log(`✅ Player Ready: ${name}`);
            playersReady[name] = true;
            socketServer.emit("player-list", playersReady);
            win.webContents.send("player-list", playersReady);
        });

        socket.on("request-start-game", () => {
            if (isHost && Object.values(playersReady).every(status => status)) {
                console.log("🎮 All players are ready! Host is starting the game...");
                socketServer.emit("start-game");
                win.webContents.send("host-started");
            }
        });
    });

    broadcastHost(); 
    win.webContents.send("player-list", playersReady);
    win.webContents.send("host-started");
});


ipcMain.on("dismiss-first-launch", (event) => {
    console.log("✅ Received request to dismiss first launch message.");
    firstLaunch = false;
    saveConfig(); 

    event.sender.send("config-data", { batFilePath, playerName, firstLaunch });
});

ipcMain.on("join-host", (event, hostIP, playerName) => {
    console.log(`👥 Joining Host at ${hostIP} as ${playerName}`);
    const socket = ioClient(`http://${hostIP}:${PORT}`);

    socket.emit("player-joined", playerName);

    event.sender.send("player-joined-game");

    ipcMain.on("player-ready", () => {
        console.log(`✅ ${playerName} is Ready!`);
        socket.emit("player-ready", playerName);
    });

    // 🔄 Ensure the client receives the latest player list
    socket.on("player-list", (players) => {
        console.log("👥 Receiving updated player list...");
        win.webContents.send("player-list", players);
    });

    socket.on("start-game", () => {
        console.log("🚀 Game started by the host!");
        launchGame();
    });

    win.webContents.send("joined-game");
});

ipcMain.on("start-game", () => {
    if (isHost) {
        console.log("🎮 Host is starting the game...");
        socketServer.emit("start-game");
        launchGame();
    } else {
        console.log("⚠️ Only the host can start the game!");
    }
});

function launchGame() {
    if (!batFilePath) {
        console.log("❌ No BAT file selected!");
        return;
    }

    console.log(`🚀 Launching BAT file: ${batFilePath}`);
    const batDir = path.dirname(batFilePath);

    exec(`start "" "${batFilePath}"`, { cwd: batDir, shell: true }, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error launching BAT file: ${error.message}`);
            console.error(stderr);
        } else {
            console.log("✅ BAT file launched successfully!");
            console.log(stdout);
        }
    });
}
app.whenReady().then(() => {
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

    if (firstLaunch) {
        console.log("🛠 First Launch Detected - Displaying Setup Popup");
        win.webContents.once("did-finish-load", () => {
            win.webContents.send("show-first-launch-popup");
        });
    }

    console.log("✅ Main Process Loaded!");

    loadConfig();
    listenForHost(); 
});
