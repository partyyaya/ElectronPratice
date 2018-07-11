## Electron

- #### <a href="#e1">基礎功能</a>
- #### <a href="#e2">撰寫通知程序</a>
- #### <a href="#e3">系統顯示在系統匣(工作列右方)</a>
- #### <a href="#e4">畫面縮小時隱藏</a>
- #### <a href="#e5">提醒的時候顯示表單</a>
- #### <a href="#e6">程式編譯 exe 執行檔</a>
- #### <a href="#e7">程式封裝 安裝檔</a>

#### <a id="e1" href="#top">基礎功能</a>

- 初始化設定 :
    - 用 cmd 進入專案資料夾
    - npm init :　初始化設定package.json
    - 安裝 electron：npm install --save--dev electron
- 修改 package.json : 就可以用 npm start 執行 electron
```
"scripts": {
    "start": "electron ."
},
```
- 設定主程序 main.js
```javascript
const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

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

    // When Window Close.
    win.on('closed', () => {
        win = null
    })

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


```

- 建立 index.html
```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Electron</title>
    </head>
    <body>
        <h1>Hello Electron</h1>
        <p>Node Version:
            <script>document.write(process.versions.node)</script>
        </p>
        <p>Chrome Version:
            <script>document.write(process.versions.chrome)</script>
        </p>
        <p>Electron Version:
            <script>document.write(process.versions.electron)</script>
        </p>
        <hr>
        <div class="now-time"></div>
        <input type="text" class="alarm-time">
        <script src="app.js"></script>
    </body>
</html>
```
- 安裝 moment.js 方便時間操作 : npm install moment --save
- 建立 app.js
```javascript
const moment = require('moment')
const elNow = document.querySelector('.now-time')
const elAlarm = document.querySelector('.alarm-time')
elAlarm.addEventListener('change', onAlarmTextChange)

let time = moment()

let nowTime
let alarmTime

/** Set Time */
const now = moment(time).format('HH:mm:ss')
nowTime = now
elNow.innerText = now

const alarm = moment(time).add(5, 'seconds').format('HH:mm:ss')
alarmTime = alarm
elAlarm.value = alarm

timer()

/** 持續更新現在時間 */
function timer() {
    time = moment().format('HH:mm:ss')

    /** Set Now */
    nowTime = time
    elNow.innerText = time

    check();

    setTimeout(() => {
        timer()
    }, 1000)
}

/** Check Time */
function check() {
    //一樣輸出0 不一樣輸出1 
    const diff = moment(nowTime, 'HH:mm:ss').diff(moment(alarmTime, 'HH:mm:ss'))
    if (diff === 0) {
        alert('wake up!')
    }
}

function onAlarmTextChange(event) {
    alarmTime = event.target.value
}
```
#### <a id="e2" href="#top">撰寫通知程序</a>

- 安裝  node-notifier : npm install node-notifier --save
- 修改 app.js
```javascript
//引入
const notifier = require('node-notifier')

//修改
/** Check Time */
function check() {
    const diff = moment(nowTime, 'HH:mm:ss').diff(moment(alarmTime, 'HH:mm:ss'))
    if (diff === 0) {
        const msg = "It's " + alarmTime + " . Wake Up!"
        /** const msg = `It's ${alarmTime}. Wake Up!` */
        notice(msg)
    }
}

function notice(msg) {
    /** https://github.com/mikaelbr/node-notifier */
    notifier.notify({
        title: 'Alarm Clock',
        message: msg,
        icon: path.join(__dirname, 'clock.ico'),
        sound: true,
    })
}
```

#### <a id="e3" href="#top">系統顯示在系統匣(工作列右方)</a>

- 需要使用 :　menu , tray
```javascript
//引入
const {app,BrowserWindow,Tray,Menu} = require('electron')

function createWindow() {

    // ...

    // Create Tray
    createTray()
}

function createTray() {
    let appIcon = null
    const iconPath = path.join(__dirname, 'clock.ico')

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
    appIcon = new Tray(iconPath)

    //設定哪一個功能在上面
    appIcon.setToolTip('Alarm Clock')
    appIcon.setContextMenu(contextMenu)
}
```
#### <a id="e4" href="#top">畫面縮小時隱藏</a>
- 在 app.js 增加
```javascript
function createWindow() {
    // ...

    // When Window Minimize
    win.on('minimize', () => {
        win.hide()
    })

    // Create Tray
    createTray()
}
```

#### <a id="e5" href="#top">提醒的時候顯示表單</a>

- 在隱藏起來,用提醒來跳出表單
- 需要用到 remote，才能從渲染層到主程式 main.js 進行通訊。
- 在 app.js 增加
```javascript
/*
當觸發 notice 的時候，利用 getCurrentWindow 取得當前表單
這裡的 window.show() 等於從 main.js 進行 win.show()
*/
//引入
const remote = require('electron').remote

//修改
function notice(msg) {
    /** Show Form */
    const window = remote.getCurrentWindow()
    window.restore()
    window.show()

    /** https://github.com/mikaelbr/node-notifier */
    notifier.notify({
        title: 'Alarm Clock',
        message: msg,
        icon: path.join(__dirname, 'clock.png'),
        sound: true,
    })
}
```

#### <a id="e6" href="#top">程式編譯 exe 執行檔</a>

- 將程式編譯成 exe，我們使用 electron-packager
- npm install electron-packager --save
- 修改 package.json
```
 "scripts": {
    "start": "electron .",
    "build": "electron-packager . AlarmClock 
            --out AlarmClock 
            --overwrite 
            --platform=win32 
            --arch=x64 
            --icon=clock.ico 
            --prune=true 
            --squirrel-install 
            --ignore=node_modules/electron-* 
            --electron-version=1.7.9 
            --ignore=AlarmClock-win32-x64 
            --version-string.CompanyName=cgh 
            --version-string.ProductName=AlarmClock",
  },
```
- 說明 : 
    - electron-packager . AlarmClock：把當前目錄 . 打包起來，並將應用程式命名 AlarmClock
    - --out AlarmClock：輸出資料夾於 AlarmClock，產出後預設資料夾為 AlarmClock-win32-x64
    - --overwrite：如果已經存在資料夾和檔案，會進行覆寫
    - --platform=win32：平台為 Windows（Mac: darwin, Linux: linux）
    - --arch=x64：應用程式 64位元（ia32, all）
    - --icon=clock.ico：應用程式 ICON
    - --ignore=node_modules/electron-*：忽略的檔案
    - --electron-version=1.7.9：electron 的核心版本
    - --version-string.CompanyName=Robby：軟體公司名稱（顯示於軟體資訊中）
    - --version-string.ProductName=AlarmClock：軟體名稱（顯示於軟體資訊中）
- 編譯看看 : npm run build

#### <a id="e7" href="#top">程式封裝 安裝檔</a>
- 將程式封裝變成安裝版的一個套件 grunt-electron-installer
- 由於該封裝工具是透過 grunt 運行，所以一併安裝
- npm install --save-dev grunt
- npm install --save-dev grunt-electron-installer
- 建立 Gruntfile.js
```javascript
var grunt = require('grunt');
grunt.config.init({
    pkg: grunt.file.readJSON('./AlarmClock/package.json'),
    'create-windows-installer': {
        ia32: {
            appDirectory: './AlarmClock/AlarmClock-win32-x64',
            outputDirectory: './AlarmClock/installer64',
            authors: 'mingming',
            title: 'AlarmClock',
            exe: 'AlarmClock.exe',
            description: 'alarm clock',
            noMsi: true,
            loadingGif: 'myicon.ico',
            setupIcon: 'myicon.ico',
            icon: 'myicon.ico',
        }
    }
})

grunt.loadNpmTasks('grunt-electron-installer');
grunt.registerTask('default', ['create-windows-installer']);
```
- 說明 : 
    - AlarmClock/package.json：等等在輸出的 AlarmClock 資料夾中 放置這個檔案
    - create-windows-installer：grunt 的任務名稱
    - appDirectory: 檔案來源（需先使用 electron-packager 做出執行檔）
    - outputDirectory: 輸出資料夾
    - authors: 作者
    - title: 應用程式標題
    - exe: 應用程式名稱
    - description: 應用程式描述（可忽略）
    - noMsi: 是否提供MIS檔（可忽略，預設 true）
    - loadingGif: 執行時的圖片（可忽略）
    - setupIcon: 安裝階段時的圖片（可忽略）
    - icon: ICON圖片
- 並在輸出資料夾建立 package.json 檔
- package.json
```
{
  "name": "AlarmClock",
  "version": "1.0.0"
}
```
- 在根目錄 package.json 新增
```
"scripts": {
    "start": "electron .",
    "build": "electron-packager . AlarmClock --out AlarmClock --overwrite --icon=./myicon.ico --platform=win32 --arch=x64  --prune=true --squirrel-install --ignore=node_modules/electron-* --electron-version=2.0.2 --ignore=AlarmClock-win32-x64 --version-string.CompanyName=cgh --version-string.ProductName=AlarmClock",
    "pack": "grunt"
},
```
- 開始封裝檔案 : npm run pack
- 如出現 Done 代表封裝完成
- 安裝完路徑 : C:\Users\ { 用戶名稱 } \AppData\Local\electron-alarm-clock

#### 建立桌面捷徑
- 避免程式有權限的問題，預設都是安裝在 AppData / Local，
- 由於透過封裝的方式安裝，會發現程式的路徑太長了。
- 可以在程式安裝階段進行捷徑的建立，並且在移除階段自動地將捷徑刪除。
- 於根目錄 main.js 進行新增
```javascript
/** Please Set To The Top */
if (handleSquirrelEvent()) {
    return;
}

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
```
- 這個方式是利用 windows-installer，
- 它已經被封裝在 electron-packager，因此不需要另外安裝，直接調用即可 

- #### 參考網址 : https://dotblogs.com.tw/explooosion/2018/03/25/181604#2
