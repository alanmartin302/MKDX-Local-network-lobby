// /src/modules/network.js
// ---------------------------------------------------------------------
// Optional Network Module for the Renderer Process
// This module sets up any additional network-related listeners or
// client-side network logic. Currently, it demonstrates listening for
// host discovery events and logging them. Contributors can expand this
// module as needed for future network features (e.g., enhanced connectivity,
// fallback mechanisms, etc.).
// ---------------------------------------------------------------------

export function setupNetwork(electronAPI) {
    document.addEventListener("DOMContentLoaded", () => {
      console.log("Network module loaded in the renderer.");
      
      // Example: Listen for host found events and log the host IP
      electronAPI.onHostFound((hostIP) => {
        console.log("Renderer network module: Host found at", hostIP);
        // Future enhancements can go here (e.g., update UI or try reconnection)
      });
    });
  }
  