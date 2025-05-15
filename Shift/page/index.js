import { getText } from '@zos/i18n'
import { align, createWidget, deleteWidget, event, getTextLayout, prop, setStatusBarVisible, text_style, widget } from '@zos/ui'
import { px } from '@zos/utils'
import { localStorage } from '@zos/storage'
import { Time } from '@zos/sensor'
import { push, back } from '@zos/router'

import {
  COLORS,
  CONTENT,
  SCREEN_HEIGHT, SCREEN_WIDTH,
  createSpace,
  getDateFormatted,
  getDayInfo,
  getDayNumber,
  getFirstShiftDay,
  getFirstWeekDay,
  getMonthLength,
  getNearAlarm,
  getShiftScheme,
  getTimeFormatted,
  getWeekDay,
  isRound
} from '../utils/constants'

setStatusBarVisible(false)

const time = new Time()
// localStorage.clear()
let shift = localStorage.getItem('shift')
let settings = localStorage.getItem('settings', {})

let content = JSON.parse(JSON.stringify(CONTENT))

let buttons = {
  W: px(44),
  H: px(44),
  HL: px(54),
  R: px(8),
  P: px(5),
  M: px(15)
}

const blocks = {
  X: content.M,          // Blocks X
  W: content.W,          // Blocks width
  P: content.P,
  iW: px(30),            // Image width
  graphic: {
    bg: {},
    Y: 0,
    H: 0,
    graph: {
      group: {},
      X: 0,
      Y: 0,
      H: 0
    },
    changeButton: {
      group: {},
      primaryText: {},
      secondaryText: {}
    }
  },
  alarms: {
    group: {},
    bg: {},
    Y: 0,
    H: 0
  },
  hours: {
    group: {},
    bg: {},
    Y: 0,
    H: 0
  },
  vacations: {
    group: {},
    bg: {},
    Y: 0,
    H: 0
  },
  buttons: {
    group: {},
    bg: {},
    Y: {},
    H: buttons.H + content.P * 2
  }
}

let bottomSpace = {}

let shiftScheme = getShiftScheme(shift)
let firstShiftDay = getFirstShiftDay(shift)

/** Returns an object with calculated working hours according to the working scheme
 * 
 * @param {number} startDay 
 * @param {number} endDay 
 * @returns 
 */
function getHoursCount(startDay, endDay) {
  const count = {
    day: {
      hours: 0,
      minutes: 0,
      count: 0
    },
    night: {
      hours: 0,
      minutes: 0,
      count: 0
    }
  }
  if (endDay < firstShiftDay) return count
  for (let i = startDay < firstShiftDay ? firstShiftDay : startDay; i <= endDay; i++) {
    let dayInfo = getDayInfo(shiftScheme, firstShiftDay, i)
    if (['day', 'night'].includes(dayInfo.type)) {
      count[dayInfo.type].hours += dayInfo.hoursCount.hours
      count[dayInfo.type].minutes += dayInfo.hoursCount.minutes
      count[dayInfo.type].count++
    }
  }
  return count
}

Page({
  build() {
    if (!shift) {
      push({ url: 'page/shift' })
      return
    }
    if (false) {
      push({ url: 'page/shifts' })
      return
    }

    function updatePos() {
      blocks.alarms.Y = blocks.graphic.Y + blocks.graphic.H + content.G
      blocks.alarms.group.setProperty(prop.Y, blocks.alarms.Y)
      blocks.hours.Y = blocks.alarms.Y + blocks.alarms.H + content.G
      blocks.hours.group.setProperty(prop.Y, blocks.hours.Y)
      blocks.buttons.Y = blocks.hours.Y + blocks.hours.H + content.G
      blocks.buttons.group.setProperty(prop.Y, blocks.buttons.Y)
      bottomSpace.setProperty(prop.MORE, {
        x: 0,
        y: blocks.buttons.Y + blocks.buttons.H + content.G,
        w: SCREEN_WIDTH,
        h: isRound ? 100 : 20
      })
    }
    function drawGraphic(type = shift.params.graphic) {
      let graph = blocks.graphic.graph
      graph.H = 0

      deleteWidget(graph.group)
      graph.group = createWidget(widget.GROUP, {
        x: graph.X,
        y: graph.Y,
        w: graph.W,
        h: 0
      })

      let elemW = Math.floor(graph.W / 7)

      if (type == 'weeks') {
        const firstWeekDay = getFirstWeekDay()
        for (let i = 0; i < 2; i++) {
          graph.group.createWidget(widget.TEXT, {
            x: 0,
            y: graph.H,
            w: content.W - 2 * content.P,
            h: px(32),
            text: getText(i == 0 ? 'thisWeek' : 'nextWeek'),
            text_size: px(24),
            color: COLORS.secondary,
            align_v: align.CENTER_V
          })
          graph.H += px(40)
          if (!i) {
            graph.group.createWidget(widget.FILL_RECT, {
              x: elemW * (time.getDay() - 1) - px(5),
              y: graph.H - px(2),
              w: elemW,
              h: px(48),
              radius: px(5),
              alpha: content.A * 2,
              color: COLORS.primary
            })
          }
          for (let j = 0; j < 7; j++) {
            let dayInfo = getDayInfo(shiftScheme, firstShiftDay, firstWeekDay + i * 7 + j)
            graph.group.createWidget(widget.TEXT, {
              x: elemW * j,
              y: graph.H,
              w: elemW,
              h: px(30),
              text: getText(`week${j + 1}`),
              text_size: px(22),
              color: dayInfo.type == 'nodata' ? COLORS.inactive : dayInfo.color ?? COLORS.shifts[0],
              align_v: align.CENTER_V
            })
            if (!settings?.hideInactive || ['day', 'night'].includes(dayInfo.type)) {
              graph.group.createWidget(widget.TEXT, {
                x: elemW * j,
                y: graph.H + px(24),
                w: elemW,
                h: px(20),
                text: getText(`${dayInfo.type}Type`),
                text_size: px(12),
                color: dayInfo.type == 'nodata' ? COLORS.inactive : dayInfo.color ?? COLORS.shifts[0],
                align_v: align.CENTER_V
              })
            }
          }
          graph.H += i ? px(44) : px(54)
        }
      } else {
        graph.group.createWidget(widget.TEXT, {
          x: 0,
          y: 0,
          w: graph.W,
          h: px(30),
          text: `${getText(`month${time.getMonth()}`)} ${time.getFullYear()}`,
          text_size: px(24),
          color: COLORS.secondary
        })
        graph.H += px(40)

        let days = Array.from(Array(6), () => Array.from(Array(7), () => ''))
        const dateParams = {
          prev: {
            M: time.getMonth() == 1 ? 12 : time.getMonth() - 1,
            Y: time.getFullYear() - (time.getMonth() == 1),
          },
          current: {
            L: getMonthLength(time.getMonth(), time.getFullYear())
          },
          next: {
            M: time.getMonth() == 12 ? 1 : time.getMonth() + 1,
            Y: time.getFullYear() + (time.getMonth() == 12)
          }
        }
        dateParams.prev.L = getMonthLength(dateParams.prev.M, dateParams.prev.Y)
        dateParams.next.L = getMonthLength(dateParams.next.M, dateParams.next.Y)
        let weekId = getWeekDay(1, time.getMonth(), time.getFullYear())
        if (weekId == 0) weekId = 7
        let day = {
          number: 0,
          type: '',
          counter: 1
        }
        for (let i = 0; i < 7; i++) {
          graph.group.createWidget(widget.TEXT, {
            x: elemW * i,
            y: graph.H,
            w: elemW,
            h: px(30),
            text: getText(`week${i + 1}`),
            text_size: px(20),
            color: COLORS.secondary,
            align_v: align.CENTER_V
          })
        }
        graph.H += px(40)
        for (let i = 0; i < days.length; i++) {
          for (let j = 0; j < days[i].length; j++) {
            if (i == 0 && j < weekId - 1) {
              day.day = dateParams.prev.L - (weekId - j - 2)
              day.month = dateParams.prev.M
              day.year = dateParams.prev.Y
              day.state = 'inactive'
            } else if (day.counter > dateParams.current.L) {
              day.day = day.counter - dateParams.current.L
              day.month = dateParams.next.M
              day.year = dateParams.next.Y
              day.state = 'inactive'
              day.counter++
            } else {
              day.day = day.counter
              day.month = time.getMonth()
              day.year = time.getFullYear()
              day.state = 'normal'
              day.counter++
            }
            day.number = getDayNumber(day.day, day.month, day.year)
            day.info = getDayInfo(shiftScheme, firstShiftDay, day.number)
            if (time.getDate() == day.day && time.getMonth() == day.month) {
              graph.group.createWidget(widget.FILL_RECT, {
                x: elemW * j - px(5),
                y: graph.H + px(45) * i - px(2),
                w: elemW,
                h: px(48),
                radius: px(5),
                alpha: content.A * 2,
                color: COLORS.primary
              })
            }
            graph.group.createWidget(widget.TEXT, {
              x: elemW * j,
              y: graph.H + px(45) * i,
              w: elemW,
              h: px(30),
              text: `${day.day}`,
              text_size: px(24),
              color: day.state == 'inactive' || day.info.type == 'nodata' ? COLORS.inactive : day.info.color ?? COLORS.shifts[0],
              align_v: align.CENTER_V
            })
            if (!settings?.hideInactive || ['day', 'night'].includes(day.info.type)) {
              graph.group.createWidget(widget.TEXT, {
                x: elemW * j,
                y: graph.H + px(45) * i + px(24),
                w: elemW,
                h: px(20),
                text: getText(`${day.info.type}Type`),
                text_size: px(12),
                color: day.state == 'inactive' || day.info.type == 'nodata' ? COLORS.inactive : day.info.color ?? COLORS.shifts[0],
                align_v: align.CENTER_V
              })
            }
          }
        }
        graph.H += px(45) * 6
      }

      blocks.graphic.H = graph.Y - blocks.graphic.Y + graph.H
      blocks.graphic.changeButton.group.setProperty(prop.Y, blocks.graphic.Y + blocks.graphic.H - buttons.HL)
      blocks.graphic.H += blocks.P

      blocks.graphic.bg.setProperty(prop.MORE, {
        x: blocks.X,
        y: blocks.graphic.Y,
        w: blocks.W,
        h: blocks.graphic.H
      })
      updatePos()
    }

    createWidget(widget.TEXT, {
      x: content.M,
      y: content.H,
      w: content.W,
      h: px(50),
      text: getText('shifts'),
      text_size: px(32),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      color: COLORS.primary
    })
    content.H += px(70)

    let shifts = {
      X: content.M,
      H: px(40),
      R: px(12),
      P: px(15),
      G: px(10),
      M: px(5)
    }
    let dateText = getText(`fromDate${shift.startDay.month}`, shift.startDay.day)
    let dateRect = getTextLayout(dateText, { text_size: px(24), text_width: 0 })
    let shiftImgW = px(20)
    let shiftSchemeW = 0

    Object.values(shift.shifts).forEach((val, i) => {
      let textW = getTextLayout(`${val.daysCount}`, { text_size: px(32), text_width: 0 }).width
      let blockW = textW + shifts.P * 2 + shifts.G + shiftImgW
      shiftSchemeW += blockW + !!shiftSchemeW * shifts.M
      if (shiftSchemeW > content.W) {
        shiftSchemeW = blockW
        content.H += shifts.H + shifts.M
      }
      createWidget(widget.FILL_RECT, {
        x: shifts.X + shiftSchemeW - blockW,
        y: content.H,
        w: blockW,
        h: shifts.H,
        radius: shifts.R,
        color: COLORS.bg,
        alpha: content.A
      })
      createWidget(widget.TEXT, {
        x: shifts.X + shiftSchemeW - blockW + shifts.P,
        y: content.H,
        w: textW,
        h: shifts.H,
        text: `${val.daysCount}`,
        text_size: px(32),
        color: COLORS.primary,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })
      createWidget(widget.IMG, {
        x: shifts.X + shiftSchemeW - blockW + shifts.P + textW + shifts.G,
        y: content.H + (shifts.H - shiftImgW) / 2,
        src: `shifts/${val.type}.png`
      })
    })

    if (shiftSchemeW + shifts.M + dateRect.width > content.W) {
      shiftSchemeW = 0
      content.H += shifts.H + !!shiftSchemeW * shifts.M
    }
    const startDate = createWidget(widget.TEXT, {
      x: shifts.X + shiftSchemeW + shifts.M,
      y: content.H,
      w: dateRect.width,
      h: newline ? px(32) : shifts.H,
      text: dateText,
      text_size: px(24),
      color: COLORS.primary,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V
    })
    startDate.addEventListener(event.CLICK_UP, () => {
      push({
        url: 'page/shift'
      })
    })
    content.H += (newline ? px(24) : shifts.H) + content.G

    // График
    blocks.graphic.Y = content.H
    blocks.graphic.H += blocks.P
    blocks.graphic.bg = createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      radius: content.R,
      color: COLORS.bg,
      alpha: content.A
    })
    let imageW = px(30)
    createWidget(widget.IMG, {
      x: blocks.X + blocks.P,
      y: blocks.graphic.Y + blocks.graphic.H + (buttons.H - imageW) / 2,
      src: 'shifts/graphic.png'
    })
    createWidget(widget.TEXT, {
      x: blocks.X + blocks.P + imageW + px(10),
      y: blocks.graphic.Y + blocks.graphic.H,
      w: blocks.W - 2 * blocks.P - imageW - px(10) * 2 - buttons.W,
      h: buttons.H,
      text: getText('graphic'),
      text_size: px(32),
      color: COLORS.primary,
      align_v: align.CENTER_V
    })
    createWidget(widget.FILL_RECT, {
      x: blocks.X + blocks.W - blocks.P - buttons.W,
      y: blocks.graphic.Y + blocks.graphic.H,
      w: buttons.W,
      h: buttons.H,
      radius: buttons.R,
      color: COLORS.bg,
      alpha: content.A
    })
    createWidget(widget.BUTTON, {
      x: blocks.X + blocks.W - blocks.P - buttons.W,
      y: blocks.graphic.Y + blocks.graphic.H,
      w: buttons.W,
      h: buttons.H,
      normal_src: 'buttons/settings.png',
      press_src: 'buttons/settings_gray.png',
      click_func: () => { push({ url: 'page/shifts' }) }
    })

    blocks.graphic.H += buttons.H + px(10)
    blocks.graphic.graph.X = blocks.X + blocks.P
    blocks.graphic.graph.Y = blocks.graphic.Y + blocks.graphic.H
    blocks.graphic.graph.W = blocks.W - 2 * blocks.P - buttons.W

    blocks.graphic.changeButton.group = createWidget(widget.GROUP, {
      x: blocks.X + blocks.W - blocks.P - buttons.W,
      y: blocks.graphic.Y + blocks.graphic.H - buttons.HL,
      w: buttons.W,
      h: buttons.HL,
    })
    blocks.graphic.changeButton.group.createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: buttons.W,
      h: buttons.HL,
      radius: buttons.R,
      color: COLORS.bg,
      alpha: content.A
    })
    blocks.graphic.changeButton.primaryText = blocks.graphic.changeButton.group.createWidget(widget.TEXT, {
      x: 0,
      y: buttons.P,
      w: buttons.W,
      h: Math.floor((buttons.HL - buttons.P * 2) * 0.7),
      text: shift.params.graphic == 'weeks' ? '1' : '2',
      text_size: Math.round((buttons.HL - buttons.P * 2) * 0.7 * 0.8),
      color: COLORS.primary,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V
    })
    blocks.graphic.changeButton.secondaryText = blocks.graphic.changeButton.group.createWidget(widget.TEXT, {
      x: 0,
      y: buttons.P + Math.floor((buttons.HL - buttons.P * 2) * 0.7),
      w: buttons.W,
      h: buttons.HL - buttons.P * 2 - Math.floor((buttons.HL - buttons.P * 2) * 0.7),
      text: getText(shift.params.graphic == 'weeks' ? 'monthShort' : 'weekShort'),
      text_size: Math.round((buttons.HL - buttons.P * 2 - Math.floor((buttons.HL - buttons.P * 2) * 0.7)) * 0.8),
      color: COLORS.primary,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V
    })
    blocks.graphic.changeButton.group.addEventListener(event.CLICK_UP, () => {
      shift.params.graphic = shift.params.graphic == 'weeks' ? 'month' : 'weeks'
      blocks.graphic.changeButton.primaryText.setProperty(prop.TEXT, shift.params.graphic == 'weeks' ? '1' : '2')
      blocks.graphic.changeButton.secondaryText.setProperty(prop.TEXT, getText(shift.params.graphic == 'weeks' ? 'monthShort' : 'weekShort'))
      localStorage.setItem('shift', shift)
      drawGraphic()
    })

    // Будильники
    blocks.hours.Y = content.H + content.G
    blocks.alarms.H = blocks.P
    blocks.alarms.group = createWidget(widget.GROUP, {
      x: blocks.X,
      y: blocks.alarms.Y,
      w: blocks.W,
      h: blocks.alarms.H
    })
    blocks.alarms.bg = blocks.alarms.group.createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      radius: content.R,
      color: COLORS.bg,
      alpha: content.A
    })
    blocks.alarms.group.createWidget(widget.IMG, {
      x: blocks.P,
      y: blocks.alarms.H + (buttons.H - imageW) / 2,
      src: 'shifts/alarm.png'
    })
    blocks.alarms.group.createWidget(widget.TEXT, {
      x: blocks.P + imageW + px(10),
      y: blocks.alarms.H,
      w: blocks.W - 2 * blocks.P - imageW - px(10) * 2 - buttons.W,
      h: buttons.H,
      text: getText('alarms'),
      text_size: px(32),
      color: COLORS.primary,
      align_v: align.CENTER_V
    })
    let entries = ['pershift', 'perday'].includes(shift.params.alarms) ? Object.entries(shift.params.alarms == 'perday' ? shift.alarms : shift.shifts) : []
    if (shift.params.alarms != 'off' && entries.length) {
      blocks.alarms.group.createWidget(widget.FILL_RECT, {
        x: blocks.W - blocks.P - buttons.W,
        y: blocks.alarms.H,
        w: buttons.W,
        h: buttons.H,
        radius: buttons.R,
        color: COLORS.bg,
        alpha: content.A
      })
      blocks.alarms.group.createWidget(widget.BUTTON, {
        x: blocks.W - blocks.P - buttons.W,
        y: blocks.alarms.H,
        w: buttons.W,
        h: buttons.H,
        normal_src: 'buttons/settings.png',
        press_src: 'buttons/settings_gray.png',
        click_func: () => { push({ url: 'page/alarms' }) }
      })
    }
    blocks.alarms.H += buttons.H + px(10)

    if (shift.params.alarms == 'off' || !entries.length) {
      let alarmsText = getText(shift.params.alarms == 'off' ? 'alarmsOffText' : 'alarmsEmptyText')
      let alarmsTextH = getTextLayout(alarmsText, { text_size: px(18), text_width: blocks.W - blocks.P * 2, wrapped: true }).height
      blocks.alarms.group.createWidget(widget.TEXT, {
        x: blocks.P,
        y: blocks.alarms.H,
        w: blocks.W - 2 * blocks.P,
        h: alarmsTextH,
        text: alarmsText,
        text_size: px(18),
        color: COLORS.secondary,
        text_style: text_style.WRAP,
        align_v: align.CENTER_V
      })
      blocks.alarms.H += alarmsTextH
    } else {
      blocks.alarms.group.createWidget(widget.TEXT, {
        x: blocks.P,
        y: blocks.alarms.H,
        w: blocks.W - 2 * blocks.P,
        h: px(32),
        text: getText('nearAlarm'),
        text_size: px(24),
        color: COLORS.secondary,
        align_v: align.CENTER_V
      })
      blocks.alarms.H += px(32)
      let searchDaysCount = 30
      let nearAlarm = getNearAlarm(shift, firstShiftDay, searchDaysCount)
      if (nearAlarm) {
        let nearAlarmText = getTimeFormatted(nearAlarm.hours, nearAlarm.minutes)
        let nearAlarmTextRect = getTextLayout(nearAlarmText, { text_size: px(32), text_width: 0 })
        let nearAlarmDateText = getDateFormatted(nearAlarm.year, nearAlarm.month, nearAlarm.day) + ' ' + getText(`week${getWeekDay(nearAlarm.day, nearAlarm.month, nearAlarm.year)}`)
        blocks.alarms.group.createWidget(widget.TEXT, {
          x: blocks.P,
          y: blocks.alarms.H,
          w: blocks.W - 2 * blocks.P,
          h: px(40),
          text: nearAlarmText,
          text_size: px(32),
          color: COLORS.primary,
          align_v: align.CENTER_V
        })
        blocks.alarms.group.createWidget(widget.TEXT, {
          x: blocks.P + nearAlarmTextRect.width + px(15),
          y: blocks.alarms.H + px(7),
          w: blocks.W - 2 * blocks.P - nearAlarmTextRect.width - px(15) - px(54) - px(10),
          h: px(32),
          text: nearAlarmDateText,
          text_size: px(24),
          color: COLORS.primary,
          align_v: align.CENTER_V
        })
        blocks.alarms.group.createWidget(widget.FILL_RECT, {
          x: blocks.W - blocks.P - px(54),
          y: blocks.alarms.H,
          w: px(54),
          h: px(34),
          radius: px(12),
          color: COLORS.inactive,
          alpha: 100
        })
        blocks.alarms.group.createWidget(widget.FILL_RECT, {
          x: blocks.W - blocks.P - px(50),
          y: blocks.alarms.H + px(4),
          w: px(26),
          h: px(26),
          radius: px(8),
          color: COLORS.primary,
          alpha: 100
        })
        blocks.alarms.H += px(50)
      } else {
        let emptyNearAlarmText = getText('emptyNearAlarmText', searchDaysCount)
        let emptyNearAlarmRect = getTextLayout(emptyNearAlarmText, { text_size: px(24), text_width: blocks.W - 2 * blocks.P, wrapped: true })
        blocks.alarms.group.createWidget(widget.TEXT, {
          x: blocks.P,
          y: blocks.alarms.H,
          w: blocks.W - 2 * blocks.P,
          h: emptyNearAlarmRect.height,
          text: emptyNearAlarmText,
          text_size: px(24),
          text_style: text_style.WRAP,
          color: COLORS.primary,
          align_v: align.CENTER_V
        })
        blocks.alarms.H += emptyNearAlarmRect.height + px(10)
      }

      entries.forEach(([key, val]) => {
        if (!val.alarm.isOn) return

        blocks.alarms.group.createWidget(widget.TEXT, {
          x: blocks.P,
          y: blocks.alarms.H,
          w: blocks.W - 2 * blocks.P,
          h: px(24),
          text: (val.name.length ? val.name : `${getText(shift.params.alarms == 'perday' ? 'day' : 'shift')} ${+key + 1}`) + ' | ' + getText(`${val.type}Type`),
          text_size: px(18),
          color: COLORS.secondary,
          align_v: align.CENTER_V
        })
        blocks.alarms.H += px(24)

        let timeText = getTimeFormatted(val.alarm.time.hours, val.alarm.time.minutes)
        blocks.alarms.group.createWidget(widget.TEXT, {
          x: blocks.P,
          y: blocks.alarms.H,
          w: blocks.W - 2 * blocks.P,
          h: px(32),
          text: timeText,
          text_size: px(24),
          color: COLORS.primary,
          align_v: align.CENTER_V
        })
        if (val.alarm.time.prevDay) {
          blocks.alarms.group.createWidget(widget.TEXT, {
            x: blocks.P + getTextLayout(timeText, { text_size: px(24), text_width: 0 }).width + px(10),
            y: blocks.alarms.H,
            w: blocks.W - 2 * blocks.P,
            h: px(32),
            text: getText('prevDay'),
            text_size: px(18),
            color: COLORS.secondary,
            align_v: align.CENTER_V
          })
        }
        blocks.alarms.H += px(40)
      })
      blocks.alarms.H -= px(10)
    }

    blocks.alarms.H += blocks.P
    blocks.alarms.bg.setProperty(prop.MORE, {
      x: 0,
      y: 0,
      w: blocks.W,
      h: blocks.alarms.H
    })

    // Рабочие часы
    blocks.hours.Y = content.H + content.G
    blocks.hours.H = blocks.P
    blocks.hours.group = createWidget(widget.GROUP, {
      x: blocks.X,
      y: blocks.hours.Y,
      w: blocks.W,
      h: blocks.hours.H
    })
    blocks.hours.bg = blocks.hours.group.createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      radius: content.R,
      color: COLORS.bg,
      alpha: content.A
    })
    blocks.hours.group.createWidget(widget.IMG, {
      x: blocks.P,
      y: blocks.hours.H + (buttons.H - imageW) / 2,
      src: 'shifts/hours.png'
    })
    blocks.hours.group.createWidget(widget.TEXT, {
      x: blocks.P + imageW + px(10),
      y: blocks.hours.H,
      w: blocks.W - 2 * blocks.P - imageW - px(10),
      h: buttons.H,
      text: getText('workHours'),
      text_size: px(32),
      color: COLORS.primary,
      align_v: align.CENTER_V
    })
    blocks.hours.H += buttons.H + px(10)

    let hoursYear = getHoursCount(getDayNumber(1, 1, time.getFullYear()), getDayNumber(31, 12, time.getFullYear()))
    let hoursYearSum = {
      day: {
        hours: hoursYear.day.hours + Math.floor(hoursYear.day.minutes / 60),
        minutes: hoursYear.day.minutes % 60,
        count: hoursYear.day.count
      },
      night: {
        hours: hoursYear.night.hours + Math.floor(hoursYear.night.minutes / 60),
        minutes: hoursYear.night.minutes % 60,
        count: hoursYear.night.count
      },
      full: {
        count: hoursYear.day.count + hoursYear.night.count
      }
    }
    hoursYearSum.full.hours = hoursYearSum.day.hours + hoursYearSum.night.hours + Math.floor((hoursYearSum.day.minutes + hoursYearSum.night.minutes) / 60)
    hoursYearSum.full.minutes = (hoursYearSum.day.minutes + hoursYearSum.night.minutes) % 60

    blocks.hours.group.createWidget(widget.TEXT, {
      x: blocks.P,
      y: blocks.hours.H,
      w: blocks.W - 2 * blocks.P,
      h: px(32),
      text: getText('perYear'),
      text_size: px(24),
      color: COLORS.secondary,
      align_v: align.CENTER_V
    })
    blocks.hours.H += px(32)
    blocks.hours.group.createWidget(widget.TEXT, {
      x: blocks.P,
      y: blocks.hours.H,
      w: blocks.W - 2 * blocks.P,
      h: px(32),
      text: (getDayNumber(1, 1, time.getFullYear()) < firstShiftDay && time.getFullYear() == shift.startDay.year
        ? getDateFormatted(shift.startDay.year, shift.startDay.month, shift.startDay.day)
        : getDateFormatted(time.getFullYear(), 1, 1))
        + ' - ' + getDateFormatted(time.getFullYear(), 12, 31),
      text_size: px(24),
      color: COLORS.secondary,
      align_v: align.CENTER_V
    })
    blocks.hours.H += px(40)

    blocks.hours.group.createWidget(widget.TEXT, {
      x: blocks.P,
      y: blocks.hours.H,
      w: blocks.W - 2 * blocks.P,
      h: px(40),
      text: getText('shiftsCount', hoursYearSum.full.count) + ', ' + getText('hoursAndMinutes2', hoursYearSum.full.hours, hoursYearSum.full.minutes),
      text_size: px(32),
      color: COLORS.primary,
      align_v: align.CENTER_V
    })
    blocks.hours.H += px(40)

    if ((hoursYearSum.day.hours != 0 || hoursYearSum.day.minutes != 0) && (hoursYearSum.night.hours != 0 || hoursYearSum.night.minutes != 0)) {
      blocks.hours.group.createWidget(widget.TEXT, {
        x: blocks.P,
        y: blocks.hours.H,
        w: blocks.W - 2 * blocks.P,
        h: px(32),
        text: getText('dayType'),
        text_size: px(24),
        color: COLORS.secondary,
        align_v: align.CENTER_V
      })
      blocks.hours.H += px(32)

      blocks.hours.group.createWidget(widget.TEXT, {
        x: blocks.P,
        y: blocks.hours.H,
        w: blocks.W - 2 * blocks.P,
        h: px(40),
        text: getText('shiftsCount', hoursYearSum.day.count) + ', ' + getText('hoursAndMinutes2', hoursYearSum.day.hours, hoursYearSum.day.minutes),
        text_size: px(32),
        color: COLORS.primary,
        align_v: align.CENTER_V
      })
      blocks.hours.H += px(40)

      blocks.hours.group.createWidget(widget.TEXT, {
        x: blocks.P,
        y: blocks.hours.H,
        w: blocks.W - 2 * blocks.P,
        h: px(32),
        text: getText('nightType'),
        text_size: px(24),
        color: COLORS.secondary,
        align_v: align.CENTER_V
      })
      blocks.hours.H += px(32)
      blocks.hours.group.createWidget(widget.TEXT, {
        x: blocks.P,
        y: blocks.hours.H,
        w: blocks.W - 2 * blocks.P,
        h: px(40),
        text: getText('shiftsCount', hoursYearSum.night.count) + ', ' + getText('hoursAndMinutes2', hoursYearSum.night.hours, hoursYearSum.night.minutes),
        text_size: px(32),
        color: COLORS.primary,
        align_v: align.CENTER_V
      })
      blocks.hours.H += px(55)

      blocks.hours.group.createWidget(widget.FILL_RECT, {
        x: blocks.P,
        y: blocks.hours.H,
        w: blocks.W - 2 * blocks.P,
        h: px(2),
        color: COLORS.primary,
        alpha: content.A
      })
    }
    blocks.hours.H += px(15)

    let hoursMonth = getHoursCount(getDayNumber(1, time.getMonth(), time.getFullYear()), getDayNumber(getMonthLength(time.getMonth(), time.getFullYear()), time.getMonth(), time.getFullYear()))
    let hoursMonthSum = {
      day: {
        hours: hoursMonth.day.hours + Math.floor(hoursMonth.day.minutes / 60),
        minutes: hoursMonth.day.minutes % 60,
        count: hoursMonth.day.count
      },
      night: {
        hours: hoursMonth.night.hours + Math.floor(hoursMonth.night.minutes / 60),
        minutes: hoursMonth.night.minutes % 60,
        count: hoursMonth.night.count
      },
      full: {
        count: hoursMonth.day.count + hoursMonth.night.count
      }
    }
    hoursMonthSum.full.hours = hoursMonthSum.day.hours + hoursMonthSum.night.hours + Math.floor((hoursMonthSum.day.minutes + hoursMonthSum.night.minutes) / 60)
    hoursMonthSum.full.minutes = (hoursMonthSum.day.minutes + hoursMonthSum.night.minutes) % 60

    blocks.hours.group.createWidget(widget.TEXT, {
      x: blocks.P,
      y: blocks.hours.H,
      w: blocks.W - 2 * blocks.P,
      h: px(32),
      text: getText('perMonth'),
      text_size: px(24),
      color: COLORS.secondary,
      align_v: align.CENTER_V
    })
    blocks.hours.H += px(32)

    blocks.hours.group.createWidget(widget.TEXT, {
      x: blocks.P,
      y: blocks.hours.H,
      w: blocks.W - 2 * blocks.P,
      h: px(32),
      text: (getDayNumber(1, time.getMonth(), time.getFullYear()) < firstShiftDay && time.getFullYear() == shift.startDay.year && time.getMonth() == shift.startDay.month
        ? getDateFormatted(shift.startDay.year, shift.startDay.month, shift.startDay.day)
        : getDateFormatted(time.getFullYear(), time.getMonth(), 1))
        + ' - ' + getDateFormatted(time.getFullYear(), time.getMonth(), getMonthLength(time.getMonth(), time.getFullYear())),
      text_size: px(24),
      color: COLORS.secondary,
      align_v: align.CENTER_V
    })
    blocks.hours.H += px(40)

    blocks.hours.group.createWidget(widget.TEXT, {
      x: blocks.P,
      y: blocks.hours.H,
      w: blocks.W - 2 * blocks.P,
      h: px(40),
      text: getText('shiftsCount', hoursMonthSum.full.count) + ', ' + getText('hoursAndMinutes2', hoursMonthSum.full.hours, hoursMonthSum.full.minutes),
      text_size: px(32),
      color: COLORS.primary,
      align_v: align.CENTER_V
    })
    blocks.hours.H += px(40)

    if ((hoursMonthSum.day.hours != 0 || hoursMonthSum.day.minutes != 0) && (hoursMonthSum.night.hours != 0 || hoursMonthSum.night.minutes != 0)) {
      blocks.hours.group.createWidget(widget.TEXT, {
        x: blocks.P,
        y: blocks.hours.H,
        w: blocks.W - 2 * blocks.P,
        h: px(32),
        text: getText('dayType'),
        text_size: px(24),
        color: COLORS.secondary,
        align_v: align.CENTER_V
      })
      blocks.hours.H += px(32)

      blocks.hours.group.createWidget(widget.TEXT, {
        x: blocks.P,
        y: blocks.hours.H,
        w: blocks.W - 2 * blocks.P,
        h: px(40),
        text: getText('shiftsCount', hoursMonthSum.day.count) + ', ' + getText('hoursAndMinutes2', hoursMonthSum.day.hours, hoursMonthSum.day.minutes),
        text_size: px(32),
        color: COLORS.primary,
        align_v: align.CENTER_V
      })
      blocks.hours.H += px(40)

      blocks.hours.group.createWidget(widget.TEXT, {
        x: blocks.P,
        y: blocks.hours.H,
        w: blocks.W - 2 * blocks.P,
        h: px(32),
        text: getText('nightType'),
        text_size: px(24),
        color: COLORS.secondary,
        align_v: align.CENTER_V
      })
      blocks.hours.H += px(32)

      blocks.hours.group.createWidget(widget.TEXT, {
        x: blocks.P,
        y: blocks.hours.H,
        w: blocks.W - 2 * blocks.P,
        h: px(40),
        text: getText('shiftsCount', hoursMonthSum.night.count) + ', ' + getText('hoursAndMinutes2', hoursMonthSum.night.hours, hoursMonthSum.night.minutes),
        text_size: px(32),
        color: COLORS.primary,
        align_v: align.CENTER_V
      })
      blocks.hours.H += px(40)
    }

    blocks.hours.H += blocks.P
    blocks.hours.bg.setProperty(prop.MORE, {
      x: 0,
      y: 0,
      w: blocks.W,
      h: blocks.hours.H
    })

    // Отпуска
    //
    //

    // Кнопки
    blocks.buttons.Y = content.H + content.G
    blocks.buttons.group = createWidget(widget.GROUP, {
      x: blocks.X,
      y: blocks.buttons.Y,
      w: blocks.W,
      h: blocks.buttons.H
    })
    blocks.buttons.bg = blocks.buttons.group.createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: blocks.W,
      h: blocks.buttons.H,
      radius: content.R,
      color: COLORS.bg,
      alpha: content.A
    })
    let btnsArr = ['shift', 'settings', 'info']
    blocks.buttons.W = Math.floor((content.W - blocks.P * 2 - buttons.M * (btnsArr.length - 1)) / btnsArr.length)
    btnsArr.forEach((val, i) => {
      blocks.buttons.group.createWidget(widget.FILL_RECT, {
        x: blocks.P + (blocks.buttons.W + buttons.M) * i,
        y: blocks.P,
        w: blocks.buttons.W,
        h: buttons.H,
        radius: buttons.R,
        color: COLORS.bg,
        alpha: content.A
      })
      blocks.buttons.group.createWidget(widget.BUTTON, {
        x: blocks.P + (blocks.buttons.W + buttons.M) * i,
        y: blocks.P,
        w: blocks.buttons.W,
        h: buttons.H,
        normal_src: `buttons/${val}.png`,
        press_src: `buttons/${val}_gray.png`,
        click_func: () => { push({ url: `page/${val}` }) }
      })
    })

    bottomSpace = createSpace({})
    drawGraphic()
  }
})