import * as hmUI from "@zos/ui"
import { getText } from "@zos/i18n"
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device"
import { localStorage } from "@zos/storage"
import { queryPermission, requestPermission } from "@zos/app"
import { createModal } from "@zos/interaction"
import { px } from "@zos/utils"

import { COLORS, SERVICE_PERMISSION } from "../utils/constants"
import { SETTINGS_TEXT_PARAMS, SETTINGS_DESC_PARAMS, SWITCH_PARAMS, CHECKBOX } from "../utils/settings"
import { createButtons, changeSettings } from "../utils/functions"

const { screenShape } = getDeviceInfo()
const screenWidth = getDeviceInfo().width
const screenHeight = getDeviceInfo().height
const isRoundedScreen = screenShape == SCREEN_SHAPE_ROUND

Page({
  onInit() {
    hmUI.setStatusBarVisible(false)
    
    function getSettings(key) {
      const settings = localStorage.getItem('settings', {})
      return settings[key]
    }
    function dataUpdate(widget, key, isIncrement = true, save = true) {
      let currentParam = getSettings(key.param)
      let index = currentParam ? key.vals.indexOf(currentParam) : 0
      if (isIncrement) index = index + 1 >= key.vals.length ? 0 : (index + 1)
      let val = key.vals[index]
      let valW = hmUI.getTextLayout(`${val}`, { text_size: 40, text_width: 0 }).width
      let suffixW = hmUI.getTextLayout(key.suffix, { text_size: 28, text_width: 0 }).width
      widget.setProperty(hmUI.prop.MORE, {
        x: groups.W - suffixW - valW - 10,
        w: valW,
        text: val
      })
      if (save) changeSettings(key.param, val)
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
              fill.setProperty(hmUI.prop.VISIBLE, !newVal)
            }
          })
        }
      }
      changeSettings("bgService", newVal)
      fill.setProperty(hmUI.prop.VISIBLE, !newVal)
      return newVal
    }

    let startY = isRoundedScreen ? 50 : 20
    let contentH = startY
    let M = isRoundedScreen ? 36 : 32

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: M,
      y: contentH,
      w: screenWidth - M * 2,
      h: 50,
      text: getText('settings'),
      text_size: 32,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text_style: hmUI.text_style.WRAP
    })

    contentH += 100

    const groups = {
      X: M,
      W: screenWidth - M * 2,
      H: 80,
      M: 20
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
        type: "number",
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
      w: screenWidth,
      h: 0
    }

    for (let key in groupsData) {
      if (Object.keys(groupsData).indexOf(key) == 1) alphaFill.y = contentH
      groupsArr[key] = hmUI.createWidget(hmUI.widget.GROUP, {
        x: groups.X,
        y: contentH,
        w: groups.W,
        h: groups.H
      })
      groupsArr[key].createWidget(hmUI.widget.TEXT, {
        ...SETTINGS_TEXT_PARAMS,
        w: screenWidth - M * 2 - 110,
        text: groupsData[key].text,
      })
      groupsArr[key].createWidget(hmUI.widget.TEXT, {
        ...SETTINGS_DESC_PARAMS,
        w: screenWidth - M * 2 - 110,
        text: groupsData[key].desc,
      })
      switch (groupsData[key].type) {
        case "checkbox": {
          groupsArr[key].createWidget(hmUI.widget.SLIDE_SWITCH, {
            x: groups.W - CHECKBOX.W,
            y: (groups.H - CHECKBOX.H) / 2,
            ...SWITCH_PARAMS,
            checked: getSettings(groupsData[key].param),
            checked_change_func: (slide, checked) => {
              changeSettings(groupsData[key].param, checked)
              if (groupsData[key].param == "bgService") changeService(checked)
            }
          })
          break
        }
        case "number": {
          let suffixW = hmUI.getTextLayout(groupsData[key].suffix, { text_size: 28, text_width: 0 }).width
          gg[key] = groupsArr[key].createWidget(hmUI.widget.TEXT, {
            x: 0,
            y: 0,
            w: 0,
            h: groups.H,
            text: '',
            text_size: 40,
            align_h: hmUI.align.RIGHT,
            align_v: hmUI.align.CENTER_V,
            text_style: hmUI.text_style.NONE,
            color: COLORS.primary
          })
          dataUpdate(gg[key], groupsData[key], false)
          groupsArr[key].createWidget(hmUI.widget.TEXT, {
            x: groups.W - suffixW,
            y: 0,
            w: suffixW,
            h: groups.H,
            text: groupsData[key].suffix,
            text_size: 28,
            align_h: hmUI.align.RIGHT,
            align_v: hmUI.align.CENTER_V,
            text_style: hmUI.text_style.NONE,
            color: COLORS.primary
          })
          groupsArr[key].createWidget(hmUI.widget.BUTTON, {
            x: groups.W - 100,
            y: 0,
            w: px(100),
            h: px(groups.H),
            normal_src: '',
            press_src: '',
            click_func: () => dataUpdate(gg[key], groupsData[key])
          })
          break
        }
        case "clear": {
          groupsArr[key].createWidget(hmUI.widget.BUTTON, {
            x: groups.W - CHECKBOX.W,
            y: (groups.H - CHECKBOX.H) / 2,
            w: px(CHECKBOX.W),
            h: px(CHECKBOX.H),
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

    const fill = hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: alphaFill.x,
      y: alphaFill.y,
      w: alphaFill.w,
      h: alphaFill.h,
      color: 0x000000,
      alpha: 200
    })
    fill.setProperty(hmUI.prop.VISIBLE, !(getSettings(groupsData[0].param)))

    createButtons({ UI: hmUI, y: contentH, buttons: { 1: { name: 'back' } } })
  },
  build() { },
  onDestroy() { },
});
