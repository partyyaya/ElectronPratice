const {app,BrowserWindow,Tray,Menu} = require('electron')
const path = require('path')
const url = require('url')

/** Please Set To The Top */
if (handleSquirrelEvent()) {
    return;
}

// 保持win对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let win

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    // darwin = MacOS
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 400,
        height: 400,
        maximizable: false
    })

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open DevTools.
    // win.webContents.openDevTools()

    // 將頁面關閉
    win.on('closed', () => {
        win = null
    })

    // 將頁面隱藏
    win.on('minimize', () => {
      win.hide()
    })

     // Create Tray
     createTray()
}

function createTray() {
    let appIcon = null;
    //在這裡只能用ico
    const iconPath = path.join(__dirname,'myicon.ico')
    appIcon = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([{
            label: 'AlarmClock',
            click() {
                win.show()
            }
        },
        {
            label: 'Quit',
            click() {
                win.removeAllListeners('close')
                win.close()
            }
        }
  ]);
  
  //設定哪一個功能在上面
  appIcon.setToolTip('Alarm Clock')
  appIcon.setContextMenu(contextMenu)
}

//在工具列點右鍵時啟動
app.setUserTasks([
    {
      program: process.execPath,
      arguments: '--new-window',
      iconPath: process.execPath,
      iconIndex: 0,
      title: '新窗口',
      description: '創建新窗口'
    }
])

function handleSquirrelEvent() {
    if (process.argv.length === 1) {
        return false;
    }

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function (command, args) {
        let spawnedProcess;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function (args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            spawnUpdate(['--createShortcut', exeName]);
            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-uninstall':

            spawnUpdate(['--removeShortcut', exeName]);
            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            app.quit();
            return true;
    }
}

