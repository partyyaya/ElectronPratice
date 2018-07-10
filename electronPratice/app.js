/*
提醒時間：預設當前時間過後 5 秒

nowTime：把當前時間存成全域變數
alarmTime：把提醒時間存成全域變數
*/
const remote = require('electron').remote
const notifier = require('node-notifier')
const moment = require('moment')
const path = require('path')
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
        const msg = "It's " + alarmTime + ". Wake Up!"
        /** const msg = `It's ${alarmTime}. Wake Up!` */
        notice(msg)
    }
}

function notice(msg) {
     /** Show Form */
     const window = remote.getCurrentWindow()
     window.restore()
     window.show()

    /** https://github.com/mikaelbr/node-notifier */
    //在這裡只能用ico
    notifier.notify({
        title: 'Alarm Clock',
        message: msg,
        icon: path.join(__dirname, 'myicon.ico'),
        sound: true,
    })
}

/**
 * Save To Global Variable,
 * Can't Read Dom In Minimize Status.
 * @param {event} event
 */
function onAlarmTextChange(event) {
    alarmTime = event.target.value
}