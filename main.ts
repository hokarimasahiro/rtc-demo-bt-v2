function 時間更新 () {
	
}
function 着信表示 (時間: number, 電話番号: number) {
    led.plot(1, 0)
    led.plot(2, 0)
    led.plot(3, 0)
    led.plot(0, 1)
    led.plot(4, 1)
    led.plot(2, 2)
    led.plot(1, 3)
    led.plot(3, 3)
    led.plot(0, 4)
    led.plot(1, 4)
    led.plot(2, 4)
    led.plot(3, 4)
    led.plot(4, 4)
    pins.digitalWritePin(DigitalPin.P1, 1)
    basic.pause(時間)
    pins.digitalWritePin(DigitalPin.P1, 0)
    basic.pause(1000)
    basic.clearScreen()
}
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    受信文字 = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
})
function コマンド処理 () {
    if (コマンド == "s") {
        datetimeA = 受信文字.substr(2, 100).split(",")
        datetime = [parseFloat(datetimeA[0]), parseFloat(datetimeA[1]), parseFloat(datetimeA[2]), parseFloat(datetimeA[3]), parseFloat(datetimeA[4]), parseFloat(datetimeA[5]), parseFloat(datetimeA[6])]
        // datetime = split.splitNum(受信文字.substr(2, 100))
        rtc.setClockArray(datetime)
        時刻表示(false)
    } else if (コマンド == "a") {
        pins.analogPitch(parseFloat(受信文字.split(",")[1]), parseFloat(受信文字.split(",")[2]))
    } else if (コマンド == "v") {
        着信表示(parseFloat(受信文字.split(",")[1]), parseFloat(受信文字.split(",")[2]))
    }
    受信文字 = ""
}
function 表示方向 () {
    if (input.rotation(Rotation.Pitch) <= -40) {
        watchfont.setRotatation(rotate.under)
    } else {
        watchfont.setRotatation(rotate.top)
    }
    if (input.rotation(Rotation.Roll) < -75) {
        watchfont.setRotatation(rotate.right)
    } else if (input.rotation(Rotation.Roll) > 75) {
        watchfont.setRotatation(rotate.left)
    }
}
function 秒表示 () {
    表示方向()
    watchfont.showNumber2(datetime[rtc.getClockData(clockData.second)])
}
function 時刻表示 (読み上げ: boolean) {
    if (読み上げ) {
        atp3012.write("tada'ima <NUMK VAL=" + datetime[rtc.getClockData(clockData.hour)] + " COUNTER=ji>" + " <NUMK VAL=" + datetime[rtc.getClockData(clockData.minute)] + " COUNTER=funn>desu.")
    }
    表示方向()
    watchfont.showNumber2(datetime[rtc.getClockData(clockData.hour)])
    basic.pause(1000)
    basic.clearScreen()
    basic.pause(200)
    watchfont.showNumber2(datetime[rtc.getClockData(clockData.minute)])
    basic.pause(1000)
    basic.clearScreen()
    basic.pause(500)
}
let datetimeA: string[] = []
let 受信文字 = ""
let datetime: number[] = []
let コマンド = ""
pins.digitalWritePin(DigitalPin.P0, 0)
pins.digitalWritePin(DigitalPin.P1, 0)
pins.digitalWritePin(DigitalPin.P2, 0)
let 消灯時間 = 600
コマンド = ""
let 時計有効 = rtc.getDevice() != rtc.getClockDevice(rtcType.NON)
if (!(時計有効)) {
    basic.showIcon(IconNames.Sad)
    datetime = [20, 11, 10, 3, 11, 4, 12]
    basic.pause(500)
} else {
    datetime = rtc.getClock()
}
let 音声有効 = atp3012.isAvalable()
if (音声有効) {
    watchfont.plot(0, 0)
    basic.pause(200)
}
bluetooth.startUartService()
時刻表示(false)
basic.forever(function () {
    basic.pause(100)
    if (受信文字 != "") {
        コマンド = 受信文字.split(",")[0]
        コマンド処理()
    }
    if (時計有効) {
        datetime = rtc.getClock()
    }
    if (datetime[rtc.getClockData(clockData.minute)] == 0 && datetime[rtc.getClockData(clockData.second)] == 0) {
        pins.digitalWritePin(DigitalPin.P1, 1)
        basic.pause(200)
        pins.digitalWritePin(DigitalPin.P1, 0)
        basic.pause(800)
    }
    if (input.buttonIsPressed(Button.A) && !(input.buttonIsPressed(Button.B))) {
        時刻表示(音声有効)
    } else if (input.buttonIsPressed(Button.B) && !(input.buttonIsPressed(Button.A))) {
        秒表示()
    } else if (input.isGesture(Gesture.Shake)) {
        時刻表示(false)
    } else {
        basic.clearScreen()
    }
})
