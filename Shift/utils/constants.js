import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device"
import { getText } from "@zos/i18n"
import { createModal, MODAL_CONFIRM } from "@zos/interaction"
import { Time, Vibrator, VIBRATOR_SCENE_CALL, VIBRATOR_SCENE_STRONG_REMINDER, VIBRATOR_SCENE_TIMER } from "@zos/sensor"
import { DATE_FORMAT_MDY, DATE_FORMAT_YMD, getDateFormat, getLanguage, getTimeFormat, TIME_FORMAT_12 } from "@zos/settings"
import { localStorage } from "@zos/storage"
import hmUI, { align, createWidget, deleteWidget, event, prop, text_style, widget } from "@zos/ui"
import { px } from "@zos/utils"

const time = new Time()
let settings = localStorage.getItem('settings', {})

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, screenShape, deviceSource } = getDeviceInfo()
export const isRound = screenShape == SCREEN_SHAPE_ROUND

export const ALARMS_PARAMS = {
  states: ['off', 'pershift'],//, 'perday']
  vibroTypes: [
    VIBRATOR_SCENE_STRONG_REMINDER,
    VIBRATOR_SCENE_CALL,
    VIBRATOR_SCENE_TIMER
  ],
  soundTypes: ['default', 'note3', 'alarm', 'radar', 'alert', 'loud', 'digital'],
  repeat: {
    counts: [0, 1, 2, 3, 5],
    intervals: [1, 3, 5, 10, 15]
  }
}
const speakerDevices = [7995648, 7995649, 7930112, 7930113, 7864577, 8126720, 8126721, 8519936, 8519937, 8519939, 8323328, 8323329, 8782081, 8782088, 8782089, 8913152, 8913153, 8913155, 8913159, 10092800, 10092801, 10092803, 10092807, 9765120, 9765121, 10158337]
export const SPEAKER_SUPPORT = speakerDevices.includes(deviceSource)

export const COLORS = {
  primary: 0xffffff,
  secondary: 0xcccccc,
  inactive: 0x888888,
  dark: 0x313236,
  dark2: 0x212226,
  bg: 0xfafbff,
  accent: 0x0884d0,
  shifts: [0xffffff, 0x888888, 0xff0000, 0xf88800, 0xffff00, 0x00ff00, 0x00ffff, 0x0088ff, 0x0000ff, 0x8800ff, 0xff00ff]
}

const vibro = new Vibrator()
function stopVibro() {
  vibro.stop()
}

/**
 * Activates vibration
 * @param {number} id // index of vibration array
 * @param {number} duration // duration in milliseconds 
 */
export function playVibro(id, duration = 60000) {
  vibro.setMode(ALARMS_PARAMS.vibroTypes[id])
  vibro.start()
  setTimeout(stopVibro, duration)
}

/**
 * Adds empty space
 * @param {Object} param0 
 * @returns 
 */
export function createSpace({ UI = hmUI, y = 0, h = isRound ? 50 : 20 }) {
  return UI.createWidget(widget.FILL_RECT, {
    x: 0,
    y: y,
    w: SCREEN_WIDTH,
    h: h,
    alpha: 0
  })
}

/**
 * [Arrow right] button params
 */
export const ARROW_BTN_PARAMS = {
  w: px(30),
  h: px(40),
  normal_src: 'buttons/arr_right.png',
  press_src: 'buttons/arr_right_gray.png'
}

/**
 * [Add] button params
 */
export const ADD_BUTTON = {
  w: px(64),
  r: px(32),
  t: '+',
  s: px(24),
}

export const CONTENT = {
  M: (SCREEN_WIDTH - px(isRound ? 400 : 370)) / 2,
  Y: px(isRound ? 50 : 32),
  W: px(isRound ? 400 : 370),
  H: px(isRound ? 50 : 32),
  R: px(24),
  A: 25,
  P: px(15),
  G: px(15)
}

/**
 * Returns day number from 1 Jan 1970
 * @param {number} day 
 * @param {number} month 
 * @param {number} year 
 * @returns 
 */
export function getDayNumber(day, month, year) {
  let time = new Date(year, month - 1, day)
  let count = Math.floor(time / (1000 * 60 * 60 * 24))
  return count
}

/**
 * Returns the working schema
 * @param {object} shift 
 * @returns [day, day, night, night, weekday, ...]
 */
export function getShiftScheme(shift) {
  let shiftScheme = []
  if (typeof shift == 'object') {
    Object.values(shift?.shifts).forEach(val => {
      shiftScheme.push(...Array.from(Array(val.daysCount), (v, k) => val))
    })
  }
  return shiftScheme
}

/**
 * Returns number of shift start day
 * @param {object} shift 
 * @returns 
 */
export function getFirstShiftDay(shift) {
  return shift?.startDay ? getDayNumber(shift.startDay.day, shift.startDay.month, shift.startDay.year) : 0
}

/**
 * Returns information about the day according to the working scheme
 * @param {Array} shiftScheme 
 * @param {number} firstDay
 * @param {number} day 
 * @returns 
 */
export function getDayInfo(shiftScheme, firstDay, day) {
  let info = {
    type: '',
    color: 0,
    hoursCount: {}
  }
  if (!shiftScheme.length || day < firstDay) {
    info.type = 'nodata'
    info.hoursCount.hours = 0
    info.hoursCount.minutes = 0
  } else ({
    type: info.type,
    color: info.color,
    hoursCount: info.hoursCount
  } = shiftScheme[(day - firstDay) % shiftScheme.length])
  return info
}

/**
 * Returns the Monday number from the current week
 * @returns 
 */
export function getFirstWeekDay() {
  return Math.floor(time.getTime() / (1000 * 3600 * 24)) - time.getDay() + 1
}

/**
 * Returns the day of the week number
 * @param {number} day 
 * @param {number} month 
 * @param {number} year 
 * @returns 
 */
export function getWeekDay(day, month, year) {
  if (month > 2) {
    month -= 2
  } else {
    month += 10
    year--
  }
  return (day + Math.floor((13 * month - 1) / 5) + year + Math.floor(year / 4)
    + Math.floor(year / 400) - Math.floor(year / 100)) % 7
}

/**
 * Returns the number of days of the month
 * @param {number} month 
 * @param {number} year 
 * @returns 
 */
export function getMonthLength(month, year) {
  return month == 2 ? (year % 4 == 0 ? 29 : 28) : [1, 3, 5, 7, 8, 10, 12].indexOf(month) >= 0 ? 31 : 30
}

/**
 * Returns a formatted date string
 * @param {number} year 
 * @param {number} month 
 * @param {number} day 
 * @returns 
 */
export function getDateFormatted(year, month, day) {
  if (month < 10) month = '0' + month
  if (day < 10) day = '0' + day
  switch (getDateFormat()) {
    case DATE_FORMAT_YMD:
      return `${year}.${month}.${day}`
    case DATE_FORMAT_MDY:
      return `${month}/${day}/${year}`
    default:
      return `${day}.${month}.${year}`
  }
}

/**
 * Returns a formatted time string, adding localized am/pm if necessary
 * @param {number} hours 
 * @param {number} minutes 
 * @returns 
 */
export function getTimeFormatted(hours, minutes) {
  if (getTimeFormat() == TIME_FORMAT_12 && hours >= 12) hours = hours == 12 ? 12 : hours % 12
  if (minutes < 10) minutes = `0${minutes}`
  if (hours < 10) hours = `0${hours}`
  return `${hours}:${minutes}${getTimeFormat() == TIME_FORMAT_12 ? hours < 12 ? ` ${getText('am')}` : ` ${getText('pm')}` : ''}`
}

/**
 * Returns a formatted shoft string
 * @param {object} shift 
 * @returns 
 */
export function getShiftFormatted(shift) {
  return shift
    ? `${shift.day} ${getText(`month${shift.month}`).substring(0, 3)}, ${getText(`week${shift.week}`)}, ${getText(`widgetNear${shift.type[0].toUpperCase() + shift.type.slice(1)}Type`)}`
    : '-'
}

/**
 * Returns the nearest active alarm clock
 * @param {object} shift
 * @param {number} count The number of days after the current one. Specified for the verification range
 * @returns 
 */
export function getNearAlarm(shift, count = 30) {
  return
  return {
    day: 28,
    month: 4,
    year: 2025,
    hours: 8,
    minutes: 0
  }
}

/**
 * Returns {day, month, year}
 * @param {number} day Timestamp day numer
 */
function getDayDate(day) {
  const date = new Date(1970, 0, 1)
  date.setDate(date.getDate() + day)
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    week: date.getDay()
  }
}

/**
 * Returns the nearest work shift
 * @param {object} shift
 * @param {number} count The number of days after the current one. Specified for the verification range
 */
export function getNearShift(shift, count = 30) {
  let nearShift = {}
  let shiftScheme = getShiftScheme(shift)
  let firstShiftDay = getFirstShiftDay(shift)
  let startDay = getDayNumber(time.getDate(), time.getMonth(), time.getFullYear())
  if (time.getHours() >= 21) startDay++
  for (let i = 0; i < count; i++) {
    let dayInfo = getDayInfo(shiftScheme, firstShiftDay, startDay + i)
    if (['day', 'night'].includes(dayInfo.type)) {
      nearShift = {
        ...dayInfo,
        ...getDayDate(startDay + i)
      }
      return nearShift
    }
  }
  return
}

/**
 * Checkbox params
 */
export const checkbox = {
  W: px(54),
  H: px(34),
  R: px(13),
  bg: {
    onColor: COLORS.accent,
    offColor: 0x333333
  },
  fg: {
    W: px(26),
    H: px(26),
    R: px(8),
    onColor: COLORS.primary,
    offColor: 0x666666
  }
}
checkbox.X = SCREEN_WIDTH - M - checkbox.W
checkbox.R = checkbox?.R ?? Math.floor(checkbox.H / 2)
checkbox.bg.onColor = checkbox.bg?.onColor ?? checkbox.bg.offColor
checkbox.fg.W = checkbox.fg?.W ?? checkbox.fg?.H ?? checkbox.H
checkbox.fg.H = checkbox.fg?.H ?? checkbox.fg.W
checkbox.fg.R = checkbox.fg?.R ?? Math.floor(Math.min(checkbox.fg.W, checkbox.fg.H) / 2)
checkbox.fg.xOff = (checkbox.H - checkbox.fg.H) / 2
checkbox.fg.xOn = checkbox.W - (checkbox.H - checkbox.fg.H) / 2 - checkbox.fg.W
checkbox.fg.Y = (checkbox.H - checkbox.fg.H) / 2
checkbox.fg.offColor = checkbox.fg?.offColor ?? checkbox.fg.onColor

export function createCheckBox({ UI = hmUI, x, y, param }) {
  let bool = !!settings[param]
  const checkboxGroup = UI.createWidget(widget.GROUP, {
    x: x,
    y: y,
    w: checkbox.W,
    h: checkbox.H
  })
  const checkboxBg = checkboxGroup.createWidget(widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: checkbox.W,
    h: checkbox.H,
    radius: checkbox.R,
    color: bool ? checkbox.bg.onColor : checkbox.bg.offColor
  })
  const checkboxFg = checkboxGroup.createWidget(widget.FILL_RECT, {
    x: bool ? checkbox.fg.xOn : checkbox.fg.xOff,
    y: checkbox.fg.Y,
    w: checkbox.fg.W,
    h: checkbox.fg.H,
    radius: checkbox.fg.R,
    color: bool ? checkbox.fg.onColor : checkbox.fg.offColor
  })
  checkboxGroup.addEventListener(event.CLICK_DOWN, () => {
    bool = !bool
    checkboxBg.setProperty(prop.COLOR, bool ? checkbox.bg.onColor : checkbox.bg.offColor)
    checkboxFg.setProperty(prop.MORE, {
      x: bool ? checkbox.fg.xOn : checkbox.fg.xOff,
      y: checkbox.fg.Y,
      w: checkbox.fg.W,
      h: checkbox.fg.H,
      color: bool ? checkbox.fg.onColor : checkbox.fg.offColor
    })
    settings[param] = bool
    localStorage.setItem('settings', settings)
  })
}

const topKeys = Array.from(Array(10), (v, k) => +k)
const KEYBOARDS = {
  4: {
    name: 'RU',
    qwerty: [
      ['Й', 'Ц', 'У', 'К', ['Е', 'Ё'], 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х'],
      ['Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Э'],
      ['Я', 'Ч', 'С', 'М', 'И', 'Т', ['Ь', 'Ъ'], 'Б', 'Ю']
    ],
    abc: ['А', 'Б', 'В', 'Г', 'Д', ['Е', 'Ё'], 'Ж', 'З', ['И', 'Й'], 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', ['Ь', 'Ъ'], 'Ы', 'Э', 'Ю', 'Я']
  },
  2: {
    name: 'EN',
    qwerty: [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ],
    abc: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'G', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  }
}
let bottomKeys = ['apply', 'cancel', 'shift', 'lang', 'space', 'backspace']
let keyLangs = Object.keys(KEYBOARDS)

export class Keyboard {
  constructor(oldVal = '', key = { width: px(isRound ? 40 : 39), height: px(isRound ? 50 : 39) }, width = SCREEN_WIDTH) {
    this.width = width
    this.oldVal = JSON.parse(JSON.stringify(oldVal))
    this.keySize = key
    this.group = {}
    this.isShift = false
    this.lang = keyLangs.indexOf(getLanguage()) >= 0 ? getLanguage : 2 // проверь, будет ли английский по умолчанию
    this.keys = []
    this.drawableKeys = []
    this.bg = createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT
    })
    this.textWidget = {}
    this.onChanged = {}
  }

  draw() {
    this.group = createWidget(widget.GROUP, {
      x: 0,
      y: 0,
      w: SCREEN_WIDTH,
      h: SCREEN_HEIGHT
    })

    this.keys = []
    let keysLineCount = Math.floor(this.width / this.keySize.width)
    this.keys.push(topKeys)
    if (KEYBOARDS[this.lang].qwerty[0].length <= keysLineCount) {
      KEYBOARDS[this.lang].qwerty.forEach((row) => {
        this.keys.push(row)
      })
    } else {
      let keysArr = JSON.parse(JSON.stringify(KEYBOARDS[this.lang].abc))
      while (keysArr.length) {
        this.keys.push(keysArr.splice(0, keysLineCount))
        if (isRound) keysLineCount--
      }
    }
    this.keys.push(bottomKeys)

    let contentH = this.keySize.height + px(isRound ? 20 : 10)
    this.keys.reverse().forEach((row, i) => {
      row.forEach((key, j) => {
        let keyText = `${Array.isArray(key) ? key[0] : key}`
        if (!i) {
          switch (keyText) {
            case 'apply':
              keyText = '✓'
              break
            case 'cancel':
              keyText = '×'
              break
            case 'shift':
              keyText = this.isShift ? 'AA' : 'aA'
              break
            case 'lang':
              keyText = KEYBOARDS[this.lang].name
              break
            case 'space':
              keyText = "␣"
              break
            case 'backspace':
              keyText = '⇦'
              break
          }
        } else keyText = (this.isShift ? keyText.toUpperCase() : keyText.toLowerCase())
        this.group.createWidget(widget.BUTTON, {
          x: Math.floor((this.width - this.keySize.width * row.length) / 2) + j * this.keySize.width,
          y: SCREEN_HEIGHT - contentH,
          w: this.keySize.width,
          h: this.keySize.height,
          radius: Math.floor(this.keySize.width / 4),
          text: keyText,
          text_size: Math.floor(this.keySize.height * (['shift', 'lang'].includes(key) ? .4 : .6)),
          color: COLORS.primary,
          normal_color: 0,
          press_color: 0x333333,
          click_func: () => {
            switch (key) {
              case 'apply':
                createModal({
                  content: getText('saveAndOut'),
                  onClick: (keyObj) => {
                    const { type } = keyObj
                    if (type === MODAL_CONFIRM) {
                      this.onChanged?.(this.oldVal)
                      this.remove()
                    }
                  }
                })
                break
              case 'cancel':
                createModal({
                  content: getText('cancelAndOut'),
                  onClick: (keyObj) => {
                    const { type } = keyObj
                    if (type === MODAL_CONFIRM) this.remove()
                  }
                })
                break
              case 'shift':
                this.changeShift()
                break
              case 'lang':
                this.changeLang()
                break
              case 'space':
                this.oldVal += ' '
                this.updateText()
                break
              case 'backspace':
                if (this.oldVal.length) {
                  this.oldVal = this.oldVal.substring(0, this.oldVal.length - 1)
                  this.updateText()
                }
                break
              default:
                this.oldVal += (this.isShift ? (Array.isArray(key) ? key[0] : key).toUpperCase() : (Array.isArray(key) ? key[0] : key).toLowerCase())
                this.updateText()
                break
            }
          },
          longpress_func: () => {
            if (Array.isArray(key)) {
              this.oldVal += (this.isShift ? key[1].toUpperCase() : key[1].toLowerCase())
              this.updateText()
            }
          }
        })
      })
      contentH += this.keySize.height
    })
    contentH += px(10)
    this.textWidget = this.group.createWidget(widget.TEXT, {
      x: px(30),
      y: SCREEN_HEIGHT - contentH,
      w: this.width - px(60),
      h: px(50),
      text: `${this.oldVal}`,
      text_size: px(32),
      text_style: text_style.WRAP,
      color: COLORS.primary,
      align_h: align.RIGHT,
      align_v: align.CENTER_V
    })
  }



  remove() {
    deleteWidget(this.group)
    deleteWidget(this.bg)
  }

  update() {
    deleteWidget(this.group)
    this.draw()
  }
  updateText() {
    this.textWidget.setProperty(prop.TEXT, this.oldVal)
  }

  changeShift() {
    this.isShift = !this.isShift
    this.update()
  }
  changeLang() {
    let languages = Object.keys(KEYBOARDS)
    let index = languages.indexOf(this.lang)
    if (++index >= languages.length) index = 0
    this.lang = languages[index]
    this.update()
  }
}