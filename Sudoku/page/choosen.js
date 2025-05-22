import { align, createWidget, event, setStatusBarVisible, widget } from '@zos/ui'
import { localStorage } from '@zos/storage'
import { px } from '@zos/utils'
import { getText } from '@zos/i18n'

import { COLORS, difficults, isRound, SCREEN_HEIGHT, SCREEN_WIDTH } from '../utils/constants'
import { back } from '@zos/router'

let session = localStorage.getItem('session')

Page({
  build() {
    setStatusBarVisible(false)

    let startY = px(isRound ? 50 : 20)
    let contentH = startY
    let M = px(isRound ? 36 : 32)

    createWidget(widget.TEXT, {
      x: M,
      y: contentH,
      w: SCREEN_WIDTH - 2 * M,
      h: px(40),
      text: getText('choosenTitle'),
      text_size: px(24),
      color: COLORS.primary,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V
    })
    contentH += px(70)

    difficults.forEach(v => {
      createWidget(widget.BUTTON, {
        x: (SCREEN_WIDTH - px(300)) / 2,
        y: contentH,
        w: px(300),
        h: px(50),
        radius: px(10),
        text: getText(v),
        text_size: px(32),
        normal_color: COLORS.difficults.normal[difficults.indexOf(v)],
        press_color: COLORS.difficults.press[difficults.indexOf(v)]
      }).addEventListener(event.CLICK_DOWN, () => {
        session.difficulty = v
        localStorage.setItem('session', session)
        back()
      })
      contentH += px(70)
    })
  }
})