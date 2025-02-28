// /src/renderer.js
console.log("✅ Renderer loaded!");

// Import our modular functionality using ES module syntax
import { setupUIListeners } from "./modules/ui.js";
import { setupCustomization } from "./modules/customize.js";
import { setupNetwork } from "./modules/network.js";

// Initialize modules after the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const api = window.electronAPI;
  setupUIListeners(api);
  setupCustomization();
  setupNetwork(api);
});
