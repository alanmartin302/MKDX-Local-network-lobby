// /src/app/networkHandler.js
const dgram = require("dgram");
const os = require("os");

const BROADCAST_PORT = 4444;
let udpClient = null;  // For host discovery
let broadcastInterval = null;
let udpServer = null;  // For broadcasting (if hosting)

/**
 * Returns the local IP address.
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface in interfaces) {
    for (const alias of interfaces[iface]) {
      if (alias.family === "IPv4" && !alias.internal) {
        return alias.address;
      }
    }
  }
  return "127.0.0.1";
}

/**
 * Starts broadcasting the host's IP address.
 */
function broadcastHost() {
  udpServer = dgram.createSocket("udp4");
  udpServer.bind(() => {
    udpServer.setBroadcast(true);
    console.log("Broadcasting host IP...");
    broadcastInterval = setInterval(() => {
      const message = JSON.stringify({
        type: "host-broadcast",
        hostIP: getLocalIP()
      });
      udpServer.send(message, BROADCAST_PORT, "255.255.255.255");
    }, 2000);
  });
}

/**
 * Stops the broadcasting socket.
 */
function stopBroadcast() {
  if (broadcastInterval) clearInterval(broadcastInterval);
  if (udpServer) udpServer.close();
  broadcastInterval = null;
  udpServer = null;
}

/**
 * Listens for host broadcasts and sends them to the renderer.
 * Stores the UDP client so it can be stopped later.
 * @param {BrowserWindow} win 
 */
function listenForHost(win) {
  udpClient = dgram.createSocket("udp4");
  udpClient.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.type === "host-broadcast" && data.hostIP) {
        console.log(`Found Host at ${data.hostIP}`);
        if (win) {
          win.webContents.send("host-found", data.hostIP);
        }
      }
    } catch (err) {
      console.error("Error parsing UDP message:", err);
    }
  });
  udpClient.bind(BROADCAST_PORT);
}

/**
 * Stops the UDP discovery/listening.
 */
function stopDiscovery() {
  if (udpClient) {
    udpClient.close();
    udpClient = null;
    console.log("UDP discovery stopped.");
  }
}

module.exports = {
  broadcastHost,
  stopBroadcast,
  listenForHost,
  stopDiscovery
};
