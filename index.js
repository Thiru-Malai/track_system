var electron = require("electron");
const AutoLaunch = require("auto-launch");
const { Menu, nativeImage, Tray } = require("electron");
const os = require("os");
const admin = require("firebase-admin");
var path = require("path");
const systemName = os.hostname();
var startTime = new Date().toISOString();
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
let tray = null;
app.setLoginItemSettings({
  openAtLogin: true,
});

function setEntryTime() {
  startTime = new Date().toISOString();
}
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

app.on("before-quit", () => {
  const endTime = new Date().toISOString();
  const data = {
    [systemName]: {
      start_time: startTime,
      end_time: endTime,
    },
  };
  console.log(systemName + "\n" + startTime + "\n" + endTime);
  const ref = db.ref("/times"); // Replace with your database path
  ref.update(data, (error) => {
    if (error) {
      console.error("Error writing to Firebase:", error);
    } else {
      console.log("Data saved successfully.");
    }
    app.quit();
  });
});

app.on("window-all-closed", () => {
  const serviceAccount = require("./track_System_firebase_adminsdk.json"); // Replace with your Firebase credentials file

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://employeemonitoring-eca95-default-rtdb.firebaseio.com/", // Replace with your Firebase Realtime Database URL
  });

  const db = admin.database();
  // console.log(systemName + "\n" + startTime + "\n");
  const endTime = new Date().toISOString();
  const data = {
    [systemName]: {
      start_time: startTime,
      end_time: endTime,
    },
  };
  console.log(systemName + "\n" + startTime + "\n" + endTime);
  const ref = db.ref("/times"); // Replace with your database path
  ref.update(data, (error) => {
    if (error) {
      console.error("Error writing to Firebase:", error);
    } else {
      console.log("Data saved successfully.");
    }
    app.dock.hide();
    if (process.platform != "darwin") app.quit();
  });
});
