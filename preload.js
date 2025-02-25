const { contextBridge, ipcRenderer } = require("electron");

console.log("✅ Preload script loaded successfully!");

contextBridge.exposeInMainWorld("electronAPI", {
    

    dismissFirstLaunch: () => {
        console.log("✅ IPC Sent: dismiss-first-launch");
        ipcRenderer.send("dismiss-first-launch");
    },
    selectBatFile: () => {
        console.log("📂 IPC Sent: select-game-path");
        ipcRenderer.send("select-game-path");
    },

    getConfig: (callback) => {
        console.log("📥 Requesting saved config data...");
        ipcRenderer.send("get-config");
        ipcRenderer.on("config-data", (event, config) => {
            console.log("🔄 Received Config Data:", config);
            callback(config);
        });
    },

    setPlayerName: (name) => {
        console.log(`💾 IPC Sent: set-player-name (${name})`);
        ipcRenderer.send("set-player-name", name);
    },

    setGamePath: (path) => {
        console.log(`💾 IPC Sent: set-game-path (${path})`);
        ipcRenderer.send("set-game-path", path);
    },


    onGamePathSet: (callback) => {
        ipcRenderer.on("game-path-set", (event, path) => {
            console.log(`🎮 Game Path Set: ${path}`);
            callback(path);
        });
    },
    onHostFound: (callback) => {
        ipcRenderer.on("host-found", (event, hostIP) => {
            console.log(`🔍 Host Found at ${hostIP}`);
            callback(hostIP);
        });
    },
    onPlayerListUpdate: (callback) => {
        ipcRenderer.on("player-list", (event, players) => {
            console.log("👥 Player List Updated:", players);
            callback(players);
        });
    },

    startAsHost: (name) => {
        console.log(`🌍 IPC Sent: start-as-host (${name})`);
        ipcRenderer.send("start-as-host", name);
    },
    joinHost: (hostIP, name) => {
        console.log(`👥 IPC Sent: join-host (${hostIP}) as ${name}`);
        ipcRenderer.send("join-host", hostIP, name);
    },
    playerReady: () => {
        console.log("✅ IPC Sent: player-ready");
        ipcRenderer.send("player-ready");
    },
    startGame: () => {
        console.log("🚀 IPC Sent: start-game");
        ipcRenderer.send("start-game");
    },

    onFirstLaunchPopup: (callback) => {
        ipcRenderer.on("show-first-launch-popup", () => {
            console.log("🛠 First Launch Popup Triggered!");
            callback();
        });
    },

    onPlayerJoinedGame: (callback) => {
        ipcRenderer.on("player-joined-game", () => {
            console.log("🔄 Local player has joined the game - hiding 'Join Game' button");
            callback();
        });
    },
    

onHostStarted: (callback) => {
    ipcRenderer.on("host-started", () => {
        console.log("🔥 Host started the game, triggering event...");
        callback();
    });
},

});
