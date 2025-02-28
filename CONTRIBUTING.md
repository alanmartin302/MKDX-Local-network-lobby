# 🛠️ Contributing to MKDX Local Multiplayer Lobby

Thank you for your interest in contributing! We welcome all contributions—whether it's **reporting issues, suggesting new features, improving documentation, or submitting code changes**.

---

## 🔧 How to Contribute

### 1️⃣ Fork & Clone the Repository
Click **Fork** on the GitHub repository.  
Clone your fork locally:

```sh
git clone https://github.com/alanmartin302/MKDX-Local-network-lobby.git
cd MKDX-Local-network-lobby
```
2️⃣ Create a New Branch
Always create a separate branch for your changes:

```sh
Copy
git checkout -b feature-name
```
3️⃣ Make Changes & Commit
Make your modifications.
Stage and commit changes:

```sh
Copy
git add .
git commit -m "Added feature XYZ"
```
4️⃣ Push to Your Fork
Push your changes to your forked repository:

```sh
Copy
git push origin feature-name
```
5️⃣ Open a Pull Request (PR)

Go to the original repository on GitHub.

Click Pull Requests → New Pull Request.

Select your branch and submit the PR with a clear description.

✅ Guidelines for Contributions

Code Style: Follow the project’s existing structure and style.

Commit Messages: Use clear, concise commit messages.

Documentation: If your changes are significant, document them (e.g., in the README or code comments).

Backward Compatibility: Ensure your feature or bug fix doesn’t break existing functionality.

Communication: If your change is major, open an issue first to discuss it.

🏗 Adding New Modules
The project now has a modular structure for easy scalability. Each module focuses on a single responsibility (e.g., UI, network, customization, etc.).

Where to Place New Modules
Front-End (Renderer) Modules: Place new scripts in /src/modules/ for client-side code.

Example: If you’re adding a chat feature, create /src/modules/chat.js.
Import your module in /src/renderer.js:
```js
Copy
import { setupChat } from "./modules/chat.js";

document.addEventListener("DOMContentLoaded", () => {
  setupChat();
});
```
Main Process (Electron) Modules: If your feature requires back-end logic or IPC handlers, you can place new scripts in /src/app/.

Example: /src/app/chatHandler.js for host/client socket logic, imported by main.js if needed.

How to Integrate a New Module

Create the module file (e.g., chat.js) in the appropriate folder (/src/modules or /src/app).

Export the functions you need (e.g., export function setupChat() { ... }).

Import and initialize it in renderer.js (for front-end logic) or main.js (for Electron’s main process).

Follow the existing code style: keep each module focused on one responsibility.

🏎 Example: Adding a Chat Module

Create /src/modules/chat.js:

```js
Copy
// /src/modules/chat.js
export function setupChat() {
  console.log("Chat module loaded!");
  // e.g., set up chat UI elements, event listeners, etc.
}
Import & Initialize in /src/renderer.js:

js
Copy
// /src/renderer.js
import { setupChat } from "./modules/chat.js";

document.addEventListener("DOMContentLoaded", () => {
  setupChat();
});
```
(Optional) If you need to communicate with the main process or sockets:

Add a new handler in /src/app/ (e.g., chatHandler.js).
Use ipcMain and ipcRenderer or Socket.IO for real-time communication.

🐞 Reporting Bugs
If you find a bug, please open an issue and include:

Steps to reproduce the issue
Expected behavior
Screenshots (if applicable)
System details (OS, game version, etc.)

📩 Open an Issue
For bug reports or questions, open an issue on GitHub. Provide as much detail as possible to help us resolve it quickly.

🎯 Feature Requests
If you have ideas for new features, submit an issue with:

A clear description of the feature
Why it would be useful
Any implementation ideas
💬 Need Help?
If you have any questions, feel free to ask in:

Discussions tab on GitHub
Issues section for technical problems

🎉 Thank You!
Your contributions make this project better! 🚀
We appreciate your time and effort in improving MKDX Local Multiplayer Lobby. 🏎️💨
