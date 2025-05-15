import { getText } from '@zos/i18n'
import { align, createWidget, deleteWidget, event, getTextLayout, prop, setStatusBarVisible, text_style, widget } from '@zos/ui'
import { px } from '@zos/utils'
import { localStorage } from '@zos/storage'
import { createModal, MODAL_CONFIRM } from '@zos/interaction'
import { push } from '@zos/router'

import { ADD_BUTTON, COLORS, CONTENT, Keyboard, SCREEN_HEIGHT, SCREEN_WIDTH, createSpace, isRound } from '../utils/constants'
import { setScrollLock } from '@zos/page'

setStatusBarVisible(false)

let shift = localStorage.getItem('shift')

let shiftPattern = {
  name: '',       // Название
  type: 'day',    // Тип смены (день/ночь/выходной)
  daysCount: 3,   // Количество дней подряд
  time: {         // Время начала
    hours: 8,
    minutes: 0,
  },
  hoursCount: {   // Количество рабочего времени
    hours: 8,
    minutes: 0
  },
  brek: {         // Количество времени перерыва
    hours: 1,
    minutes: 0
  },
  alarm: {        // Будильник
    isOn: false,
    time: {
      prevDay: false,
      hours: 8,
      minutes: 0
    },
    vibro: {
      isOn: true,
      type: 0
    },
    sound: {
      isOn: false,
      type: 'default'
    },
    repeats: {
      count: 0,
      interval: 5
    }
  }
}
let types = ['day', 'night', 'weekend']
let content = JSON.parse(JSON.stringify(CONTENT))
let list = []


Page({
  build() {
    function changeName(shift, oldName, widget) {
      setScrollLock(true)
      const keyboard = new Keyboard(oldName)
      keyboard.draw()
      keyboard.onChanged = (newVal) => {
        shift.name = newVal
        widget.setProperty(prop.TEXT, newVal)
      }
    }

    function changeList(action, id) {
      if (action == 'add') {
        const len = Object.keys(shift.shifts).length
        shift.shifts[len] = JSON.parse(JSON.stringify(shiftPattern))
      } else if (action == 'remove') {
        delete shift.shifts[id]
        shift.shifts = Object.entries(shift.shifts).reduce((a, [, v], i) => ({ ...a, [i]: v }), {})
      }
      drawList()
    }

    function drawList() {
      list.forEach((v, i) => deleteWidget(list[i]))

      let listItemsH = px(260)
      let listItemsM = px(15)

      const entries = Object.values(shift.shifts)
      if (entries.length) {
        entries.forEach((val, i) => {
          list[i] = createWidget(widget.GROUP, {
            x: content.M,
            y: content.Y + (listItemsH + listItemsM) * i,
            w: content.W,
            h: listItemsH
          })

          let listItemH = content.P
          let listItemParamsW = px(100)
          list[i].createWidget(widget.FILL_RECT, {
            x: 0,
            y: 0,
            w: content.W,
            h: listItemsH,
            radius: content.R,
            color: COLORS.primary,
            alpha: content.A
          })
          const color = list[i].createWidget(widget.FILL_RECT, {
            x: content.P,
            y: listItemH,
            w: px(44),
            h: px(44),
            radius: px(22),
            color: val?.color ?? COLORS.shifts[0]
          })
          color.addEventListener(event.CLICK_DOWN, () => {
            let index = val?.color ? COLORS.shifts.indexOf(val?.color) : 0
            if (++index >= COLORS.shifts.length) index = 0
            val.color = COLORS.shifts[index]
            color.setProperty(prop.COLOR, COLORS.shifts[index])
          })
          let name = {}
          if (val.name.length) {
            list[i].createWidget(widget.TEXT, {
              x: content.P + px(54),
              y: listItemH,
              w: content.W - 2 * content.P - px(100),
              h: px(20),
              text: `${getText('shift')} ${i + 1}`,
              text_size: px(16),
              color: COLORS.secondary,
              align_v: align.CENTER_V
            })
            name = list[i].createWidget(widget.TEXT, {
              x: content.P + px(54),
              y: listItemH + px(20),
              w: content.W - 2 * content.P - px(100),
              h: px(24),
              text: val.name.length ? val.name : `${getText('shift')} ${i + 1}`,
              text_size: px(18),
              color: COLORS.secondary,
              align_v: align.CENTER_V
            })
          } else {
            name = list[i].createWidget(widget.TEXT, {
              x: content.P + px(54),
              y: listItemH,
              w: content.W - 2 * content.P - px(100),
              h: px(44),
              text: val.name.length ? val.name : `${getText('shift')} ${i + 1}`,
              text_size: px(24),
              color: COLORS.primary,
              align_v: align.CENTER_V
            })
          }
          name.addEventListener(event.CLICK_UP, () => {
            changeName(val, val.name.length ? val.name : `${getText('shift')} ${i + 1}`, name)
          })
          list[i].createWidget(widget.BUTTON, {
            x: content.W - content.P - px(44),
            y: content.P,
            w: px(44),
            h: px(44),
            normal_src: 'buttons/remove.png',
            press_src: 'buttons/remove_gray.png',
            click_func: () => {
              createModal({
                content: getText('removeShift', val.name.length ? val.name : i + 1),
                onClick: (keyObj) => {
                  const { type } = keyObj
                  if (type === MODAL_CONFIRM) {
                    changeList('remove', i)
                  }
                }
              })
            }
          })
          listItemH += px(70)
          list[i].createWidget(widget.TEXT, {
            x: content.P,
            y: listItemH,
            w: content.W - content.P * 2 - listItemParamsW,
            h: px(40),
            text: getText('type'),
            text_size: px(24),
            color: COLORS.secondary,
            align_v: align.CENTER_V
          })
          const itemType = list[i].createWidget(widget.TEXT, {
            x: content.W - content.P - listItemParamsW,
            y: listItemH,
            w: listItemParamsW,
            h: px(40),
            text: getText(`${val.type}Type`),
            text_size: px(32),
            color: COLORS.primary,
            align_h: align.RIGHT,
            align_v: align.CENTER_V
          })
          listItemH += px(5)
          let dots = Array.from({ length: types.length }, () => { })
          let dotsR = px(4)
          for (let k = 0; k < dots.length; k++) {
            dots[k] = list[i].createWidget(widget.CIRCLE, {
              center_x: content.W - content.P - px(20) * (dots.length - k - 1) - dotsR,
              center_y: listItemH + px(40),
              radius: dotsR,
              color: COLORS.primary,
              alpha: types.indexOf(val.type) == k ? 255 : 100
            })
          }
          itemType.addEventListener(event.CLICK_UP, () => {
            let index = types.indexOf(val.type)
            if (++index >= types.length) index = 0
            val.type = types[index]
            itemType.setProperty(prop.TEXT, getText(`${val.type}Type`))
            hours.setProperty(prop.TEXT, val.type == 'weekend' ? '-' : getText('hoursAndMinutes', val.hoursCount.hours, (val.hoursCount.minutes < 10 ? '0' : '') + val.hoursCount.minutes))
            dots.forEach((v, k) => {
              v.setProperty(prop.ALPHA, index == k ? 255 : 150)
            })
          })
          listItemH += px(55)
          list[i].createWidget(widget.TEXT, {
            x: content.P,
            y: listItemH,
            w: content.W - content.P * 2 - listItemParamsW,
            h: px(40),
            text: getText('daysCount'),
            text_size: px(24),
            color: COLORS.secondary,
            align_v: align.CENTER_V
          })
          const daysCount = list[i].createWidget(widget.TEXT, {
            x: content.W - content.P - listItemParamsW,
            y: listItemH,
            w: listItemParamsW,
            h: px(40),
            text: `${val.daysCount}`,
            text_size: px(32),
            color: COLORS.primary,
            align_h: align.RIGHT,
            align_v: align.CENTER_V
          })
          daysCount.addEventListener(event.CLICK_UP, () => {
            push({
              url: 'page/picker',
              params: {
                id: i,
                param: 'daysCount'
              }
            })
          })
          listItemH += px(60)
          list[i].createWidget(widget.TEXT, {
            x: content.P,
            y: listItemH,
            w: content.W - content.P * 2 - listItemParamsW,
            h: px(40),
            text: getText('hoursCount'),
            text_size: px(24),
            color: COLORS.secondary,
            align_v: align.CENTER_V
          })
          const hours = list[i].createWidget(widget.TEXT, {
            x: content.W - content.P - listItemParamsW,
            y: listItemH,
            w: listItemParamsW,
            h: px(40),
            text: val.type == 'weekend' ? '-' : getText('hoursAndMinutes', val.hoursCount.hours, (val.hoursCount.minutes < 10 ? '0' : '') + val.hoursCount.minutes),
            text_size: px(32),
            color: COLORS.primary,
            align_h: align.RIGHT,
            align_v: align.CENTER_V
          })
          hours.addEventListener(event.CLICK_UP, () => {
            if (val.type != 'weekend') {
              push({
                url: 'page/picker',
                params: {
                  id: i,
                  param: 'hoursCount'
                }
              })
            }
          })
        })
      }
      content.H = content.Y + (listItemsH + listItemsM) * entries.length + px(20)

      list[list.length] = createWidget(widget.BUTTON, {
        x: (SCREEN_WIDTH - ADD_BUTTON.w) / 2,
        y: content.H,
        w: ADD_BUTTON.w,
        h: ADD_BUTTON.w,
        radius: ADD_BUTTON.r,
        text: ADD_BUTTON.t,
        text_size: ADD_BUTTON.s,
        color: COLORS.primary,
        normal_color: COLORS.dark2,
        press_color: COLORS.dark,
        click_func: () => {
          changeList('add')
        }
      })
      content.H += ADD_BUTTON.w

      list[list.length] = createSpace({ y: content.H })
    }

    content.H = content.Y

    createWidget(widget.TEXT, {
      x: content.M,
      y: content.Y,
      w: content.W,
      h: px(50),
      text: getText('shifts'),
      text_size: px(32),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V
    })
    content.H += px(80)
    content.Y = content.H

    drawList()
  },
  onDestroy() {
    localStorage.setItem('shift', shift)
  }
})