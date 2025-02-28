// /src/modules/ui.js

// Flags to track the user's lobby status
let isHost = false;
let hasJoined = false;
let foundHostIP = null; // Store the latest discovered host IP

export function setupUIListeners(electronAPI) {
  // Initialization function: attach event listeners and update UI elements
  function init() {
    console.log("Renderer loaded via ui.js!");

    // Grab UI elements
    const createGameBtn = document.getElementById("createGame");
    const joinGameBtn = document.getElementById("joinGame");
    const readyButton = document.getElementById("readyButton");
    const startGameBtn = document.getElementById("startGame");
    const settingsIcon = document.getElementById("settingsIcon");
    const settingsMenu = document.getElementById("settingsMenu");
    const settingsPlayerName = document.getElementById("settingsPlayerName");
    const settingsGamePath = document.getElementById("settingsGamePath");
    const selectBatFileBtn = document.getElementById("selectBatFile");
    const saveSettingsBtn = document.getElementById("saveSettings");
    const closeSettingsBtn = document.getElementById("closeSettings");
    const customizeButton = document.getElementById("customizeButton");
    const customizeMenu = document.getElementById("customizeMenu");
    const saveCustomizeBtn = document.getElementById("saveCustomize");
    const closeCustomizeBtn = document.getElementById("closeCustomize");
    const firstUsePopup = document.getElementById("firstUsePopup");
    const closeFirstUsePopupBtn = document.getElementById("closeFirstUsePopup");
    const dontShowAgainCheckbox = document.getElementById("dontShowAgain");

    // Image file inputs
    const backgroundInput = document.getElementById("backgroundImage");
    const logoInput = document.getElementById("logoImage");
    const createGameImageInput = document.getElementById("createGameImage");
    const joinGameImageInput = document.getElementById("joinGameImage");
    const readyImageInput = document.getElementById("readyImage");
    const startGameImageInput = document.getElementById("startGameImage");

    // Settings menu event handlers
    settingsIcon.addEventListener("click", () => {
      settingsMenu.classList.add("open");
    });
    closeSettingsBtn.addEventListener("click", () => {
      settingsMenu.classList.remove("open");
    });
    customizeButton.addEventListener("click", () => {
      customizeMenu.classList.add("open");
    });
    closeCustomizeBtn.addEventListener("click", () => {
      customizeMenu.classList.remove("open");
    });

    selectBatFileBtn.addEventListener("click", () => {
      console.log("Select BAT File button clicked!");
      electronAPI.selectBatFile();
    });

    saveSettingsBtn.addEventListener("click", () => {
      const newPlayerName = settingsPlayerName.value.trim();
      const newGamePath = settingsGamePath.textContent.trim();
      if (!newPlayerName) {
        alert("Please enter your name!");
        return;
      }
      console.log(`Saving Settings: Name=${newPlayerName}, Path=${newGamePath}`);
      electronAPI.setPlayerName(newPlayerName);
      electronAPI.setGamePath(newGamePath);
      electronAPI.dismissFirstLaunch();
      settingsMenu.classList.remove("open");
    });

    closeFirstUsePopupBtn.addEventListener("click", () => {
      firstUsePopup.style.display = "none";
      if (dontShowAgainCheckbox.checked) {
        console.log("Dismissing first launch popup permanently.");
        electronAPI.dismissFirstLaunch();
      }
    });

    // File input handler for theme images
    function handleFileInput(inputElement, storageKey, elementId) {
      inputElement.addEventListener("change", (event) => {
        let file = event.target.files[0];
        if (file) {
          let reader = new FileReader();
          reader.onload = function (e) {
            localStorage.setItem(storageKey, e.target.result);
            if (elementId === "body") {
              document.body.style.backgroundImage = `url('${e.target.result}')`;
            } else {
              let element = document.getElementById(elementId);
              if (element) element.src = e.target.result;
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
    handleFileInput(backgroundInput, "backgroundImage", "body");
    handleFileInput(logoInput, "logoImage", "logo");
    handleFileInput(createGameImageInput, "createGameImage", "createGame");
    handleFileInput(joinGameImageInput, "joinGameImage", "joinGame");
    handleFileInput(readyImageInput, "readyImage", "readyButton");
    handleFileInput(startGameImageInput, "startGameImage", "startGame");

    // Game action buttons
    createGameBtn.addEventListener("click", () => {
      const playerName = settingsPlayerName.value.trim();
      if (!playerName) {
        alert("Please enter your name!");
        return;
      }
      console.log(`Creating game as Host: ${playerName}`);
      isHost = true;
      hasJoined = true;
      electronAPI.startAsHost(playerName);
      createGameBtn.style.display = "none";
      joinGameBtn.style.display = "none";
      readyButton.style.display = "none";
      // For the host, always show the Start Game button immediately.
      startGameBtn.style.display = "block";
    });

    joinGameBtn.addEventListener("click", () => {
      const playerName = settingsPlayerName.value.trim();
      if (!playerName) {
        alert("Please enter your name!");
        return;
      }
      console.log("Joining game...");
      isHost = false;
      hasJoined = true;
      // Use the discovered host IP if available; otherwise, fallback (e.g., 127.0.0.1)
      electronAPI.joinHost(foundHostIP || "127.0.0.1", playerName);
      joinGameBtn.style.display = "none";
      createGameBtn.style.display = "none";
      readyButton.style.display = "block";
      startGameBtn.style.display = "none";
    });

    readyButton.addEventListener("click", () => {
      console.log("Player ready clicked");
      electronAPI.playerReady();
      readyButton.disabled = true;
    });

    startGameBtn.addEventListener("click", () => {
      console.log("Start game clicked");
      electronAPI.startGame();
    });

    // Load stored images from localStorage
    function applyStoredImages() {
      let bgImage = localStorage.getItem("backgroundImage");
      let logoImage = localStorage.getItem("logoImage");
      let createGameImage = localStorage.getItem("createGameImage");
      let joinGameImage = localStorage.getItem("joinGameImage");
      let readyImage = localStorage.getItem("readyImage");
      let startGameImage = localStorage.getItem("startGameImage");
      if (bgImage) document.body.style.backgroundImage = `url('${bgImage}')`;
      if (logoImage) document.getElementById("logo").src = logoImage;
      if (createGameImage) document.getElementById("createGame").src = createGameImage;
      if (joinGameImage) document.getElementById("joinGame").src = joinGameImage;
      if (readyImage) document.getElementById("readyButton").src = readyImage;
      if (startGameImage) document.getElementById("startGame").src = startGameImage;
    }
    applyStoredImages();

    // Load config into UI
    electronAPI.getConfig((config) => {
      console.log("Preloading UI with config data:", config);
      if (config.playerName) settingsPlayerName.value = config.playerName;
      if (config.batFilePath) settingsGamePath.textContent = config.batFilePath;
      firstUsePopup.style.display = config.firstLaunch === "true" ? "block" : "none";
    });

    // IPC event listeners for host discovery & lobby updates
    electronAPI.onHostFound((hostIP) => {
      console.log("Host found at", hostIP);
      // Update the global foundHostIP variable.
      foundHostIP = hostIP;
      // If the user hasn't joined yet, show the Join Game button.
      if (!hasJoined) {
        createGameBtn.style.display = "none";
        joinGameBtn.style.display = "block";
      }
    });

    electronAPI.onPlayerJoinedGame(() => {
      console.log("Player joined game");
      // Once joined, hide both Create and Join buttons, and show the Ready button.
      joinGameBtn.style.display = "none";
      createGameBtn.style.display = "none";
      readyButton.style.display = "block";
    });

    electronAPI.onPlayerListUpdate((players) => {
      console.log("Player list update:", players);
      const playerList = document.getElementById("playerList");
      if (playerList) {
        playerList.innerHTML = "";
        Object.keys(players).forEach((player) => {
          let listItem = document.createElement("li");
          listItem.textContent = `${player} - ${
            players[player] ? "Ready ✅" : "Not Ready ❌"
          }`;
          playerList.appendChild(listItem);
        });
      }
      // For the host, always display the Start Game button.
      if (isHost) {
        startGameBtn.style.display = "block";
      } else {
        startGameBtn.style.display = "none";
      }
    });
  }

  // Run initialization immediately if the document is already ready,
  // otherwise attach the event listener.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
