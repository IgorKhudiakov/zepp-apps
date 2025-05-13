import { BasePage } from '@zeppos/zml/base-page'
import hmUI, { align, createWidget, getTextLayout, prop, setStatusBarVisible, text_style, widget } from "@zos/ui"
import { getText } from "@zos/i18n"
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device"
import { localStorage } from "@zos/storage"
import { queryPermission, requestPermission } from "@zos/app"
import { createModal } from "@zos/interaction"
import { px } from "@zos/utils"

import { COLORS, SERVICE_PERMISSION } from "../utils/constants"
import { SETTINGS_TEXT_PARAMS, SETTINGS_DESC_PARAMS, SWITCH_PARAMS, CHECKBOX } from "../utils/settings"
import { createButtons, changeSettings } from "../utils/functions"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, screenShape } = getDeviceInfo()
const isRound = screenShape == SCREEN_SHAPE_ROUND

let settings = localStorage.getItem('settings', {})

Page(
  BasePage({
    callSettings() {
      this.call({
        method: "SAVE_SETTINGS",
        params: settings
      })
        .then(() => { })
        .catch(() => { })
    },
    onInit() {
      setStatusBarVisible(false)

      function dataUpdate(widget, key, isIncrement = true, save = true) {
        let currentParam = settings[key.param]
        let index = currentParam ? key.vals.indexOf(currentParam) : 0
        if (isIncrement) index = index + 1 >= key.vals.length ? 0 : (index + 1)
        let val = key.vals[index]
        let valW = getTextLayout(`${val}`, { text_size: px(40), text_width: 0 }).width
        let suffixW = getTextLayout(key?.suffix ?? '', { text_size: px(28), text_width: 0 }).width
        widget.setProperty(prop.MORE, {
          x: groups.W - suffixW - valW - groups.RBM,
          w: valW,
          text: getText(val)
        })
        if (save) {
          changeSettings(key.param, val)
          settings = localStorage.getItem('settings')
        }
      }
      function changeService(val) {
        let newVal = false
        if (val) {
          const permissions = SERVICE_PERMISSION
          const [perm] = queryPermission({ permissions })
          newVal = perm == 2
          if (perm == 0) {
            requestPermission({
              permissions,
              callback([perm]) {
                newVal = perm == 2
                changeSettings("bgService", newVal)
                fill.setProperty(prop.VISIBLE, !newVal)
              }
            })
          }
        }
        changeSettings("bgService", newVal)
        fill.setProperty(prop.VISIBLE, !newVal)
        return newVal
      }

      let startY = px(isRound ? 50 : 20)
      let contentH = startY
      let M = px(isRound ? 36 : 32)

      createWidget(widget.TEXT, {
        x: M,
        y: contentH,
        w: SCREEN_WIDTH - M * 2,
        h: px(50),
        text: getText('settings'),
        text_size: px(32),
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text_style: text_style.WRAP
      })

      contentH += px(100)

      const groups = {
        X: M,
        W: SCREEN_WIDTH - M * 2,
        H: px(80),
        M: px(20),
        RBM: px(10),              // Отступ кнопки справа
        RBW: px(96)               // Ширина кнопки справа 
      }
      let groupsData = {
        0: {
          type: "checkbox",
          text: getText("bgServiceText"),
          desc: getText("bgServiceDesc"),
          param: "bgService"
        },
        1: {
          type: "checkbox",
          text: getText("notifUpdateText"),
          desc: getText("notifUpdateDesc"),
          param: "notifUpdate"
        },
        2: {
          type: "selector",
          text: getText("freqText"),
          desc: getText("freqDesc"),
          param: "freq",
          vals: [1, 3, 7, 30],
          suffix: getText("daySuffix")
        },
        3: {
          type: "checkbox",
          text: getText("notifTOText"),
          desc: getText("notifTODesc"),
          param: "notifTO"
        },
        4: {
          type: "selector",
          text: getText("measureText"),
          desc: getText("measureDesc"),
          param: "measure",
          vals: ['km', 'mi']
        },
        5: {
          type: "clear",
          text: getText("clearText"),
          desc: getText("clearDesc")
        }
      }

      const groupsArr = []
      const gg = []
      const alphaFill = {
        x: 0,
        y: 0,
        w: SCREEN_WIDTH,
        h: 0
      }

      for (let key in groupsData) {
        if (Object.keys(groupsData).indexOf(key) == 1) alphaFill.y = contentH
        groupsArr[key] = createWidget(widget.GROUP, {
          x: groups.X,
          y: contentH,
          w: groups.W,
          h: groups.H
        })
        groupsArr[key].createWidget(widget.TEXT, {
          ...SETTINGS_TEXT_PARAMS,
          w: SCREEN_WIDTH - M * 2 - groups.RBW - groups.RBM,
          text: groupsData[key].text,
        })
        groupsArr[key].createWidget(widget.TEXT, {
          ...SETTINGS_DESC_PARAMS,
          w: SCREEN_WIDTH - M * 2 - groups.RBW - groups.RBM,
          text: groupsData[key].desc,
        })
        switch (groupsData[key].type) {
          case "checkbox": {
            groupsArr[key].createWidget(widget.SLIDE_SWITCH, {
              x: groups.W - CHECKBOX.W,
              y: (groups.H - CHECKBOX.H) / 2,
              ...SWITCH_PARAMS,
              checked: settings[groupsData[key].param],
              checked_change_func: (slide, checked) => {
                changeSettings(groupsData[key].param, checked)
                if (groupsData[key].param == "bgService") changeService(checked)
              }
            })
            break
          }
          case "selector": {
            let suffixW = getTextLayout(groupsData[key]?.suffix ?? '', { text_size: px(28), text_width: 0 }).width
            gg[key] = groupsArr[key].createWidget(widget.TEXT, {
              x: 0,
              y: 0,
              w: 0,
              h: groups.H,
              text: '',
              text_size: px(40),
              align_h: align.RIGHT,
              align_v: align.CENTER_V,
              text_style: text_style.NONE,
              color: COLORS.primary
            })
            dataUpdate(gg[key], groupsData[key], false, false)
            if (groupsData[key]?.suffix) {
              groupsArr[key].createWidget(widget.TEXT, {
                x: groups.W - suffixW,
                y: 0,
                w: suffixW,
                h: groups.H,
                text: groupsData[key].suffix,
                text_size: px(28),
                align_h: align.RIGHT,
                align_v: align.CENTER_V,
                text_style: text_style.NONE,
                color: COLORS.primary
              })
            }
            groupsArr[key].createWidget(widget.BUTTON, {
              x: groups.W - groups.RBW,
              y: 0,
              w: groups.RBW,
              h: groups.H,
              normal_src: '',
              press_src: '',
              click_func: () => {
                dataUpdate(gg[key], groupsData[key])
                this.callSettings()
              }
            })
            break
          }
          case "clear": {
            groupsArr[key].createWidget(widget.BUTTON, {
              x: groups.W - groups.RBW,
              y: (groups.H - groups.RBW) / 2,
              w: groups.RBW,
              h: groups.H,
              normal_src: 'image/buttons/reset.png',
              press_src: 'image/buttons/reset_gray.png',
              click_func: () => {
                createModal({
                  content: getText("clearDialogTitle"),
                  onClick: (key) => {
                    if (key.type == 1) localStorage.clear()
                  }
                })
              }
            })
            break
          }
          default:
            break
        }
        contentH += groups.H + groups.M
        if (Object.keys(groupsData).indexOf(key) < 3) alphaFill.h += groups.H + groups.M
      }

      const fill = createWidget(widget.FILL_RECT, {
        x: alphaFill.x,
        y: alphaFill.y,
        w: alphaFill.w,
        h: alphaFill.h,
        color: 0x000000,
        alpha: 200
      })
      fill.setProperty(prop.VISIBLE, !(settings[groupsData[0].param]))

      createButtons({ UI: hmUI, y: contentH, buttons: { 1: { name: 'back' } } })
    },
    build() { },
    onDestroy() { },
  })
)