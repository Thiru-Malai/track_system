// electron-packager . track_system --platform=win32 --arch=x64

var electron = require("electron");
const AutoLaunch = require("auto-launch");
const { Menu, nativeImage, Tray } = require("electron");
const os = require("os");
const admin = require("firebase-admin");
const systemName = os.hostname();
var startTime = new Date().toISOString();
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
let tray = null;
var data;

var endTime = 0;

//Firebase Settings
const serviceAccount = require("./track_System_firebase_adminsdk.json"); // Replace with your Firebase credentials file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://employeemonitoring-eca95-default-rtdb.firebaseio.com/", // Replace with your Firebase Realtime Database URL
});
const db = admin.database();
const ref = db.ref("/times"); // Replace with your database path

// app.setLoginItemSettings({
//   openAtLogin: true,
// });

function getCurrentDate() {
  let date = new Date().toLocaleDateString("en-IN");
  return date
}

function getCurrentTime() {
  const date = new Date();
  var ISToffSet = 330; //IST is 5:30; i.e. 60*5+30 = 330 in minutes 
  offset = ISToffSet * 60 * 1000;
  var ISTTime = new Date(date.getTime() + offset);
  return (ISTTime).toJSON().substring(11, 19)
}

function setEntryTime() {
  data = {
    [systemName]: {
      start_time: {
        date: getCurrentDate(),
        time: getCurrentTime(),
      },
      end_time: endTime,
      status: 1,
    },
  };
  startTime = data[systemName].start_time
  console.log(startTime)

  ref.update(data, (error) => {
    if (error) {
      console.error("Error writing to Firebase:", error);
    } else {
      console.log("Data saved successfully.");
    }
  });
}

function setEndTime() {
  data = {
    [systemName]: {
      start_time: startTime,
      end_time: {
        date: getCurrentDate(),
        time: getCurrentTime(),
      },
      status: 0,
    },
  };
  endTime = data[systemName].end_time
  console.log(endTime)

  ref.update(data, (error) => {
    if (error) {
      console.error("Error writing to Firebase:", error);
    } else {
      console.log("Data saved successfully.");
    }
  })
}

function setCurrentTime() {
  data = {
    [systemName]: {
      start_time: startTime,
      end_time: endTime,
      status: 1,
      current_time: getCurrentTime(),
    },
  };
  ref.update(data, (error) => {
    if (error) {
      console.error("Error writing to Firebase:", error);
    } else {
      console.log("Data saved successfully.");
    }
  })
}

setInterval(setCurrentTime, 5000);

setEntryTime();

function createTray() {
  const icon = "D:\\Projects\\track_system\\track_system-win32-x64\\resources\\app\\track_system.png"; // required.
  const trayicon = nativeImage.createFromPath(icon);
  tray = new Tray(trayicon.resize({ width: 106 }));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: () => {
        createWindow();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
}

function createWindow() {
  if (!tray) {
    createTray();
  }

  var mainwindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: "favicon.ico",
    frame: true,
    title: "Dashboard",
    fullscreen: false,
    autoHideMenuBar: false,
    skipTaskbar: false,
  });

  mainwindow.loadFile("index.html");
  mainwindow.on("closed", function () {
    mainwindow = null;
  });
}

app.on("ready", () => {
  createWindow()
  let autoLaunch = new AutoLaunch({
    name: 'Track System',
    path: app.getPath('exe'),
  });
  autoLaunch.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLaunch.enable();
  });
});

app.on("before-quit", () => {
  setEndTime()
});

app.on("window-all-closed", () => {
});

process.on('exit', function () {
  setEndTime();
});