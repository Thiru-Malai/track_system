const electron = require("electron");
const { Menu, nativeImage, Tray, BrowserWindow, app } = require("electron");
const os = require("os");
const admin = require("firebase-admin");
const path = require("path");

const systemName = os.hostname();
let startTime = null;
let isBackgroundProcessRunning = false;

app.setLoginItemSettings({
  openAtLogin: true,
});

// Initialize Firebase at the beginning of your application
const serviceAccount = require("./track_System_firebase_adminsdk.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://employeemonitoring-eca95-default-rtdb.firebaseio.com/",
});

function setEntryTime() {
  startTime = new Date().toISOString();
  const endTime = "NULL"; // Set this to "NULL" as you indicated

  const db = admin.database();
  const data = {
    [systemName]: {
      start_time: startTime,
      end_time: endTime,
    },
  };

  const ref = db.ref("/times"); // Replace with your database path
  ref.update(data, (error) => {
    if (error) {
      console.error("Error writing to Firebase:", error);
    } else {
      console.log("Data saved successfully.");
    }
  });
}

function createTray() {
  const icon = path.join("track_system.png");
  const trayicon = nativeImage.createFromPath(icon);
  tray = new Tray(trayicon.resize({ width: 106 }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: createWindow,
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
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

  setEntryTime();
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
  if (process.platform !== "darwin") app.quit();
});

app.on("hide", () => {
  isBackgroundProcessRunning = true;
});

app.on("show", () => {
  isBackgroundProcessRunning = false;
});

electron.powerMonitor.on("shutdown", () => {
  if (isBackgroundProcessRunning) {
    const endTime = new Date().toISOString();
    const db = admin.database();
    const data = {
      [systemName]: {
        start_time: startTime,
        end_time: endTime,
      },
    };

    const ref = db.ref("/times"); // Replace with your database path
    ref.update(data, (error) => {
      if (error) {
        console.error("Error writing to Firebase:", error);
      } else {
        console.log("Data saved successfully.");
      }
      app.quit();
    });
  }
});
