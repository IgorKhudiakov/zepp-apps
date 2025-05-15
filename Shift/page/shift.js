import { getText } from '@zos/i18n'
import { align, createWidget, deleteWidget, event, getTextLayout, prop, setStatusBarVisible, text_style, widget } from '@zos/ui'
import { px } from '@zos/utils'
import { localStorage } from '@zos/storage'
import { Time } from '@zos/sensor'
import { setScrollLock } from '@zos/page'
import { push } from '@zos/router'

import { ARROW_BTN_PARAMS, COLORS, CONTENT, SCREEN_HEIGHT, SCREEN_WIDTH, isRound, getDateFormatted, ALARMS_PARAMS } from '../utils/constants'

setStatusBarVisible(false)

const time = new Time()

let shift = localStorage.getItem('shift', {
  params: {
    graphic: 'weeks',
    alarms: 'off'
  },
  startDay: {
    day: time.getDate(),
    month: time.getMonth(),
    year: time.getFullYear()
  },
  shifts: {},
  alarms: {},
  vacations: { // Отпуска
    // 1: {
    //   from: {
    //     day: 1,
    //     month: 1,
    //     year: 2025
    //   },
    //   to: {
    //     day: 31,
    //     month: 1,
    //     year: 2025
    //   },
    //   count: 31,
    // }
  }
})

let pickerG = {}

let content = JSON.parse(JSON.stringify(CONTENT))

Page({
  build() {
    function closePicker() {
      setScrollLock(false)
      deleteWidget(pickerG)
    }
    function showPicker() {
      setScrollLock(true)
      pickerG = createWidget(widget.GROUP, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT
      })
      pickerG.createWidget(widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: SCREEN_HEIGHT
      })

      let pickerH = px(isRound ? 50 : 32)
      pickerG.createWidget(widget.TEXT, {
        x: 0,
        y: pickerH,
        w: SCREEN_WIDTH,
        h: px(40),
        text: getText('startDate'),
        text_size: px(32),
        color: COLORS.primary,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V
      })
      pickerH += px(60)

      const picker = pickerG.createWidget(widget.PICK_DATE, {
        x: 0,
        y: pickerH,
        w: SCREEN_WIDTH,
        font_size: px(36),
        padding_1: px(20),
        padding_2: px(20),
        startYear: 2020,
        endYear: 2035,
        initYear: shift.startDay.year,
        initMonth: shift.startDay.month,
        initDay: shift.startDay.day
      })
      pickerH += px(230)

      pickerG.createWidget(widget.BUTTON, {
        x: (SCREEN_WIDTH - px(240)) / 2,
        y: pickerH,
        w: px(240),
        h: px(50),
        text: getText('apply'),
        text_size: px(32),
        color: COLORS.primary,
        radius: px(10),
        normal_color: COLORS.accent,
        press_color: COLORS.dark,
        click_func: () => {
          const dateObj = picker.getProperty(prop.MORE, {})
          const { year, month, day } = dateObj
          shift.startDay.year = year
          shift.startDay.month = month
          shift.startDay.day = day
          let newDate = getDateFormatted(year, month, day)
          let newDateW = getTextLayout(newDate, { text_size: px(32), text_width: 0 }).width
          dateWidget.setProperty(prop.MORE, {
            x: content.M + content.W - newDateW,
            w: newDateW
          })
          dateWidget.setProperty(prop.TEXT, newDate)
          closePicker()
        }
      })
      pickerH += px(60)

      pickerG.createWidget(widget.BUTTON, {
        x: (SCREEN_WIDTH - px(240)) / 2,
        y: pickerH,
        w: px(240),
        h: px(50),
        text: getText('cancel'),
        text_size: px(32),
        color: COLORS.secondary,
        radius: px(10),
        normal_color: COLORS.dark2,
        press_color: COLORS.dark,
        click_func: closePicker
      })
    }

    function changeAlarmsState() {
      let alarmsStates = ALARMS_PARAMS.states
      let index = alarmsStates.indexOf(shift.params.alarms)
      if (++ index >= alarmsStates.length) index = 0
      shift.params.alarms = alarmsStates[index]
      alarmsStateText.setProperty(prop.TEXT, getText(alarmsStates[index]))
    }

    createWidget(widget.TEXT, {
      x: content.M,
      y: content.H,
      w: content.W,
      h: px(50),
      text: getText('shiftEdit'),
      text_size: px(32),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V
    })
    content.H += px(80)

    let dateText = getDateFormatted(shift.startDay.year, shift.startDay.month, shift.startDay.day)
    let dateW = getTextLayout(dateText, { text_width: 0, text_size: px(32) }).width
    createWidget(widget.TEXT, {
      x: content.M,
      y: content.H,
      w: content.W - dateW,
      h: px(40),
      text: getText('startDate'),
      text_size: px(24),
      color: COLORS.secondary,
      align_v: align.CENTER_V
    })
    const dateWidget = createWidget(widget.TEXT, {
      x: content.M + content.W - dateW,
      y: content.H,
      w: dateW,
      h: px(40),
      text: dateText,
      text_size: px(32),
      color: COLORS.primary,
      align_h: align.RIGHT,
      align_v: align.CENTER_V
    })
    dateWidget.addEventListener(event.CLICK_UP, showPicker)
    content.H += px(60)

    createWidget(widget.TEXT, {
      x: content.M,
      y: content.H,
      w: content.W - ARROW_BTN_PARAMS.w,
      h: px(40),
      text: getText('shifts'),
      text_size: px(24),
      color: COLORS.secondary,
      align_v: align.CENTER_V
    })
    createWidget(widget.BUTTON, {
      x: content.M + content.W - ARROW_BTN_PARAMS.w,
      y: content.H,
      ...ARROW_BTN_PARAMS,
      click_func: () => {
        push({
          url: 'page/shifts'
        })
      }
    })
    content.H += px(60)

    createWidget(widget.TEXT, {
      x: content.M,
      y: content.H,
      w: content.W,
      h: px(40),
      text: getText('alarms'),
      text_size: px(24),
      color: COLORS.secondary,
      align_v: align.CENTER_V
    })
    const alarmsStateText = createWidget(widget.TEXT, {
      x: content.M + content.W - px(160),
      y: content.H,
      w: px(160),
      h: px(40),
      text: getText(shift.params.alarms),
      text_size: px(32),
      color: COLORS.primary,
      align_h: align.RIGHT,
      align_v: align.CENTER_V
    })
    alarmsStateText.addEventListener(event.CLICK_UP, changeAlarmsState)
    content.H += px(60)

    createWidget(widget.TEXT, {
      x: content.M,
      y: content.H,
      w: content.W - ARROW_BTN_PARAMS.w,
      h: px(40),
      text: getText("vacations"),
      text_size: px(24),
      // color: COLORS.secondary,
      color: COLORS.inactive,
      align_v: align.CENTER_V
    })
    createWidget(widget.BUTTON, {
      x: content.M + content.W - ARROW_BTN_PARAMS.w,
      y: content.H,
      ...ARROW_BTN_PARAMS,
      normal_src: 'buttons/arr_right_gray.png',
      // click_func: () => {
      //   push({
      //     url: 'page/vacations'
      //   })
      // }
    })
    content.H += px(60)
  },
  onDestroy() {
    localStorage.setItem('shift', shift)
  }
})