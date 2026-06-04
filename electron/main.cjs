const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, '../public/favicon.png'),
    title: "As Sagradas Escrituras Originais do Eterno"
  });

  // Load the compiled index.html file
  const indexPath = path.join(__dirname, '../dist/index.html');
  mainWindow.loadFile(indexPath);

  // Disable default menu for a cleaner, premium application feel
  Menu.setApplicationMenu(null);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Create preload.cjs dynamically if needed, or omit if not using node APIs
app.whenReady().then(() => {
  // Write a simple empty preload file
  const fs = require('fs');
  const preloadPath = path.join(__dirname, 'preload.cjs');
  if (!fs.existsSync(preloadPath)) {
    fs.writeFileSync(preloadPath, '// Preload script\n');
  }

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
