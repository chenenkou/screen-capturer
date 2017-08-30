'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
// 托盘
const Tray = electron.Tray
// 托盘菜单
const Menu = electron.Menu
// 托盘的变量
let appTray = null

const platform = {
  OSX: process.platform === 'darwin',
  Windows: process.platform === 'win32',
  Linux: process.platform === 'linux'
}

// 同一时刻最多只会有一个实例
const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.showInactive();
      mainWindow.focus()
  }
});

if (shouldQuit) {
  app.quit()
}

let iconExt = ''
if (platform.OSX) {
  // iconExt = 'icns'
  iconExt = 'png'
} else if (platform.Windows) {
  iconExt = 'ico'
} else if (platform.Linux) {
  iconExt = 'png'
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null,
  subWindow = null,
  fs = require('fs'),
  // globalShortcut = require('global-shortcut'),
  globalShortcut = electron.globalShortcut,
  clipboard = require('electron').clipboard,
  ipc = require('electron').ipcMain;
  
// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 92, height: 36, 
    resizable: false, 
    frame: false,
    alwaysOnTop: true,
    //fullscreen: true,
    //skipTaskbar: true
    icon: `${__dirname}/icons/icon.${iconExt}`
  });
  
  //add shortcut
  globalShortcut.register('ctrl+shift+q', function () {
    mainWindow.webContents.send('global-shortcut-quit', 1);
  });
  globalShortcut.register('ctrl+shift+c', function () {
    mainWindow.webContents.send('global-shortcut-capture', 1);
  });
  
  
  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  let trayIcon = `${__dirname}/icons/icon.${iconExt}`
  appTray = new Tray(trayIcon)

  let contextMenu = Menu.buildFromTemplate([
    {
      label: '打开主面板',
      click: function () {
        mainWindow.show();
      }
    },
    {
      label: '退出',
      click: function () {
        mainWindow.close();
        mainWindow = null;
        app.quit();
      }
    }
  ]);
  appTray.setToolTip(`截屏小工具`);
  appTray.setContextMenu(contextMenu);
  // appTray.displayBalloon({title: '截屏小工具', content: '启动中'});
  appTray.on("click", function () {
    mainWindow.show();
  });
  
  ipc.on('close', function () {
    app.quit()
  })

  ipc.on('hide', function () {
    mainWindow.hide()
  })
  
  ipc.on('create-sub-window', function (e, wh) {
    subWindow = new BrowserWindow({width: wh[0], height: wh[1], fullscreen: true, resizable: false, skipTaskbar: true, frame: false, alwaysOnTop: true})
    //subWindow.webContents.openDevTools()
    subWindow.loadURL('file://' + __dirname + '/sub.html')
    mainWindow.hide()
  })

  ipc.on('minimize-window', function () {
    mainWindow.minimize()
  })
  
  ipc.on('close-subwindow', function () {
    subWindow.close()
    mainWindow.show()
  })
  
  ipc.on('cut', function (e, arg) {
    subWindow.capturePage(arg, function (image) {
      clipboard.writeImage(image)
      subWindow.close()
      mainWindow.show()
    })
  })
  
  ipc.on('save-to-fs', function (e, arg) {
    subWindow.capturePage(arg, function (image) {
      subWindow.setAlwaysOnTop(false)
      let filename = '屏幕截图' + getCurentDate() + '.png'
      dialog.showSaveDialog({title: '请选择保存路径', defaultPath: filename, filters: [
        { name: 'Images', extensions: ['png'] }
      ]}, function (p) {
        if (!p) {
          subWindow.close()
          mainWindow.show()
          return false
        }
        fs.writeFile(p, image.toPng(), function () {
          subWindow.close()
          mainWindow.show()
        })
      })
    })
  })
});

function getCurentDate()
{ 
    var now = new Date();
   
    var year = now.getFullYear();       //年
    var month = now.getMonth() + 1;     //月
    var day = now.getDate();            //日
   
    var hh = now.getHours();            //时
    var mm = now.getMinutes();          //分
    var ss = now.getSeconds();          //秒
   
    var clock = year
   
    if(month < 10)
        clock += "0"
   
    clock += month
   
    if(day < 10)
        clock += "0"
       
    clock += day
   
    if(hh < 10)
        clock += "0"
       
    clock += hh
    if (mm < 10) clock += '0' 
    clock += mm
    clock += ss
    return(clock)
} 