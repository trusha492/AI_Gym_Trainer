// frontend/electron.js
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const startUrl = process.env.ELECTRON_START_URL;
  const iconPath = startUrl
    ? path.join(__dirname, "public", "icon-152.png")
    : path.join(__dirname, "dist", "icon-152.png");

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (startUrl) {
    // Dev: load Vite dev server
    win.loadURL(startUrl);
  } else {
    // Prod: load built index.html
    win.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
