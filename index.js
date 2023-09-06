var electron = require("electron");
const AutoLaunch = require("auto-launch");

var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var path = require("path");
app.setLoginItemSettings({
  openAtLogin: true,
});
app.on("ready", () => {
  var mainwindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: "favicon.ico",
    frame: true,
    title: "Menuboard",
    fullscreen: false,
    autoHideMenuBar: false,
  });
  mainwindow.openDevTools();
  mainwindow.loadURL("https://www.google.com");
  mainwindow.on("closed", function () {
    mainwindow = null;
  });
});
app.on("window-all-closed", function () {
  if (process.platform != "darwin") app.quit();
});
