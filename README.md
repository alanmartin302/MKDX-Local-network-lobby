# MKDX Local Network Lobby

## 🎮 About
MKDX Local Network Lobby is a simple **local multiplayer lobby system** for Mario Kart DX. It allows players to **host** or **join a game** over a LAN connection and manage their **game settings** with an easy-to-use UI.

## 🚀 Features
- **Local Multiplayer Lobby** – Players can join and create games on the same network.
- **Player Ready System** – Players can mark themselves as ready before the game starts.
- **Game Launching** – The host can launch the game for all players.
- **Settings Menu** – Easily configure player name and game path.
- **Automatic Host Discovery** – Clients automatically find the host on the network.

## 🛠 Installation
1. **Download & Install Node.js** (if not installed) from [nodejs.org](https://nodejs.org/).
2. Clone or download this repository:
   ```sh
   git clone https://github.com/alanmartin302/MKDX-Local-network-lobby.git
   ```
3. Open the project folder and install dependencies:
   ```sh
   npm install
   ```
4. Start the application:
   ```sh
   npm start
   ```
Note you will need to add the following images to the asset folder

background.jpg
icon.png
mariodxlogo,png

## 🎮 How to Use
### 1️⃣ Setting Up
- Open the app and **set your player name**.
- Select the **game BAT file** path in settings.
- Click **Save**.

### 2️⃣ Joining a Game
- Wait for the app to detect a **host** or manually enter the IP.
- Click **Join Game**.
- Click **I'm Ready** when ready.

### 3️⃣ Hosting a Game
- Click **Create Game**.
- Wait for players to join.
- When all players are ready, click **Start Game**.

## 🔧 Configuration
MKDX Local Network Lobby uses a simple **config.ini** file to store user settings.

📌 **Config File Location**  
```
MKDX-Local-network-lobby/config.ini
```
⚙ **Example Config.ini**
```
[Settings]
playerName=Player1
batFilePath=C:\path\to\your\game.bat
firstLaunch=false
```
- `playerName` → Sets the display name in the lobby.
- `batFilePath` → Path to the game’s launch script (BAT file).
- `firstLaunch` → `true` shows the first-use popup, `false` disables it.

## ❓ Troubleshooting
❌ **Game Doesn't Start?**  
✔ Make sure you've selected the correct **game BAT file** in **Settings**.  
✔ Check **firewall settings** (ensure the app is allowed).  
✔ Restart the app and check **Windows Defender Firewall** settings.

❌ **Players Can't See Each Other?**  
✔ Ensure all players are on the **same local network**.  
✔ Restart the app and try again.

❌ **Join Button Not Hiding?**  
✔ Each player must **click "Join Game"** themselves. The button hides **only for the player who clicked it**.

## 📜 License
This project is licensed under the **GPL-3.0 license**. See [LICENSE](LICENSE) for details.

## 🔮 Future Features
- 🔥 **Voice Chat Integration** – Talk to players in the lobby.
- 🔥 **LAN Game Detection Enhancements** – Improve host discovery reliability.
- 🔥 **Auto-Detect Game Path** – Automatically locate the MKDX executable.

## 🤝 Contributing
Pull requests are welcome! If you find a bug or have a feature request:  
📌 **Open an issue** on GitHub. Fork the repo, make changes, and submit a pull request.

🌟 **Credits** Developed by Alan Martin. Inspired by the **Mario Kart Arcade GP DX** community. 🚀

Disclaimer: This project, MKDX Local Network Lobby, is an unofficial fan project and is not affiliated with, endorsed by, or sponsored by Nintendo. Mario Kart and all related trademarks are owned by Nintendo Co., Ltd. This project does not distribute or include any copyrighted game assets or files. It is intended for personal use and experimentation within the bounds of fair use.
