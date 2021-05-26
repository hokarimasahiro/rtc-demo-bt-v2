function 着信表示 (時間: number, 電話番号: number) {
    watchfont.showIcon(
    "01110",
    "10001",
    "00100",
    "01010",
    "11111"
    )
    pins.digitalWritePin(DigitalPin.P2, 1)
    basic.pause(時間)
    pins.digitalWritePin(DigitalPin.P2, 0)
    basic.pause(1000)
}
function コマンド処理 () {
    if (コマンド == "s") {
        rtc.setClockData(clockData.year, parseInt(パラメータ[0]))
        rtc.setClockData(clockData.month, parseInt(パラメータ[1]))
        rtc.setClockData(clockData.day, parseInt(パラメータ[2]))
        rtc.setClockData(clockData.weekday, parseInt(パラメータ[3]))
        rtc.setClockData(clockData.hour, parseInt(パラメータ[4]))
        rtc.setClockData(clockData.minute, parseInt(パラメータ[5]))
        rtc.setClockData(clockData.second, parseInt(パラメータ[6]))
        rtc.setClock()
        時刻表示(0)
    } else if (コマンド == "a") {
        pins.analogPitch(parseInt(パラメータ[0]), parseInt(パラメータ[1]))
    } else if (コマンド == "v") {
        着信表示(parseInt(パラメータ[0]), parseInt(パラメータ[1]))
    }
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
    watchfont.showNumber2(rtc.getClockData(clockData.second))
}
function 時刻表示 (タイプ: number) {
    if (タイプ == 0) {
        表示方向()
        watchfont.showNumber2(rtc.getClockData(clockData.hour))
        basic.pause(1000)
        basic.clearScreen()
        basic.pause(200)
        watchfont.showNumber2(rtc.getClockData(clockData.minute))
        basic.pause(1000)
        basic.clearScreen()
        basic.pause(500)
    } else if (タイプ == 1) {
        atp3012.write("tada'ima <NUMK VAL=" + rtc.getClockData(clockData.hour) + " COUNTER=ji>" + " <NUMK VAL=" + rtc.getClockData(clockData.minute) + " COUNTER=funn>desu.")
        basic.showString("" + rtc.getClockData(clockData.hour) + ":" + rtc.getClockData(clockData.minute))
    }
}
let パラメータ: string[] = []
let コマンド = ""
pins.digitalWritePin(DigitalPin.P2, 0)
pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
pins.setPull(DigitalPin.P12, PinPullMode.PullUp)
pins.setPull(DigitalPin.P13, PinPullMode.PullUp)
let 消灯時間 = 600
let 時計有効 = rtc.getDevice() != rtc.getClockDevice(rtcType.NON)
if (!(時計有効)) {
    watchfont.showIcon(
    "00000",
    "01010",
    "00000",
    "01110",
    "10001"
    )
    rtc.setClockData(clockData.year, 2021)
    rtc.setClockData(clockData.month, 1)
    rtc.setClockData(clockData.day, 7)
    rtc.setClockData(clockData.hour, 4)
    rtc.setClockData(clockData.minute, 13)
    rtc.setClockData(clockData.second, 32)
    rtc.setClock()
    basic.pause(500)
}
let 音声有効 = atp3012.isAvalable()
if (音声有効) {
    watchfont.plot(0, 0)
    basic.pause(200)
}
let QUEUE: string[] = []
bluetooth.startUartService()
rtc.getClock()
時刻表示(0)
basic.forever(function () {
    basic.pause(100)
    if (QUEUE.length > 0) {
        コマンド = QUEUE[0].split(",")[0]
        パラメータ = QUEUE[0].substr(2, 100).split(",")
        コマンド処理()
        QUEUE.shift()
    }
    rtc.getClock()
    if (rtc.getClockData(clockData.minute) == 0 && rtc.getClockData(clockData.second) == 0) {
        pins.digitalWritePin(DigitalPin.P2, 1)
        basic.pause(200)
        pins.digitalWritePin(DigitalPin.P2, 0)
        basic.pause(800)
    }
    if (input.buttonIsPressed(Button.A) && !(input.buttonIsPressed(Button.B))) {
        時刻表示(1)
    } else if (input.buttonIsPressed(Button.B) && !(input.buttonIsPressed(Button.A))) {
        秒表示()
    } else if (input.isGesture(Gesture.Shake)) {
        時刻表示(0)
    } else {
        basic.clearScreen()
    }
    if (pins.digitalReadPin(DigitalPin.P8) == 0) {
        music.playTone(262, music.beat(BeatFraction.Whole))
    }
    if (pins.digitalReadPin(DigitalPin.P12) == 0) {
        music.playTone(330, music.beat(BeatFraction.Whole))
    }
    if (pins.digitalReadPin(DigitalPin.P13) == 0) {
        music.playTone(392, music.beat(BeatFraction.Whole))
    }
})
control.inBackground(function () {
    while (true) {
        QUEUE.push(bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine)))
    }
})
