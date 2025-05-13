import { BasePage } from '@zeppos/zml/base-page'
import hmUI, { align, createWidget, getTextLayout, prop, setStatusBarVisible, text_style, widget, getImageInfo } from "@zos/ui"
import { getText } from "@zos/i18n"
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device"
import { replace } from '@zos/router'
import { localStorage } from "@zos/storage"
import { px } from '@zos/utils'
import { queryPermission } from "@zos/app"
import * as service from '@zos/app-service'
import { Time } from '@zos/sensor'

import { numFormat } from "../utils/formatter"
import { COLORS, SERVICE_PERMISSION } from "../utils/constants"
import { createButtons } from '../utils/functions'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, screenShape } = getDeviceInfo()
const isRound = screenShape == SCREEN_SHAPE_ROUND

const settings = localStorage.getItem('settings', {})

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
      setStatusBarVisible(false)
      if (getApp()._options.globalData.isUpdated != true) this.getTransport()
      if (typeof options === 'string') options = JSON.parse(options)

      const main = {
        M: px(isRound ? 36 : 5),
        P: px(10),
        Y: px(isRound ? 100 : 50),
        H: px(124),
        MB: px(30),
        R: px(15)
      }
      main.W = SCREEN_WIDTH - main.M * 2
      let contentH = main.Y

      var localData = localStorage.getItem('transport', [])
      if (localData.length == 0) {
        contentH = px(50)
        let imgPath = 'image/no_trans.png'
        let imgRect = getImageInfo(imgPath)
        createWidget(widget.IMG, {
          x: (SCREEN_WIDTH - imgRect.width) / 2,
          y: contentH,
          src: imgPath
        })
        contentH += imgRect.height + px(30)
        createWidget(widget.TEXT, {
          x: main.M,
          y: contentH,
          w: main.W,
          h: px(36),
          text: getText('transportNullWatch'),
          text_size: px(28),
          align_h: align.CENTER_H,
          align_v: align.CENTER_V,
          color: COLORS.primary
        })
        contentH += px(40)
        let textH = getTextLayout(getText('newInApp'), { text_size: 24, text_width: main.W, wrapped: 1 }).height
        createWidget(widget.TEXT, {
          x: main.M,
          y: contentH,
          w: main.W,
          h: textH,
          text: getText('newInApp'),
          text_size: px(24),
          align_h: align.CENTER_H,
          align_v: align.CENTER_V,
          text_style: text_style.WRAP,
          color: COLORS.secondary
        })
        contentH += textH + px(20)
      } else {
        const curTrans = localData[options.id ?? 0] ?? {}
        let curTransIndex = 0
        let numVisible = curTrans.carnum.visible ?? false
        let accentColor = curTrans.accent?.isCustom
          ? curTrans.accent?.customColor ?? curTrans.accent?.color ?? COLORS.accentArray[0]
          : curTrans.accent?.color ?? COLORS.accentArray[0]
        if (accentColor.length == 6) accentColor = `0x${accentColor}`

        const btnsG = {
          X: main.M + px(20),
          Y: main.Y,
          W: SCREEN_WIDTH - 2 * main.M - px(40)
        }
        const transIcon = {
          W: px(60),
          H: px(34),
          M: px(10)
        }
        const btnsGroup = createWidget(widget.GROUP, {
          x: btnsG.X,
          y: btnsG.Y,
          w: btnsG.W,
          h: transIcon.H
        })

        let leftShadowV = false
        for (let i = 0; i < localData.length; i++) {
          let localAccent = localData[i].accent?.isCustom
            ? localData[i].accent?.customColor ?? localData[i].accent?.color ?? COLORS.accentArray[0]
            : localData[i].accent?.color ?? COLORS.accentArray[0]
          btnsGroup.createWidget(widget.FILL_RECT, {
            x: (transIcon.W + transIcon.M) * i + 1,
            y: 1,
            w: px(transIcon.W) - 2,
            h: px(transIcon.H) - 2,
            color: localAccent == 0 ? COLORS.primary : '0x' + localAccent
          })
          btnsGroup.createWidget(widget.BUTTON, {
            x: (transIcon.W + transIcon.M) * i,
            y: 0,
            w: px(transIcon.W),
            h: px(transIcon.H),
            normal_src: `image/buttons/${localData[i].type}_mask${localData[i].autoID == curTrans.autoID ? '_normal' : ''}.png`,
            press_src: `image/buttons/${localData[i].type}_mask${localData[i].autoID == curTrans.autoID ? '_normal' : '_dark'}.png`,
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
            if (iconPosX > (SCREEN_WIDTH - transIcon.W) / 2) {
              btnsGroup.setProperty(prop.X, btnsG.X - (iconPosX - (SCREEN_WIDTH - transIcon.W) / 2))
              leftShadowV = true
            }
          }
        }

        let shadowRect = getImageInfo('image/shadow_left.png')
        if (leftShadowV) {
          createWidget(widget.IMG, {
            x: 0,
            y: btnsG.Y - (shadowRect.height - transIcon.H) / 2,
            src: 'image/shadow_left.png'
          })
        }
        createWidget(widget.IMG, {
          x: SCREEN_WIDTH - shadowRect.width,
          y: btnsG.Y - (shadowRect.height - transIcon.H) / 2,
          src: 'image/shadow_right.png'
        })

        const autoGroup = createWidget(widget.GROUP, {
          x: main.M,
          y: main.Y + px(50),
          w: main.W,
          h: main.M
        })

        autoGroup.createWidget(widget.STROKE_RECT, {
          x: 0,
          y: 0,
          w: main.W,
          h: main.H,
          color: accentColor,
          line_width: 1,
          radius: main.R
        })

        let carNumW = 0
        let carNumRegW = 0
        let carNumIM = 2
        let fullCarNumW = 0

        if (numVisible) {

          let carNumH = px(30)
          let carNumP = px(5)

          let carNum = (curTrans.carnum?.format ?? 1) == 2 ? curTrans.carnum.reg : curTrans.carnum.num
          let carNumReg = (curTrans.carnum?.format ?? 1) == 2 ? curTrans.carnum.num : curTrans.carnum.reg
          carNumW = getTextLayout(carNum, { text_size: px(24), text_width: 0 }).width + carNumP * 2
          fullCarNumW += carNumW
          if ((curTrans.carnum?.format ?? 1) <= 2) carNumRegW = getTextLayout(carNumReg, { text_size: px(24), text_width: 0 }).width + carNumP * 2

          const carNumBg = autoGroup.createWidget(widget.FILL_RECT, {
            x: main.W - main.P - carNumW - ((curTrans.carnum?.format ?? 1) > 2 ? 0 : (carNumRegW + carNumIM)),
            y: main.P,
            w: carNumW,
            h: carNumH,
            line_width: 1,
            radius: px(5),
            color: '0x' + COLORS.carnum.bg[curTrans.carnum?.color ?? 0]
          })
          autoGroup.createWidget(widget.TEXT, {
            x: carNumBg.getProperty(prop.X) + carNumP,
            y: carNumBg.getProperty(prop.Y),
            w: carNumBg.getProperty(prop.W),
            h: carNumH,
            text: carNum,
            text_size: px(24),
            align_h: align.LEFT,
            align_v: align.CENTER_V,
            text_style: text_style.NONE,
            color: '0x' + COLORS.carnum.text[curTrans.carnum?.color ?? 0]
          })

          if ((curTrans.carnum?.format ?? 1) <= 2) {
            fullCarNumW += carNumRegW + carNumIM
            const carNumRegBg = autoGroup.createWidget(widget.FILL_RECT, {
              x: main.W - main.P - carNumRegW,
              y: main.P,
              w: carNumRegW,
              h: carNumH,
              line_width: 1,
              radius: px(5),
              color: '0x' + COLORS.carnum.bg[curTrans.carnum?.color ?? 0]
            })
            autoGroup.createWidget(widget.TEXT, {
              x: carNumRegBg.getProperty(prop.X) + carNumP,
              y: carNumRegBg.getProperty(prop.Y),
              w: carNumRegBg.getProperty(prop.W),
              h: carNumH,
              text: carNumReg,
              text_size: px(24),
              align_h: align.LEFT,
              align_v: align.CENTER_V,
              text_style: text_style.NONE,
              color: '0x' + COLORS.carnum.text[curTrans.carnum?.color ?? 0]
            })
          }
        }

        autoGroup.createWidget(widget.TEXT, {
          x: main.P,
          y: main.P,
          w: main.W - main.P * 2 - (fullCarNumW > 0 ? (main.P + fullCarNumW) : 0),
          h: px(30),
          text: `${curTrans.name}${curTrans.model != '' ? ` ${curTrans.model}` : ''}`,
          text_size: px(24),
          align_h: align.LEFT,
          align_v: align.CENTER_V,
          text_style: text_style.ELLIPSIS,
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
        autoGroup.createWidget(widget.TEXT, {
          x: main.P,
          y: px(56),
          w: (main.W - main.P * 3) / 2,
          h: px(24),
          text: getText('currentMileage'),
          text_size: px(18),
          align_h: align.LEFT,
          align_v: align.BOTTOM,
          text_style: text_style.NONE,
          color: COLORS.secondary
        })
        let mileage = numFormat(curTrans.mileage.current)
        autoGroup.createWidget(widget.TEXT, {
          x: main.P,
          y: px(80),
          w: (main.W - main.P * 2) / 2,
          h: px(40),
          text: mileage,
          text_size: px(30),
          align_h: align.LEFT,
          align_v: align.BOTTOM,
          text_style: text_style.NONE,
          color: COLORS.primary
        })
        let mileageW = getTextLayout(mileage, { text_size: px(30), text_width: SCREEN_WIDTH }).width
        let textP = px(10)
        autoGroup.createWidget(widget.TEXT, {
          x: main.P + mileageW + textP,
          y: px(80),
          w: (main.W - main.P * 2) / 2,
          h: px(36),
          text: getText(settings?.measure ?? 'km'),
          text_size: px(20),
          align_h: align.LEFT,
          align_v: align.BOTTOM,
          text_style: text_style.NONE,
          color: COLORS.primary
        })
        autoGroup.createWidget(widget.BUTTON, {
          x: 0,
          y: px(56),
          w: main.W / 2,
          h: px(60),
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

        autoGroup.createWidget(widget.TEXT, {
          x: (main.W + main.P) / 2,
          y: px(56),
          w: (main.W - main.P * 3) / 2,
          h: px(24),
          text: getText('nextMaintenance'),
          text_size: px(18),
          align_h: align.LEFT,
          align_v: align.BOTTOM,
          text_style: text_style.NONE,
          color: COLORS.secondary
        })
        let toage = parseInt(curTrans.maintenance.last) + parseInt(curTrans.maintenance.period) - parseInt(curTrans.mileage.current)
        toage = numFormat(toage < 0 ? 0 : toage)
        autoGroup.createWidget(widget.TEXT, {
          x: (main.W + main.P) / 2,
          y: px(80),
          w: (main.W - main.P * 2) / 2,
          h: px(40),
          text: toage,
          text_size: px(30),
          align_h: align.LEFT,
          align_v: align.BOTTOM,
          text_style: text_style.NONE,
          color: COLORS.primary
        })
        let toageW = getTextLayout(toage, { text_size: px(30), text_width: SCREEN_WIDTH }).width
        autoGroup.createWidget(widget.TEXT, {
          x: main.W / 2 + main.P + toageW + textP,
          y: px(80),
          w: (main.W - main.P * 2) / 2,
          h: px(36),
          text: getText(settings?.measure ?? 'km'),
          text_size: px(20),
          align_h: align.LEFT,
          align_v: align.BOTTOM,
          text_style: text_style.NONE,
          color: COLORS.primary
        })
        autoGroup.createWidget(widget.BUTTON, {
          x: main.W / 2,
          y: px(56),
          w: (main.W - main.P * 2) / 2,
          h: px(60),
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
        let blocksY = main.Y + main.H + main.MB + px(50)
        // M - margin, P - padding, W - width, H - height, B - bottom, i - icon, l - line, R - radius
        const block = {
          P: px(15),
          W: SCREEN_WIDTH - main.M * 2,
          H: px(130),
          BM: px(20),
          iW: px(30),
          iM: px(10),
          lH: px(20),
          R: px(25)
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

          groups[i] = createWidget(widget.GROUP, {
            x: main.M,
            y: blocksY + (block.H + block.BM) * i,
            w: block.W,
            h: block.H
          })

          groups[i].createWidget(widget.FILL_RECT, {
            x: 0,
            y: 0,
            w: block.W,
            h: block.H,
            radius: block.R,
            color: ratio < 0.8 ? 0x111111 : ratio >= 1 ? 0x661111 : 0x663311
          })
          groups[i].createWidget(widget.FILL_RECT, {
            x: block.P,
            y: block.P,
            w: block.lW,
            h: block.lH,
            radius: block.lH / 2,
            color: ratio < 0.8 ? 0x333333 : ratio >= 1 ? 0x883333 : 0x885533
          })

          groups[i].createWidget(widget.FILL_RECT, {
            x: block.P,
            y: block.P,
            w: curlineW,
            h: block.lH,
            radius: block.lH / 2,
            color: ratio < 0.8 ? accentColor : ratio >= 1 ? 0xff3333 : 0xffaa33
          })

          groups[i].createWidget(widget.IMG, {
            x: block.P,
            y: block.P * 2 + block.lH,
            src: `image/${blocks[i]}.png`
          })
          groups[i].createWidget(widget.TEXT, {
            x: block.P + block.iW + block.iM,
            y: block.P * 2 + block.lH - 2,
            w: block.W - block.P * 2 - block.iW - block.iM,
            h: px(36),
            text: getText(curTrans.details[blocks[i]].types ? curTrans.details[blocks[i]].types.arr[curTrans.details[blocks[i]].types.current] : blocks[i]),
            text_size: px(32),
            align_h: align.LEFT,
            align_v: align.CENTER_V,
            text_style: text_style.NONE,
            color: COLORS.primary
          })

          let curText = numFormat(cur)
          let tarText = numFormat(tar)
          groups[i].createWidget(widget.TEXT, {
            x: block.P,
            y: block.P * 2 + px(60),
            w: block.W - block.P * 2,
            h: px(36),
            text: `${curText}`,
            text_size: px(32),
            align_h: align.LEFT,
            align_v: align.BOTTOM,
            text_style: text_style.NONE,
            color: COLORS.primary
          })
          let textW = getTextLayout(curText.toString(), { text_size: px(32), text_width: SCREEN_WIDTH }).width
          let textM = px(10)
          groups[i].createWidget(widget.TEXT, {
            x: block.P + textW + textM,
            y: block.P * 2 + px(60),
            w: SCREEN_WIDTH - (main.M + block.P) * 2 - textW - textM,
            h: px(34),
            text: `/ ${tarText}`,
            text_size: px(24),
            align_h: align.LEFT,
            align_v: align.BOTTOM,
            text_style: text_style.NONE,
            color: COLORS.secondary
          })

          groups[i].createWidget(widget.BUTTON, {
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