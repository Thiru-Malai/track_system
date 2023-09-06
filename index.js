var electron = require("electron");
const AutoLaunch = require("auto-launch");
const { Menu, nativeImage, Tray } = require("electron");
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var path = require("path");
let tray = null;
app.setLoginItemSettings({
  openAtLogin: true,
});

function createTray() {
  const icon = path.join("track_system.png"); // required.
  const trayicon = nativeImage.createFromPath(icon);
  tray = new Tray(trayicon.resize({ width: 106 }));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: () => {
        createWindow();
      },
    },
    {
      label: "Quit",
      click: () => {
        app.quit(); // actually quit the app.
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

let mainWindow;

function createWindow() {
  if (!tray) {
    createTray();
  }

  var mainwindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: "favicon.ico",
    frame: true,
    title: "Menuboard",
    fullscreen: false,
    autoHideMenuBar: false,
    skipTaskbar: true,
  });
  mainwindow.openDevTools();
  mainwindow.loadURL("https://www.google.com");
  mainwindow.on("closed", function () {
    mainwindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  app.dock.hide();
  if (process.platform != "darwin") app.quit();
});
