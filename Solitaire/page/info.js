import { setStatusBarVisible, createWidget, widget, align, text_style } from "@zos/ui"
import { getText } from "@zos/i18n"
import { getPackageInfo } from '@zos/app'

import { SCREEN_WIDTH, SCREEN_HEIGHT, isRound, COLORS, createSpace } from "../utils/constants"

Page({
  onInit() {
    setStatusBarVisible(false)
    let infoParams = ['name', 'version', 'vender', 'email', 'tglink', 'description', 'donate']

    let startY = isRound ? 50 : 20
    let contentH = startY
    let M = isRound ? 36 : 32

    createWidget(widget.TEXT, {
      x: M,
      y: contentH,
      w: SCREEN_WIDTH - M * 2,
      h: 50,
      text: getText('appinfo'),
      text_size: 32,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE
    })

    contentH += 70

    const packageInfo = getPackageInfo()
    for (let i = 0; i < infoParams.length; i++) {
      createWidget(widget.TEXT, {
        x: M,
        y: contentH,
        w: SCREEN_WIDTH - M * 2,
        h: 50,
        text: getText(infoParams[i]),
        text_size: 20,
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
          case 'pdalink':
            link = 'https://4pda.to/forum/index.php?showtopic=1052827&view=findpost&p=136378321'
            break
          case 'donate':
            link = 'https://yoomoney.ru/to/4100119028733968/100'
            break
          default:
            break
        }
        createWidget(widget.QRCODE, {
          content: link,
          x: M + 10,
          y: contentH + 60,
          w: 160,
          h: 160,
          bg_x: M,
          bg_y: contentH + 50,
          bg_w: 180,
          bg_h: 180,
          bg_radius: 10
        })
        contentH += 240
      } else {
        createWidget(widget.TEXT, {
          x: M,
          y: contentH + 30,
          w: SCREEN_WIDTH - M * 2,
          h: 50,
          text: infoParams[i] == 'tglink' ? '@igorkhudiakov' : infoParams[i] == 'email' ? 'khudiakov.i.v@gmail.com' : packageInfo[infoParams[i]],
          text_size: 24,
          align_h: align.LEFT,
          align_v: align.CENTER_V,
          text_style: text_style.WRAP,
          color: COLORS.primary
        })
        contentH += 80
      }
    }
    createSpace({ y: contentH, h: (isRound ? 100 : 20) })
  },
  build() { },
  onDestroy() { },
});
