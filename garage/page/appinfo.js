import * as hmUI from "@zos/ui"
import { getText } from "@zos/i18n"
import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device"
import { getPackageInfo } from '@zos/app'
import { px } from "@zos/utils"

import { COLORS } from "../utils/constants"
import { createButtons } from "../utils/functions"

const { screenShape } = getDeviceInfo()
const screenWidth = getDeviceInfo().width
const screenHeight = getDeviceInfo().height
const isRoundedScreen = screenShape == SCREEN_SHAPE_ROUND

Page({
  onInit() {
    hmUI.setStatusBarVisible(false)
    let infoParams = ['name', 'version', 'vender', 'tglink', 'gmail', 'description', 'donate']

    let startY = px(isRoundedScreen ? 50 : 20)
    let contentH = startY
    let M = px(isRoundedScreen ? 36 : 32)

    hmUI.createWidget(hmUI.widget.TEXT, {
      x: M,
      y: contentH,
      w: screenWidth - M * 2,
      h: px(50),
      text: getText('appinfo'),
      text_size: px(32),
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text_style: hmUI.text_style.NONE
    })

    contentH += px(70)

    const packageInfo = getPackageInfo()
    for (let i = 0; i < infoParams.length; i++) {
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: M,
        y: contentH,
        w: screenWidth - M * 2,
        h: px(50),
        text: getText(infoParams[i]),
        text_size: px(20),
        align_h: hmUI.align.LEFT,
        align_v: hmUI.align.CENTER_V,
        text_style: hmUI.text_style.WRAP,
        color: COLORS.secondary
      })
      if (infoParams[i] == 'donate') {
      // Обнаружен баг на часах GTR 4. Если кодов на странице несколько, они все одинаковые (по самому последнему).
      // A bug was found on the GTR 4 watch. If there are several codes on the page, they are all the same (according to the most recent one).
      //if (['tglink', 'pdalink', 'donate'].includes(infoParams[i])) {
        let link = ''
        switch(infoParams[i]) {
          case 'tglink':
            link = 'https://t.me/igorkhudiakov'
            break
          case 'pdalink':
            link = 'https://4pda.to/forum/index.php?showtopic=1052827&view=findpost&p=136214711'
            break
          case 'donate':
            link = 'https://yoomoney.ru/to/4100119028733968/100'
            break
          default:
            break
        }
        hmUI.createWidget(hmUI.widget.QRCODE, {
          content: link,
          x: M + px(10),
          y: contentH + px(60),
          w: px(160),
          h: px(160),
          bg_x: M,
          bg_y: contentH + px(50),
          bg_w: px(180),
          bg_h: px(180),
          bg_radius: px(10)
        })
        contentH += px(240)
      } else {
        hmUI.createWidget(hmUI.widget.TEXT, {
          x: M,
          y: contentH + px(30),
          w: screenWidth - M * 2,
          h: px(50),
          text: infoParams[i] == 'tglink' ? '@igorkhudiakov' : infoParams[i] == 'gmail' ? 'khudiakov.i.v@gmail.com' : packageInfo[infoParams[i]],
          text_size: px(24),
          align_h: hmUI.align.LEFT,
          align_v: hmUI.align.CENTER_V,
          text_style: hmUI.text_style.WRAP,
          color: COLORS.primary
        })
        contentH += px(80)
      }
    }

    createButtons({ UI: hmUI, y: contentH, buttons: { 1: { name: 'back' } } })
  },
  build() { },
  onDestroy() { },
});
