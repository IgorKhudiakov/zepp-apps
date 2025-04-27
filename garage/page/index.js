import { BasePage } from '@zeppos/zml/base-page'
import * as hmUI from "@zos/ui"
import { getText } from "@zos/i18n"
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device"
import { replace } from '@zos/router'
import { localStorage } from "@zos/storage"
import { px } from '@zos/utils'
import { queryPermission } from "@zos/app"
import * as service from '@zos/app-service'

import { numFormat, carNumFormat } from "../utils/formatter"
import { COLORS, SERVICE_PERMISSION } from "../utils/constants"
import { createButtons } from '../utils/functions'
import { Time } from '@zos/sensor'

const { screenShape } = getDeviceInfo()
const screenWidth = getDeviceInfo().width
const screenHeight = getDeviceInfo().height
const isRoundedScreen = screenShape == SCREEN_SHAPE_ROUND

Page(
  BasePage({
    getTransport() {
      this.request({
        method: "GET_TRANSPORT"
      })
        .then(({ result }) => {
          let oldTransport = JSON.stringify(localStorage.getItem('transport', []))
          if (oldTransport != JSON.stringify(result)) {
            localStorage.setItem('transport', result)
            getApp()._options.globalData.isUpdated = true
            replace({
              url: 'page/index',
              params: {}
            })
          }
        })
        .catch((res) => { if (getApp()._options.globalData.dev) console.log(`request error: ${res}`) })
    },
    saveTransport(data) {
      if (data) localStorage.setItem('transport', data)
      this.call({
        method: "SAVE_TRANSPORT",
        params: data ?? localStorage.getItem('transport', [])
      })
        .then(() => { })
        .catch(() => { })
    },
    editParam(data) {
      replace({
        url: 'page/editparam',
        params: data
      })
    },
    onInit(options = {}) {
      hmUI.setStatusBarVisible(false)
      if (getApp()._options.globalData.isUpdated != true) this.getTransport()
      if (typeof options === 'string') options = JSON.parse(options)

      const main = {
        M: isRoundedScreen ? 30 : 5,
        P: 15,
        Y: isRoundedScreen ? 100 : 50,
        H: 130,
        MB: 30
      }
      main.W = screenWidth - main.M * 2
      let contentH = main.Y

      var localData = localStorage.getItem('transport', [])
      if (localData.length == 0) {
        contentH = 50
        let imgPath = 'image/no_trans.png'
        let imgRect = hmUI.getImageInfo(imgPath)
        hmUI.createWidget(hmUI.widget.IMG, {
          x: (screenWidth - imgRect.width) / 2,
          y: contentH,
          src: imgPath
        })
        contentH += imgRect.height + 30
        hmUI.createWidget(hmUI.widget.TEXT, {
          x: main.M,
          y: contentH,
          w: main.W,
          h: 36,
          text: getText('transportNullWatch'),
          text_size: 28,
          align_h: hmUI.align.CENTER_H,
          align_v: hmUI.align.CENTER_V,
          color: COLORS.primary
        })
        contentH += 40
        let textH = hmUI.getTextLayout(getText('newInApp'), { text_size: 24, text_width: main.W, wrapped: 1 }).height
        hmUI.createWidget(hmUI.widget.TEXT, {
          x: main.M,
          y: contentH,
          w: main.W,
          h: textH,
          text: getText('newInApp'),
          text_size: 24,
          align_h: hmUI.align.CENTER_H,
          align_v: hmUI.align.CENTER_V,
          text_style: hmUI.text_style.WRAP,
          color: COLORS.secondary
        })
        contentH += textH + 20
      } else {
        const curTrans = localData[options.id ?? 0] ?? {}
        let curTransIndex = 0
        let numVisible = curTrans.carnum.visible ?? false
        let accentColor = curTrans.accent
          ? curTrans.accent.isCustom
            ? curTrans.accent.customColor ?? curTrans.accent.color ?? COLORS.primary
            : curTrans.accent.color ?? COLORS.primary
          : COLORS.primary
        if (accentColor.length == 6) accentColor = `0x${accentColor}`

        const btnsG = {
          X: main.M + 20,
          Y: main.Y,
          W: screenWidth - 2 * main.M - 40
        }
        const transIcon = {
          W: 60,
          H: 30,
          M: 20
        }
        const btnsGroup = hmUI.createWidget(hmUI.widget.GROUP, {
          x: btnsG.X,
          y: btnsG.Y,
          w: btnsG.W,
          h: transIcon.H
        })

        let leftShadowV = false
        for (let i = 0; i < localData.length; i++) {
          btnsGroup.createWidget(hmUI.widget.BUTTON, {
            x: (transIcon.W + transIcon.M) * i,
            y: 0,
            w: px(transIcon.W),
            h: px(transIcon.H),
            normal_src: `image/buttons/${localData[i].type}${localData[i].autoID == curTrans.autoID ? '' : '_gray'}.png`,
            press_src: `image/buttons/${localData[i].type}.png`,
            click_func: () => {
              if (localData[i].autoID != curTrans.autoID) {
                replace({
                  url: 'page/index',
                  params: {
                    id: i
                  }
                })
              }
            }
          })
          if (localData[i].autoID == curTrans.autoID) {
            curTransIndex = i
            let iconPosX = btnsG.X + (transIcon.W + transIcon.M) * i
            if (iconPosX > (screenWidth - transIcon.W) / 2) {
              btnsGroup.setProperty(hmUI.prop.X, btnsG.X - (iconPosX - (screenWidth - transIcon.W) / 2))
              leftShadowV = true
            }
          }
        }

        if (leftShadowV) {
          hmUI.createWidget(hmUI.widget.IMG, {
            x: 0 - (30 - main.M),
            y: btnsG.Y - 5,
            src: 'image/shadow_left.png'
          })
        }
        hmUI.createWidget(hmUI.widget.IMG, {
          x: screenWidth - 100 + (30 - main.M),
          y: btnsG.Y - 5,
          src: 'image/shadow_right.png'
        })

        const autoGroup = hmUI.createWidget(hmUI.widget.GROUP, {
          x: main.M,
          y: main.Y + 50,
          w: main.W,
          h: main.M
        })

        autoGroup.createWidget(hmUI.widget.STROKE_RECT, {
          x: 0,
          y: 0,
          w: main.W,
          h: main.H,
          color: accentColor,
          line_width: 1,
          radius: 10
        })

        let carNumW = 0
        let carNumRegW = 0
        let carNumIM = 2
        let fullCarNumW = 0

        if (numVisible) {

          let carNumH = 30
          let carNumP = 5

          let carNum = carNumFormat(curTrans.carnum.num, curTrans.type)
          let carNumReg = `${curTrans.carnum.reg}`
          carNumW = hmUI.getTextLayout(carNum, { text_size: 24, text_width: 0 }).width + carNumP * 2
          fullCarNumW += carNumW
          carNumRegW = hmUI.getTextLayout(carNumReg, { text_size: 24, text_width: 0 }).width + carNumP * 2

          const carNumBg = autoGroup.createWidget(hmUI.widget.FILL_RECT, {
            x: main.W - main.P - carNumW - (curTrans.type == 'scooter' ? 0 : (carNumRegW + carNumIM)),
            y: main.P,
            w: carNumW,
            h: carNumH,
            line_width: 1,
            radius: 5,
            color: COLORS.primary
          })
          autoGroup.createWidget(hmUI.widget.TEXT, {
            x: carNumBg.getProperty(hmUI.prop.X) + carNumP,
            y: carNumBg.getProperty(hmUI.prop.Y),
            w: carNumBg.getProperty(hmUI.prop.W),
            h: carNumH,
            text: carNum.toLowerCase(),
            text_size: 24,
            align_h: hmUI.align.LEFT,
            align_v: hmUI.align.CENTER_V,
            text_style: hmUI.text_style.NONE,
            color: 0x000000
          })

          if (curTrans.type != 'scooter') {
            fullCarNumW += carNumRegW + carNumIM
            const carNumRegBg = autoGroup.createWidget(hmUI.widget.FILL_RECT, {
              x: main.W - main.P - carNumRegW,
              y: main.P,
              w: carNumRegW,
              h: carNumH,
              line_width: 1,
              radius: 5,
              color: COLORS.primary
            })
            autoGroup.createWidget(hmUI.widget.TEXT, {
              x: carNumRegBg.getProperty(hmUI.prop.X) + carNumP,
              y: carNumRegBg.getProperty(hmUI.prop.Y),
              w: carNumRegBg.getProperty(hmUI.prop.W),
              h: carNumH,
              text: carNumReg,
              text_size: 24,
              align_h: hmUI.align.LEFT,
              align_v: hmUI.align.CENTER_V,
              text_style: hmUI.text_style.NONE,
              color: 0x000000
            })
          }
        }

        autoGroup.createWidget(hmUI.widget.TEXT, {
          x: main.P,
          y: main.P,
          w: main.W - main.P * 2 - (fullCarNumW > 0 ? (main.P + fullCarNumW) : 0),
          h: 30,
          text: `${curTrans.name}${curTrans.model != '' ? ` ${curTrans.model}` : ''}`,
          text_size: 24,
          align_h: hmUI.align.LEFT,
          align_v: hmUI.align.CENTER_V,
          text_style: hmUI.text_style.ELLIPSIS,
          color: COLORS.primary
        })

        let perMonth = parseInt(curTrans.mileage.perMonth)
        if (curTrans.mileage.auto && perMonth != 0) {
          let currentDay = Math.floor(new Time().getTime() / (1000 * 3600 * 24))
          let lastUpdate = parseInt(curTrans.mileage.lastUpdate)
          if (lastUpdate != currentDay) {
            curTrans.mileage.current = parseInt(curTrans.mileage.current) + Math.round(perMonth / 30) * (currentDay - lastUpdate)
            curTrans.mileage.lastUpdate = currentDay
            this.saveTransport(localData)
          }
        }
        autoGroup.createWidget(hmUI.widget.TEXT, {
          x: main.P,
          y: 60,
          w: (main.W - main.P * 4) / 2,
          h: 24,
          text: getText('currentMileage'),
          text_size: 18,
          align_h: hmUI.align.LEFT,
          align_v: hmUI.align.BOTTOM,
          text_style: hmUI.text_style.NONE,
          color: COLORS.secondary
        })
        let mileage = numFormat(curTrans.mileage.current)
        autoGroup.createWidget(hmUI.widget.TEXT, {
          x: main.P,
          y: 80,
          w: (main.W - main.P * 2) / 2,
          h: 40,
          text: mileage,
          text_size: 30,
          align_h: hmUI.align.LEFT,
          align_v: hmUI.align.BOTTOM,
          text_style: hmUI.text_style.NONE,
          color: COLORS.primary
        })
        let mileageW = hmUI.getTextLayout(mileage, { text_size: 30, text_width: screenWidth }).width
        let textP = 10
        autoGroup.createWidget(hmUI.widget.TEXT, {
          x: main.P + mileageW + textP,
          y: 80,
          w: (main.W - main.P * 2) / 2,
          h: 36,
          text: getText('km'),
          text_size: 20,
          align_h: hmUI.align.LEFT,
          align_v: hmUI.align.BOTTOM,
          text_style: hmUI.text_style.NONE,
          color: COLORS.primary
        })
        autoGroup.createWidget(hmUI.widget.BUTTON, {
          x: 0,
          y: 60,
          w: main.W / 2,
          h: 60,
          normal_src: '',
          press_src: '',
          longpress_func: () => {
            this.editParam({
              transport: localData,
              index: curTransIndex,
              text: getText('currentMileage'),
              key: 'mileage.current',
              value: curTrans.mileage.current
            })
          }
        })

        autoGroup.createWidget(hmUI.widget.TEXT, {
          x: main.W / 2 + main.P,
          y: 60,
          w: (main.W - main.P * 4) / 2,
          h: 24,
          text: getText('nextMaintenance'),
          text_size: 18,
          align_h: hmUI.align.LEFT,
          align_v: hmUI.align.BOTTOM,
          text_style: hmUI.text_style.NONE,
          color: COLORS.secondary
        })
        let toage = parseInt(curTrans.maintenance.last) + parseInt(curTrans.maintenance.period) - parseInt(curTrans.mileage.current)
        toage = numFormat(toage < 0 ? 0 : toage)
        autoGroup.createWidget(hmUI.widget.TEXT, {
          x: main.W / 2 + main.P,
          y: 80,
          w: (main.W - main.P * 2) / 2,
          h: 40,
          text: toage,
          text_size: 30,
          align_h: hmUI.align.LEFT,
          align_v: hmUI.align.BOTTOM,
          text_style: hmUI.text_style.NONE,
          color: COLORS.primary
        })
        let toageW = hmUI.getTextLayout(toage, { text_size: 30, text_width: screenWidth }).width
        autoGroup.createWidget(hmUI.widget.TEXT, {
          x: main.W / 2 + main.P + toageW + textP,
          y: 80,
          w: (main.W - main.P * 2) / 2,
          h: 36,
          text: getText('km'),
          text_size: 20,
          align_h: hmUI.align.LEFT,
          align_v: hmUI.align.BOTTOM,
          text_style: hmUI.text_style.NONE,
          color: COLORS.primary
        })
        autoGroup.createWidget(hmUI.widget.BUTTON, {
          x: main.W / 2,
          y: 60,
          w: main.W / 2,
          h: 60,
          normal_src: '',
          press_src: '',
          longpress_func: () => {
            this.editParam({
              transport: localData,
              index: curTransIndex,
              text: getText('lastMaintenanceFull'),
              key: `maintenance.last`,
              value: curTrans.maintenance.last
            })
          }
        })

        let blocks = []
        let blocksY = main.Y + main.H + main.MB + 50
        // M - margin, P - padding, W - width, H - height, B - bottom, i - icon, l - line
        const block = {
          P: 15,
          W: screenWidth - main.M * 2,
          H: 130,
          BM: 20,
          iW: 30,
          iM: 10,
          lH: 20
        }
        block.lW = block.W - block.P * 2

        for (const key in curTrans.details) {
          if (curTrans.details[key].visible) blocks.push(key)
        }

        const groups = []
        for (let i = 0; i < blocks.length; i++) {
          let data = curTrans.details[blocks[i]]
          let tar = parseInt(data.period)
          let cur = parseInt(curTrans.mileage.current) - parseInt(data.lastUpdate)
          let ratio = cur / tar
          let curlineW = Math.round(ratio > 1 ? block.lW : ratio * block.lW < block.lH ? block.lH : ratio * block.lW)

          groups[i] = hmUI.createWidget(hmUI.widget.GROUP, {
            x: main.M,
            y: blocksY + (block.H + block.BM) * i,
            w: block.W,
            h: block.H
          })

          groups[i].createWidget(hmUI.widget.FILL_RECT, {
            x: 0,
            y: 0,
            w: block.W,
            h: block.H,
            radius: Math.floor((screenWidth / 15) / 5) * 5,
            color: ratio < 0.8 ? 0x111111 : ratio >= 1 ? 0x661111 : 0x663311
          })
          groups[i].createWidget(hmUI.widget.FILL_RECT, {
            x: block.P,
            y: block.P,
            w: block.lW,
            h: block.lH,
            radius: block.lH / 2,
            color: ratio < 0.8 ? 0x333333 : ratio >= 1 ? 0x883333 : 0x885533
          })

          groups[i].createWidget(hmUI.widget.FILL_RECT, {
            x: block.P,
            y: block.P,
            w: curlineW,
            h: block.lH,
            radius: block.lH / 2,
            color: ratio < 0.8 ? accentColor : ratio >= 1 ? 0xff3333 : 0xffaa33
          })

          groups[i].createWidget(hmUI.widget.IMG, {
            x: block.P,
            y: block.P * 2 + block.lH,
            src: `image/${blocks[i]}.png`
          })
          groups[i].createWidget(hmUI.widget.TEXT, {
            x: block.P + block.iW + block.iM,
            y: block.P * 2 + block.lH - 2,
            w: block.W - block.P * 2 - block.iW - block.iM,
            h: 36,
            text: getText(curTrans.details[blocks[i]].types ? curTrans.details[blocks[i]].types.arr[curTrans.details[blocks[i]].types.current] : blocks[i]),
            text_size: 32,
            align_h: hmUI.align.LEFT,
            align_v: hmUI.align.CENTER_V,
            text_style: hmUI.text_style.NONE,
            color: COLORS.primary
          })

          let curText = numFormat(cur)
          let tarText = numFormat(tar)
          groups[i].createWidget(hmUI.widget.TEXT, {
            x: block.P,
            y: block.P * 2 + 60,
            w: block.W - block.P * 2,
            h: 36,
            text: `${curText}`,
            text_size: 32,
            align_h: hmUI.align.LEFT,
            align_v: hmUI.align.BOTTOM,
            text_style: hmUI.text_style.NONE,
            color: COLORS.primary
          })
          let textW = hmUI.getTextLayout(curText.toString(), { text_size: 32, text_width: screenWidth }).width
          let textM = 10
          groups[i].createWidget(hmUI.widget.TEXT, {
            x: block.P + textW + textM,
            y: block.P * 2 + 60,
            w: screenWidth - (main.M + block.P) * 2 - textW - textM,
            h: 34,
            text: `/ ${tarText}`,
            text_size: 24,
            align_h: hmUI.align.LEFT,
            align_v: hmUI.align.BOTTOM,
            text_style: hmUI.text_style.NONE,
            color: COLORS.secondary
          })

          groups[i].createWidget(hmUI.widget.BUTTON, {
            x: 0,
            y: 0,
            w: block.W,
            h: block.H,
            normal_src: '',
            press_src: '',
            longpress_func: () => {
              this.editParam({
                transport: localData,
                index: curTransIndex,
                text: getText(blocks[i]),
                key: `details.${blocks[i]}.lastUpdate`,
                value: data.lastUpdate
              })
            }
          })
        }

        contentH = blocksY + (block.H + block.BM) * blocks.length
      }

      createButtons({ UI: hmUI, y: contentH, buttons: { 1: { name: 'settings' }, 2: { name: 'appinfo' } } }, this)
    },
    build() {
      const settings = localStorage.getItem('settings', {})
      let services = service.getAllAppServices()
      if (settings.bgService) {
        let serviceFile = "app-service/index"
        const permissions = SERVICE_PERMISSION
        if (!services.includes(serviceFile)) {
          const [perm] = queryPermission({ permissions })
          if (perm == 2) {
            service.start({
              url: serviceFile,
              complete_func: () => { }
            })
          }
        }
      } else services.forEach((val) => service.stop(val))
    },
    onDestroy() { },
    onCall(req) {
      if (req.method === "SAVE_TRANSPORT") {
        localStorage.setItem('transport', req.result)
        replace({
          url: 'page/index',
          params: {
            id: 0
          }
        })
      }
    }
  })
)