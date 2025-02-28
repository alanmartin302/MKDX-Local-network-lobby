// src/app/ipcHandlers.js
const { ipcRenderer } = require("electron");

const electronAPI = {
  // Let the renderer request to dismiss first launch
  dismissFirstLaunch: () => {
    ipcRenderer.send("dismiss-first-launch");
  },

  // Let the renderer select a .bat file
  selectBatFile: () => {
    ipcRenderer.send("select-game-path");
  },

  // Fetch config
  getConfig: (callback) => {
    ipcRenderer.send("get-config");
    // Listen once for config-data
    ipcRenderer.once("config-data", (event, config) => {
      callback(config);
    });
  },

  setPlayerName: (name) => {
    ipcRenderer.send("set-player-name", name);
  },

  setGamePath: (path) => {
    ipcRenderer.send("set-game-path", path);
  },

  // Listen for path set
  onGamePathSet: (callback) => {
    ipcRenderer.on("game-path-set", (event, path) => {
      callback(path);
    });
  },

  // Host discovery
  onHostFound: (callback) => {
    ipcRenderer.on("host-found", (event, hostIP) => {
      callback(hostIP);
    });
  },

  // Player list updates
  onPlayerListUpdate: (callback) => {
    ipcRenderer.on("player-list", (event, players) => {
      callback(players);
    });
  },

  // Host actions
  startAsHost: (name) => {
    ipcRenderer.send("start-as-host", name);
  },

  joinHost: (hostIP, name) => {
    ipcRenderer.send("join-host", hostIP, name);
  },

  playerReady: () => {
    ipcRenderer.send("player-ready");
  },

  startGame: () => {
    ipcRenderer.send("start-game");
  },

  // First launch popup
  onFirstLaunchPopup: (callback) => {
    ipcRenderer.on("show-first-launch-popup", () => {
      callback();
    });
  },

  onPlayerJoinedGame: (callback) => {
    ipcRenderer.on("player-joined-game", () => {
      callback();
    });
  },

  onHostStarted: (callback) => {
    ipcRenderer.on("host-started", () => {
      callback();
    });
  },
};

module.exports = { electronAPI };
