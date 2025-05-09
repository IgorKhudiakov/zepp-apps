import { setStatusBarVisible, createWidget, widget, align, text_style } from "@zos/ui"
import { getText } from "@zos/i18n"
import { getPackageInfo } from '@zos/app'
import { px } from "@zos/utils";

import { SCREEN_WIDTH, SCREEN_HEIGHT, isRound, COLORS, createSpace } from "../utils/constants"

Page({
  onInit() {
    setStatusBarVisible(false)
    let infoParams = ['name', 'version', 'vender', 'email', 'tglink', 'description', 'donate']

    let startY = px(isRound ? 50 : 20)
    let contentH = startY
    let M = px(isRound ? 36 : 32)

    createWidget(widget.TEXT, {
      x: M,
      y: contentH,
      w: SCREEN_WIDTH - M * 2,
      h: px(50),
      text: getText('appinfo'),
      text_size: px(32),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE
    })
    contentH += px(70)

    const packageInfo = getPackageInfo()
    for (let i = 0; i < infoParams.length; i++) {
      createWidget(widget.TEXT, {
        x: M,
        y: contentH,
        w: SCREEN_WIDTH - M * 2,
        h: px(50),
        text: getText(infoParams[i]),
        text_size: px(20),
        align_h: align.LEFT,
        align_v: align.CENTER_V,
        text_style: text_style.WRAP,
        color: COLORS.secondary
      })
      if (infoParams[i] == 'donate') {
        let link = ''
        switch (infoParams[i]) {
          case 'tglink':
            link = 'https://t.me/igorkhudiakov'
            break
          case 'donate':
            link = 'https://yoomoney.ru/to/4100119028733968/100'
            break
        }
        createWidget(widget.QRCODE, {
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
        createWidget(widget.TEXT, {
          x: M,
          y: contentH + px(30),
          w: SCREEN_WIDTH - M * 2,
          h: px(50),
          text: infoParams[i] == 'tglink' ? '@igorkhudiakov' : infoParams[i] == 'email' ? 'khudiakov.i.v@gmail.com' : packageInfo[infoParams[i]],
          text_size: px(24),
          align_h: align.LEFT,
          align_v: align.CENTER_V,
          text_style: text_style.WRAP,
          color: COLORS.primary
        })
        contentH += px(80)
      }
    }
    createSpace({ y: contentH, h: px(isRound ? 100 : 20) })
  },
  build() { },
  onDestroy() { },
});
