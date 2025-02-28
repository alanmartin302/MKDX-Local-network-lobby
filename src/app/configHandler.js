// /src/app/configHandler.js
const fs = require("fs");
const path = require("path");

/**
 * Returns the path to config.ini.
 * If the app is packaged, the config is assumed to be in the resources path.
 * Otherwise, it is assumed to be in the root of the project.
 */
function getConfigPath(isPackaged) {
  return isPackaged
    ? path.join(process.resourcesPath, "config.ini")
    : path.join(__dirname, "../config.ini"); // Adjust if your config.ini is located elsewhere
}

/**
 * Loads the configuration from config.ini.
 * Returns an object with playerName, batFilePath, and firstLaunch (boolean).
 */
function loadConfig(configPath) {
  console.log(`🔍 Checking for config.ini at: ${configPath}`);
  
  if (!fs.existsSync(configPath)) {
    console.log("⚙️ Creating default config.ini...");
    const defaultConfig = `[Settings]
playerName=Player1
batFilePath=C:\\path\\to\\your\\game.bat
firstLaunch=true

# Edit values above and restart the app to apply changes.
`;
    fs.writeFileSync(configPath, defaultConfig, "utf-8");
  }

  const configData = fs.readFileSync(configPath, "utf-8");
  let playerName = "Player1";
  let batFilePath = "";
  let firstLaunch = true;

  // Parse the config file line by line
  configData.split("\n").forEach((line) => {
    if (line.startsWith("playerName=")) {
      playerName = line.replace("playerName=", "").trim();
    } else if (line.startsWith("batFilePath=")) {
      batFilePath = line.replace("batFilePath=", "").trim();
    } else if (line.startsWith("firstLaunch=")) {
      firstLaunch = line.replace("firstLaunch=", "").trim() === "true";
    }
  });

  console.log(`✅ Loaded Config: Player="${playerName}", BAT="${batFilePath}", First Launch=${firstLaunch}`);
  return { playerName, batFilePath, firstLaunch };
}

/**
 * Saves the provided configuration to config.ini.
 * @param {string} configPath - Path to the config.ini file.
 * @param {string} playerName - The player name.
 * @param {string} batFilePath - The BAT file path.
 * @param {boolean} firstLaunch - Whether it's the first launch.
 */
function saveConfig(configPath, playerName, batFilePath, firstLaunch) {
  console.log("💾 Saving config.ini...");
  const newConfig = `[Settings]
playerName=${playerName}
batFilePath=${batFilePath}
firstLaunch=${firstLaunch ? "true" : "false"}

# Edit values above and restart the app to apply changes.
`;
  fs.writeFileSync(configPath, newConfig, "utf-8");
  console.log("✅ Config successfully saved!");
}

module.exports = {
  getConfigPath,
  loadConfig,
  saveConfig
};
