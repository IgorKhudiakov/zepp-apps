import { BasePage } from '@zeppos/zml/base-page'
import * as hmUI from "@zos/ui"
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device"
import { localStorage } from "@zos/storage"
import { replace } from "@zos/router"
import { px } from '@zos/utils'

import { COLORS } from "../utils/constants"
import { numFormat } from "../utils/formatter"
import { createButtons } from '../utils/functions'

const { screenShape } = getDeviceInfo()
const screenWidth = getDeviceInfo().width
const screenHeight = getDeviceInfo().height
const isRoundedScreen = screenShape == SCREEN_SHAPE_ROUND

Page(
  BasePage({
    editValue(oldVal, newVal, lenlim = 7) {
      let oldValStr = oldVal.toString()
      let newValStr = newVal.toString()
      if (newValStr == 'backspace') newValStr = oldValStr.length <= 1 ? '0' : oldValStr.substring(0, oldValStr.length - 1)
      else {
        if (oldValStr.length > lenlim) newValStr = oldValStr.substring(0, lenlim)
        else if (oldValStr.length == lenlim) newValStr = oldValStr
        else newValStr = parseInt(oldValStr) == '0' ? newValStr : oldValStr += newValStr
      }
      return newValStr
    },
    saveValue(data) {
      const transport = data.transport
      const keys = data.key.split('.')
      let current = transport[data.index]
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = data.value

      localStorage.setItem('transport', transport)
      this.call({
        method: "SAVE_TRANSPORT",
        params: transport
      })
        .then(() => { })
        .catch(() => { })
      replace({
        url: 'page/index',
        params: {}
      })
    },
    onInit(data) {
      hmUI.setStatusBarVisible(false)
      data = JSON.parse(data)
      let startY = px(isRoundedScreen ? 50 : 10)
      let M = px(isRoundedScreen ? 50 : 10)

      hmUI.createWidget(hmUI.widget.TEXT, {
        x: M,
        y: startY,
        w: screenWidth - px(isRoundedScreen ? 100 : 20),
        h: px(30),
        text: data.text,
        text_size: px(20),
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
        text_style: hmUI.text_style.NONE,
        color: COLORS.secondary
      })
      const text = hmUI.createWidget(hmUI.widget.TEXT, {
        x: M,
        y: startY + px(40),
        w: screenWidth - px(isRoundedScreen ? 100 : 20),
        h: px(50),
        text: numFormat(data.value.toString()),
        text_size: px(40),
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
        color: COLORS.primary
      })

      const keyboard = {
        X: M,
        Y: startY + px(100),
        W: screenWidth - px(isRoundedScreen ? 100 : 20),
        keys: [
          [1, 2, 3, 'backspace'],
          [4, 5, 6, 0],
          [7, 8, 9, 'apply']
        ]
      }

      const key = {
        X: keyboard.X,
        Y: keyboard.Y + px(10),
        H: px(64),
        MR: px(10),
        MB: px(10),
        R: px(10)
      }
      key.W = (keyboard.W - (keyboard.keys[0].length - 1) * key.MR) / keyboard.keys[0].length
      keyboard.H = keyboard.keys.length * (key.H + key.MB) - key.MB

      for (let i = 0; i < keyboard.keys.length; i++) {
        for (let k = 0; k < keyboard.keys[i].length; k++) {
          const btnParams = Number.isNaN(parseInt(keyboard.keys[i][k])) ?
            {
              normal_src: `image/buttons/${keyboard.keys[i][k]}.png`,
              press_src: `image/buttons/${keyboard.keys[i][k]}.png`,
            } :
            {
              text: keyboard.keys[i][k],
              text_size: px(24),
              color: COLORS.primary,
              normal_color: 0x333333,
              press_color: 0x666666,
            }
          if (Number.isNaN(parseInt(keyboard.keys[i][k]))) {
            hmUI.createWidget(hmUI.widget.FILL_RECT, {
              x: key.X + (key.W + key.MR) * k,
              y: key.Y + (key.H + key.MB) * i,
              w: key.W,
              h: key.H,
              radius: key.R,
              color: 0x333333,
            })
          }
          hmUI.createWidget(hmUI.widget.BUTTON, {
            x: key.X + (key.W + key.MR) * k,
            y: key.Y + (key.H + key.MB) * i,
            w: key.W,
            h: key.H,
            ...btnParams,
            radius: key.R,
            click_func: () => {
              if (keyboard.keys[i][k] == 'apply') this.saveValue(data)
              else {
                data.value = this.editValue(data.value, keyboard.keys[i][k])
                text.setProperty(hmUI.prop.TEXT, numFormat(data.value))
              }
            }
          })
        }
      }

      createButtons({ UI: hmUI, y: keyboard.Y + keyboard.H + px(10), buttons: { 1: { name: 'back', type: 'replace', url: 'page/index' } } })
    },
    build() { },
    onDestroy() { },
  })
)