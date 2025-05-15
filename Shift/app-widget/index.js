import { createWidget, widget, prop, setAppWidgetSize, getAppWidgetSize } from '@zos/ui'
import { getText } from '@zos/i18n'
import { push } from '@zos/router'

import { COLORS, CONTENT, getNearAlarm, getNearShift, getShiftFormatted } from '../utils/constants'
import { px } from '@zos/utils'
import { localStorage } from '@zos/storage'

const card = {
  X: getAppWidgetSize().margin,
  W: getAppWidgetSize().w,
  P: px(16),
  R: getAppWidgetSize().radius,
  A: CONTENT.A
}

const openButton = {
  W: px(70),
  R: card.R - Math.floor(card.P / 2),
  M: px(10)
}

const data = {
  nearShift: {},
  nearAlarm: {}
}

let bg = {}

AppWidget({
  updateNears() {
    let shift = localStorage.getItem('shift', false)
    let shiftsIsNotNull = Object.keys(shift?.shifts).length
    let nearShift = getNearShift(shift, 100)
    data.nearShift.setProperty(prop.TEXT, shiftsIsNotNull
      ? nearShift
        ? getShiftFormatted(nearShift)
        : getText('nearShiftEmpty', 100)
      : getText('nearShiftNull'))
    data.nearShift.setProperty(prop.MORE, {
      text_size: shiftsIsNotNull && nearShift ? px(28) : px(24)
    })

    let nearAlarm = getNearAlarm(shift, 100)
    data.nearAlarm.setProperty(prop.TEXT, shiftsIsNotNull ? getText('nearAlarmEmpty', 100) : getText('alarmsEmptyText'))
    data.nearAlarm.setProperty(prop.MORE, {
      text_size: nearAlarm ? px(28) : px(24)
    })
    bg.setProperty(prop.COLOR, nearShift?.color ?? COLORS.accent)
  },
  build() {
    bg = createWidget(widget.FILL_RECT, {
      x: card.X,
      y: 0,
      w: card.W,
      h: 0,
      radius: card.R,
      color: COLORS.accent,
      alpha: 50
    })
    card.H = card.P

    createWidget(widget.TEXT, {
      x: card.X + card.P,
      y: card.H,
      w: card.W - 2 * card.P - openButton.W - openButton.M,
      h: px(32),
      text_size: px(24),
      text: getText('widgetNearShift'),
      color: COLORS.primary
    })
    card.H += px(32)

    data.nearShift = createWidget(widget.TEXT, {
      x: card.X + card.P,
      y: card.H,
      w: card.W - 2 * card.P - openButton.W - openButton.M,
      h: px(40),
      text_size: px(28),
      text: '',
      color: COLORS.primary
    })
    card.H += px(50)

    createWidget(widget.TEXT, {
      x: card.X + card.P,
      y: card.H,
      w: card.W - 2 * card.P - openButton.W - openButton.M,
      h: px(32),
      text_size: px(24),
      text: getText('widgetNearAlarm'),
      color: COLORS.primary
    })
    card.H += px(32)

    data.nearAlarm = createWidget(widget.TEXT, {
      x: card.X + card.P,
      y: card.H,
      w: card.W - 2 * card.P - openButton.W - openButton.M,
      h: px(40),
      text_size: px(28),
      text: '',
      color: COLORS.primary
    })
    card.H += px(40)
    openButton.H = card.H - card.P
    card.H += card.P

    this.updateNears()

    createWidget(widget.FILL_RECT, {
      x: card.X + card.W - card.P - openButton.W,
      y: (card.H - openButton.H) / 2,
      w: openButton.W,
      h: openButton.H,
      radius: openButton.R,
      color: COLORS.primary,
      alpha: card.A * 2
    })
    createWidget(widget.BUTTON, {
      x: card.X + card.W - card.P - openButton.W,
      y: (card.H - openButton.H) / 2,
      w: openButton.W,
      h: openButton.H,
      normal_src: 'buttons/arr_right.png',
      press_src: 'buttons/arr_right_gray.png',
      click_func: () => {
        push({
          url: 'page/index'
        })
      }
    })

    bg.setProperty(prop.MORE, {
      x: card.X,
      y: 0,
      w: card.W,
      h: card.H
    })
    setAppWidgetSize({
      h: card.H
    })
  },
  onResume() {
    this.updateNears()
  }
})