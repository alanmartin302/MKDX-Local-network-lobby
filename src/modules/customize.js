// /src/modules/customize.js
export function setupCustomization() {
  function init() {
    console.log("Customization module loaded.");

    // Grab file input elements from the DOM
    const backgroundInput = document.getElementById("backgroundImage");
    const logoInput = document.getElementById("logoImage");
    const createGameImageInput = document.getElementById("createGameImage");
    const joinGameImageInput = document.getElementById("joinGameImage");
    const readyImageInput = document.getElementById("readyImage");
    const startGameImageInput = document.getElementById("startGameImage");

    // Helper function to handle file input events
    function handleFileInput(inputElement, storageKey, elementId) {
      if (!inputElement) return;
      inputElement.addEventListener("change", (event) => {
        let file = event.target.files[0];
        if (file) {
          let reader = new FileReader();
          reader.onload = function (e) {
            localStorage.setItem(storageKey, e.target.result);
            if (elementId === "body") {
              document.body.style.backgroundImage = `url('${e.target.result}')`;
            } else {
              const el = document.getElementById(elementId);
              if (el) el.src = e.target.result;
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Attach file input listeners for each customization option
    handleFileInput(backgroundInput, "backgroundImage", "body");
    handleFileInput(logoInput, "logoImage", "logo");
    handleFileInput(createGameImageInput, "createGameImage", "createGame");
    handleFileInput(joinGameImageInput, "joinGameImage", "joinGame");
    handleFileInput(readyImageInput, "readyImage", "readyButton");
    handleFileInput(startGameImageInput, "startGameImage", "startGame");

    // Apply stored images from localStorage when the page loads
    function applyStoredImages() {
      const bgImage = localStorage.getItem("backgroundImage");
      const logoImage = localStorage.getItem("logoImage");
      const createGameImage = localStorage.getItem("createGameImage");
      const joinGameImage = localStorage.getItem("joinGameImage");
      const readyImage = localStorage.getItem("readyImage");
      const startGameImage = localStorage.getItem("startGameImage");

      if (bgImage) {
        document.body.style.backgroundImage = `url('${bgImage}')`;
      }
      if (logoImage && document.getElementById("logo")) {
        document.getElementById("logo").src = logoImage;
      }
      if (createGameImage && document.getElementById("createGame")) {
        document.getElementById("createGame").src = createGameImage;
      }
      if (joinGameImage && document.getElementById("joinGame")) {
        document.getElementById("joinGame").src = joinGameImage;
      }
      if (readyImage && document.getElementById("readyButton")) {
        document.getElementById("readyButton").src = readyImage;
      }
      if (startGameImage && document.getElementById("startGame")) {
        document.getElementById("startGame").src = startGameImage;
      }
    }
    applyStoredImages();

    // Restore Defaults functionality
    const restoreDefaultsBtn = document.getElementById("restoreDefaults");
    if (restoreDefaultsBtn) {
      restoreDefaultsBtn.addEventListener("click", () => {
        // Set localStorage values to the default paths from your assets folder
        localStorage.setItem("backgroundImage", "assets/background.png");
        localStorage.setItem("logoImage", "assets/mariodxlogo.png");
        localStorage.setItem("createGameImage", "assets/buttons/creategame.jpg");
        localStorage.setItem("joinGameImage", "assets/buttons/joingame.jpg");
        localStorage.setItem("readyImage", "assets/buttons/ready.jpg");
        localStorage.setItem("startGameImage", "assets/buttons/startgame.jpg");

        // Reapply the stored images so the UI updates immediately
        applyStoredImages();
      });
    } else {
      console.error("Restore Defaults button not found in DOM");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
