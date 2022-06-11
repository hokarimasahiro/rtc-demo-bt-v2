function 着信表示 (時間: number, 電話番号: number) {
    watchfont.showIcon(
    "01110",
    "10001",
    "00100",
    "01010",
    "11111"
    )
    pins.digitalWritePin(DigitalPin.P2, 1)
    neopixelLight.showColor(neopixelLight.colors(neopixelLight.Colors.Red))
    basic.pause(時間)
    pins.digitalWritePin(DigitalPin.P2, 0)
    neopixelLight.showColor(neopixelLight.colors(neopixelLight.Colors.Green))
    basic.pause(200)
    neopixelLight.showColor(neopixelLight.colors(neopixelLight.Colors.Blue))
    basic.pause(200)
    neopixelLight.showColor(neopixelLight.colors(neopixelLight.Colors.Black))
}
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    QUEUE.push(bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine)))
})
function コマンド処理 () {
    コマンド = 受信文字.split(",")
    if (コマンド[0] == "s") {
        ds3231.setClockData(clockData.year, parseInt(コマンド[1]))
        ds3231.setClockData(clockData.month, parseInt(コマンド[2]))
        ds3231.setClockData(clockData.day, parseInt(コマンド[3]))
        ds3231.setClockData(clockData.weekday, parseInt(コマンド[4]))
        ds3231.setClockData(clockData.hour, parseInt(コマンド[5]))
        ds3231.setClockData(clockData.minute, parseInt(コマンド[6]))
        ds3231.setClockData(clockData.second, parseInt(コマンド[7]))
        ds3231.setClock()
        時刻表示(0)
    } else if (コマンド[0] == "a") {
        pins.analogPitch(parseInt(コマンド[1]), parseInt(コマンド[2]))
    } else if (コマンド[0] == "v") {
        着信表示(parseInt(コマンド[1]), parseInt(コマンド[2]))
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
    watchfont.showNumber2(ds3231.getClockData(clockData.second))
}
function 時刻表示 (タイプ: number) {
    if (タイプ == 0) {
        表示方向()
        watchfont.showNumber2(ds3231.getClockData(clockData.hour))
        basic.pause(1000)
        basic.clearScreen()
        basic.pause(200)
        watchfont.showNumber2(ds3231.getClockData(clockData.minute))
        basic.pause(1000)
        basic.clearScreen()
        basic.pause(500)
    } else if (タイプ == 1) {
        basic.showString("" + ds3231.getClockData(clockData.hour) + ":" + ds3231.getClockData(clockData.minute))
    }
}
let 受信文字 = ""
let コマンド: string[] = []
let QUEUE: string[] = []
neopixelLight.initNeopixel(DigitalPin.P1, 4)
neopixelLight.showColor(neopixelLight.colors(neopixelLight.Colors.Black))
pins.digitalWritePin(DigitalPin.P2, 0)
pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
pins.setPull(DigitalPin.P12, PinPullMode.PullUp)
pins.setPull(DigitalPin.P13, PinPullMode.PullUp)
QUEUE = []
bluetooth.startUartService()
ds3231.getClock()
時刻表示(0)
basic.forever(function () {
    basic.pause(100)
    if (QUEUE.length > 0) {
        受信文字 = QUEUE.removeAt(0)
        コマンド処理()
        QUEUE.shift()
    }
    ds3231.getClock()
    if (ds3231.getClockData(clockData.minute) == 0 && ds3231.getClockData(clockData.second) == 0) {
        pins.digitalWritePin(DigitalPin.P2, 1)
        basic.pause(200)
        pins.digitalWritePin(DigitalPin.P2, 0)
        basic.pause(800)
    }
    if (input.buttonIsPressed(Button.A)) {
        時刻表示(1)
    } else if (input.buttonIsPressed(Button.B)) {
        秒表示()
    } else if (input.isGesture(Gesture.Shake)) {
        時刻表示(0)
    } else {
        basic.clearScreen()
    }
    if (pins.digitalReadPin(DigitalPin.P8) == 0) {
        neopixelLight.showColor(neopixelLight.colors(neopixelLight.Colors.Red))
        pins.analogPitch(220, 10)
    } else if (pins.digitalReadPin(DigitalPin.P12) == 0) {
        neopixelLight.showColor(neopixelLight.colors(neopixelLight.Colors.Orange))
        pins.analogPitch(440, 10)
    } else if (pins.digitalReadPin(DigitalPin.P13) == 0) {
        neopixelLight.showColor(neopixelLight.colors(neopixelLight.Colors.Green))
        pins.analogPitch(880, 10)
    }
    neopixelLight.showColor(neopixelLight.colors(neopixelLight.Colors.Black))
})
