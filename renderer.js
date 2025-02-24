document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ Renderer loaded!");

    let createGameBtn = document.getElementById("createGame");
    let joinGameBtn = document.getElementById("joinGame");
    let readyButton = document.getElementById("readyButton");
    let startGameBtn = document.getElementById("startGame");
    let playerList = document.getElementById("playerList");

    let settingsIcon = document.getElementById("settingsIcon");
    let settingsMenu = document.getElementById("settingsMenu");
    let settingsPlayerName = document.getElementById("settingsPlayerName");
    let settingsGamePath = document.getElementById("settingsGamePath");
    let selectBatFileBtn = document.getElementById("selectBatFile");
    let saveSettingsBtn = document.getElementById("saveSettings");
    let closeSettingsBtn = document.getElementById("closeSettings");

    let firstUsePopup = document.getElementById("firstUsePopup");
    let closeFirstUsePopupBtn = document.getElementById("closeFirstUsePopup");
    let dontShowAgainCheckbox = document.getElementById("dontShowAgain");

    let foundHostIP = null;
    let isHost = false;
    let hasJoined = false;

    function loadConfigIntoUI() {
        window.electronAPI.getConfig((config) => {
            console.log("🎮 Preloading UI with Config Data:", config);

            if (config.playerName) {
                settingsPlayerName.value = config.playerName;
            }

            if (config.batFilePath) {
                settingsGamePath.textContent = config.batFilePath;
            }

            if (config.firstLaunch) {
                firstUsePopup.style.display = "block";
            } else {
                firstUsePopup.style.display = "none";
            }
        });
    }

    loadConfigIntoUI();

    settingsIcon.addEventListener("click", () => {
        settingsMenu.classList.add("open");
    });

    closeSettingsBtn.addEventListener("click", () => {
        settingsMenu.classList.remove("open");
    });

    selectBatFileBtn.addEventListener("click", () => {
        console.log("📂 Select BAT File button clicked!");
        window.electronAPI.selectBatFile();
    });

    window.electronAPI.onGamePathSet((path) => {
        console.log(`✅ Game Path Selected: ${path}`);

        settingsGamePath.textContent = path;
        window.electronAPI.setGamePath(path);
    });

    saveSettingsBtn.addEventListener("click", () => {
        let newPlayerName = settingsPlayerName.value.trim();
        let newGamePath = settingsGamePath.textContent.trim();

        console.log(`💾 Saving Settings: Name=${newPlayerName}, Path=${newGamePath}`);
        window.electronAPI.setPlayerName(newPlayerName);
        window.electronAPI.setGamePath(newGamePath);

        window.electronAPI.dismissFirstLaunch();

        settingsMenu.classList.remove("open");
    });

    closeFirstUsePopupBtn.addEventListener("click", () => {
        firstUsePopup.style.display = "none";

        if (dontShowAgainCheckbox.checked) {
            console.log("✅ Dismissing first launch message and saving to config.");
            window.electronAPI.dismissFirstLaunch();

            window.electronAPI.getConfig((config) => {
                if (!config.firstLaunch) {
                    firstUsePopup.style.display = "none";
                }
            });
        }
    });

    createGameBtn.addEventListener("click", () => {
        let playerName = settingsPlayerName.value.trim();
        if (!playerName) {
            alert("Please enter your name!");
            return;
        }
        console.log(`🌍 Creating Game as Host: ${playerName}`);
        isHost = true;
        window.electronAPI.startAsHost(playerName);

        createGameBtn.style.display = "none";
        joinGameBtn.style.display = "none";
        readyButton.style.display = "none";
        startGameBtn.style.display = "block";
    });

    joinGameBtn.addEventListener("click", () => {
        let playerName = settingsPlayerName.value.trim();
        if (!playerName) {
            alert("Please enter your name!");
            return;
        }
        console.log(`👥 Joining Host at ${foundHostIP}`);
        window.electronAPI.joinHost(foundHostIP, playerName);

        joinGameBtn.style.display = "none";
        createGameBtn.style.display = "none";

        readyButton.style.display = "block";

        hasJoined = true;
    });

    readyButton.addEventListener("click", () => {
        console.log("✅ Player Ready button clicked!");
        window.electronAPI.playerReady();
        readyButton.disabled = true;
    });

    startGameBtn.addEventListener("click", () => {
        console.log("🚀 Start Game button clicked!");
        window.electronAPI.startGame();
    });

    window.electronAPI.onHostFound((hostIP) => {
        console.log(`🔍 Host found at ${hostIP}`);
        foundHostIP = hostIP;

        if (!isHost) {
            createGameBtn.style.display = "none";

            if (!hasJoined) {
                joinGameBtn.style.display = "block";
            }
        }
    });

    window.electronAPI.onPlayerJoinedGame(() => {
        console.log("✅ Local player has joined the game, updating UI...");

        joinGameBtn.style.display = "none";
        createGameBtn.style.display = "none";

        readyButton.style.display = "block";
    });

    window.electronAPI.onPlayerListUpdate((players) => {
        console.log("👥 Player List Updated:", players);
        playerList.innerHTML = "";
        Object.keys(players).forEach(player => {
            let listItem = document.createElement("li");
            listItem.textContent = `${player} - ${players[player] ? "Ready ✅" : "Not Ready ❌"}`;
            playerList.appendChild(listItem);
        });

        if (isHost && Object.values(players).every(status => status)) {
            startGameBtn.style.display = "block";
        } else {
            startGameBtn.style.display = "none";
        }
    });
});
